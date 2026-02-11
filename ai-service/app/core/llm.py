import json
import httpx
from openai import AsyncOpenAI
from google import genai
from google.genai import types
from config import MODEL_CONFIG, PROXIES
from app.utils.format import convert_to_gemini_format

# openAI客户端(兼容deepseek)
def get_openai_client(api_key, base_url):
    return AsyncOpenAI(
        api_key=api_key,
        base_url=base_url,
        http_client=httpx.AsyncClient(proxy="http://127.0.0.1:8889"),
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
            thinking_config=types.ThinkingConfig(include_thoughts=True),
        )
        try:
            response = await client.aio.models.generate_content_stream(
                model=model, contents=google_contents, config=generate_config
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
                model=model, messages=messages, stream=True
            )
            async for chunk in response:
                delta = chunk.choices[0].delta
                # 1. 处理推理内容
                if (
                    hasattr(chunk.choices[0].delta, "reasoning_content")
                    and chunk.choices[0].delta.reasoning_content
                ):
                    payload = {"type": "thought", "content": delta.reasoning_content}
                    yield f"data: {json.dumps(payload)}\n\n"

                # 2. 处理正式回复内容
                content = chunk.choices[0].delta.content
                if content:
                    payload = {"type": "text", "content": content}
                    yield f"data: {json.dumps(payload)}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'content': str(e)})}\n\n"