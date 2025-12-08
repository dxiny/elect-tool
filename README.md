# Elect Tool

一个使用 Vue 3 + Element Plus 构建的 Electron 桌面应用。

## 主要功能

- AI 助手接入
- 备忘录（富文本）
- 知识库记录
- 3D/three.js 模型展示及工作流辅助

## 技术栈

- 前端: `Vue 3`、`Pinia`、`Vue Router`、`Vue I18n`、`Element Plus`
- 构建: `Vite`
- 桌面容器: `Electron`

## 开发与打包

- `npm run dev` 启动前端开发服务器
- `npm run dev:electron` 启动 Electron 主进程并连接到前端
- `npm run dev:app` 并发启动前端与 Electron
- `npm run build` 前端构建到 `dist/`
- `npm run dist` 打包 Electron 应用安装包

## 目录结构

```
src/
├── main.ts                # 应用入口，注册 Pinia/Router/I18n/ElementPlus 并挂载
├── App.vue                # 应用基础布局（顶部栏、侧栏、router-view）
├── components/            # 公共组件
│   ├── Sidebar.vue        # 侧栏菜单（与 stores/menu.ts 联动）
│   ├── TopBar.vue         # 顶部栏（窗口控制、刷新、主题等）
│   └── ThemeSwitch.vue    # 主题切换（联动 utils/theme.ts 与 ElementPlus 主色）
├── pages/                 # 页面模块
│   ├── home/index.vue     # 首页
│   ├── ai/Index.vue       # AI 对话页（调用统一后端封装 services/backend.ts）
│   ├── json/Index.vue     # JSON 工具占位页
│   ├── editor/Markdown.vue# Markdown 编辑页
│   ├── charts/Index.vue   # 图表页（ECharts 可接入）
│   ├── settings/Index.vue # 设置页
│   ├── profile/Index.vue  # 示例页（localStorage 演示）
│   └── about/Index.vue    # 关于页
├── router/index.ts        # 路由配置（哈希模式）
├── stores/menu.ts         # Pinia store：侧栏菜单项定义
├── services/backend.ts    # 统一后端封装：本地 IPC 与远程 HTTP 自动切换
├── locales/               # 国际化文案
│   ├── zh-CN.ts           # 中文文案
│   └── en-US.ts           # 英文文案
└── utils/theme.ts         # 主题变量初始化与动态主色

electron/
├── main.cjs               # Electron 主进程入口
│   ├── 创建窗口、禁用缩放快捷键、加载 dev URL 或 dist/index.html
│   ├── 注册 IPC：app 信息、窗口控制、文件读写、对话框
│   └── 本地数据接口：projects/assets 的最小 CRUD（JSON 存储）
└── preload.cjs            # 预加载脚本，通过 contextBridge 暴露 window.electronAPI

server/
├── index.cjs              # 入口，仅监听端口，不含业务代码
├── app.cjs                # 装配中间件与路由
├── config/env.cjs         # 端口与数据目录配置
├── db/sqlite.cjs          # SQLite 连接与建表（projects/assets/scenes）
├── middlewares/error.cjs  # 全局错误处理
├── utils/id.cjs           # 主键生成
├── utils/files.cjs        # 数据与资产目录确保
├── routes/                # 路由模块（仅声明 URL 与动词）
│   ├── common.cjs         # /api/health、/api/version
│   ├── projects.cjs       # 项目接口
│   ├── assets.cjs         # 资产接口
│   └── scenes.cjs         # 场景接口
├── controllers/           # 控制器（入参校验与出参格式化）
│   ├── commonController.cjs
│   ├── projectsController.cjs
│   ├── assetsController.cjs
│   └── scenesController.cjs
├── services/              # 业务编排（默认值、版本号、组合操作）
│   ├── projectsService.cjs
│   ├── assetsService.cjs
│   └── scenesService.cjs
└── repositories/          # 数据访问（SQL）
    ├── projectsRepo.cjs
    ├── assetsRepo.cjs
    └── scenesRepo.cjs

index.html                 # HTML 入口，加载 /src/main.ts
package.json               # 依赖与脚本（dev/dev:electron/dev:app/build/dist/server）
scripts/dev-electron.cjs   # 开发时拉起 Electron 并连接到 Vite（若使用 dev:electron）
dist/                      # 前端构建产物（生产模式由 Electron 加载）
```

