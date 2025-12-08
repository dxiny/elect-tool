// 全局错误处理中间件：统一返回 { success: false, error }
function errorHandler(err, req, res, next) {
  const msg = err && err.message ? err.message : 'error'
  res.status(500).json({ success: false, error: msg })
}

module.exports = { errorHandler }
