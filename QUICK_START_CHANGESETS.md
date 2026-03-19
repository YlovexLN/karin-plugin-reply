# Changesets 快速开始

## 🚀 立即使用

### 第一步：创建你的第一个 Changeset

```bash
npm run changeset
```

**按提示操作：**

1. 选择包：`karin-plugin-reply`（按空格选择，回车确认）
2. 选择版本类型：
   - `patch` - 小修复（0.0.6 → 0.0.7）
   - `minor` - 新功能（0.0.6 → 0.1.0）
   - `major` - 重大变更（0.0.6 → 1.0.0）
3. 输入变更描述：`feat: 添加新功能` 或 `fix: 修复问题`

### 第二步：提交 Changeset

```bash
git add .changeset/
git commit -m "docs: add changeset"
git push origin main
```

### 第三步：准备发布（当有多个 changeset 后）

```bash
# 更新版本号（自动同步到 web.config.js）
npm run version

# 提交版本更新
git add .
git commit -m "chore: release v0.0.7"
git tag v0.0.7

# 推送（触发自动发布）
git push --tags
git push origin main
```

## 🎯 完整流程示例

### 场景：修复了一个 Bug

```bash
# 1. 修复 Bug 后创建 changeset
npm run changeset
# 选择：patch
# 描述：fix: 修复关键词匹配错误

# 2. 提交代码和 changeset
git add .
git commit -m "fix: 修复关键词匹配错误"
git add .changeset/
git commit -m "docs: add changeset"
git push origin main

# 3. 准备发布时
npm run version
git add .
git commit -m "chore: release v0.0.7"
git tag v0.0.7
git push --tags
```

## 📋 常用命令

```bash
# 创建 changeset
npm run changeset

# 更新版本号（消费 changesets）
npm run version

# 发布到 npm
npm run release

# 手动同步版本号到 web.config.js
npm run sync-version

# 查看未发布的 changesets
npx changeset status
```

## 🔄 自动化

### GitHub Actions 会自动：

1. ✅ 推送 tag 时自动发布到 npm
2. ✅ 发布到 GitHub Packages
3. ✅ 创建 GitHub Release
4. ✅ 附加 .tgz 文件

### 配置位置：

- `.github/workflows/version.yml` - 版本更新和发布
- `.github/workflows/release.yml` - Tag 触发发布

## ⚠️ 注意事项

1. **每次 PR 都要有 changeset**
2. **不要手动修改版本号**
3. **`npm run version` 会自动同步 web.config.js**

## 📖 详细文档

- [Changesets 完整指南](./docs/CHANGESETS_GUIDE.md)
- [版本号同步说明](./docs/VERSION_SYNC.md)
