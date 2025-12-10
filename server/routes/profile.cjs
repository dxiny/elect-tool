const express = require('express')
const ctrl = require('../controllers/profileController.cjs')
const router = express.Router()

router.get('/', ctrl.getProfile)
router.put('/theme', ctrl.updateTheme)
router.put('/basic', ctrl.updateBasic)
router.put('/avatar', ctrl.updateAvatar)

module.exports = router
