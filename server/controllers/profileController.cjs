const { join } = require("path");
const fs = require("fs");
const { dataDir } = require("../config/env.cjs");

// 定义用户配置文件路径：data/app.json
const APP_JSON = join(dataDir, "app.json");

// 辅助函数：读取 app.json 文件内容
function readAppJson() {
  try {
    // 如果文件不存在，返回空对象
    if (!fs.existsSync(APP_JSON)) return {};
    // 同步读取文件内容
    const txt = fs.readFileSync(APP_JSON, "utf-8");
    // 解析 JSON
    return JSON.parse(txt || "{}");
  } catch {
    // 出错时返回空对象，保证不崩
    return {};
  }
}

// 辅助函数：写入 app.json 文件内容
function writeAppJson(obj) {
  try {
    // 将对象转为 JSON 字符串并写入文件，
    fs.writeFileSync(APP_JSON, JSON.stringify(obj, null, 2));
    return true;
  } catch {
    return false;
  }
}

// 获取用户个人资料
async function getProfile(req, res, next) {
  try {
    const app = readAppJson();
    // 读取 profile 字段，如果不存在则使用默认值
    const profile = app.profile || {
      id: "user_default",
      name: "Guest",
      email: "",
      avatarDataUrl: "",
      themeMode: "light",
    };
    // 确保所有字段都有默认值（兜底策略）
    profile.id = profile.id || "user_default";
    profile.name = profile.name || "Guest";
    profile.email = profile.email || "";
    profile.avatarDataUrl = profile.avatarDataUrl || "";
    profile.themeMode = profile.themeMode === "dark" ? "dark" : "light";
    
    res.json({ success: true, data: profile });
  } catch (e) {
    next(e);
  }
}

// 更新用户主题设置 (light/dark)
async function updateTheme(req, res, next) {
  try {
    const { themeMode } = req.body || {};
    // 参数校验
    if (themeMode !== "light" && themeMode !== "dark")
      return res
        .status(400)
        .json({ success: false, error: "invalid themeMode" });
    
    const app = readAppJson();
    // 初始化 profile 对象（如果不存在）
    app.profile = app.profile || {
      id: "user_default",
      name: "Guest",
      email: "",
      avatarDataUrl: "",
    };
    // 更新主题字段
    app.profile.themeMode = themeMode;
    // 写入文件
    writeAppJson(app);
    res.json({ success: true, data: app.profile });
  } catch (e) {
    next(e);
  }
}

// 更新基本信息 (name, email)
async function updateBasic(req, res, next) {
  try {
    const { name, email } = req.body || {};
    const app = readAppJson();
    app.profile = app.profile || {
      id: "user_default",
      name: "Guest",
      email: "",
      avatarDataUrl: "",
      themeMode: "light",
    };
    // 只更新传入字段
    if (name != null) app.profile.name = String(name);
    if (email != null) app.profile.email = String(email);
    
    writeAppJson(app);
    res.json({ success: true, data: app.profile });
  } catch (e) {
    next(e);
  }
}

// 更新头像
async function updateAvatar(req, res, next) {
  try {
    const { dataUrl, url } = req.body || {};
    if (!dataUrl && !url)
      return res
        .status(400)
        .json({ success: false, error: "missing dataUrl or url" });
    const app = readAppJson();
    app.profile = app.profile || {
      id: "user_default",
      name: "Guest",
      email: "",
      avatarDataUrl: "",
      themeMode: "light",
    };
    if (dataUrl) {
      // 简化：直接存储 base64 的 data URL，避免静态文件服务改造
      app.profile.avatarDataUrl = String(dataUrl);
    }
    if (url) {
      app.profile.avatarDataUrl = String(url);
    }
    writeAppJson(app);
    res.json({ success: true, data: app.profile });
  } catch (e) {
    next(e);
  }
}

module.exports = { getProfile, updateTheme, updateBasic, updateAvatar };
