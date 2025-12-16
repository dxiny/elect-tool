const { db } = require("../db/sqlite.cjs");

function list(visitId) {
  if (visitId) {
    const rows = db
      .prepare(
        "SELECT id, visit_id AS visitId, type, name, lng, lat, cost, note, assets_json AS assetsJson, created_at AS createdAt FROM travel_markers WHERE visit_id = ? ORDER BY created_at DESC"
      )
      .all(visitId);
    return rows.map((r) => ({
      ...r,
      assets: r.assetsJson ? JSON.parse(r.assetsJson) : [],
    }));
  }
  const rows = db
    .prepare(
      "SELECT id, visit_id AS visitId, type, name, lng, lat, cost, note, assets_json AS assetsJson, created_at AS createdAt FROM travel_markers ORDER BY created_at DESC"
    )
    .all();
  return rows.map((r) => ({
    ...r,
    assets: r.assetsJson ? JSON.parse(r.assetsJson) : [],
  }));
}

function create(entity) {
  db.prepare(
    "INSERT INTO travel_markers (id, visit_id, type, name, lng, lat, cost, note, assets_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  ).run(
    entity.id,
    entity.visitId,
    entity.type,
    entity.name,
    entity.lng,
    entity.lat,
    entity.cost,
    entity.note,
    JSON.stringify(entity.assets || []),
    entity.createdAt
  );
  return entity;
}

function get(id) {
  const r = db
    .prepare(
      "SELECT id, visit_id AS visitId, type, name, lng, lat, cost, note, assets_json AS assetsJson, created_at AS createdAt FROM travel_markers WHERE id = ?"
    )
    .get(id);
  if (!r) return null;
  return { ...r, assets: r.assetsJson ? JSON.parse(r.assetsJson) : [] };
}

function update(id, patch) {
  const prev = get(id);
  if (!prev) return null;
  const next = {
    id: prev.id,
    visitId: patch.visitId != null ? patch.visitId : prev.visitId,
    type: patch.type != null ? String(patch.type) : prev.type,
    name: patch.name != null ? String(patch.name) : prev.name,
    lng: patch.lng != null ? Number(patch.lng) : prev.lng,
    lat: patch.lat != null ? Number(patch.lat) : prev.lat,
    cost: patch.cost != null ? Number(patch.cost) : prev.cost,
    note: patch.note != null ? String(patch.note) : prev.note,
    assets: patch.assets != null ? patch.assets : prev.assets,
    createdAt: prev.createdAt,
  };
  db.prepare(
    "UPDATE travel_markers SET visit_id = ?, type = ?, name = ?, lng = ?, lat = ?, cost = ?, note = ?, assets_json = ? WHERE id = ?"
  ).run(
    next.visitId,
    next.type,
    next.name,
    next.lng,
    next.lat,
    next.cost,
    next.note,
    JSON.stringify(next.assets || []),
    id
  );
  return next;
}

function remove(id) {
  db.prepare("DELETE FROM travel_markers WHERE id = ?").run(id);
  return true;
}

module.exports = { list, create, get, update, remove };
