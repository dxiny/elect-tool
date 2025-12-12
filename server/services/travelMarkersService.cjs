const { genId } = require('../utils/id.cjs')
const repo = require('../repositories/markersRepo.cjs')

function list(visitId) { return repo.list(visitId || null) }

function create(payload) {
  const id = genId('marker')
  const now = new Date().toISOString()
  const entity = {
    id,
    visitId: payload?.visitId || null,
    type: String(payload?.type || 'poi'),
    name: String(payload?.name || ''),
    lng: Number(payload?.lng || 0),
    lat: Number(payload?.lat || 0),
    cost: Number(payload?.cost || 0),
    note: String(payload?.note || ''),
    assets: Array.isArray(payload?.assets) ? payload.assets : [],
    createdAt: now
  }
  return repo.create(entity)
}

function get(id) { return repo.get(id) }
function update(id, patch) { return repo.update(id, patch || {}) }
function remove(id) { return repo.remove(id) }

module.exports = { list, create, get, update, remove }
