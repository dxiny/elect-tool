// 场景路由：three.js 场景图的增查与版本管理（clone 可后续扩展）
const express = require('express')
const ctrl = require('../controllers/scenesController.cjs')
const router = express.Router()

router.get('/', ctrl.list)
router.post('/', ctrl.create)
router.get('/:id', ctrl.get)

module.exports = router
