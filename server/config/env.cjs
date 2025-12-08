// 环境配置：端口与数据目录
const { join } = require('path')

// 服务端口
const port = process.env.PORT ? Number(process.env.PORT) : 3000
// 数据目录（含数据库文件与资产目录）
const dataDir = process.env.APP_DATA_DIR || join(__dirname, '..', 'data')

module.exports = { port, dataDir }
