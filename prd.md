# 项目说明：

名称：霍格沃茨模拟器
定义or简介：这是一款web端的AI TRPG游戏，其本质上是一个类似于普通AI对话平台的页面，只不过AI是作为游戏GM的角色控制游戏流程。但对它的最终构想存在较大差异，具体包括：1.结合Multi-Agent技术，使输出更遵守规则，逻辑更合理；2.结合RAG技术或是普通的数据库，存储基本信息及重要的世界线变化等信息，规范AI的输出；3.最终在界面上进行一些美化工作；
计划的技术栈：前端React+TailwindCSS+shadcn/ui（或是其他ui库）+axios+react query+zustand;后端：golang+gin+gorm+python（主要负责langgraph等multi-agent的实现）；
该产品的开发目的：作为一名正在寻求前端/全栈开发实习生机会的用户的个人简历项目作品，同时也是作为用户感兴趣的用爱发电的项目，它不需要达到能商业化的水平，但是需要比市面上的同类产品如酒馆做的更好；



# 第一部分：产品迭代规划 (Roadmap)

为了保证项目能快速上线并逐步完善，建议分为三个阶段：

### 第一阶段：MVP（最小可行性产品）—— “分院仪式与初入学”

- **目标**：跑通核心链路，验证技术架构（Go与Python的通信，前端流式输出），实现最基础的TRPG对话。
- **核心功能**：

- - 简单的用户注册/登录（JWT）。
  - 角色创建卡片（姓名、性别、魔杖等）。
  - 核心对话界面（类似于ChatGPT,AI扮演GM）。
  - 后台Agent：单Agent或简单的双Agent（GM + 规则审查），能够基于简单的Prompt推进剧情。
  - **技术重点**：搭建Golang网关 + Python推理服务的架构；前端Zustand状态管理；Markdown流式渲染。

### 第二阶段：沉浸感升级 —— “有求必应屋”

- **目标**：引入RAG和更复杂的Agent逻辑，解决AI“胡说八道”和“遗忘设定”的问题。
- **核心功能**：

- - **RAG系统接入**：建立霍格沃茨世界观向量数据库（咒语、校规、历史）。
  - **长期记忆（Memory）**：记录用户做过的重要选择（如：得罪了斯内普）。
  - **状态面板**：前端侧边栏实时显示生命值、金加隆、学院分（由AI自动提取更新）。

- **技术重点**：Vector DB (Chroma/Milvus)集成；LangGraph状态图设计。

### 第三阶段：视觉与交互打磨 —— “魁地奇世界杯”

- **目标**：UI高度美化，增加游戏化机制。
- **核心功能**：

- - **掷骰子机制**：判定成功率的可视化动画。
  - **多媒体输出**：AI生成当前场景图片（Stable Diffusion API）或语音。
  - **库存系统**：背包道具管理。

------

# 第二部分：霍格沃茨模拟器 MVP阶段产品需求文档 (PRD)

| 文档版本     | V1.0                |
| ------------ | ------------------- |
| **文档状态** | 进行中              |
| **撰写人**   | 高级产品专家 (You)  |
| **面向读者** | 全栈开发 (Yourself) |
| **发布日期** | 202X-XX-XX          |

## 1. 项目背景与目标

### 1.1 项目背景

市面上的AI角色扮演（如SillyTavern）多基于单Prompt模式，容易导致逻辑崩坏（如NPC不知道自己在哪里，或者无视规则）。本项目旨在通过**Multi-Agent (LangGraph)** 架构，将“剧情推动（GM）”、“规则判定（System）”、“NPC扮演”分离，提供更合乎逻辑的TRPG体验。

### 1.2 核心价值（简历亮点）

- **全栈实践**：React + Go + Python 的混合架构。
- **AI落地**：LLM Agent 在游戏逻辑中的实际应用，而非简单的API调用。
- **工程规范**：完整的接口定义、状态管理和组件化开发。

## 2. 用户角色 (Persona)

- **一年级新生（用户）**：主要操作者，通过自然语言与系统交互，期望获得沉浸式的魔法世界体验。

## 3. 业务流程图 (MVP Scope)

 code Mermaid

downloadcontent_copy

expand_less

```plain
graph TD
    A[用户访问] --> B{是否登录?}
    B -- 否 --> C[登录/注册页]
    B -- 是 --> D[角色列表页]
    
    D --> E[创建新角色]
    D --> F[选择已有角色]
    
    E --> G[进入游戏主界面]
    F --> G
    
    G --> H[用户输入指令/对话]
    H --> I[前端发送请求至Golang API]
    I --> J[Golang转发至Python Agent服务]
    J --> K[LangGraph处理(GM逻辑)]
    K --> L[流式返回剧情/NPC对话]
    L --> I
    I --> M[前端渲染流式文本]
```

## 4. 功能需求详情

### 4.1 模块一：账户与角色管理 (Auth & Char Creation)

**优先级**：P1
**前端组件**：Shadcn Card, Form, Input, Button

#### 功能描述：

