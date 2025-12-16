// 场景控制器：three.js 场景增查与创建
const service = require("../services/scenesService.cjs");

async function list(req, res, next) {
  try {
    const data = await service.list(req.query.projectId);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

async function create(req, res, next) {
  try {
    const data = await service.create(req.body || {});
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

async function get(req, res, next) {
  try {
    const data = await service.get(req.params.id);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

module.exports = { list, create, get };
