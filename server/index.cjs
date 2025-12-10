// 入口文件：仅负责读取配置并启动 HTTP 服务，不包含业务逻辑
const app = require('./app.cjs')
const { port } = require('./config/env.cjs')

// 启动监听
const server = app.listen(port, () => {
  console.log(`服务已启动，端口：${port}`)
})
