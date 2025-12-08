// 数据与资产目录工具：确保目录、提供资产目录路径
const { join } = require('path')
const fs = require('fs')
const { dataDir } = require('../config/env.cjs')

// 确保 data 与 assets 目录存在
function ensureDataDirs() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })
  const assetsDir = join(dataDir, 'assets')
  if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true })
}

// 获取资产目录路径
function getAssetsDir() {
  return join(dataDir, 'assets')
}

module.exports = { ensureDataDirs, getAssetsDir }
