const { db } = require("../db/sqlite.cjs");

const getAll = () => {
  const stmt = db.prepare("SELECT * FROM ai_sessions ORDER BY updated_at DESC");
  return stmt.all().map((row) => ({
    ...row,
    updatedAt: row.updated_at,
    messages: JSON.parse(row.messages),
  }));
};

const getById = (id) => {
  const stmt = db.prepare("SELECT * FROM ai_sessions WHERE id = ?");
  const row = stmt.get(id);
  if (row) {
    row.updatedAt = row.updated_at;
    row.messages = JSON.parse(row.messages);
  }
  return row;
};

const create = (session) => {
  const stmt = db.prepare(
    "INSERT INTO ai_sessions (id, title, messages, updated_at) VALUES (?, ?, ?, ?)"
  );
  stmt.run(
    session.id,
    session.title,
    JSON.stringify(session.messages),
    session.updatedAt
  );
  return session;
};

const update = (id, session) => {
  const stmt = db.prepare(
    "UPDATE ai_sessions SET title = ?, messages = ?, updated_at = ? WHERE id = ?"
  );
  stmt.run(
    session.title,
    JSON.stringify(session.messages),
    session.updatedAt,
    id
  );
  return session;
};

const remove = (id) => {
  const stmt = db.prepare("DELETE FROM ai_sessions WHERE id = ?");
  stmt.run(id);
};

module.exports = { getAll, getById, create, update, remove };
