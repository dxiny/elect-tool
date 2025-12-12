const { genId } = require('../utils/id.cjs')
const repo = require('../repositories/routesRepo.cjs')

function list(visitId) { return repo.list(visitId || null) }

function create(payload) {
  const id = genId('route')
  const now = new Date().toISOString()
  const entity = {
    id,
    visitId: payload?.visitId || null,
    mode: String(payload?.mode || 'walk'),
    geojson: payload?.geojson || {},
    duration: Number(payload?.duration || 0),
    distance: Number(payload?.distance || 0),
    cost: Number(payload?.cost || 0),
    createdAt: now
  }
  return repo.create(entity)
}

function get(id) { return repo.get(id) }
function update(id, patch) { return repo.update(id, patch || {}) }
function remove(id) { return repo.remove(id) }

module.exports = { list, create, get, update, remove }
