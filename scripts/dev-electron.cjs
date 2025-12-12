const http = require('http')
const { spawn } = require('child_process')

const DEFAULT_PORT = 4002
const timeoutMs = 120000

const isWin = process.platform === 'win32'
const npxCmd = isWin ? 'npx.cmd' : 'npx'

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
  // Always try to start Vite in dev:electron
  const vite = spawn(npxCmd, ['vite', '--port', String(DEFAULT_PORT), '--strictPort'], { stdio: 'inherit' })

  // Graceful cleanup
  const clean = () => {
    if (!vite.killed) {
      try { vite.kill('SIGINT') } catch {}
    }
  }
  process.on('SIGINT', clean)
  process.on('SIGTERM', clean)

  // Wait for dev server and then launch Electron
  const port = (await waitForPort(DEFAULT_PORT))
    || (await waitForPort(5173))
    || (await waitForPort(4001))
    || (await waitForPort(3000))
  if (!port) {
    console.error('开发服务在超时时间内未就绪')
    clean()
    process.exit(1)
  }

  const env = { ...process.env, ELECTRON_RENDERER_URL: `http://localhost:${port}` }
  const electron = spawn(npxCmd, ['electron', '.'], { stdio: 'inherit', env })
  electron.on('exit', (code) => {
    clean()
    process.exit(code ?? 0)
  })
})()
