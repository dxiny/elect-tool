// 入口文件：仅负责读取配置并启动 HTTP 服务，不包含业务逻辑
const http = require('http')
const { Server } = require('socket.io')
const { port } = require('./config/env.cjs')
const express = require('express')
const cors = require('cors')

let app
try {
  app = require('./app.cjs')
} catch (e) {
  app = express()
  app.use(cors())
  app.use(express.json())
  app.get('/', (req, res) => res.send('Socket Server Running (Minimal Mode)'))
}

const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})

const drawHandler = require('./socket/drawHandler.cjs')
const chessHandler = require('./socket/chessHandler.cjs')

io.on('connection', socket => {
  console.log('User connected:', socket.id)

  drawHandler(io, socket)
  chessHandler(io, socket)

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
  })
})

// 启动监听
server.listen(port, () => {
  console.log(`服务已启动，端口：${port}`)
})
