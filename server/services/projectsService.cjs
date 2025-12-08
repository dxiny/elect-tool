// 项目服务：业务编排（默认值、去重与组合操作可在此处理）
const { genId } = require('../utils/id.cjs')
const repo = require('../repositories/projectsRepo.cjs')

function list() {
  return repo.list()
}

function create(payload) {
  const id = genId('proj')
  const createdAt = new Date().toISOString()
  const entity = {
    id,
    name: String(payload?.name || ''),
    ownerId: payload?.ownerId || null,
    description: String(payload?.description || ''),
    createdAt
  }
  return repo.create(entity)
}

function get(id) {
  return repo.get(id)
}

function update(id, patch) {
  return repo.update(id, patch || {})
}

function remove(id) {
  return repo.remove(id)
}

module.exports = { list, create, get, update, remove }
