const { db } = require('../db/sqlite.cjs')

function list(projectId, q) {
  let rows
  if (projectId) {
    rows = db.prepare('SELECT id, project_id AS projectId, title, content_html AS contentHtml, tags_json AS tagsJson, created_at AS createdAt, updated_at AS updatedAt FROM notes WHERE project_id = ? ORDER BY updated_at DESC').all(projectId)
  } else {
    rows = db.prepare('SELECT id, project_id AS projectId, title, content_html AS contentHtml, tags_json AS tagsJson, created_at AS createdAt, updated_at AS updatedAt FROM notes ORDER BY updated_at DESC').all()
  }
  if (q && q.trim()) {
    const s = q.trim().toLowerCase()
    rows = rows.filter(r => (r.title || '').toLowerCase().includes(s) || (r.contentHtml || '').toLowerCase().includes(s))
  }
  return rows.map(r => ({ ...r, tags: r.tagsJson ? JSON.parse(r.tagsJson) : [] }))
}

function create(entity) {
  db.prepare('INSERT INTO notes (id, project_id, title, content_html, tags_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(entity.id, entity.projectId, entity.title, entity.contentHtml, JSON.stringify(entity.tags || []), entity.createdAt, entity.updatedAt)
  return entity
}

function get(id) {
  const row = db.prepare('SELECT id, project_id AS projectId, title, content_html AS contentHtml, tags_json AS tagsJson, created_at AS createdAt, updated_at AS UpdatedAt FROM notes WHERE id = ?').get(id)
  if (!row) return null
  return { ...row, tags: row.tagsJson ? JSON.parse(row.tagsJson) : [] }
}

function update(id, patch) {
  const prev = get(id)
  if (!prev) return null
  const next = {
    id: prev.id,
    projectId: patch.projectId != null ? patch.projectId : prev.projectId,
    title: patch.title != null ? String(patch.title) : prev.title,
    contentHtml: patch.contentHtml != null ? String(patch.contentHtml) : prev.contentHtml,
    tags: patch.tags != null ? patch.tags : prev.tags,
    createdAt: prev.createdAt,
    updatedAt: new Date().toISOString()
  }
  db.prepare('UPDATE notes SET project_id = ?, title = ?, content_html = ?, tags_json = ?, updated_at = ? WHERE id = ?')
    .run(next.projectId, next.title, next.contentHtml, JSON.stringify(next.tags || []), next.updatedAt, id)
  return next
}

function remove(id) {
  db.prepare('DELETE FROM notes WHERE id = ?').run(id)
  return true
}

module.exports = { list, create, get, update, remove }
