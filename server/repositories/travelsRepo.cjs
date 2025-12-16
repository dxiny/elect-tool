const { db } = require("../db/sqlite.cjs");

function list() {
  return db
    .prepare(
      "SELECT id, title, start_date AS startDate, end_date AS endDate, total_cost AS totalCost, rating, created_at AS createdAt, updated_at AS updatedAt FROM travels ORDER BY created_at DESC"
    )
    .all();
}

function create(entity) {
  db.prepare(
    "INSERT INTO travels (id, title, start_date, end_date, total_cost, rating, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  ).run(
    entity.id,
    entity.title,
    entity.startDate,
    entity.endDate,
    entity.totalCost,
    entity.rating,
    entity.createdAt,
    entity.updatedAt
  );
  return entity;
}

function get(id) {
  return db
    .prepare(
      "SELECT id, title, start_date AS startDate, end_date AS endDate, total_cost AS totalCost, rating, created_at AS createdAt, updated_at AS updatedAt FROM travels WHERE id = ?"
    )
    .get(id);
}

function update(id, patch) {
  const prev = get(id);
  if (!prev) return null;
  const now = new Date().toISOString();
  const next = {
    id: prev.id,
    title: patch.title != null ? String(patch.title) : prev.title,
    startDate:
      patch.startDate != null ? String(patch.startDate) : prev.startDate,
    endDate: patch.endDate != null ? String(patch.endDate) : prev.endDate,
    totalCost:
      patch.totalCost != null ? Number(patch.totalCost) : prev.totalCost,
    rating: patch.rating != null ? Number(patch.rating) : prev.rating,
    createdAt: prev.createdAt,
    updatedAt: now,
  };
  db.prepare(
    "UPDATE travels SET title = ?, start_date = ?, end_date = ?, total_cost = ?, rating = ?, updated_at = ? WHERE id = ?"
  ).run(
    next.title,
    next.startDate,
    next.endDate,
    next.totalCost,
    next.rating,
    next.updatedAt,
    id
  );
  return next;
}

function remove(id) {
  db.prepare("DELETE FROM travels WHERE id = ?").run(id);
  return true;
}

module.exports = { list, create, get, update, remove };
