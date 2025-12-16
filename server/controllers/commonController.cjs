// 公共控制器：健康检查与版本信息
async function health(req, res, next) {
  try {
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
}

async function version(req, res, next) {
  try {
    res.json({ success: true, data: { version: "1.0.0" } });
  } catch (e) {
    next(e);
  }
}

module.exports = { health, version };
