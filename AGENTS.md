# AGENTS.md

> 本仓库内 AI 编码代理（Agent）的最高优先级作业规范。开始操作前先读完；与其它说明冲突时以本文件为准。

## 0. 两条红线

1. **只在“本文件所在目录”之内读写**——它就是项目根，随仓库移动；任何落到项目外的修改，先停下来问人。
2. **没有明确指令，不提交、不构建、不打包、不发布。**

## 1. 项目边界

### 1.1 项目根

项目根 = `AGENTS.md` 所在目录，不是某个固定盘符路径。

```bash
git rev-parse --show-toplevel   # 仓库内最准确
pwd -P                          # 非 git 场景（解压的 zip 等）
```

- 仓库可被克隆到任意盘符、目录名和层级，边界自动跟随，**无需改本文件**；文中出现的具体路径只是举例，不得写死进代码、脚本或文档。
- 子目录若有 `AGENTS.md`，只能补充规则，**不得放宽**本文件。
- 比较前先规范化路径：解析符号链接、折叠 `..`、Windows 下统一大小写和分隔符。

### 1.2 写操作前的确认

1. 确认 cwd 在项目根内，并把目标规范化为绝对路径（目标尚不存在也要能算）。
2. 用**相对路径**判断归属，不要比字符串前缀——前缀法会放过 `..\karin-plugin-reply2`、`..\karin-plugin-reply-backup` 这类同名前缀目录：

```bash
node -e '
const p = require("path")
const n = s => process.platform === "win32" ? s.toLowerCase() : s
const rel = p.relative(n(p.resolve(process.argv[1])), n(p.resolve(process.argv[2])))
process.exit(rel === "" || (!rel.startsWith("..") && !p.isAbsolute(rel)) ? 0 : 1)
' "$ROOT" "$TARGET"
```

3. 检查 cwd、输出路径、重定向和脚本参数；任一处可能落到项目外就不执行，并说明原因与替代方案。

### 1.3 禁止范围与例外

**禁止**：上级与兄弟项目、用户目录和全局配置（`~/.npmrc`、`npm i -g`）、工具与框架安装目录、系统目录及其它盘符、Karin 运行时配置（`<Karin 根目录>/@karinjs/karin-plugin-reply/config/`）、受管目录（`.git/`、`node_modules/`、`.dsh-ops/`——只能通过 git、包管理器或工具本身操作）。

**边界内可做的例外**：

- 只读查阅项目外文件（如确认 `node-karin` API），不得写入，也不得整体复制进项目。
- `pnpm install` 可直接在项目根运行；`pnpm add` / `remove` 会改依赖清单，需授权（见 6.1）。禁止 `-g`。
- 临时文件只放项目内 `temp/`（已 gitignore），用完即删（见 5.1）。
- 确需越界：说明改哪里、为什么、风险，得到明确同意后执行；一次授权只对当次有效。

## 2. 项目速览

| 项 | 值 |
| --- | --- |
| 包名 / 版本 | `karin-plugin-reply` / `0.0.8` |
| 形态 | Karin 插件，ESM（`"type": "module"`），GPL-3.0 |
| 运行时 | Node 24（CI/工具链）+ pnpm 11 |
| 框架依赖 | `node-karin ^1.18.0`（peerDependency） |
| 入口 | `lib/index.js` → `lib/apps/reply.js` |
| Web UI 配置 | `lib/web.config.js` |
| 配置读写与缓存 | `lib/utils/replyConfig.js` |
| 辅助脚本 | `scripts/sync-version.js`、`scripts/setup-husky.js` |

## 3. 架构与数据流

`lib/index.js` 打印加载日志并导出 `customReply`；`lib/apps/reply.js` 用 `karin.command` 注册 `rank: 9000`、`perm: 'all'`、`log: false` 的全局监听，匹配和回复都在这个回调里。

### 3.1 匹配顺序（不要破坏）

1. 空消息直接 `return false`
2. 群组专属规则优先（仅群聊，按 `groups[groupId]` 顺序）
3. 全局规则其次（按 `global` 顺序）
4. 单条规则：`enabled === false` 跳过 → `requireAt` → 清理 @ 文本 → 匹配 `keyword`
5. 命中即 `e.reply()` 并 `return true`，不再继续；全部未命中返回 `false`

### 3.2 规则字段

| 字段 | 取值 | 默认 |
| --- | --- | --- |
| `keyword` | 字符串；`match: regex` 时为正则源码 | 必填 |
| `reply` | 字符串或字符串数组（数组按 `\n` 拼接） | 必填 |
| `match` | `exact` / `contains` / `regex` | `contains` |
| `scene` | `all` / `group` / `private`（仅全局规则） | `all` |
| `requireAt` | 布尔，仅群聊生效 | `false` |
| `enabled` | 布尔 | `true` |

### 3.3 配置与缓存

- 默认配置 `config/config/reply.yaml`；用户配置 `<Karin 根目录>/@karinjs/karin-plugin-reply/config/reply.yaml`，启动时由 `copyConfigSync` 复制且不覆盖已有文件。
- 用户配置用 `requireFileSync(..., { force: true })` 读盘，绕开 node-karin 默认 300 秒文件缓存；保存后 `clearRequireFile` + `watch`，保证修改立即生效。
- Web UI 往返由 `lib/utils/replyText.js` 处理：`replyToInput` / `inputToReply` 用字面量 `\n` 表示换行；空 `keyword` 丢弃；`scene: private` 强制 `requireAt = false`；写入后清缓存。

