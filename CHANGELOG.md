# karin-plugin-reply

## 0.0.9-beta.2

### Patch Changes

- e567c70: 修复 npm 包内容：排除 `.agents/`、`.dsh-ops/`、`AGENTS.md`、`.gitattributes`、`pnpm-workspace.yaml` 等开发文件，发布包从 21 个文件降到 12 个。

## 0.0.9-beta.1

### Patch Changes

- 5ce530e: 修复 Web UI 多行回复丢失换行、配置保存后不生效的问题，并升级工具链。
  
  - Web UI 与 YAML 之间改用字面量 `\n` 往返，避免单行输入框吞掉换行
  - 配置读取改为 force 读盘，保存后 `clearRequireFile` 并 `watch`，修改立即生效
  - 依赖升级：`node-karin ^1.18.0`、`@changesets/cli` v3、`eslint` 10、`neostandard` 0.14
  - CI 固定 Node 24 + pnpm 11，新增 `pnpm-workspace.yaml` 放行构建脚本
  - 补充 `AGENTS.md` 作业规范与 README 文档，统一 LF 换行

## 0.0.8

### Patch Changes

- build: 更新 node-karin 依赖版本至 ^1.15.1

## 0.0.7

### Patch Changes

- d402797: docs(web.config): 更新插件名称和描述以更准确反映功能

## 0.0.6

### Patch Changes

- .
