// 公共路由：健康检查与版本信息
const express = require('express')
const ctrl = require('../controllers/commonController.cjs')
const router = express.Router()

router.get('/health', ctrl.health)
router.get('/version', ctrl.version)

module.exports = router
