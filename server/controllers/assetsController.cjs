// 资产控制器：转换查询参数与调用服务层
const service = require('../services/assetsService.cjs')

async function list(req, res, next) {
  try {
    const data = await service.list(req.query.projectId)
    res.json({ success: true, data })
  } catch (e) { next(e) }
}

async function create(req, res, next) {
  try {
    const data = await service.create(req.body || {})
    res.json({ success: true, data })
  } catch (e) { next(e) }
}

async function get(req, res, next) {
  try {
    const data = await service.get(req.params.id)
    res.json({ success: true, data })
  } catch (e) { next(e) }
}

async function remove(req, res, next) {
  try {
    const data = await service.remove(req.params.id)
    res.json({ success: true, data })
  } catch (e) { next(e) }
}

module.exports = { list, create, get, remove }
