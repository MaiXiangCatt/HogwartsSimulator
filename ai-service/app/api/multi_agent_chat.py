import json
from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from app.core.graph import app_graph

router = APIRouter()


async def graph_stream_generator(payload: dict):
    # 准备初始状态
    inputs = {
        "messages": payload.get("messages", []),
        "game_state": json.dumps(payload.get("game_state", {}), ensure_ascii=False),
        "api_key": payload.get("api_key"),
        "model": payload.get("model"),
        "story_content": "",
    }

    # LangGraph 的流式输出
    async for event in app_graph.astream_events(inputs, version="v1"):
        kind = event["event"]

        # 阶段一：Storyteller 正在打字
        if (
            kind == "on_chat_model_stream"
            and event["metadata"].get("langgraph_node") == "storyteller"
        ):
            chunk = event["data"]["chunk"]
            thought_content = ""
            if hasattr(chunk, "content_blocks"):
                for block in chunk.content_blocks:
                    if block.get("type") in ["reasoning", "thinking"]:
                        thought_content += block.get("text", "") or block.get(
                            "reasoning", ""
                        )
            if not thought_content:
                thought_content = chunk.additional_kwargs.get("reasoning_content", "")
            if not thought_content:
                thought_content = chunk.additional_kwargs.get("thought", "")
            if thought_content:
                yield f"data: {json.dumps({'type': 'thought', 'content': thought_content})}\n\n"
            if chunk.content:
                yield f"data: {json.dumps({'type': 'text', 'content': chunk.content})}\n\n"

        # 阶段二：Calculator 算完了 (这个通常不流式，算完了一次性吐 JSON)
        elif (
            kind == "on_chat_model_end"
            and event["metadata"].get("langgraph_node") == "calculator"
        ):
            output = event["data"]["output"].content
            # Calculator 输出的是 JSON，我们把它发给前端
            if output:
                yield f"data: {json.dumps({'type': 'text', 'content': output})}\n\n"


@router.post("/multiagent/chat")
async def multi_agent_chat_endpoint(request: Request):
    payload = await request.json()
    return StreamingResponse(
        graph_stream_generator(payload), media_type="text/event-stream"
    )
