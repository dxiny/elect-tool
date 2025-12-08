const { join } = require('path')
const Database = require('better-sqlite3')

function getDbFile() {
  const base = process.env.APP_DATA_DIR || join(__dirname, 'data')
  return join(base, 'app.db')
}

function open() {
  const file = getDbFile()
  const db = new Database(file)
  db.pragma('journal_mode = WAL')
  db.exec('CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, name TEXT NOT NULL, owner_id TEXT, description TEXT, created_at TEXT)')
  db.exec('CREATE TABLE IF NOT EXISTS assets (id TEXT PRIMARY KEY, project_id TEXT, type TEXT, filename TEXT, path TEXT, size INTEGER, hash TEXT, metadata TEXT, created_at TEXT)')
  return db
}

module.exports = { open }
