const http = require('http')
const { spawn } = require('child_process')

// 默认端口号
const DEFAULT_PORT = 4002
// 超时时间（毫秒）
const timeoutMs = 120000

// 判断是否为 Windows 平台
const isWin = process.platform === 'win32'
// Windows 下使用 npx.cmd，其他平台使用 npx
const npxCmd = isWin ? 'npx.cmd' : 'npx'

/**
 * 检查指定 URL 是否可以访问
 * @param {string} url - 要检查的 URL
 * @returns {Promise<boolean>} - 如果可以访问返回 true，否则返回 false
 */
function check(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      res.resume()
      resolve(true)
    })
    req.on('error', () => resolve(false))
    req.setTimeout(1500, () => {
      req.destroy()
      resolve(false)
    })
  })
}

/**
 * 等待指定端口启动
 * @param {number} port - 要等待的端口号
 * @returns {Promise<number|null>} - 如果端口可用返回端口号，超时返回 null
 */
async function waitForPort(port) {
  const start = Date.now()
  const url = `http://localhost:${port}/`
  while (Date.now() - start < timeoutMs) {
    if (await check(url)) return port
    await new Promise((r) => setTimeout(r, 500))
  }
  return null
}

(async () => {
  // 始终尝试启动 Vite 开发服务器
  // 使用 --strictPort 确保端口被占用时直接报错而不是尝试下一个端口（虽然这里只指定了一个）
  const vite = spawn(npxCmd, ['vite', '--port', String(DEFAULT_PORT), '--strictPort'], { stdio: 'inherit' })

  // 退出函数
  const clean = () => {
    if (!vite.killed) {
      try { vite.kill('SIGINT') } catch {}
    }
  }
  // 监听进程终止信号
  process.on('SIGINT', clean)
  process.on('SIGTERM', clean)

  // 等待开发服务器就绪，然后启动 Electron
  // 尝试连接几个常用的开发端口
  const port = (await waitForPort(DEFAULT_PORT))
    || (await waitForPort(5173))
    || (await waitForPort(4001))
    || (await waitForPort(3000))
  
  if (!port) {
    console.error('开发服务在超时时间内未就绪')
    clean()
    process.exit(1)
  }

  // 设置环境变量，告诉 Electron 渲染进程的 URL
  const env = { ...process.env, ELECTRON_RENDERER_URL: `http://localhost:${port}` }
  // 启动 Electron
  const electron = spawn(npxCmd, ['electron', '.'], { stdio: 'inherit', env })
  
  // Electron 退出时清理并退出当前进程
  electron.on('exit', (code) => {
    clean()
    process.exit(code ?? 0)
  })
})()
