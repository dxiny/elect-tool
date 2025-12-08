# Elect Tool - 你的全能桌面助手

Elect Tool 是一个基于 Vue 3 + Element Plus + Electron 的现代化桌面应用，集成了 AI 助手、富文本笔记、知识库管理和 3D 模型预览等功能。

它支持**双模式运行**：既可以作为离线单机应用使用（数据存本地），也可以作为客户端连接远程服务器（数据云端同步）。

## 1. 主要功能

*   **🤖 AI 智能助手**：支持多会话管理、上下文对话、Prompt 模板。
*   **📝 富文本备忘录**：支持 Markdown/富文本编辑、标签归档、全文搜索。
*   **📚 知识库管理**：支持文档导入、切片管理、RAG（检索增强生成）辅助。
*   **🎨 3D 模型工作流**：支持 GLB/FBX/OBJ 模型预览、元数据管理、场景构建。

### 技术栈

*   **前端**：`Vue 3`、`TypeScript`、`Pinia`、`Vue Router`、`Element Plus`
*   **构建工具**：`Vite`
*   **桌面框架**：`Electron`
*   **数据库**：`SQLite` (better-sqlite3)
*   **后端服务**：`Node.js` + `Express` (可选，用于远程模式)

---

## 2. 目录结构详解

```
d:\DXY\ElectTool\
├── .github/                # GitHub 配置
│   └── workflows/          # CI/CD 流水线配置 (GitHub Actions)
│       └── build.yml       # 自动打包脚本 (Tag 触发)
├── .trae/                  # Trae IDE 专属配置
├── build/                  # 打包资源目录
│   ├── icon.ico            # Windows 应用图标
│   └── icon.icns           # macOS 应用图标
├── dist/                   # 前端构建产物 (npm run build 生成)
├── electron/               # Electron 主进程代码
│   ├── main.cjs            # 主进程入口 (窗口创建、IPC通信、本地数据库)
│   └── preload.cjs         # 预加载脚本 (安全暴露 API 给渲染进程)
├── scripts/                # 工具脚本
│   └── dev-electron.cjs    # 开发环境启动脚本
├── server/                 # 后端服务代码 (用于远程模式)
│   ├── config/             # 环境配置
│   ├── controllers/        # 控制器 (处理请求)
│   ├── db/                 # 数据库连接
│   ├── routes/             # API 路由定义
│   ├── services/           # 业务逻辑层
│   └── index.cjs           # 服务入口文件
├── src/                    # 前端渲染进程代码 (Vue)
│   ├── components/         # 公共组件
│   ├── pages/              # 页面视图 (AI, Notes, Config 等)
│   ├── services/           # 前端服务层 (统一调用 backend.ts)
│   ├── stores/             # Pinia 状态管理
│   ├── utils/              # 工具函数
│   ├── App.vue             # 根组件
│   └── main.ts             # 入口文件
├── BUILD_GUIDE.md          # 打包发布指南 (详细版)
├── DEPLOY.md               # 服务器部署指南 (详细版)
└── package.json            # 项目依赖与脚本配置
```

---

## 3. 整体架构

本项目采用了**灵活的双架构设计**，通过 `src/services/backend.ts` 进行统一封装，前端业务代码无需感知底层差异。

### 模式 A：本地离线模式 (默认)
*   **架构**：渲染进程 (Vue) <-> IPC 通信 <-> 主进程 (Electron) <-> 本地 SQLite
*   **适用场景**：个人使用，数据隐私要求高，无网络环境。
*   **数据存储**：用户的 `AppData` 目录。

### 模式 B：远程客户端模式
*   **架构**：渲染进程 (Vue) <-> HTTP 请求 <-> 远程 Node 服务器 <-> 服务器 SQLite
*   **适用场景**：多端同步，团队协作，数据云端备份。
*   **切换方式**：在设置页面配置 `API Base URL` 即可无缝切换。

---

## 4. 服务部署/应用打包

为了保持文档清晰，特定领域的详细操作请参考独立文档：

*   **想把代码部署到云服务器？**
    👉 请阅读 **[`DEPLOY.md`](./DEPLOY.md)**
    *   *涵盖：服务器环境搭建、Nginx 配置、PM2 进程守护、HTTPS 配置等。*

*   **想打包成安装包发给别人？**
    👉 请阅读 **[`BUILD_GUIDE.md`](./BUILD_GUIDE.md)**
    *   *涵盖：GitHub Actions 自动构建流程、版本号管理、安装包下载指引。*

---

## 5. 本地开发指南

### 环境准备
*   Node.js (推荐 v18 或 v20)
*   Git

### 启动前端 + Electron (桌面开发)
```powershell
# 1. 安装依赖
npm install

# 2. 启动开发环境 (同时启动 Vite 和 Electron)
npm run dev:app
```

### 启动独立后端 (服务端开发)
如果你需要调试远程模式的后端接口：
```powershell
# 启动 Express 服务器 (默认端口 3000)
npm run server
```

---

## 6. 功能实现指南

### 📝 笔记系统
*   **实现逻辑**：基于 SQLite 的 CRUD 操作。
*   **特色**：支持按时间排序、关键词搜索。如果在远程模式下，数据会自动存储在服务器数据库中。
