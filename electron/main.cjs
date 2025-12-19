const { app, BrowserWindow, ipcMain, dialog, Menu, shell } = require('electron')
const { join } = require('path')
const fs = require('fs').promises

let mainWindow

/**
 * 创建主应用窗口
 */
function createWindow() {
  // 根据操作系统设置应用图标路径
  const iconPath =
    process.platform === 'win32'
      ? join(__dirname, '../build/iconWin.ico')
      : join(__dirname, '../build/iconMac.icns')

  // 初始化浏览器窗口
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 960,
    minHeight: 600,
    show: false, // 初始隐藏，等待加载完成后显示，防止白屏
    frame: false, // 无边框模式，自定义标题栏
    icon: iconPath,
    autoHideMenuBar: true, // 自动隐藏菜单栏
    webPreferences: {
      preload: join(__dirname, '../electron/preload.cjs'), // 预加载脚本路径
      sandbox: false, // 禁用沙箱
      contextIsolation: true, // 开启上下文隔离，保护渲染进程安全
      enableRemoteModule: false, // 禁用 remote 模块
      nodeIntegration: false // 禁用 Node.js 集成（禁止渲染进程直接使用 Node API）
    }
  })

  // 当窗口准备好显示时触发,展示窗口
  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  // 禁用窗口单独缩放功能，保持界面比例
  mainWindow.webContents.setVisualZoomLevelLimits(1, 1)
  mainWindow.webContents.on('before-input-event', (event, input) => {
    // 拦截 Ctrl + +/-/0 快捷键，防止页面内容缩放
    if (input.type === 'keyDown' && (input.control || input.meta)) {
      const key = String(input.key)
      if (key === '+' || key === '=' || key === '-' || key === '0') {
        event.preventDefault()
      }
    }
  })
  
  // 页面加载完成后，再次强制重置缩放比例
  mainWindow.webContents.on('did-finish-load', () => {
    try {
      mainWindow.webContents.setZoomFactor(1)
    } catch {}
  })

  // 处理窗口内链接点击，强制使用默认浏览器打开外部链接
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // 加载页面：开发环境加载 URL，生产环境加载本地文件
  if (process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../dist/index.html'))
  }
}

// 当 Electron 初始化完成并准备好创建浏览器窗口时调用
app.whenReady().then(() => {
  // 设置 Windows 任务栏的应用 ID
  app.setAppUserModelId('com.elect.tool')

  createWindow()

  // macOS 专用：当点击 dock 图标且没有其他窗口打开时，重新创建窗口
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// 当所有窗口关闭时退出应用
app.on('window-all-closed', () => {
  // macOS 习惯：应用通常保持激活状态直到用户显式退出 (Cmd + Q)
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// ==========================================
// IPC 通信接口：处理渲染进程发送的消息
// ==========================================

// 获取应用版本号
ipcMain.handle('app:getVersion', () => {
  return app.getVersion()
})

// 获取系统特定路径 (如 home, appData, temp 等)
ipcMain.handle('app:getPath', (_, name) => {
  return app.getPath(name)
})

// 窗口控制：最小化
ipcMain.handle('window:minimize', () => {
  mainWindow?.minimize()
})

// 窗口控制：最大化/还原
ipcMain.handle('window:maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize()
  } else {
    mainWindow?.maximize()
  }
})

// 窗口控制：关闭
ipcMain.handle('window:close', () => {
  mainWindow?.close()
})

// ==========================================
// 文件系统操作 (fs)
// ==========================================

// 读取文件内容
ipcMain.handle('file:read', async (_, filePath) => {
  try {
    const content = await fs.readFile(filePath, 'utf-8')
    return { success: true, content }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

// 写入文件内容
ipcMain.handle('file:write', async (_, filePath, content) => {
  try {
    await fs.writeFile(filePath, content, 'utf-8')
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

// 删除文件
ipcMain.handle('file:delete', async (_, filePath) => {
  try {
    await fs.unlink(filePath)
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

// 打开文件选择对话框
ipcMain.handle('file:openDialog', async (_, options = {}) => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [
        { name: 'All Files', extensions: ['*'] },
        { name: 'Markdown', extensions: ['md', 'markdown'] },
        { name: 'Text', extensions: ['txt'] }
      ],
      ...options
    })
    return result
  } catch (error) {
    return { canceled: true, error: error.message }
  }
})

// 打开文件保存对话框
ipcMain.handle('file:saveDialog', async (_, options = {}) => {
  try {
    const result = await dialog.showSaveDialog(mainWindow, {
      filters: [
        { name: 'All Files', extensions: ['*'] },
        { name: 'Markdown', extensions: ['md', 'markdown'] },
        { name: 'Text', extensions: ['txt'] }
      ],
      ...options
    })
    return result
  } catch (error) {
    return { canceled: true, error: error.message }
  }
})