## 4. 代码规范

- 只用 ESM，相对导入带 `.js` 后缀；遵循 neostandard（2 空格、单引号、无分号、`function foo ()`）。
- 新增或改动的导出函数补中文 JSDoc。
- 日志统一 `[karin-plugin-reply]` 前缀，优先 `node-karin` 的 `logger`，不加裸 `console.log`；不新增静默 `catch`，至少记一条错误日志。
- 不引入新依赖；确需新增先说明理由、体积与替代方案。
- 除非任务就是改它，不动 `package.json` 的 `name` / `main` / `karin` / `publishConfig`。
- 改动最小化：不顺手重构、不整文件重排、不动无关行。
- 向后兼容：新字段带默认值，旧配置仍能正常加载。

## 5. 验证与交付

- 改动过的文件逐个 `node --check <file>`。
- 本仓库**没有**测试框架，也**没有** lint 脚本；不要声称“测试通过”“lint 通过”，如实说明做了哪些检查。
- 消息收发、Web UI、热重载相关改动需在 Karin 主程序人工验证，交付时写清步骤与预期结果。
- 汇报固定包含：改动清单、验证结果、未验证项与原因。

### 5.1 测试产物清理（强制）

验证、复现或调试时临时创建的东西都算测试产物：一次性脚本、调试代码、mock 桩、临时配置、样例数据、临时依赖目录。

- **位置**：只能放 `temp/`，不得写进 `lib/`、`scripts/`、仓库根或任何受版本控制的目录。
- **判定**：测试结束立即判断能否复用。不能复用 → **必须删除**；能复用（回归测试、fixture）→ 迁到正式测试目录并提交，本仓库暂无测试框架，落地前先与用户确认。
- **时机**：验证跑完就清；失败或中断也要在结束前清，不许“下次再说”。
- **自动**：默认动作，不需要用户提醒，也不把“留不留”抛回给用户。
- **安全**：删除前按 1.2 核对路径，只删自己创建的，不递归删除无法确认归属的目录。
- **汇报**：交付时列出已清理项；确有保留必须说明原因和位置。

## 6. 版本、发布与授权

### 6.1 必须由用户显式授权

默认只做“改代码 + 本地验证”。以下操作在拿到明确指令前**一律不执行**：

| 类别 | 操作 |
| --- | --- |
| 暂存与提交 | `git add`、`commit`、`merge`、`rebase`、`reset`、`stash` |
| 推送与标签 | `git push`、`git tag`、任何 force 推送 |
| 构建与打包 | `pnpm build`、`pnpm pack`、任何生成产物的编译 |
| 发布 | `npm publish`、`pnpm publish`、`pnpm release`、`changeset version` / `publish`、触发 CI 发版 |
| 依赖清单变更 | `pnpm add` / `remove`、手改 `package.json` 依赖版本 |

- 算授权：明确说“提交 / commit / 推送 / 构建 / 打包 / 发版 / 发布”，或直接给出命令。
- 不算授权：“改完了吗”“可以了”“继续”“看着办”这类含糊表述。
- 一次授权只对当次有效：说了“提交”不等于授权“推送”，说了“打包”不等于授权“发布”。

未授权时只做：改文件、只读检查、本地验证，然后汇报结果和待执行命令。

### 6.2 版本与 changeset

- 版本号唯一来源 `package.json`；`lib/web.config.js` 的 `version` 由 `scripts/sync-version.js` 同步，**不要手改**（husky `pre-commit` 会自动同步）。
- 功能或修复完成后建 changeset：`pnpm changeset`，按语义选 `patch` / `minor` / `major`，描述用 `feat:` / `fix:` 等约定式前缀。
- `pnpm version` 执行 `changeset version` 并同步 `web.config.js`；changeset v3 要求 Node >=22.11、pnpm >=10，CI 固定 Node 24 + pnpm 11。
- 提交信息遵循 Conventional Commits，分组见 `.github/cliff.toml`。

## 7. Git 纪律

- 只在本仓库执行 git；禁止 `--global` 配置、force push、改写已推送历史。
- 提交前 `git status` 自查：不得带入 `config/`、`node_modules/`、`temp/`、`.dsh-ops/` 及任何项目外文件。
- 不回滚用户未提交的改动（如 `.gitignore`、`.agents/`）；确需处理先询问。

## 8. 沟通

- 中文，先结论后细节；多文件改动先给简短计划。
- 不编造文件内容、命令输出或验证结果；不确定就直说，并给出确认方式。
- 删除、覆盖、发布、越界等不可逆操作，执行前确认。

## 9. 开工前自查

- [ ] 项目根已确认，所有写入路径都在根内（相对路径判断，不用前缀比较）？
- [ ] 没有写死绝对路径，没有全局副作用（`-g`、`--global`、系统临时目录、其它项目）？
- [ ] 没碰 `.git/`、`node_modules/`、Karin 运行时配置？
- [ ] 改动范围与任务一致，没顺手重构？
- [ ] 跑过 `node --check`，并如实汇报？
- [ ] 一次性测试产物已删除，或已说明保留原因？
- [ ] 提交 / 构建 / 打包 / 发布都拿到了明确指令？
