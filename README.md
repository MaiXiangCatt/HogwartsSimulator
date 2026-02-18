# 霍格沃茨模拟器

![Project Status](https://img.shields.io/badge/Status-Alpha%20v0.1.0-orange)
![License](https://img.shields.io/badge/License-GPLv3-blue)
![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20Go%20%7C%20Python-green)

**霍格沃茨沉浸式模拟器** 是一款基于 **LLM (大语言模型)** 和 **Multi-Agent (多智能体)** 技术的 Web 端文字角色扮演游戏 (TRPG)。

## ✨ 核心特性 (Key Features)

- **🧠 多Agent技术 (Multi-Agent System)**: 
  - **Storyteller (叙事者)**: 专注于沉浸式剧情描写，负责世界观构建与氛围渲染。
  - **Calculator (结算员)**: 专注于逻辑与数值，负责解析剧情并更新 HP、金币、好感度、物品栏等状态。
- **🔒 隐私保护**: 
  - 虽然部署在云端，但我们支持 **BYOK (Bring Your Own Key)** 模式。
  - 您的 API Key 经加密处理，仅在会话期间使用，我们绝不持久化存储您的 Key。
- **📜 动态世界线**: 
  - 你的每一个选择都会引发蝴蝶效应，记录在“世界线变动日志”中。
  - 目前支持 **deepseek-reasoner** 与 **gemini 2.5/3 pro** 模型，后续会支持更多需要的模型。
- **🎒 深度 RPG 系统**: 
  - 完整的魔法体系（咒语等级）、物品背包、人际关系网。
  - 包含时间系统（学年/周目）与体力（AP）限制。

## 🛠️ 技术栈 (Tech Stack)

本项目采用前后端分离的三层架构：

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Shadcn/UI
- **Backend (BFF)**: Go (Gin), GORM 
- **AI Service**: Python (FastAPI), **LangGraph** 

## License

本项目采用 GNU General Public License v3.0 (GPL-3.0) 协议。

这意味着您可以自由地运行、学习、修改和分发本软件的副本，但如果您分发修改后的版本（无论是否收费），您必须：

1. 保持开源：必须以相同的 GPL-3.0 协议发布您的源代码。

2. 显著声明：标明您进行了修改。

3. 不用于闭源商用：您不能将本项目代码集成到闭源软件中。
