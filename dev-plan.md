### 1. 需求拆分与层次化 (WBS)

我们将需求拆分为 L0 (基建), L1 (核心业务), L2 (AI逻辑), L3 (体验优化)。

| 模块     | 功能点 (Feature)   | 复杂度 | 优先级 | 核心技术点/工具                                   |
| -------- | ------------------ | ------ | ------ | ------------------------------------------------- |
| L0: 基建 | 项目初始化         | 低     | P0     | Monorepo 或多仓库结构，Docker Compose (可选)      |
|          | 双端通信桥梁       | 高     | P0     | Go net/http Client, Python StreamingResponse, SSE |
|          | 数据库设计         | 中     | P0     | MySQL/Postgres, Gorm AutoMigrate                  |
| L1: 业务 | 用户注册/登录      | 低     | P1     | JWT, BCrypt, Middleware                           |
|          | 角色创建 (CRUD)    | 低     | P1     | Form Validation, Shadcn UI                        |
|          | 会话管理 (Session) | 中     | P1     | 关联 User/Char, 存储 Summary                      |
| L2: AI   | Python API 封装    | 低     | P0     | FastAPI                                           |
|          | LangGraph 基础流   | 高     | P0     | StateGraph, ConditionalEdges, Prompt Engineering  |
|          | 历史记录注入       | 中     | P1     | Context Window 逻辑                               |
| L3: UI   | 聊天界面 (ChatUI)  | 中     | P0     | Tailwind, Markdown渲染, 滚动到底部逻辑            |
|          | 流式打字机效果     | 中     | P1     | 前端 SSE 解析器                                   |
|          | 视觉美化           | 低     | P2     | 字体, 配色, 简单的 CSS 动画                       |

### 2. 开发计划日程表 (Step-by-Step)

**前提**：

- 开始日期：2月4日
- 投入时间：每天 4-5 小时
- 策略：**先难后易**。先打通 Go <-> Python 的流式传输，这是项目的命门。

#### Phase 1: 架构与核心链路 (The Backbone)

*目标：前端输入 "Hi"，屏幕上能一个字一个字地蹦出 Python 返回的 "Hello"（经过 Go 中转）。*

- **2月4日 (Day 1): 环境搭建与 Hello World**

- - [后端] 初始化 Go Gin 项目，配置 Gorm 连接本地 MySQL。
  - [AI端] 初始化 Python FastAPI 项目，写一个简单的 /chat 接口，返回流式数据（yield 字符串）。
  - [前端] 初始化 Vite + React + Tailwind + Shadcn。

- **2月5日 (Day 2): 攻克双后端流式透传 (关键)**

- - [AI端] 编写一个模拟耗时的生成器（每0.5秒吐一个字）。
  - [后端] **核心任务**：在 Gin 中实现 SSE (Server-Sent Events) Handler。Go 需要发起 HTTP 请求调用 Python，并使用 bufio.Scanner 或 io.Pipe 将 Python 的响应实时 Flush 给前端。
  - *提示：如果 SSE 太难，MVP 可先用长轮询，但建议死磕 SSE。*

- **2月6日 (Day 3): 前端流式渲染**

- - [前端] 封装 useChat Hook，使用 EventSource 或 fetch + ReadableStream 接收数据。
  - [前端] 实现 Markdown 组件，确保文字出来时页面自动滚动到底部。

#### Phase 2: 业务逻辑与数据库 (The Game Logic)

*目标：用户能注册，能建卡，能保存聊天记录。*

- **2月7日 (Day 4): 数据库建模与 CRUD**

- - [后端] 定义 User, Character, Message, Session 的 Gorm Struct。
  - [后端] 利用 AI 生成 CRUD 代码 (Repository/Service 层)。

- **2月8日 (Day 5): 鉴权体系**

- - [后端] 实现注册/登录接口 (JWT)。
  - [前端] 制作简单的登录页和注册页（Shadcn Form）。
  - [后端] 编写 AuthMiddleware，拦截 /api/game 开头的请求。

- **2月9日 (Day 6): 角色创建与会话初始化**

- - [后端] 实现 CreateCharacter 接口。
  - [前端] 实现“入学登记表”页面（姓名、性别、学院选择）。
  - [联调] 创建角色后，自动在 DB 创建一个 session_id。

#### Phase 3: AI 智能接入 (The Brain)

*目标：接入 LangGraph，让 AI 像个 GM 一样说话。*

- **2月10日 (Day 7): LangGraph 基础搭建**

- - [AI端] 引入 LangChain/LangGraph。
  - [AI端] 构建最简单的 Graph：Start -> Model -> End。
  - [AI端] 配置 OpenAI API (或兼容的 DeepSeek/Ollama 接口)。

- **2月11日 (Day 8): Prompt Engineering (GM 人设)**

- - [AI端] 编写 System Prompt：“你是一个霍格沃茨的 GM...”。
  - [AI端] 测试：尝试攻击 NPC，看 AI 是否能进行逻辑阻拦。

