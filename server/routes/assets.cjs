// 资产路由：资源元数据的增删查与上传（后续可扩展multipart）
const express = require('express')
const ctrl = require('../controllers/assetsController.cjs')
const router = express.Router()

router.get('/', ctrl.list)
router.post('/', ctrl.create)
router.get('/:id', ctrl.get)
router.delete('/:id', ctrl.remove)

module.exports = router
