import os
from pathlib import Path

CURRENT_FILE_PATH = Path(__file__).resolve()
BASE_DIR = CURRENT_FILE_PATH.parent.parent.parent
PROMPTS_DIR = BASE_DIR / "prompts"

def load_prompt(filename: str) -> str:

    file_path = PROMPTS_DIR / filename
    
    try:
        # encoding='utf-8' 防止中文乱码
        return file_path.read_text(encoding='utf-8')
    except FileNotFoundError:
        print(f"❌ 警告：找不到 Prompt 文件: {file_path}")
        return ""

STORYTELLER_RULES = load_prompt("storyteller_prompt.md")
CALCULATOR_RULES = load_prompt("calculator_prompt.md")