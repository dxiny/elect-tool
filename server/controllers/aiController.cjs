const aiService = require("../services/aiService.cjs");


const list = (req, res) => {
  // 调用 Service 层获取数据
  const sessions = aiService.getAllSessions();
  res.json({ success: true, data: sessions });
};


const create = (req, res) => {
  // 获取会话数据
  const session = req.body;
  // 调用 Service 层创建会话
  const newSession = aiService.createSession(session);
  res.json({ success: true, data: newSession });
};


const update = (req, res) => {
  const { id } = req.params;
  const session = req.body;
  // 调用 Service 层执行更新
  const updatedSession = aiService.updateSession(id, session);
  res.json({ success: true, data: updatedSession });
};


const remove = (req, res) => {
  const { id } = req.params;
  aiService.deleteSession(id);
  res.json({ success: true, message: "Deleted successfully" });
};

module.exports = { list, create, update, remove };
