import time
import uvicorn
from fastapi import FastAPI
from fastapi.responses import StreamingResponse

app = FastAPI()

def fake_stream_generator(user_input: str):
    response_text = f"霍格沃茨收到你的消息：{user_input}。猫头鹰正在起飞..."
    for char in response_text:
        yield char  # 每次吐一个字符
        time.sleep(0.1)  # 假装在思考/打字

@app.post("/chat")
def chat_endpoint(payload: dict):
    # payload 预期格式: {"message": "Hello"}
    user_message = payload.get("message", "")
    
    # 返回流式响应，media_type="text/plain" 表示返回纯文本
    return StreamingResponse(fake_stream_generator(user_message), media_type="text/event-stream")

if __name__ == "__main__":
    # 启动服务，监听 8000 端口
    uvicorn.run(app, host="0.0.0.0", port=8000)