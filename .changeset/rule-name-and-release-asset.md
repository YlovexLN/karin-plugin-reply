---
'karin-plugin-reply': patch
---

Web UI 支持自定义规则名称：新增 `name` 字段与「规则名称」输入框，卡片标题优先显示该名称，留空则回退到关键词；同时修复 GitHub Release 附件版本错乱（改为检出发布 tag 后再打包）。
