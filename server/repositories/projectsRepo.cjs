// 项目仓储：所有与 projects 表的 SQL 读写
const { db } = require('../db/sqlite.cjs')

function list() {
  return db.prepare('SELECT id, name, owner_id AS ownerId, description, created_at AS createdAt FROM projects ORDER BY created_at DESC').all()
}

function create(entity) {
  db.prepare('INSERT INTO projects (id, name, owner_id, description, created_at) VALUES (?, ?, ?, ?, ?)')
    .run(entity.id, entity.name, entity.ownerId, entity.description, entity.createdAt)
  return entity
}

function get(id) {
  return db.prepare('SELECT id, name, owner_id AS ownerId, description, created_at AS createdAt FROM projects WHERE id = ?').get(id)
}

function update(id, patch) {
  const prev = get(id)
  if (!prev) return null
  const next = {
    id: prev.id,
    name: patch.name != null ? String(patch.name) : prev.name,
    ownerId: patch.ownerId != null ? patch.ownerId : prev.ownerId,
    description: patch.description != null ? String(patch.description) : prev.description,
    createdAt: prev.createdAt
  }
  db.prepare('UPDATE projects SET name = ?, owner_id = ?, description = ? WHERE id = ?')
    .run(next.name, next.ownerId, next.description, id)
  return next
}

function remove(id) {
  db.prepare('DELETE FROM projects WHERE id = ?').run(id)
  return true
}

module.exports = { list, create, get, update, remove }
