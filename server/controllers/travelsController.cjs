const service = require('../services/travelsService.cjs')

async function list(req, res, next) {
  try { const data = await service.list(); res.json({ success: true, data }) } catch (e) { next(e) }
}
async function create(req, res, next) {
  try { const data = await service.create(req.body || {}); res.json({ success: true, data }) } catch (e) { next(e) }
}
async function get(req, res, next) {
  try { const data = await service.get(req.params.id); res.json({ success: true, data }) } catch (e) { next(e) }
}
async function update(req, res, next) {
  try { const data = await service.update(req.params.id, req.body || {}); res.json({ success: true, data }) } catch (e) { next(e) }
}
async function remove(req, res, next) {
  try { const data = await service.remove(req.params.id); res.json({ success: true, data }) } catch (e) { next(e) }
}

module.exports = { list, create, get, update, remove }
