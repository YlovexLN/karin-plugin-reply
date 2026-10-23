# 🎯 karin-plugin-reply

> Karin 自定义关键词回复插件 | 群聊 / 私聊 | 群组专属规则 | Web UI 配置

[![NPM Version](https://img.shields.io/npm/v/karin-plugin-reply)](https://www.npmjs.com/package/karin-plugin-reply)
[![GitHub License](https://img.shields.io/badge/license-GPL--3.0-blue.svg)](https://github.com/YlovexLN/karin-plugin-reply/blob/main/LICENSE)
[![GitHub Issues](https://img.shields.io/github/issues/YlovexLN/karin-plugin-reply)](https://github.com/YlovexLN/karin-plugin-reply/issues)
[![GitHub Actions](https://github.com/YlovexLN/karin-plugin-reply/actions/workflows/ci.yml/badge.svg)](https://github.com/YlovexLN/karin-plugin-reply/actions)
[![GitHub Stars](https://img.shields.io/github/stars/YlovexLN/karin-plugin-reply)](https://github.com/YlovexLN/karin-plugin-reply/stargazers)

为 [Karin](https://github.com/Karinjs/Karin) 提供关键词自动回复：支持精确、包含、正则三种匹配方式，可为不同群组配置独立规则，并能按需要求消息 @机器人 后才触发。所有配置都在 Web UI 中完成，保存即生效，无需重启。

## ✨ 特性

- **多场景**：群聊、私聊均可触发，全局规则还可限定只对某一场景生效
- **三种匹配**：精确匹配、包含匹配、正则匹配
- **群组专属规则**：为指定群号配置独立关键词，优先级高于全局规则
- **@ 条件**：可要求消息 @机器人 后才触发（仅群聊）
- **Web UI 管理**：可视化增删改查，单条规则可随时启用或禁用
- **热重载**：修改配置后立即生效，无需重启插件
- **多行回复**：回复内容支持多行文本

## 🚀 快速开始

### 安装

推荐在 Karin WebUI 的插件市场中安装，也可以使用命令行：

```bash
pnpm install karin-plugin-reply
```

插件要求 `node-karin ^1.18.0`，即 Karin 1.18.0 及以上版本。

### 配置

1. 打开 Karin WebUI，进入本插件的配置页
2. 在「全局关键词规则」或「群组专属规则」中新增条目
3. 填写关键词与回复内容，选择匹配方式、应用场景和 @ 条件
4. 保存后立即生效

> **多行回复**：Web UI 的回复输入框是单行控件，需要换行时请用 `\n` 分隔，例如 `第一行\n第二行`。

### 规则字段

| 字段 | 说明 | 取值 | 默认 |
| --- | --- | --- | --- |
| `keyword` | 触发关键词；正则模式下填写正则源码 | 字符串 | 必填 |
| `reply` | 回复内容，多行用 `\n` 分隔 | 字符串 | 必填 |
| `match` | 匹配方式 | `exact` / `contains` / `regex` | `contains` |
| `scene` | 生效场景，仅全局规则支持 | `all` / `group` / `private` | `all` |
| `requireAt` | 是否要求 @机器人，仅群聊生效 | 布尔 | `false` |
| `enabled` | 是否启用该条规则 | 布尔 | `true` |

### 匹配与优先级

- 群组专属规则优先于全局规则，命中第一条即回复并结束，不再继续匹配
- 单条规则依次检查：是否启用 → @ 条件 → 关键词匹配
- 正则模式填写的是正则表达式源码，请自行确保语法正确；语法错误时该条规则会被跳过

## 📁 配置文件

Web UI 保存的配置位于：

```text
<Karin 根目录>/@karinjs/karin-plugin-reply/config/reply.yaml
```

也可以手动编辑该文件，保存后会自动生效。插件首次启动时会把内置的默认配置复制到该位置，且不会覆盖已有文件。

## 🤝 贡献

[![Contributors](https://contrib.rocks/image?repo=YlovexLN/karin-plugin-reply&max=1000)](https://github.com/YlovexLN/karin-plugin-reply/graphs/contributors)

## ❤️ 鸣谢

- [Karin](https://github.com/Karinjs/Karin) - 即时通讯应用机器人框架
- **DeepSeek Harness** - 本项目的开发、调试与文档编写在该 AI 编码环境中完成
- **DeepSeek V4.1 Flash** - 为代码实现、问题排查与文档润色提供模型支持

## 📄 许可证

本项目采用 GPL-3.0 许可证 - 查看 [LICENSE](https://github.com/YlovexLN/karin-plugin-reply/blob/main/LICENSE) 文件了解详情。

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/image?repos=YlovexLN/karin-plugin-reply&type=date&legend=top-left)](https://www.star-history.com/?repos=YlovexLN%2Fkarin-plugin-reply&type=date&legend=top-left)
