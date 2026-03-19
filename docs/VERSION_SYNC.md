# 版本号自动同步

## 概述

本项目的版本号会自动从 `package.json` 同步到 `lib/web.config.js`，确保插件信息中的版本号始终与 npm 包版本一致。

## 自动同步时机

### 1. 使用 `npm version` 或 `pnpm version` 时

```bash
# 更新版本号（会自动触发同步）
npm version patch
# 或
pnpm version patch
```

这会自动：
1. 更新 `package.json` 中的版本号
2. 运行 `scripts/sync-version.js` 同步到 `lib/web.config.js`
3. 创建 git commit 和 tag

### 2. 手动同步

```bash
# 手动触发同步
npm run sync-version
# 或
pnpm sync-version
```

## 工作原理

`scripts/sync-version.js` 脚本会：

1. 读取 `package.json` 中的 `version` 字段
2. 读取 `lib/web.config.js` 文件
3. 使用正则表达式替换版本号
4. 写回文件

支持两种格式：
- 硬编码：`version: '0.0.6'`
- 函数调用：`version: getVersion()`

## 配置说明

### package.json scripts

```json
{
  "scripts": {
    "version": "changeset version && node scripts/sync-version.js",
    "sync-version": "node scripts/sync-version.js"
  }
}
```

### 自动化选项

#### 选项 A：Git Hook（推荐）

使用 Husky 在 commit 前自动同步：

```bash
# 安装 Husky
pnpm add -D husky
npx husky install

# 添加 pre-commit hook
npx husky add .husky/pre-commit "node scripts/sync-version.js"
```

#### 选项 B：CI/CD 中同步

在 GitHub Actions 中，发布前自动同步：

```yaml
- name: Sync version
  run: node scripts/sync-version.js

- name: Commit version sync
  run: |
    git config user.name "github-actions[bot]"
    git config user.email "github-actions[bot]@users.noreply.github.com"
    git add lib/web.config.js
    git commit -m "chore: sync version to web.config.js" || echo "No changes to commit"
    git push
```

## 注意事项

1. **不要手动修改** `lib/web.config.js` 中的版本号
2. 始终通过 `package.json` 管理版本
3. 同步脚本会自动处理两种格式的版本号定义

## 故障排除

### 脚本执行失败

检查 `lib/web.config.js` 中是否有 `version` 字段：

```bash
grep "version:" lib/web.config.js
```

应该看到类似：
```javascript
version: '0.0.6',
```

### 版本号不同步

手动运行同步脚本：

```bash
npm run sync-version
```

然后检查文件是否更新。