使用约定与数据位置

- 本地模式（默认）：渲染进程通过 `window.electronAPI` 调用主进程 IPC；主进程将数据写入用户目录 `userData/data/db.json` 与 `assets` 目录（自动创建）。
- 远程模式：在客户端设置 `localStorage.apiBaseUrl='https://your-domain'` 后，`services/backend.ts` 自动改用 HTTP，服务端数据位于 `server/data/app.db`（可通过 `APP_DATA_DIR` 环境变量调整）与 `assets` 目录。

## 后端与数据持久化

后端采用分层架构（入口/装配/路由/控制器/服务/仓储/工具），当前仓库已包含最小后端服务，并支持本地与远程两种模式：

1. 内嵌后端（Electron 主进程 + SQLite）

- 使用 `better-sqlite3` 在主进程读写单文件数据库，通过 IPC 暴露 CRUD
- 适合少量用户与本机数据，部署简单、无外部服务

2. 独立后端服务（Express + SQLite）

- 在本机或服务器运行 `Express` 服务，前端调用 REST API
- 适合多人共享与简单权限控制，可扩展为 `PostgreSQL`
- 本仓库已提供最小实现：`server/index.cjs`、`server/app.cjs`、`server/db/sqlite.cjs`

3. 轻量文件存储（LowDB/JSON + 资产文件夹）

- 元数据写入 JSON 文件，资产保存在 `data/assets`，简单易用
- 原型阶段快速落地，后续可迁移到 SQLite

模式切换：在客户端设置 `localStorage.apiBaseUrl='https://your-domain'` 即走远程 HTTP；未设置时默认走本地 IPC。

## 部署与运行（少量用户推荐）

- 数据库：SQLite（单文件），后端：Node/Express
- 运行：使用 `pm2` 常驻或直接 `node server/index.cjs`

### 本地运行后端

- 安装依赖：`npm install`
- 启动服务：`npm run server`
- 访问接口：`http://localhost:3000/api/projects`、`/api/assets`
- 客户端切换到远程：在 Electron 客户端设置 `localStorage.apiBaseUrl='http://localhost:3000'`

### 服务器部署建议

- 选择 `Ubuntu LTS` 的轻量云服务器（1C2G、40–60GB SSD）
- 安装 Node 与 pm2：`npm i -g pm2`
- 复制仓库到服务器并执行：`npm install`
- 启动：`pm2 start server/index.cjs --name elect-server`
- 反向代理：使用 `nginx` 将 `https://your-domain` 代理到 `localhost:3000`
- 数据目录：默认使用 `server/data/app.db`，可通过 `APP_DATA_DIR=/var/app/data` 调整位置
- 备份：定时复制 `app.db` 与 `assets` 目录，保留 7–30 天快照

### 接口速览

- `GET /api/health`
- `GET /api/projects`、`POST /api/projects`
- `GET /api/assets?projectId=...`、`POST /api/assets`
- `GET /api/scenes?projectId=...`、`POST /api/scenes`

### 模块定位

- Projects（项目）
  - 顶层容器，归档 Notes/KB/Assets/Scenes/AI Sessions 等资源与流程
- Assets（资产）
  - 资源元数据管理，含 3D 模型、贴图、HDR、文档、图片等
- Scenes（场景）
  - three.js 场景图保存与版本控制，引用 Assets 中的资源

### 调用方式与模式切换

- 统一调用层：`src/services/backend.ts` 根据 `localStorage.apiBaseUrl` 自动选择本地 IPC 或远程 HTTP
- 示例：
  - 获取项目：`const { data } = await listProjects()`
  - 创建项目：`await createProject({ name, description })`
  - 获取资产：`await listAssets(projectId)`
  - 新增资产：`await addAsset({ projectId, type, filename, path, size, hash, metadata })`

