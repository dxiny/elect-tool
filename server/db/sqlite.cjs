// SQLite 连接与建表：负责数据库文件创建与表结构初始化
const { join } = require('path')
const fs = require('fs')
const Database = require('better-sqlite3')
const { dataDir } = require('../config/env.cjs')

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true })
}

ensureDir(dataDir)
const file = join(dataDir, 'app.db')
const db = new Database(file)
db.pragma('journal_mode = WAL')
db.exec('CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, name TEXT NOT NULL, owner_id TEXT, description TEXT, created_at TEXT)')
db.exec('CREATE TABLE IF NOT EXISTS assets (id TEXT PRIMARY KEY, project_id TEXT, type TEXT, filename TEXT, path TEXT, size INTEGER, hash TEXT, metadata TEXT, created_at TEXT)')
db.exec('CREATE TABLE IF NOT EXISTS scenes (id TEXT PRIMARY KEY, project_id TEXT, name TEXT, version INTEGER, graph_json TEXT, created_at TEXT)')
db.exec('CREATE TABLE IF NOT EXISTS notes (id TEXT PRIMARY KEY, project_id TEXT, title TEXT, content_html TEXT, tags_json TEXT, created_at TEXT, updated_at TEXT)')

module.exports = { db }
