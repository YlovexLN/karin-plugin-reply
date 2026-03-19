# Changesets 使用指南

## 概述

本项目使用 [Changesets](https://github.com/changesets/changesets) 管理版本和发布流程。Changesets 会：

- ✅ 自动追踪每次变更
- ✅ 智能决定版本号（major/minor/patch）
- ✅ 自动生成 CHANGELOG.md
- ✅ 自动同步版本号到 `lib/web.config.js`

## 完整工作流

### 1️⃣ 开发时：创建 Changeset

每次添加新功能或修复 bug 后，运行：

```bash
npm run changeset
# 或
pnpm changeset
```

**交互式提示：**

```bash
🦋  Which packages would you like to include?
❯ ○ karin-plugin-reply

🦋  Which packages should have a major bump?
❯ ○ none

🦋  Which packages should have a minor bump?
❯ ○ none

🦋  Which packages should have a patch bump?
❯ ○ karin-plugin-reply

🦋  Please enter a summary for this change:
❯ feat: 添加新的关键词匹配方式
```

**会自动生成文件：** `.changeset/[random-name].md`

```markdown
---
'karin-plugin-reply': minor
---

feat: 添加新的关键词匹配方式
```

### 2️⃣ 提交 Changeset

```bash
# 添加 changeset 文件到 git
git add .changeset/

# 提交
git commit -m "docs: add changeset for new feature"
```

### 3️⃣ 准备发布：更新版本号

当你准备好发布新版本时：

```bash
# 这会：
# 1. 消费所有 changeset 文件
# 2. 更新 package.json 版本号
# 3. 更新 CHANGELOG.md
# 4. 运行 sync-version.js 同步到 web.config.js
npm run version
# 或
pnpm version
```

**自动执行的脚本：**

```json
{
  "scripts": {
    "version": "changeset version && node scripts/sync-version.js"
  }
}
```

**结果：**

```diff
# package.json
- "version": "0.0.6"
+ "version": "0.0.7"

# lib/web.config.js
- version: '0.0.6',
+ version: '0.0.7',

# CHANGELOG.md
+ ## 0.0.7
+ ### Minor Changes
+ - feat: 添加新的关键词匹配方式
```

### 4️⃣ 提交版本更新

```bash
# 提交所有更改
git add .
git commit -m "chore: release v0.0.7"

# 推送
git push origin main
```

### 5️⃣ 发布到 npm 和 GitHub Packages

```bash
# 发布到 npm
npm run release
# 或
pnpm release

# 或者使用 pnpm publish
pnpm publish --access public
```

### 6️⃣ 创建 Git Tag

```bash
# 创建 tag
git tag v0.0.7

# 推送 tag（触发 GitHub Actions 发布）
git push origin v0.0.7
```

## 自动化：GitHub Actions

你的 `release.yml` 工作流会在推送 tag 时自动发布：

```yaml
on:
  push:
    tags:
      - 'v*'
```

**完整流程：**

1. 推送 `v0.0.7` tag
2. GitHub Actions 触发
3. 检查版本是否已发布
4. 发布到 npm 官方注册表
5. 发布到 GitHub Packages 注册表
6. 创建 GitHub Release（带 changelog 和 .tgz 附件）

## 版本号规则

### Changeset 类型

| 类型 | 说明 | 版本变化 | 使用场景 |
|------|------|----------|----------|
| `major` | 重大变更 | `1.0.0` → `2.0.0` | 破坏性更新 |
| `minor` | 新功能 | `0.0.6` → `0.1.0` | 向后兼容的功能 |
| `patch` | 小修复 | `0.0.6` → `0.0.7` | Bug 修复 |

### 示例

```bash
# 场景 1: Bug 修复
npm run changeset
# 选择: patch
# 输入: fix: 修复关键词匹配错误

# 场景 2: 新功能
npm run changeset
# 选择: minor
# 输入: feat: 添加正则表达式匹配

# 场景 3: 破坏性更新
npm run changeset
# 选择: major
# 输入: feat!: 重构配置格式
```

## 常见问题

### Q: 忘记创建 changeset 怎么办？

```bash
# 补一个 changeset
npm run changeset

# 然后重新运行版本更新
npm run version
```

### Q: 想修改已创建的 changeset？

直接编辑 `.changeset/[name].md` 文件：

```markdown
---
'karin-plugin-reply': minor  # 可以改为 patch 或 major
---

新的描述内容
```

### Q: 想取消某个 changeset？

```bash
# 删除对应的 changeset 文件
rm .changeset/[name].md

# 或取消所有 changeset
git checkout .changeset/
```

### Q: 如何预览即将发布的版本？

```bash
# 查看未发布的 changesets
npx changeset status

# 查看即将更新的版本号
npx changeset pre enter next  # 进入预发布模式
npx changeset version
# 查看 package.json 中的版本号
```

### Q: 版本号没有同步到 web.config.js？

```bash
# 手动同步
npm run sync-version

# 检查脚本是否正常工作
node scripts/sync-version.js
```

## 最佳实践

### ✅ 推荐

1. **每次 PR 都创建 changeset**
   - 方便追踪变更
   - 自动生成 changelog

2. **使用有意义的描述**
   ```bash
   # 好 ✅
   feat: 添加群组专属规则支持
   
   # 不好 ❌
   fix: 修复 bug
   ```

3. **定期发布**
   - 积累多个 changeset 后统一发布
   - 避免频繁发布小版本

4. **使用 GitHub Actions 自动化**
   - 推送 tag 自动发布
   - 减少人为错误

### ❌ 避免

1. **不要手动修改版本号**
   - 始终通过 changesets 管理

2. **不要跳过 changeset**
   - 即使是很小的改动也要创建

3. **不要忘记同步 web.config.js**
   - `version` 脚本已自动处理

## 快速参考

```bash
# 日常开发
git add .
git commit -m "feat: xxx"
npm run changeset          # 创建 changeset
git add .changeset/
git commit -m "docs: add changeset"

# 准备发布
npm run version            # 更新版本号 + 同步 web.config.js
git add .
git commit -m "chore: release v0.0.7"
git tag v0.0.7
git push --tags

# CI/CD 会自动发布到 npm 和 GitHub Packages
```

## 相关文档

- [Changesets 官方文档](https://github.com/changesets/changesets)
- [版本号同步文档](./VERSION_SYNC.md)
- [发布流程](../.github/workflows/release.yml)
