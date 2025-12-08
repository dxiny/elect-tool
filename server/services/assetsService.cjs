// 资产服务：封装元数据创建与查询逻辑
const { genId } = require('../utils/id.cjs')
const repo = require('../repositories/assetsRepo.cjs')

function list(projectId) {
  return repo.list(projectId || null)
}

function create(payload) {
  const id = genId('asset')
  const createdAt = new Date().toISOString()
  const entity = {
    id,
    projectId: payload?.projectId || null,
    type: String(payload?.type || 'unknown'),
    filename: String(payload?.filename || ''),
    path: String(payload?.path || ''),
    size: Number(payload?.size || 0),
    hash: String(payload?.hash || ''),
    metadata: payload?.metadata || {},
    createdAt
  }
  return repo.create(entity)
}

function get(id) {
  return repo.get(id)
}

function remove(id) {
  return repo.remove(id)
}

module.exports = { list, create, get, remove }
