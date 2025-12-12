const { db } = require('../db/sqlite.cjs')

function list(travelId) {
  if (travelId) {
    return db.prepare('SELECT id, travel_id AS travelId, city_code AS cityCode, city_name AS cityName, start_time AS startTime, end_time AS endTime, notes, created_at AS createdAt, updated_at AS updatedAt FROM city_visits WHERE travel_id = ? ORDER BY start_time DESC').all(travelId)
  }
  return db.prepare('SELECT id, travel_id AS travelId, city_code AS cityCode, city_name AS cityName, start_time AS startTime, end_time AS EndTime, notes, created_at AS createdAt, updated_at AS updatedAt FROM city_visits ORDER BY start_time DESC').all()
}

function create(entity) {
  db.prepare('INSERT INTO city_visits (id, travel_id, city_code, city_name, start_time, end_time, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .run(entity.id, entity.travelId, entity.cityCode, entity.cityName, entity.startTime, entity.endTime, entity.notes, entity.createdAt, entity.updatedAt)
  return entity
}

function get(id) {
  return db.prepare('SELECT id, travel_id AS travelId, city_code AS cityCode, city_name AS cityName, start_time AS startTime, end_time AS endTime, notes, created_at AS createdAt, updated_at AS updatedAt FROM city_visits WHERE id = ?').get(id)
}

function update(id, patch) {
  const prev = get(id)
  if (!prev) return null
  const now = new Date().toISOString()
  const next = {
    id: prev.id,
    travelId: patch.travelId != null ? patch.travelId : prev.travelId,
    cityCode: patch.cityCode != null ? String(patch.cityCode) : prev.cityCode,
    cityName: patch.cityName != null ? String(patch.cityName) : prev.cityName,
    startTime: patch.startTime != null ? String(patch.startTime) : prev.startTime,
    endTime: patch.endTime != null ? String(patch.endTime) : prev.endTime,
    notes: patch.notes != null ? String(patch.notes) : prev.notes,
    createdAt: prev.createdAt,
    updatedAt: now
  }
  db.prepare('UPDATE city_visits SET travel_id = ?, city_code = ?, city_name = ?, start_time = ?, end_time = ?, notes = ?, updated_at = ? WHERE id = ?')
    .run(next.travelId, next.cityCode, next.cityName, next.startTime, next.endTime, next.notes, next.updatedAt, id)
  return next
}

function remove(id) {
  db.prepare('DELETE FROM city_visits WHERE id = ?').run(id)
  return true
}

module.exports = { list, create, get, update, remove }
