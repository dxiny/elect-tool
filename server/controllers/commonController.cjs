// 公共控制器：健康检查与版本信息
// 健康检查接口，用于监控服务是否存活
async function health(req, res, next) {
  try {
    res.json({ ok: true });
  } catch (e) {
    // 如果发生错误，交给全局错误处理中间件
    next(e);
  }
}

// 获取服务版本信息
async function version(req, res, next) {
  try {
    // 返回硬编码的版本号，实际项目中可能从 package.json 读取
    res.json({ success: true, data: { version: "1.0.0" } });
  } catch (e) {
    next(e);
  }
}

module.exports = { health, version };