### 运行与常见问题

- Windows 上 `better-sqlite3` 需要本机编译环境（Python/VS Build Tools）；若安装时报错，可在服务器运行或安装后执行 `npm rebuild better-sqlite3`

## 功能实现指南（四大功能）

- AI 助手接入

  - 前端：会话管理（新建/重命名/搜索）、上下文注入（选中文本/剪贴板/文件片段）、Prompt 模板库、流式响应与统计
  - 后端：`sessions`、`messages` 表；接口 `GET/POST /api/sessions`、`GET/POST /api/messages`
  - 接入：统一封装于 `src/services/backend.ts`，根据 `apiBaseUrl` 自动切换本地/远程

- 备忘录（富文本）

  - 前端：引入富文本编辑器（如 `Quill`/`TipTap`），支持图片、代码块、待办清单；列表页+编辑页
  - 后端：`notes` 表（`id,title,content_html,tags,created_at,updated_at`）；接口 `GET/POST/PUT/DELETE /api/notes`
  - 归档与搜索：按项目或标签归档；全文搜索（SQLite FTS5）

- 知识库记录（RAG）

  - 前端：文档导入（Markdown/PDF/HTML）、切块显示与管理、与会话绑定的“引用片段”
  - 后端：`kb_docs`（原文档）、`kb_chunks`（分块，含嵌入向量）；接口 `GET/POST /api/kb/docs`、`GET/POST /api/kb/chunks`
  - 检索：先走关键词检索（FTS5）或本地向量库，后续可升级外部向量存储

- 3D/three.js 模型展示及工作流辅助
  - 前端：新增三维预览页，`three.js` 加载 GLB/glTF/OBJ/FBX/HDR；展示元数据、材质、层级；基本变换与视图控制
  - 后端：使用 `assets` 表记录资产元数据（`type/filename/path/hash/metadata`）；扩充材质/包围盒等元数据；接口复用 `/api/assets`
  - 辅助：生成缩略图与校验报告（后台任务），记录到 `assets.metadata`；场景存储 `scenes`（JSON，含版本号）

## 打包分发（Windows/macOS）

- Windows（需在 Windows 打包）

  - 执行：`npm run dist`，输出 `nsis` 安装包
  - 分发：将安装包提供给用户下载安装即可

- macOS（需在 macOS 打包）
  - 配置 `electron-builder` 的 `mac` 目标，执行 `npm run dist`
  - 开发阶段可不签名；正式发布建议使用 Apple 开发者证书签名

## 服务器与服务购买建议

- 云服务器（国内）

  - 阿里云轻量/腾讯云轻量/华为云，推荐规格：`1C2G`、`40–60GB SSD`、`3–5Mbps`
  - 系统：`Ubuntu LTS`

- 对象存储（资产较大时）

  - 阿里云 OSS/七牛云 Kodo/Cloudflare R2，用于模型/贴图等大文件；数据库记录元数据与路径

- 域名（可选）
  - 任何国内注册商；用于配置 `HTTPS` 与人类可读的 API 地址

## 从零到用（步骤清单）

- 本地验证：`npm run dev`（前端）、`npm run server`（后端），浏览器访问 `http://localhost:3000/api/health`
- 客户端切换：在 Electron 客户端设置 `localStorage.apiBaseUrl='http://localhost:3000'`
- 服务器部署：安装 Node 与 pm2，`pm2 start server/index.cjs --name elect-server`，Nginx 反代开启 `HTTPS`
- 备份：定时复制 `app.db` 与 `assets` 目录（或对象存储），保留快照

### 客户端切换模式

- 未设置 `apiBaseUrl`：走本地模式（Electron 主进程数据）
- 设置 `localStorage.apiBaseUrl`：走远程 HTTP 接口（服务器模式）
