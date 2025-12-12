const express = require('express')
const router = express.Router()
const aiController = require('../controllers/aiController.cjs')

router.get('/', aiController.list)
router.post('/', aiController.create)
router.put('/:id', aiController.update)
router.delete('/:id', aiController.remove)

module.exports = router
