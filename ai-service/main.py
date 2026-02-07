import time
import uvicorn
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
from openai import OpenAI

app = FastAPI()

MODEL_URL_MAP = {
    "deepseek-reasoner": "https://api.deepseek.com/v1",
    "deepseek-chat": "https://api.deepseek.com",
}

def llm_stream_generator(client: OpenAI, model: str, messages: list):
    try:
        response = client.chat.completions.create(
            model = model,
            messages = messages,
            stream = True
        )
        for chunk in response:
            # 1. 处理推理内容
            if hasattr(chunk.choices[0].delta, 'reasoning_content') and chunk.choices[0].delta.reasoning_content:
                reasoning = chunk.choices[0].delta.reasoning_content
                yield f"[THOUGHT]{reasoning}"

            # 2. 处理正式回复内容
            content = chunk.choices[0].delta.content
            if content:
                yield content
    except Exception as e:
        yield f"\n[System Error]: 调用模型失败 - {str(e)}"

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

    base_url = MODEL_URL_MAP.get(model)

    client = OpenAI(
        api_key = api_key,
        base_url = base_url
    )
    
    # 返回流式响应，media_type="text/plain" 表示返回纯文本
    return StreamingResponse(
        llm_stream_generator(client, model, messages), 
        media_type="text/event-stream")

if __name__ == "__main__":
    # 启动服务，监听 8000 端口
    uvicorn.run(app, host="0.0.0.0", port=8000)