- **简易登录**：MVP阶段仅需用户名+密码（BCrypt加密），生成JWT Token。
- **角色创建**：

- - 输入：姓名（如：Harry Potter）、性别。
  - 选择：学院（格兰芬多/斯莱特林/拉文克劳/赫奇帕奇）— *MVP阶段由用户自选，后期改为AI分院*。
  - **提交后**：后端初始化一条新的Session（会话），并在数据库记录角色初始状态。

**接口需求 (Golang)**：

- POST /api/auth/register
- POST /api/auth/login
- POST /api/character/create

------

### 4.2 模块二：核心游戏界面 (The Interface)

**优先级**：P0 (核心)
**前端组件**：ScrollArea (消息列表), Textarea (输入), Avatar (头像)
**状态管理 (Zustand)**：需管理 messageList, isTyping, currentCharacter。

#### 功能描述：

- **对话流展现**：

- - 界面布局类似ChatGPT/Gemini。
  - 暂时类似于普通的AI平台

- **用户输入**：

- - 支持文本输入。
  - 支持“回车发送”。

- **加载状态**：

- - 发送后显示“猫头鹰正在飞来...”或骨架屏。

------

### 4.3 模块三：AI 逻辑核心 (Backend - Go & Python)

**优先级**：P0
**技术栈**：Golang (Gin) + Python (FastAPI + LangGraph)

#### 逻辑描述：

这是本项目的核心差异化所在。我们不直接把Prompt发给OpenAI，而是经过Python服务处理。

- **Golang层 (API Gateway)**：

- - 接收前端请求。
  - 鉴权 (Auth Middleware)。
  - 从MySQL读取历史聊天记录（Context）。
  - 将 {用户输入 + 最近10条历史 + 角色档案} 封装，HTTP Post 请求 Python 服务。

- **Python层 (The Brain)**：

- - **架构**：使用 FastAPI 接收请求，内部运行 LangGraph。
  - **Agent设计 (MVP版)**：

- - - 设计一个 Master Agent (GM)。
    - **System Prompt**：你是一个严厉但公正的霍格沃茨游戏管理员。你需要根据用户的输入推进剧情。如果用户行为不符合魔法世界逻辑（比如掏出AK47），你需要驳回并描述后果。

- - **输出格式**：JSON流或特殊标记文本，方便前端解析。

**接口需求**：

- Go -> Python (Internal): POST /internal/agent/chat
- Go -> Frontend: GET /api/game/{session_id}/history (加载历史)
- Go -> Frontend: POST /api/game/chat (SSE流式返回)

------

## 5. 数据需求 (Database Schema)

使用 Gorm (Go) 定义模型，自动迁移。

**Users 表**

- id, username, password_hash

**Characters 表**

- id, user_id, name, house, created_at
- attributes (JSON类型，存储 {"courage": 10, "magic": 5})

**GameSessions 表**

- id, character_id, current_summary (当前剧情摘要，用于压缩Context)

**Messages 表**

- id, session_id, sender_type (user/ai), content, created_at

------

## 6. 非功能性需求 (NFR)

- **响应速度**：

- - 用户发送消息后，首字生成时间 (TTFT) < 2秒。
  - *解决方案*：必须使用 **SSE (Server-Sent Events)** 或 WebSocket。Python生成Token -> 推送给Go -> Go推送给前端。

- **UI/UX 审美**：

- - 色调：深色模式 (Slate/Zinc colors in Tailwind)。
  - 字体：衬线字体 (Serif) 用于正文，营造书籍感。

- **代码规范**：

- - 前端：ESLint, Prettier, TypeScript Strict Mode。
  - 后端：Golang 标准目录结构 (cmd, internal, pkg, api)。

------

## 7. 界面原型描述 (Wireframe Description)

### 7.1 游戏主屏

- **顶部栏 (Header)**：

- - 左侧：当前位置（如：霍格沃茨特快列车）。
  - 右侧：角色名 | 退出按钮。

- **中间区域 (Chat Area)**：

- - 背景：羊皮纸纹理或深色磨砂。
  - 消息气泡：

- - - 用户：右侧对齐，深蓝色背景。
    - GM/NPC：左侧对齐，透明背景，通过文字颜色区分。

- **底部区域 (Input Area)**：

- - 输入框占据宽度的 80%。
  - 发送按钮设计为“魔杖挥舞”图标。

------

## 8. 简历技术点预埋 (Talking Points)

在开发这个MVP时，请刻意关注以下点，以便写入简历：

- **React Query**：用于管理历史记录的缓存和重验证，避免页面闪烁。
- **SSE (Server-Sent Events)**：在Golang中实现流式响应，处理AI打字机效果。
- **LangGraph**：虽然MVP简单，但在Python端预留了Graph结构（Node, Edge），解释为何选择Graph而非简单的Chain（为了处理循环逻辑和条件判断）。
- **跨语言通信**：Golang作为高并发Web服务器，Python作为计算密集型/AI逻辑单元，两者解耦。