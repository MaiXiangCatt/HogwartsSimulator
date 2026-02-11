import uvicorn
from fastapi import FastAPI
from app.api import chat

app = FastAPI()

app.include_router(chat.router)

if __name__ == "__main__":
    # 启动服务，监听 8000 端口
    uvicorn.run(app, host="0.0.0.0", port=8000)
