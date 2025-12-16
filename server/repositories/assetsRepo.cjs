// 资产仓储：assets 表的 SQL 读写与 metadata JSON 反序列化
const { db } = require("../db/sqlite.cjs");

function list(projectId) {
  if (projectId) {
    const rows = db
      .prepare(
        "SELECT id, project_id AS projectId, type, filename, path, size, hash, metadata, created_at AS createdAt FROM assets WHERE project_id = ? ORDER BY created_at DESC"
      )
      .all(projectId);
    return rows.map((r) => ({
      ...r,
      metadata: r.metadata ? JSON.parse(r.metadata) : {},
    }));
  }
  const rows = db
    .prepare(
      "SELECT id, project_id AS projectId, type, filename, path, size, hash, metadata, created_at AS createdAt FROM assets ORDER BY created_at DESC"
    )
    .all();
  return rows.map((r) => ({
    ...r,
    metadata: r.metadata ? JSON.parse(r.metadata) : {},
  }));
}

function create(entity) {
  db.prepare(
    "INSERT INTO assets (id, project_id, type, filename, path, size, hash, metadata, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
  ).run(
    entity.id,
    entity.projectId,
    entity.type,
    entity.filename,
    entity.path,
    entity.size,
    entity.hash,
    JSON.stringify(entity.metadata || {}),
    entity.createdAt
  );
  return entity;
}

function get(id) {
  const row = db
    .prepare(
      "SELECT id, project_id AS projectId, type, filename, path, size, hash, metadata, created_at AS createdAt FROM assets WHERE id = ?"
    )
    .get(id);
  if (!row) return null;
  return { ...row, metadata: row.metadata ? JSON.parse(row.metadata) : {} };
}

function remove(id) {
  db.prepare("DELETE FROM assets WHERE id = ?").run(id);
  return true;
}

module.exports = { list, create, get, remove };
