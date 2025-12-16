# ElectTool 项目分享文档

## 1. 项目概览

ElectTool 是一个基于 Electron + Vue 3 + Node.js 的桌面应用，集成了 GIS 服务、3D 模型、AI 助手等功能。项目采用前后端分离架构，支持 gis 相关服务、3d 模型可视化、ai 助手等功能。

**核心技术栈：**

- **桌面端框架**: Electron
- **前端框架**: Vue 3 + TypeScript + Vite
- **UI 组件库**: Ant Design Vue
- **后端服务**: Node.js (Express)
- **数据库**: SQLite (better-sqlite3)
- **可视化**: Three.js + earth-flyline
- **自动化打包**: GitHub Actions
- **云服务器**: 阿里云

---

## 2. 详细实现介绍

### 2.1 Electron 搭建

Electron 负责将 Web 应用封装为桌面应用，并提供系统底层 API 的访问能力。

- **入口文件 (`electron/main.cjs`)**:
  负责创建浏览器窗口、管理应用生命周期、处理进程间通信 (IPC)。

  ```javascript
  const { app, BrowserWindow, ipcMain } = require("electron");
  const path = require("path");

  function createWindow() {
    const win = new BrowserWindow({
      width: 1200,
      height: 800,
      frame: false, // 无边框模式，自定义标题栏
      webPreferences: {
        preload: path.join(__dirname, "preload.cjs"), // 预加载脚本
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    if (process.env.VITE_DEV_SERVER_URL) {
      // 开发模式加载 Vite 服务
      win.loadURL(process.env.VITE_DEV_SERVER_URL);
    } else {
      // 生产模式加载构建文件
      win.loadFile(path.join(__dirname, "../dist/index.html"));
    }
  }
  ```

- **预加载脚本 (`electron/preload.cjs`)**:
  通过 `contextBridge` 安全地将部分 Node.js 能力暴露给渲染进程。

  ```javascript
  const { contextBridge, ipcRenderer } = require("electron");

  contextBridge.exposeInMainWorld("electronAPI", {
    minimizeWindow: () => ipcRenderer.send("window-min"),
    maximizeWindow: () => ipcRenderer.send("window-max"),
    closeWindow: () => ipcRenderer.send("window-close"),
  });
  ```

### 2.2 Node 后端服务搭建

后端服务主要用于处理数据持久化、文件上传等业务。本项目已包含一个**分层式**的 Node.js 服务（Express + SQLite），并提供了完整的增删改查示例。

#### 快速启动

- 运行后端：`npm run server`
- 服务地址：`http://localhost:3000`
- 数据库文件：`server/data/app.db`

#### 架构分层（从外到内）

- 路由层：将 HTTP 路径与控制器函数绑定（`server/routes/*.cjs`）
- 控制器层：只负责接收参数、调用服务、返回响应（`server/controllers/*.cjs`）
- 服务层：执行业务规则、拼接实体、做校验（`server/services/*.cjs`）
- 仓储层：与数据库交互（`server/repositories/*.cjs`）
- 数据库与建表：`server/db/sqlite.cjs`

下面用“笔记”模块 `notes` 展示最简单的 CRUD 业务全链路。

#### 1) 路由：声明 RESTful 路径

`server/routes/notes.cjs`

```js
router.get("/", ctrl.list); // 列表查询
router.post("/", ctrl.create); // 新增
router.get("/:id", ctrl.get); // 详情
router.put("/:id", ctrl.update); // 更新
router.delete("/:id", ctrl.remove); // 删除
```

#### 2) 控制器：入参/出参与错误兜底

`server/controllers/notesController.cjs`

```js
async function create(req, res, next) {
  try {
    // 从请求体读取数据，交给服务层
    const data = await service.create(req.body || {});
    // 统一成功响应结构
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  } // 交给全局错误处理中间件
}
```

#### 3) 服务：拼装实体、执行业务规则

`server/services/notesService.cjs:8-21`

```js
function create(payload) {
  const id = genId("note"); // 生成业务主键
  const now = new Date().toISOString(); // 统一时间戳
  const entity = {
    id,
    projectId: payload?.projectId || null,
    title: String(payload?.title || ""), // 字段类型与默认值
    contentHtml: String(payload?.contentHtml || ""),
    tags: Array.isArray(payload?.tags) ? payload.tags : [],
    createdAt: now,
    updatedAt: now,
  };
  return repo.create(entity); // 调用仓储层写库
}
```

#### 4) 仓储：SQL 与数据落库/回读

`server/repositories/notesRepo.cjs:17-21`

```js
function create(entity) {
  db.prepare(
    "INSERT INTO notes (id, project_id, title, content_html, tags_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).run(
    entity.id,
    entity.projectId,
    entity.title,
    entity.contentHtml,
    JSON.stringify(entity.tags || []),
    entity.createdAt,
    entity.updatedAt
  );
  return entity;
}
```

> SQLite 连接与建表在 `server/db/sqlite.cjs` 完成，首次启动会自动创建数据文件与表结构。

#### 5) 使用示例

