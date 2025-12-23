// SQLite 连接与建表：负责数据库文件创建与表结构初始化
const { join } = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");
const { dataDir } = require("../config/env.cjs");

// 确保数据目录存在
function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

ensureDir(dataDir);
const file = join(dataDir, "app.db");

// 初始化数据库连接
const db = new Database(file);

// 开启 Write-Ahead Logging 模式，提升并发读写性能
db.pragma("journal_mode = WAL");

// --- 初始化表结构 ---

// 项目表
db.exec(
  "CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, name TEXT NOT NULL, owner_id TEXT, description TEXT, created_at TEXT)"
);
// 资源文件表
db.exec(
  "CREATE TABLE IF NOT EXISTS assets (id TEXT PRIMARY KEY, project_id TEXT, type TEXT, filename TEXT, path TEXT, size INTEGER, hash TEXT, metadata TEXT, created_at TEXT)"
);
// AI 会话表：存储对话历史
db.exec(
  "CREATE TABLE IF NOT EXISTS ai_sessions (id TEXT PRIMARY KEY, title TEXT, messages TEXT, updated_at INTEGER)"
);

module.exports = { db };
