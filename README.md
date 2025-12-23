# Elect Tool

Elect Tool 是一个基于 Vue 3 + Ant Design Vue + Electron 的现代化桌面应用，集成了 GIS 地图、3D 模型查看与 AI 辅助等功能。项目旨在通过实际业务场景（如离线地图、模型管理、智能对话）提升个人技术栈，覆盖从前端开发到桌面应用工程化的全链路。

它支持**双模式运行**：既可以作为离线单机应用使用（数据存本地），也可以作为客户端连接远程服务器（数据云端同步）。

## 1. 主要功能

*   **🗺️ GIS 地图引擎**：离线地图加载、矢量数据 (GeoJSON) 管理、空间分析、运动轨迹分析。
*   **🎲 3D 可视化**：GLB/OBJ 模型查看、场景交互、模型检查与格式转换。
*   **🤖 AI 智能助手**：本地知识库 (RAG)、历史记录管理。
*   **📝 辅助工具**：富文本备忘录、个人中心配置、系统集成（托盘/通知）。

### 技术栈

*   **前端**：`Vue 3`、`TypeScript`、`Pinia`、`Vue Router`、`Ant Design Vue`
*   **可视化**：`MapLibre GL JS` (GIS), `Three.js` (3D)
*   **构建工具**：`Vite`
*   **桌面框架**：`Electron`
*   **数据库**：`SQLite` (better-sqlite3)
*   **后端服务**：`Node.js`

---

## 2. 目录结构详解

```
d:\DXY\ElectTool\
├── .github/                # GitHub 配置 (CI/CD)
├── build/                  # 打包资源目录 (图标等)
├── electron/               # Electron 主进程代码
│   ├── main.cjs            # 主进程入口 (窗口, IPC, 数据库)
│   └── preload.cjs         # 预加载脚本 (安全 API)
├── server/                 # 后端服务代码 (远程模式)
├── src/                    # 前端渲染进程代码 (Vue)
│   ├── components/         # 公共组件
│   ├── pages/              # 页面视图 (AI, Map, 3D 等)
│   ├── stores/             # Pinia 状态管理
│   ├── utils/              # 工具函数
│   └── main.ts             # 入口文件
├── BUILD_GUIDE.md          # 打包发布指南
├── DEPLOY.md               # 服务器部署指南
└── package.json            # 项目依赖配置
```

---

## 3. 项目规划与需求 (PRD)

> 详细的规划文档请见：[`product_requirements.md`](./.trae/documents/product_requirements.md)

### 3.1 核心模块规划

#### GIS 模块 (Geographic Information System)
*   **目的**：提供离线地图查看、空间数据管理与分析能力。
*   **功能**：离线地图加载、矢量数据管理、图层控制、空间分析、运动轨迹分析、生活圈评估。
*   **技术栈**：MapLibre GL JS + Turf.js。

#### 3D 模块 (3D Visualization)
*   **目的**：提供本地 3D 模型查看、检查与简单规划能力。
*   **功能**：模型查看器、场景交互、模型检查、格式转换、家居规划、3D 打印预览。
*   **技术栈**：Babylon.js + glTF-Transform。

#### AI 模块 (Artificial Intelligence)
*   **目的**：集成大模型能力，提供智能对话与本地知识库支持。
*   **功能**：多模型对话 (OpenAI/DeepSeek)、历史记录管理、本地知识库 (RAG)、工具调用。
*   **技术栈**：OpenAI SDK + SQLite。

### 3.2 架构原则
*   **重前端，轻后端**：核心逻辑（地图渲染、模型交互、状态管理）在前端实现。
*   **后端服务化**：Electron 主进程仅作为“本地微服务”，负责文件/数据库操作。
*   **云端辅助**：仅用于轻量配置同步，确保离线可用性。

---

## 4. 数据采集指南

### GIS 数据
*   **工具**：OsmAnd (Android/iOS), GPX Tracker (iOS)。
*   **方式**：使用 App 录制轨迹 -> 导出 GPX -> 导入本软件。

### 3D 模型
*   **下载**：Sketchfab (筛选 CC0 免费模型)。
*   **自制**：Polycam (手机扫描生成 glTF)。

---

## 5. 服务部署/应用打包

*   **如何把代码部署到云服务器？**
    👉 请阅读 **[`DEPLOY.md`](./DEPLOY.md)**

*   **如何打包成安装包发给别人？**
    👉 请阅读 **[`BUILD_GUIDE.md`](./BUILD_GUIDE.md)**

---

## 6. 本地开发指南

### 环境准备
*   Node.js (推荐 v18 或 v20)
*   Git

### 启动开发环境
```powershell
# 1. 安装依赖
npm install

# 2. 启动开发环境 (同时启动 Vite 和 Electron)
npm run dev:app
```

### 启动独立后端 (可选)
```powershell
# 启动 Express 服务器 (默认端口 3000)
npm run server
```