```bash
# 新增
curl -X POST http://localhost:3000/api/notes \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": null,
    "title": "我的第一条笔记",
    "contentHtml": "<p>Hello ElectTool</p>",
    "tags": ["demo"]
  }'

# 查询列表
curl http://localhost:3000/api/notes

# 查询详情
curl http://localhost:3000/api/notes/<id>

# 更新
curl -X PUT http://localhost:3000/api/notes/<id> \
  -H "Content-Type: application/json" \
  -d '{"title": "标题已更新"}'

# 删除
curl -X DELETE http://localhost:3000/api/notes/<id>
```


### 2.3 前端代码结合 GitHub 流水线实现自动打包

通过 GitHub Actions 实现代码提交后自动构建 Windows 和 macOS 安装包。

- **Workflow 配置文件 (`.github/workflows/build.yml`)**:

  ```yaml
  name: Build/Release
  on:
    push:
      tags: ["v*"] # 仅在推送 v 开头的 tag 时触发

  jobs:
    release:
      runs-on: ${{ matrix.os }}
      strategy:
        matrix:
          os: [macos-latest, windows-latest] # 并行构建双平台

      steps:
        - uses: actions/checkout@v4
        - uses: actions/setup-node@v4
          with:
            node-version: 20
        - run: npm install
        - name: Build & Release
          uses: samuelmeuli/action-electron-builder@v1
          with:
            github_token: ${{ secrets.GITHUB_TOKEN }}
            release: true # 自动发布到 GitHub Releases
  ```

### 2.4 后端服务器购买、部署及上云

为了让应用具备云端同步能力，我们将 Node.js 服务部署在云服务器上。

1.  **服务器购买**: 选择了阿里云的轻量应用服务器，配置 Linux 系统(Ubuntu)。
2.  **环境配置**:
    - 安装 Node.js (使用 nvm 管理版本)。
    - 安装 PM2 (进程守护工具，保证服务崩溃自动重启)。
    - 配置 Nginx (反向代理，配置 SSL 证书实现 HTTPS)。
3.  **部署流程**:
    - 将 `server/` 目录代码上传至服务器。
    - 运行 `npm install` 安装依赖。
    - 使用 `pm2 start server/index.cjs --name elect-server` 启动服务。

### 2.5 前端 Three.js 实现地球旋转 + 飞线图

在 GIS 页面 (`src/pages/gis/Index.vue`) 中，利用 `three.js` 和 `earth-flyline` 库实现了地球效果。

- **核心实现**:

  ```typescript
  import earthFlyLine from "earth-flyline";
  import geojson from "@/assets/map/world.json";

  const initGlobe = () => {
    earthFlyLine.registerMap("world", geojson); // 注册地图数据
    const dom = document.getElementById("container");

    const config = {
      R: 240, // 地球半径
      earth: { color: "#13162c" }, // 地球颜色
      flyLineStyle: { color: "#cd79ff" }, // 飞线颜色
      // ...更多配置
    };

    chart = earthFlyLine.init({
      dom,
      map: "world",
      config,
      limitFps: true, // 限制帧率优化性能
    });
  };
  ```

### 2.6 主题过渡动画 + Logo 点击弹窗操作按钮

- **主题过渡动画 (`src/components/ThemeSwitch.vue`)**:
  使用原生的 View Transitions API 实现点击处的圆形扩散切换效果。

  ```typescript
  const TOGGLE = (e: MouseEvent) => {
    // ...计算点击位置 x, y 和半径 endRadius

    const transition = document.startViewTransition(async () => {
      toggleDarkMode(!isDark); // 切换 DOM 状态
      await nextTick();
    });

    transition.ready.then(() => {
      // 执行圆形裁剪动画
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        { duration: 500, pseudoElement: "::view-transition-new(root)" }
      );
    });
  };
  ```

- **Logo 径向菜单 (`src/components/LogoRadialMenu.vue`)**:
  点击左上角 Logo 展开径向菜单，包含最小化、最大化、关闭等功能。通过 CSS `transform` 和 `transition-delay` 实现扇形展开动画。

### 2.7 macOS 系统下项目无签名运行

由于没有购买 Apple 开发者证书，打包出的 macOS 应用未签名，用户安装时会提示“文件已损坏”或“无法验证开发者”。

**解决方案**:
引导用户在终端执行以下命令，移除应用的隔离属性（Quarantine Attribute）：

```bash
sudo xattr -r -d com.apple.quarantine /Applications/ElectTool.app
```

或者在“系统设置 -> 隐私与安全性”中选择“仍要打开”。

---

## 3. 总结

### 当前完成情况

✅ **基础框架**: Electron + Vue3 + Node.js 全栈环境搭建完成。
✅ **自动化**: GitHub Actions 自动构建发布流程已跑通。
✅ **核心功能**: 3D 地球可视化、离线地图加载、AI 助手基础对话。
✅ **UI/UX**: 完成了暗黑模式切换、自定义无边框窗口及交互设计。

### 待完成与后续规划

1.  **AI 深度集成**: 目前仅接入了基础对话，后续计划接入本地 LLM (如 Llama 3) 运行在 Electron 内部，并实现信息存储, 构建本地知识库。
2.  **GIS 功能增强**: 增加更多空间分析工具（缓冲区分析、路径规划）。
3.  **用户系统完善**: 完善云端同步机制，支持多端数据实时同步。
4.  **性能优化**: 优化 3D 模型加载速度，减少内存占用。

---
