const { db } = require("../db/sqlite.cjs");

// 获取所有 AI 会话
const getAll = () => {
  // 预编译 SQL 查询语句，按更新时间倒序排列
  const stmt = db.prepare("SELECT * FROM ai_sessions ORDER BY updated_at DESC");
  // 查询并返回数据
  return stmt.all().map((row) => ({
    ...row,
    updatedAt: row.updated_at, // 转换字段命名风格 (snake_case -> camelCase)
    messages: JSON.parse(row.messages), // 解析 JSON 字符串为对象
  }));
};

// 根据 ID 获取单个会话
const getById = (id) => {
  const stmt = db.prepare("SELECT * FROM ai_sessions WHERE id = ?");
  const row = stmt.get(id); // 获取单条结果
  if (row) {
    row.updatedAt = row.updated_at;
    row.messages = JSON.parse(row.messages);
  }
  return row;
};

// 创建新会话
const create = (session) => {
  const stmt = db.prepare(
    "INSERT INTO ai_sessions (id, title, messages, updated_at) VALUES (?, ?, ?, ?)"
  );
  // 执行插入操作，传入参数对应 SQL 中的 ?
  stmt.run(
    session.id,
    session.title,
    JSON.stringify(session.messages), // 将对象数组序列化为 JSON 字符串存储
    session.updatedAt
  );
  return session;
};

// 更新会话信息
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

// 删除会话
const remove = (id) => {
  const stmt = db.prepare("DELETE FROM ai_sessions WHERE id = ?");
  stmt.run(id);
};

module.exports = { getAll, getById, create, update, remove };
