// 场景服务：场景创建、列表与详情
const { genId } = require('../utils/id.cjs')
const repo = require('../repositories/scenesRepo.cjs')

function list(projectId) {
  return repo.list(projectId || null)
}

function create(payload) {
  const id = genId('scene')
  const createdAt = new Date().toISOString()
  const entity = {
    id,
    projectId: payload?.projectId || null,
    name: String(payload?.name || ''),
    version: Number(payload?.version || 1),
    graphJson: String(payload?.graphJson || '{}'),
    createdAt
  }
  return repo.create(entity)
}

function get(id) {
  return repo.get(id)
}

module.exports = { list, create, get }
