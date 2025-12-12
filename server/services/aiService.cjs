const aiRepo = require('../repositories/aiRepo.cjs')

const getAllSessions = () => {
  return aiRepo.getAll()
}

const getSessionById = (id) => {
  return aiRepo.getById(id)
}

const createSession = (session) => {
  return aiRepo.create(session)
}

const updateSession = (id, session) => {
  return aiRepo.update(id, session)
}

const deleteSession = (id) => {
  return aiRepo.remove(id)
}

module.exports = { getAllSessions, getSessionById, createSession, updateSession, deleteSession }
