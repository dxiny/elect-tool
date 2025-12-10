const { join } = require("path");
const fs = require("fs");
const { dataDir } = require("../config/env.cjs");

const APP_JSON = join(dataDir, "app.json");

function readAppJson() {
  try {
    if (!fs.existsSync(APP_JSON)) return {};
    const txt = fs.readFileSync(APP_JSON, "utf-8");
    return JSON.parse(txt || "{}");
  } catch {
    return {};
  }
}

function writeAppJson(obj) {
  try {
    fs.writeFileSync(APP_JSON, JSON.stringify(obj, null, 2));
    return true;
  } catch {
    return false;
  }
}

async function getProfile(req, res, next) {
  try {
    const app = readAppJson();
    const profile = app.profile || {
      id: "user_default",
      name: "Guest",
      email: "",
      avatarDataUrl: "",
      themeMode: "light",
    };
    // 兜底字段
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

async function updateTheme(req, res, next) {
  try {
    const { themeMode } = req.body || {};
    if (themeMode !== "light" && themeMode !== "dark")
      return res
        .status(400)
        .json({ success: false, error: "invalid themeMode" });
    const app = readAppJson();
    app.profile = app.profile || {
      id: "user_default",
      name: "Guest",
      email: "",
      avatarDataUrl: "",
    };
    app.profile.themeMode = themeMode;
    writeAppJson(app);
    res.json({ success: true, data: app.profile });
  } catch (e) {
    next(e);
  }
}

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
    if (name != null) app.profile.name = String(name);
    if (email != null) app.profile.email = String(email);
    writeAppJson(app);
    res.json({ success: true, data: app.profile });
  } catch (e) {
    next(e);
  }
}

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
