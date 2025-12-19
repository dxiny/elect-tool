# Electron App 自动构建指南 (GitHub Actions)

本文档详细说明了如何利用 GitHub Actions 自动化流水线，将 Electron 项目打包为 Windows (`.exe`) 和 macOS (`.dmg`) 安装包。

## 1. 原理说明

我们配置了一个 GitHub Action 工作流 (`.github/workflows/build.yml`)。当你向 GitHub 仓库推送一个以 `v` 开头的标签（如 `v1.0.0`）时，GitHub 会自动启动两台云端虚拟机（一台 Windows，一台 macOS），分别执行构建任务，并将生成的安装包上传到 GitHub Releases 页面。

## 2. 准备工作

确保你的代码已经推送到 GitHub 仓库，并且仓库根目录下存在 `.github/workflows/build.yml` 文件。

## 3. 详细操作步骤

### 第一步：本地开发与测试
在本地完成代码开发，并确保本地运行无误。
```powershell
npm run dev:app
```

### 第二步：提交代码
将所有修改提交并推送到 GitHub 的 `main` 分支。
```powershell
git add .
git commit -m "feat: 完成新功能开发"
git push origin main
```

### 第三步：打标签并推送 (触发构建)
这是最关键的一步。构建流程仅在检测到 **v开头** 的标签时触发。

```powershell
# 1. 给当前代码打上版本标签 (例如 v1.0.0)
git tag v1.0.0

# 2. 将标签推送到 GitHub
git push origin v1.0.0
```

### 第四步：查看构建进度
1.  打开你的 GitHub 仓库页面。
2.  点击顶部导航栏的 **Actions**。
3.  你会看到一个名为 **Build/Release** 的工作流正在运行。
4.  点击进入可以看到两个并行的任务：`release (macos-latest)` 和 `release (windows-latest)`。
5.  通常构建需要 2-4 分钟。

### 第五步：下载安装包
构建完成后，无需在 Actions 页面寻找产物，直接去 Releases 页面：

1.  点击仓库首页右侧的 **Releases**。
2.  你会看到标题为 **v1.0.0** 的发布版本。
3.  在 **Assets** 列表中下载你需要的文件：
    *   **Windows**: `ElectTool Setup 1.0.0.exe`
    *   **macOS**: `ElectTool-1.0.0.dmg`

## 4. 常见问题与注意事项

### macOS 安装提示“无法验证开发者”
由于我们没有配置 Apple 的付费代码签名证书（$99/年），macOS 用户在首次打开应用时会收到安全警告。
*   **解决方法**：让用户在 Finder 中找到应用，**右键点击**图标，选择 **“打开”**，然后在弹窗中点击 **“打开”** 按钮。这只需要操作一次。

### 构建失败怎么办？
如果 Actions 页面显示红色的叉号（失败）：
1.  点击失败的任务进入详情。
2.  查看日志中的 `Build & Release` 步骤。
3.  常见原因可能是网络波动或 `package.json` 配置错误，请根据日志排查。

### 如何更新版本？
下次发布新版本时，只需重复“第三步”，换一个新的版本号即可（例如 `v1.0.1`）。
```powershell
git tag v1.0.1
git push origin v1.0.1
```
