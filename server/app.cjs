// 应用装配：中间件、路由挂载与错误处理
const express = require('express')
const cors = require('cors')
const { errorHandler } = require('./middlewares/error.cjs')
const { ensureDataDirs } = require('./utils/files.cjs')

// 初始化应用与基础中间件
const app = express()
app.use(cors())
app.use(express.json({ limit: '10mb' }))
ensureDataDirs()

// 路由模块挂载
app.use('/api', require('./routes/common.cjs'))
app.use('/api/projects', require('./routes/projects.cjs'))
app.use('/api/assets', require('./routes/assets.cjs'))
app.use('/api/scenes', require('./routes/scenes.cjs'))
app.use('/api/notes', require('./routes/notes.cjs'))
app.use('/api/profile', require('./routes/profile.cjs'))
app.use('/api/travels', require('./routes/travels.cjs'))
app.use('/api/city-visits', require('./routes/cityVisits.cjs'))
app.use('/api/markers', require('./routes/travelMarkers.cjs'))
app.use('/api/routes', require('./routes/travelRoutes.cjs'))
app.use('/api/ai', require('./routes/ai.cjs'))

// 全局错误处理中间件
app.use(errorHandler)

module.exports = app
