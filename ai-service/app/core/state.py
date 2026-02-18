from typing import TypedDict, List, Annotated
import operator

class AgentState(TypedDict):
  messages: Annotated[List[dict], operator.add]
  game_state: str

  story_content: str
  api_key: str
  model: str