// 场景仓储：scenes 表的 SQL 读写
const { db } = require('../db/sqlite.cjs')

function list(projectId) {
  if (projectId) {
    return db.prepare('SELECT id, project_id AS projectId, name, version, graph_json AS graphJson, created_at AS createdAt FROM scenes WHERE project_id = ? ORDER BY created_at DESC').all(projectId)
  }
  return db.prepare('SELECT id, project_id AS projectId, name, version, graph_json AS graphJson, created_at AS createdAt FROM scenes ORDER BY created_at DESC').all()
}

function create(entity) {
  db.prepare('INSERT INTO scenes (id, project_id, name, version, graph_json, created_at) VALUES (?, ?, ?, ?, ?, ?)')
    .run(entity.id, entity.projectId, entity.name, entity.version, entity.graphJson, entity.createdAt)
  return entity
}

function get(id) {
  return db.prepare('SELECT id, project_id AS projectId, name, version, graph_json AS graphJson, created_at AS createdAt FROM scenes WHERE id = ?').get(id)
}

module.exports = { list, create, get }
