const { genId } = require('../utils/id.cjs')
const repo = require('../repositories/cityVisitsRepo.cjs')

function list(travelId) { return repo.list(travelId || null) }

function create(payload) {
  const id = genId('visit')
  const now = new Date().toISOString()
  const entity = {
    id,
    travelId: payload?.travelId || null,
    cityCode: String(payload?.cityCode || ''),
    cityName: String(payload?.cityName || ''),
    startTime: String(payload?.startTime || ''),
    endTime: String(payload?.endTime || ''),
    notes: String(payload?.notes || ''),
    createdAt: now,
    updatedAt: now
  }
  return repo.create(entity)
}

function get(id) { return repo.get(id) }
function update(id, patch) { return repo.update(id, patch || {}) }
function remove(id) { return repo.remove(id) }

module.exports = { list, create, get, update, remove }