- **2月12日 (Day 9): 上下文 (Context) 组装**

- - [后端] 在调用 Python 前，从 MySQL 查询最近 10 条 Messages。
  - [后端] 查询 Character 信息（姓名、学院）。
  - [后端] 将 History + Profile 打包发给 Python。
  - [AI端] Python 解析 JSON，填入 Prompt Template。

- **2月13日 (Day 10): 消息持久化与完整链路**

- - [后端] **处理流式数据的存储**（难点）：

- - - 当 Python 的 SSE流传输结束时，Go 需要将缓冲区中完整的 AI 回复文本拼合。
    - 调用 Gorm 将这条 AI 消息存入 Messages 表。

- - [前端] 完善 Zustand store，确保用户刷新页面后，通过 useEffect 调用 /api/game/{session_id}/history 接口，能重新加载出之前的聊天记录。

#### Phase 4: 游戏化与界面打磨 (The "Game" Feel) (2.14 - 2.19)

*目标：超越“普通对话框”，营造“霍格沃茨”氛围，实现状态同步。*

- **2月14日 (Day 11): 角色状态面板 (Sidebar)**

- - [前端] 使用 shadcn/ui 的 Sheet 或 Sidebar 组件。
  - [前端] 展示角色卡：头像（可以使用默认图）、姓名、学院徽章（SVG）、基础属性（HP、金加隆）。
  - [数据] 从后端 GET /api/character/{id} 获取数据并展示。

- **2月15日 (Day 12): AI 修改游戏状态 (简易版 Tool Use)**

- - *为了降低 LangGraph 复杂度，MVP 阶段建议使用“结构化指令”方案。*
  - [AI端] 优化 System Prompt：“如果玩家受伤或获得金币，请在回复末尾附加 XML 标签，如 <update><hp>-10</hp></update>”。
  - [后端] 在 Go 接收流式数据时（或流结束后），用正则解析这些标签。
  - [后端] 如果发现标签，更新数据库中的 Characters 表。
  - [前端] 前端监听到消息结束事件后，静默刷新一次角色状态（React Query invalidateQueries），实现血条自动扣减。

- **2月16日 (Day 13): 霍格沃茨 UI 主题化**

- - [前端] **字体与配色**：引入 Google Fonts (如 *Cinzel* 或 *Crimson Text*)。配置 Tailwind 的 theme，定义 primary 颜色为羊皮纸黄 (#F0E68C) 或 学院红/绿。
  - [前端] **样式覆盖**：修改 shadcn 组件的默认圆角和阴影，使其看起来像魔法书页。

- **2月17日 (Day 14): 交互细节优化**

- - [前端] **输入框体验**：Textarea 自适应高度。
  - [前端] **加载动画**：将普通的 Spinner 换成“魔杖挥舞”或“猫头鹰飞翔”的 Lottie 动画/GIF。
  - [前端] **发送按钮**：设计为发送咒语的视觉效果。

#### Phase 5: 测试、部署与文档 (The Delivery) (2.18 - 2.22)

*目标：确保面试官打开链接能玩，代码仓库看起来专业。*

- **2月18日 (Day 15): 边界条件测试 (QA)**

- - [测试] 注册一个新号，从头跑到尾，检查是否有白屏报错。
  - [测试] 长对话测试：连续对话 20 轮，检查 Go 是否会因为 Context 过长报错（MVP 可简单做截断：只取最近 20 条发给 Python）。
  - [测试] 移动端适配：确保手机浏览器上也能点“发送”。

- **2月19日 (Day 16): 部署准备 (Docker)**

- - [DevOps] 编写 Dockerfile：

- - - Go 服务编译为二进制文件。
    - Python 服务使用 pip install -r requirements.txt。
    - 前端 Build 成静态文件，由 Nginx 或 Go 静态文件服务托管。

- - [DevOps] 编写 docker-compose.yml，一键拉起 Go+Python+MySQL。

- **2月20日 (Day 17): 上线 (Deployment)**

- - *方案 A (省钱)*：买一台便宜的云服务器 (2核4G)，直接跑 Docker Compose。
  - *方案 B (免费/分离)*：前端部署 Vercel，Go 后端部署 Render/Railway，Python 部署 HuggingFace Spaces 或 Render。
  - *建议*：为了简历演示稳定，建议方案 A。

- **2月21日 (Day 18): 项目文档 (README)**

- - **这是给面试官看的第一印象，非常重要！**
  - 撰写架构图（用 Mermaid 画出 Go-Python 交互）。
  - 录制一个 30秒 - 1分钟的 Demo 视频（Gif 放在 README 里）。
  - 列出“技术难点”：流式双端透传、Prompt 状态管理。

- **2月22日 (Day 19): 缓冲与收尾**

- - 处理部署后发现的紧急 Bug。
  - 如果在简历上写了，确保 Github 仓库是 Public 且有详细 Commit 记录。