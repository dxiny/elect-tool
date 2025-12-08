// 项目路由：项目的增删改查
const express = require('express')
const ctrl = require('../controllers/projectsController.cjs')
const router = express.Router()

router.get('/', ctrl.list)
router.post('/', ctrl.create)
router.get('/:id', ctrl.get)
router.put('/:id', ctrl.update)
router.delete('/:id', ctrl.remove)

module.exports = router
