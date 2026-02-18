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
        node_name = event["metadata"].get("langgraph_node", "")

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

            final_text_content = ""
            if hasattr(chunk, "content"):
                if isinstance(chunk.content, str):
                    # 情况 A 普通字符串 : 直接用
                    final_text_content = chunk.content
                elif isinstance(chunk.content, list):
                    # 情况 B 内容块列表 : 这种通常已经在上面处理过思考了
                    # 我们只提取其中的 'text' 类型块，防止把 thinking 块重复发出来
                    for block in chunk.content:
                        if isinstance(block, dict) and block.get("type") == "text":
                            final_text_content += block.get("text", "")
            if final_text_content:
                yield f"data: {json.dumps({'type': 'text', 'content': final_text_content})}\n\n"

        # 阶段二：Calculator 算完了 (这个通常不流式，算完了一次性吐 JSON)
        elif (
            kind == "on_chain_end" and node_name == "calculator"
        ):
            # DEBUG查看是否进入了分支
            print("DEBUG: Calculator node finished! Parsing output...") 
            output = event["data"]["output"]
            if output and "messages" in output:
                messages = output["messages"]
                if messages:
                    last_msg = messages[-1]
                    
                    # 1. 拿到 content 原始内容 (可能是 List 也可能是 Str)
                    raw_content = ""
                    if hasattr(last_msg, "content"):
                        raw_content = last_msg.content
                    elif isinstance(last_msg, dict):
                        raw_content = last_msg.get("content", "")

                    # 2. 清洗数据 (Gemini 可能会返回 List)
                    final_json_content = ""
                    
                    if isinstance(raw_content, str):
                        final_json_content = raw_content
                    elif isinstance(raw_content, list):
                        # 遍历 List，把 'thinking' 剔除，只留字符串
                        for item in raw_content:
                            if isinstance(item, str):
                                final_json_content += item
                            elif isinstance(item, dict) and item.get("type") == "text":
                                final_json_content += item.get("text", "")
                    
                    print(f"DEBUG: Extracted JSON length: {len(final_json_content)}") # 调试日志

                    if final_json_content:
                        yield f"data: {json.dumps({'type': 'text', 'content': final_json_content})}\n\n"


@router.post("/multiagent/chat")
async def multi_agent_chat_endpoint(request: Request):
    payload = await request.json()
    return StreamingResponse(
        graph_stream_generator(payload), media_type="text/event-stream"
    )
