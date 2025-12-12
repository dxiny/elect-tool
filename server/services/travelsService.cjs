const { genId } = require('../utils/id.cjs')
const repo = require('../repositories/travelsRepo.cjs')

function list() { return repo.list() }

function create(payload) {
  const id = genId('travel')
  const now = new Date().toISOString()
  const entity = {
    id,
    title: String(payload?.title || ''),
    startDate: String(payload?.startDate || ''),
    endDate: String(payload?.endDate || ''),
    totalCost: Number(payload?.totalCost || 0),
    rating: Number(payload?.rating || 0),
    createdAt: now,
    updatedAt: now
  }
  return repo.create(entity)
}

function get(id) { return repo.get(id) }
function update(id, patch) { return repo.update(id, patch || {}) }
function remove(id) { return repo.remove(id) }

module.exports = { list, create, get, update, remove }
