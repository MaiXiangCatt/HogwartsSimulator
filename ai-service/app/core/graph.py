import httpx
import os
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

from app.core.state import AgentState
from app.core.prompts import STORYTELLER_RULES, CALCULATOR_RULES
from config import MODEL_CONFIG, PROXIES
from google.genai import types


def get_model(state: AgentState, temperature=1):
    model = state["model"]
    api_key = state["api_key"]
    config = MODEL_CONFIG.get(model)

    os.environ["HTTP_PROXY"] = PROXIES["http://"]
    os.environ["HTTPS_PROXY"] = PROXIES["https://"]

    if config["provider"] == "google":
        return ChatGoogleGenerativeAI(
            model=model,
            google_api_key=api_key,
            temperature=temperature,
            include_thoughts=True,
        )
    else:
        return ChatOpenAI(
            model=model,
            api_key=api_key,
            base_url=config["base_url"],
            temperature=temperature,
            http_client=httpx.AsyncClient(proxies=PROXIES),
        )


async def storyteller_node(state: AgentState):
    model = get_model(state, temperature=1)

    sys_content = f"""{STORYTELLER_RULES}

=========================================
【当前重要指令】
1. 只要写剧情！不要输出 <state_update> JSON（数值计算由后续节点完成）。
2. 请基于以下玩家状态进行叙事：

【当前玩家状态】:
{state["game_state"]}
"""

    messages = [SystemMessage(content=sys_content)]
    # 把历史消息转成 LangChain 格式
    for m in state["messages"]:
        if m["role"] == "user":
            messages.append(HumanMessage(content=m["content"]))
        elif m["role"] == "assistant":
            messages.append(AIMessage(content=m["content"]))

    # 调用模型
    response = await model.ainvoke(messages)
    print("\n" + "=" * 50)
    print("【STORYTELLER OUTPUT】")
    print(response.content)
    print("=" * 50 + "\n")
    return {"story_content": response.content}


async def calculator_node(state: AgentState):
    model = get_model(state, temperature=0.8)

    user_prompt = f"""{CALCULATOR_RULES}

=========================================
【待分析任务】

[旧状态参考]:
{state["game_state"]}

[刚刚发生的剧情]:
{state["story_content"]}

请分析上述剧情，计算数值变化，并输出 <state_update> JSON。
"""

    response = await model.ainvoke([HumanMessage(content=user_prompt)])

    print("\n" + "=" * 50)
    print("【CALCULATOR OUTPUT】")
    print(response.content)
    print("=" * 50 + "\n")

    # 返回结果
    return {
        "messages": [AIMessage(content=response.content)]
    }


def build_agent_graph():
    workflow = StateGraph(AgentState)

    workflow.add_node("storyteller", storyteller_node)
    workflow.add_node("calculator", calculator_node)

    workflow.set_entry_point("storyteller")
    workflow.add_edge("storyteller", "calculator")
    workflow.add_edge("calculator", END)

    return workflow.compile()


app_graph = build_agent_graph()
