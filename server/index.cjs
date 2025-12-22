// 入口文件：仅负责读取配置并启动 HTTP 服务，不包含业务逻辑
const http = require('http')
const { Server } = require('socket.io')
const { port } = 3002
const express = require('express')
const cors = require('cors')

let app
try {
  // 尝试加载主应用逻辑（包含路由、中间件等）
  app = require('./app.cjs')
} catch (e) {
  // 如果加载失败，降级为最小化 Express 应用（通常用于测试或环境配置不完整时）
  console.warn('加载 app.cjs 失败，降级为最小模式:', e.message)
  app = express()
  app.use(cors())
  app.use(express.json())
  app.get('/', (req, res) => res.send('Socket Server Running (Minimal Mode)'))
}

// 创建 HTTP 服务器
const server = http.createServer(app)

// 初始化 Socket.IO 服务
// 允许跨域请求，以便前端可以在不同端口或域名下连接
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
  },
  allowEIO3: true // 兼容旧版本协议
})

// 引入游戏逻辑处理器
const chessHandler = require('./socket/chessHandler.cjs')

// 监听 Socket 连接事件
io.on('connection', socket => {
  console.log('User connected:', socket.id)

  // 注册游戏处理器
  chessHandler(io, socket)

  // 监听断开连接
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
  })
})

// 启动服务器监听指定端口
// 强制使用 3002 端口并监听 0.0.0.0 (IPv4)，避免端口冲突和 IP 绑定问题
const PORT = 3002
server.listen(PORT, '0.0.0.0', () => {
  console.log(`服务已启动，端口：${PORT}`)
})
