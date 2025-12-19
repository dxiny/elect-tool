# ElectTool 全栈开发与部署实践分享稿

## 1. 项目概览与演示 (4分钟)

**【开场白】**
大家好，今天我要分享的是 **ElectTool**。一个基于 Electron + Vue 3 + Node.js 的全栈开发案例。

**【技术栈介绍】**
我们的技术选型非常现代化，旨在打通端到端的开发体验：
*   **前端**：使用 Vue 3 配合 Ant Design Vue。
*   **桌面壳**：Electron，负责提供一定系统能力（文件读写、窗口管理）。
*   **后端**：Node.js + Socket.io，实现了数据服务与实时通信。
*   **数据层**：SQLite (better-sqlite3)，轻量级的本地数据存储。
*   **工程化**：Vite 构建，GitHub Actions 自动化部署。

**【目录结构导览】**
```
d:\DXY\ElectTool\
├── .github/                # GitHub 配置 (CI/CD)
├── build/                  # 打包资源目录 (图标等)
├── electron/               # Electron 主进程代码
│   ├── main.cjs            # 主进程入口 (窗口, IPC, 数据库)
│   └── preload.cjs         # 预加载脚本 (安全 API)
├── server/                 # 后端服务代码
├── src/                    # 前端渲染进程代码 (Vue)
│   ├── api/                # API 调用模块
│   ├── assets/             # 静态资源 (图片, 地图json文件, 字体等)
│   ├── components/         # 公共组件
│   ├── pages/              # 页面视图 (AI, Map, 3D 等)
│   ├── stores/             # Pinia 状态管理
│   ├── utils/              # 工具函数
│   └── main.ts             # 入口文件
├── BUILD_GUIDE.md          # 打包发布指南
├── DEPLOY.md               # 服务器部署指南
└── package.json            # 项目依赖配置
```

**【功能演示】**
现在我启动应用带大家看一看：
1.  **工具箱**：比如这个“图片格式转换”，它演示了 Electron 如何操作本地文件系统。
2.  **GIS 可视化**：利用 WebGL 展示地球飞线效果。
3.  **实时服务**：*(打开“实时协作画板”)* 这是一个基于 WebSocket 的多人协作功能。我在这个窗口画画，另一个连接的客户端能实时看到。这展示了我们如何通过内置 Node 服务实现实时交互。

---

## 2. Electron 进程架构解析 (6分钟)

**【核心概念：双进程模型】**
Electron 的核心在于**主进程 (Main Process)** 和 **渲染进程 (Renderer Process)** 的分离。
*   **主进程** (`electron/main.cjs`)：负责创建窗口、管理应用生命周期、调用原生 API。它拥有 Node.js 的全部权限。
*   **渲染进程** (`src/pages/...`)：本质上就是我们熟悉的 Chrome 浏览器页面，负责 UI 展示。

**【关键实践：安全通信 IPC】**
在 ElectTool 中，我们采用了**上下文隔离 (Context Isolation)** 模式：
*(展示 `electron/preload.cjs` 代码)*
我们使用 `contextBridge` 搭建了一座安全的桥梁。前端页面不能直接 `require('fs')`，而是通过 `window.electronAPI.readFile()` 来请求服务。

*(展示 `electron/main.cjs` 中的 `ipcMain.handle` 代码)*
主进程监听这个请求，执行真正的文件操作，然后把结果返回给前端。这种模式既安全又清晰，完全解耦了 UI 和底层逻辑。

---

## 3. 前端构建与自动化打包 (6分钟)

**【Vite 构建体系】**
我们使用 Vite 作为构建工具。对于 Electron 项目，Vite 需要处理两个环境：
1.  编译 Vue 代码生成静态资源 (`dist/`)。
2.  处理 Electron 的主进程代码。
我们在 `package.json` 中配置了 `concurrently`，在开发时同时启动 Vite 服务和 Electron 窗口，实现了秒级的热更新体验。

**【electron-builder 打包配置】**
打包是将代码变成 `.exe` 或 `.dmg` 的过程。
*(展示 `package.json` 的 `build` 字段)*
我们配置了 `electron-builder`：
*   指定了 Windows (NSIS) 和 macOS (DMG) 的安装包格式。
*   **关键点**：`asarUnpack`。像 `better-sqlite3` 这样的原生模块 (.node文件)，不能被压缩进 asar 包中，必须解压出来才能被系统加载。

