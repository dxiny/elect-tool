const { db } = require("../db/sqlite.cjs");

function list(visitId) {
  if (visitId) {
    return db
      .prepare(
        "SELECT id, visit_id AS visitId, mode, geojson, duration, distance, cost, created_at AS createdAt FROM travel_routes WHERE visit_id = ? ORDER BY created_at DESC"
      )
      .all(visitId);
  }
  return db
    .prepare(
      "SELECT id, visit_id AS visitId, mode, geojson, duration, distance, cost, created_at AS createdAt FROM travel_routes ORDER BY created_at DESC"
    )
    .all();
}

function create(entity) {
  db.prepare(
    "INSERT INTO travel_routes (id, visit_id, mode, geojson, duration, distance, cost, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  ).run(
    entity.id,
    entity.visitId,
    entity.mode,
    JSON.stringify(entity.geojson || {}),
    entity.duration,
    entity.distance,
    entity.cost,
    entity.createdAt
  );
  return entity;
}

function get(id) {
  const r = db
    .prepare(
      "SELECT id, visit_id AS visitId, mode, geojson, duration, distance, cost, created_at AS createdAt FROM travel_routes WHERE id = ?"
    )
    .get(id);
  if (!r) return null;
  return { ...r, geojson: r.geojson ? JSON.parse(r.geojson) : {} };
}

function update(id, patch) {
  const prev = get(id);
  if (!prev) return null;
  const next = {
    id: prev.id,
    visitId: patch.visitId != null ? patch.visitId : prev.visitId,
    mode: patch.mode != null ? String(patch.mode) : prev.mode,
    geojson: patch.geojson != null ? patch.geojson : prev.geojson,
    duration: patch.duration != null ? Number(patch.duration) : prev.duration,
    distance: patch.distance != null ? Number(patch.distance) : prev.distance,
    cost: patch.cost != null ? Number(patch.cost) : prev.cost,
    createdAt: prev.createdAt,
  };
  db.prepare(
    "UPDATE travel_routes SET visit_id = ?, mode = ?, geojson = ?, duration = ?, distance = ?, cost = ? WHERE id = ?"
  ).run(
    next.visitId,
    next.mode,
    JSON.stringify(next.geojson || {}),
    next.duration,
    next.distance,
    next.cost,
    id
  );
  return next;
}

function remove(id) {
  db.prepare("DELETE FROM travel_routes WHERE id = ?").run(id);
  return true;
}

module.exports = { list, create, get, update, remove };
