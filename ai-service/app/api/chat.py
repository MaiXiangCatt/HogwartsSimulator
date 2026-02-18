from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from app.core.llm import llm_stream_generator

router = APIRouter()

@router.post("/chat")
async def chat_endpoint(request: Request):
    payload = await request.json()
    messages = payload.get("messages", [])
    api_key = payload.get("api_key")
    model = payload.get("model")

    if not api_key:
        return StreamingResponse(
            iter(["[Error] API Key is missing"]), media_type="text/event-stream"
        )

    return StreamingResponse(
        llm_stream_generator(model, api_key, messages), media_type="text/event-stream"
    )