**【GitHub Actions 自动化】**
手动打包非常痛苦，尤其是跨平台编译。我们实现了完全的自动化：
*(展示 `.github/workflows/build.yml`)*
每当我们打上 `v*` 的标签（Tag），GitHub Actions 会自动：
1.  启动 Windows 和 macOS 的虚拟机。
2.  安装环境、编译代码。
3.  自动构建出安装包并发布到 GitHub Releases。
这不仅节省了时间，更保证了构建环境的一致性。

---

## 4. Node.js 后端服务实现 (6分钟)

**【架构设计：双模运行】**
ElectTool 的后端设计非常巧妙，它支持两种运行模式：
1.  **伴随模式**：作为 Electron 的子进程启动。我们在 `dev-electron.cjs` 脚本中，在启动 Electron 前先启动 Node 服务。这样用户安装应用后，本地就自带了一个服务器，可以离线使用所有功能。
2.  **独立模式**：`server/` 目录是一个标准的 Express 应用，完全可以单独部署到云服务器。

**【代码解析：Socket.io】**
*(展示 `server/index.cjs`)*
以画板功能为例，我们引入了 `socket.io`。
*   服务端监听 `draw-start` 等事件，收到数据后广播给所有连接的客户端。
*   这种设计极大地简化了实时应用的开发难度，代码量极少，但功能强大。

**【容错机制】**
在桌面端运行 Node 服务最大的挑战是环境差异。比如用户的系统可能缺少某些 VC++ 运行库，导致 SQLite 启动失败。
我们在这里做了**智能降级**：用 `try-catch` 包裹应用加载。如果数据库组件加载失败，服务会自动降级为“精简模式”，只提供 Socket 转发功能，保证画板可用，而不是直接崩溃。

---

## 5. 后端服务的云端部署 (6分钟)

**【从本地到云端】**
虽然 ElectTool 可以单机运行，但为了实现真正的跨设备协作，我们需要将 `server/` 部署上云。

**【部署流程】**
1.  **提取代码**：将 `server/` 目录单独提取出来。
2.  **环境准备**：在云服务器（如阿里云 ECS）上安装 Node.js (推荐使用 NVM 管理版本) 和 PM2 (进程守护)。
3.  **部署运行**：
    ```bash
    npm install --production
    pm2 start index.cjs --name "elect-server"
    ```
4.  **反向代理**：配置 Nginx 将域名的请求转发到 Node 服务的端口（如 3000），并配置 HTTPS 证书（Socket.io 在 HTTPS 下更稳定）。

**【客户端适配】**
在前端代码中，我们通过环境变量或配置文件来切换连接地址。开发时连 `localhost`，发布时连云端域名。这样，无论用户身处何地，只要打开 ElectTool，就能连上同一个云端房间进行协作。

---

## 6. 踩坑与问题解决 (4分钟)

**【问题一：内存溢出 (OOM)】**
**现象**：在 GitHub Actions 构建时，经常报 `JavaScript heap out of memory` 错误。
**原因**：CI 环境内存限制严格，而 Vite 打包大型项目且开启 SourceMap 时极其耗内存。
**解决**：
1.  在 `package.json` 的 build 命令中加入 `NODE_OPTIONS=--max-old-space-size=4096`，强行提升 Node 内存上限到 4GB。
2.  在生产构建配置中关闭 SourceMap (`sourcemap: false`)，显著降低了内存占用。

**【问题二：原生模块兼容性】**
**现象**：`better-sqlite3` 在开发环境好好的，打包后报错，或者在不同电脑上报错。
**原因**：这是 Node.js 的二进制模块 ABI 版本不一致导致的。Electron 内置的 Node 版本可能与本地开发安装的 Node 版本不同。
**解决**：
1.  利用 `electron-builder` 的自动 Rebuild 机制。
2.  在代码层面做好 `try-catch` 容错（如前所述的降级模式），永远不要让一个辅助功能的失败导致整个应用白屏。

---

## 7. 总结与展望 (2分钟)

**【总结】**
通过 ElectTool 这个项目，我们打通了 **Web 前端 -> Electron 桌面 -> Node 后端 -> 云端部署 -> CI/CD 自动化** 的全链路。这证明了 JavaScript 生态的强大，一套技术栈就能覆盖绝大多数应用场景。

**【未来方向】**
接下来我们将探索更前沿的方向：**AI 深度集成**。
计划在 Electron 内部集成轻量级的本地大模型（如 Llama 3 或 Qwen），利用用户本地的 GPU 算力。这样不仅能保护用户隐私，还能在离线状态下提供智能对话和代码辅助功能，让 ElectTool 真正成为一个“智能”工具箱。

谢谢大家！
