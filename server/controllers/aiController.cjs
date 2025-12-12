const aiService = require('../services/aiService.cjs')

const list = (req, res) => {
  const sessions = aiService.getAllSessions()
  res.json({ success: true, data: sessions })
}

const create = (req, res) => {
  const session = req.body
  const newSession = aiService.createSession(session)
  res.json({ success: true, data: newSession })
}

const update = (req, res) => {
  const { id } = req.params
  const session = req.body
  const updatedSession = aiService.updateSession(id, session)
  res.json({ success: true, data: updatedSession })
}

const remove = (req, res) => {
  const { id } = req.params
  aiService.deleteSession(id)
  res.json({ success: true, message: 'Deleted successfully' })
}

module.exports = { list, create, update, remove }
