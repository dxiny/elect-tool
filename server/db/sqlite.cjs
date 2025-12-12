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
// 旅游足迹模块
db.exec('CREATE TABLE IF NOT EXISTS travels (id TEXT PRIMARY KEY, title TEXT, start_date TEXT, end_date TEXT, total_cost REAL, rating INTEGER, created_at TEXT, updated_at TEXT)')
db.exec('CREATE TABLE IF NOT EXISTS city_visits (id TEXT PRIMARY KEY, travel_id TEXT, city_code TEXT, city_name TEXT, start_time TEXT, end_time TEXT, notes TEXT, created_at TEXT, updated_at TEXT)')
db.exec('CREATE TABLE IF NOT EXISTS travel_markers (id TEXT PRIMARY KEY, visit_id TEXT, type TEXT, name TEXT, lng REAL, lat REAL, cost REAL, note TEXT, assets_json TEXT, created_at TEXT)')
db.exec('CREATE TABLE IF NOT EXISTS travel_routes (id TEXT PRIMARY KEY, visit_id TEXT, mode TEXT, geojson TEXT, duration INTEGER, distance REAL, cost REAL, created_at TEXT)')
db.exec('CREATE TABLE IF NOT EXISTS ai_sessions (id TEXT PRIMARY KEY, title TEXT, messages TEXT, updated_at INTEGER)')

module.exports = { db }
