import os
import json
import uvicorn
import httpx
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
from openai import AsyncOpenAI
from google import genai
from google.genai import types

app = FastAPI()

os.environ["HTTP_PROXY"] = "http://127.0.0.1:8889"
os.environ["HTTPS_PROXY"] = "http://127.0.0.1:8889"

MODEL_URL_MAP = {
    "deepseek-reasoner": "https://api.deepseek.com/v1",
    "deepseek-chat": "https://api.deepseek.com",
    "gemini-3-pro-preview": "https://generativelanguage.googleapis.com/v1beta/openai/",
    "gemini-2.5-pro": "https://generativelanguage.googleapis.com/v1beta/openai/"
}

MODEL_CONFIG = {
    "deepseek-reasoner": {
        "provider": "openai", 
        "base_url": "https://api.deepseek.com/v1"
    },
    "deepseek-chat": {
        "provider": "openai",
        "base_url": "https://api.deepseek.com/v1"
    },
    "gemini-3-pro-preview": {
        "provider": "google", 
    },
    "gemini-2.5-pro": {
        "provider": "google", 
    }
}

proxies = {
    "http://": "http://127.0.0.1:8889",
    "https://": "http://127.0.0.1:8889",
}

def convert_to_gemini_format(messages: list):
    system_instruction = None
    contents = []
    
    for m in messages:
        role = m["role"]
        content = m["content"]
        
        if role == "system":
            # 如果有多个 system，拼接起来（通常只有一条）
            if system_instruction:
                system_instruction += "\n" + content
            else:
                system_instruction = content
        elif role == "user":
            contents.append(types.Content(
                role="user",
                parts=[types.Part(text=content)]
            ))
        elif role == "assistant":
            contents.append(types.Content(
                role="model",
                parts=[types.Part(text=content)]
            ))
            
    return system_instruction, contents
# deepseek客户端(兼容openAI)
def get_openai_client(api_key, base_url):
    return AsyncOpenAI(
        api_key=api_key,
        base_url=base_url,
        http_client=httpx.AsyncClient(proxy="http://127.0.0.1:8889")
    )

# google客户端
def get_google_client(api_key):
    return genai.Client(api_key=api_key)

async def llm_stream_generator(model: str, api_key: str, messages: list):
    config = MODEL_CONFIG.get(model)
    if not config:
        yield f"data: {json.dumps({'type': 'error', 'content': '暂时不支持该模型'})}\n\n"
        return
    if config["provider"] == "google":
        client = get_google_client(api_key)
        system_instruction, google_contents = convert_to_gemini_format(messages)
        generate_config = types.GenerateContentConfig(
            system_instruction=system_instruction,
            thinking_config=types.ThinkingConfig(
                include_thoughts=True
            )
        )
        try: 
            response = await client.aio.models.generate_content_stream(
                model=model,
                contents=google_contents,
                config=generate_config
            )
            async for chunk in response:
                print(f"RAW CHUNK: {chunk}")
                for part in chunk.candidates[0].content.parts:
                    if part.thought:
                        print(f"DEBUG THOUGHT: {part.text[:20]}...")
                        payload = {"type": "thought", "content": part.text}
                        yield f"data: {json.dumps(payload)}\n\n"
                    else:
                        if part.text:
                            payload = {"type": "text", "content": part.text}
                            yield f"data: {json.dumps(payload)}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'content': str(e)})}\n\n"
    elif config["provider"] == "openai":
        client = get_openai_client(api_key, config["base_url"])
        try:
            response = await client.chat.completions.create(
                model = model,
                messages = messages,
                stream = True
            )
            async for chunk in response:
                delta = chunk.choices[0].delta
                # 1. 处理推理内容
                if hasattr(chunk.choices[0].delta, 'reasoning_content') and chunk.choices[0].delta.reasoning_content:
                    payload = {"type": "thought", "content": delta.reasoning_content}
                    yield f"data: {json.dumps(payload)}\n\n"

                # 2. 处理正式回复内容
                content = chunk.choices[0].delta.content
                if content:
                    payload = {"type": "text", "content": content}
                    yield f"data: {json.dumps(payload)}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'content': str(e)})}\n\n"

@app.post("/chat")
async def chat_endpoint(request: Request):
    payload = await request.json()
    messages = payload.get("messages", [])
    api_key = payload.get("api_key")
    model = payload.get("model")

    if not api_key:
        return StreamingResponse(
            iter(["[Error] API Key is missing"]), 
            media_type="text/event-stream"
        )

    return StreamingResponse(
        llm_stream_generator(
            model, 
            api_key, 
            messages
        ),
        media_type="text/event-stream"
    )

if __name__ == "__main__":
    # 启动服务，监听 8000 端口
    uvicorn.run(app, host="0.0.0.0", port=8000)