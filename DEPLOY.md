# 后端服务部署与更新指南

本指南用于指导在云服务器（Ubuntu）上更新与维护 ElectTool 后端服务。

## 1. 本地开发与推送

在本地完成代码修改与测试后，将代码推送到阿里云 Codeup 仓库：

```bash
# 提交代码
git add .
git commit -m "feat: 更新后端逻辑"

# 推送到远程 main 分支
git push codeup main
```

---

## 2. 服务器更新步骤

### 2.1 登录服务器

```bash
# 使用 SSH 登录
ssh root@116.62.133.219
```

### 2.2 拉取最新代码

进入项目目录

```bash
cd /home/admin/elect-tool

# 如果找不到项目目录，在全盘搜索名为 elect-tool 的文件夹
find / -type d -name "elect-tool" 2>/dev/null

# 拉取最新代码
git pull codeup main

# 如果报错 Could not read from remote repository.提示服务器上的 git 仓库没有配置名为 codeup 的远程地址,执行以下命令添加远程地址,然后再次拉取

git remote add codeup https://codeup.aliyun.com/67e107468571f8159f9a986a/elect-tool.git


# 如果报错 Your local changes to the following files would be overwritten by merge: package-lock.json ，需要先放弃lock文件的修改
git checkout package-lock.json
# 再次拉取代码
git pull codeup main
# 重新安装依赖
npm install
```

> **注意**：如果提示冲突，请先手动解决或强制重置（慎用）：`git reset --hard codeup/main`

### 2.3 更新依赖（可选）

如果 `package.json` 有变动，必须执行：

```bash
npm install

# 如果涉及 better-sqlite3 升级或环境变化
npm rebuild better-sqlite3
```

### 2.4 重启服务

使用 PM2 进行零停机重载：

```bash
# 平滑重载（推荐）
pm2 reload elect-server

# 如果是新加了环境变量或修改了启动配置，需完全重启
# pm2 restart elect-server
```

---

## 3. 数据库备份与迁移

数据库文件位于 `server/config/env.cjs` 中配置的 `APP_DATA_DIR`（通常为 `/var/app/data` 或项目下的 `server/data`）。

### 手动备份

建议在重大更新前备份数据库：

```bash
# 创建备份目录
mkdir -p /var/backups/elect-tool

# 备份数据库文件
cp /var/app/data/app.db /var/backups/elect-tool/app.db.$(date +%F_%T)
```

---

## 4. 验证更新

### 检查服务状态

```bash
# 查看 PM2 进程状态
pm2 list

# 查看实时日志
pm2 logs elect-server --lines 50
```

### 接口健康检查

```bash
# 在服务器本地验证
curl http://127.0.0.1:3000/api/health
# 应返回 {"ok":true}
```

---

## 5. Nginx 配置更新（仅限修改 Nginx 时）

如果修改了 `/etc/nginx/sites-available/elect-tool`，需要重载 Nginx：

```bash
# 检查语法
sudo nginx -t

# 重载配置
sudo systemctl reload nginx
```


### 6.3 常见问题排查

- **Socket 连接失败**：
  - 检查客户端控制台日志 `Connecting to Socket Server: ...` 输出的地址是否正确。
  - 检查服务器防火墙/安全组是否允许 3000 端口入站流量。
  - 如果使用 HTTPS，确保 Socket.io 客户端也使用 `https://` 协议，且 Nginx 正确配置了 WebSocket 转发头 (`Upgrade` 和 `Connection`).

- **接口 404**：检查 Nginx 配置是否正确转发 `/api` 到 `3000` 端口。
- **CORS 错误**：检查 Nginx 配置中是否添加了 `Access-Control-Allow-Origin` 头，或后端 `cors` 中间件是否生效。
- **数据库报错**：检查 `better-sqlite3` 是否编译正确，尝试 `npm rebuild better-sqlite3`。
- **权限问题**：确保 PM2 运行用户对 `data` 目录有读写权限。
