import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import {
  watch,
  basePath,
  filesByExt,
  copyConfigSync,
  requireFileSync,
} from 'node-karin'

/** 当前文件的绝对路径 */
const filePath = fileURLToPath(import.meta.url).replace(/\\/g, '/')
/** 插件包绝对路径 */
export const dirPath = path.resolve(filePath, '../../../')
/** 插件包的名称 */
export const basename = path.basename(dirPath)

/** 读取 package.json */
export const pkg = () => requireFileSync(`${dirPath}/package.json`)

/** 用户配置的插件名称 */
const pluginName = pkg().name.replace(/\//g, '-')
/** 用户配置目录 */
const dirConfig = `${basePath}/${pluginName}/config`
/** 默认配置目录 */
const defConfig = `${dirPath}/config/config`

// 初始化：将默认配置复制到用户目录（不覆盖已有文件）
copyConfigSync(defConfig, dirConfig, ['.yaml'])

/** 缓存 */
let replyCache = null

/**
 * 读取回复配置
 * @returns {{ global: RuleItem[], groups: Record<string, RuleItem[]> }}
 */
export const replyConfig = () => {
  if (replyCache) return replyCache

  const userFile = `${dirConfig}/reply.yaml`
  const defFile = `${defConfig}/reply.yaml`

  let user = {}
  let def = {}

  try { user = requireFileSync(userFile) || {} } catch {}
  try { def = requireFileSync(defFile) || {} } catch {}

  replyCache = {
    global: user.global ?? def.global ?? [],
    groups: user.groups ?? def.groups ?? {},
  }
  return replyCache
}

/**
 * 将 YAML 格式的配置转换为字符串
 * @param {object} config
 * @returns {string}
 */
function toYAML (config) {
  const lines = ['# karin-plugin-reply 配置文件', '# 由网页配置自动生成', '']

  // 全局规则
  lines.push('global:')
  if (config.global && config.global.length > 0) {
    for (const rule of config.global) {
      lines.push(`  - keyword: "${escapeYAML(rule.keyword || '')}"`)
      if (Array.isArray(rule.reply)) {
        lines.push('    reply:')
        for (const r of rule.reply) {
          lines.push(`      - "${escapeYAML(r)}"`)
        }
      } else {
        lines.push(`    reply: "${escapeYAML(rule.reply || '')}"`)
      }
      lines.push(`    match: ${rule.match || 'contains'}`)
      lines.push(`    scene: ${rule.scene || 'all'}`)
    }
  } else {
    lines.push('  []')
  }

  lines.push('')

  // 群组规则
  lines.push('groups:')
  if (config.groups && Object.keys(config.groups).length > 0) {
    for (const [groupId, rules] of Object.entries(config.groups)) {
      lines.push(`  "${groupId}":`)
      for (const rule of rules) {
        lines.push(`    - keyword: "${escapeYAML(rule.keyword || '')}"`)
        if (Array.isArray(rule.reply)) {
          lines.push('      reply:')
          for (const r of rule.reply) {
            lines.push(`        - "${escapeYAML(r)}"`)
          }
        } else {
          lines.push(`      reply: "${escapeYAML(rule.reply || '')}"`)
        }
        lines.push(`      match: ${rule.match || 'contains'}`)
      }
    }
  } else {
    lines.push('  {}')
  }

  return lines.join('\n')
}

/**
 * 转义 YAML 字符串中的特殊字符
 * @param {string} str
 * @returns {string}
 */
function escapeYAML (str) {
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
}

/**
 * 保存配置到文件
 * @param {object} config 配置对象 { global, groups }
 */
export const saveReplyConfig = (config) => {
  const userFile = `${dirConfig}/reply.yaml`
  const yamlContent = toYAML(config)

  // 确保目录存在
  const dir = path.dirname(userFile)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  fs.writeFileSync(userFile, yamlContent, 'utf-8')

  // 清除缓存，下次读取时重新加载
  replyCache = null
}

/** 监听配置文件变化，自动清除缓存 */
setTimeout(() => {
  const list = filesByExt(dirConfig, '.yaml', 'abs')
  list.forEach(file => watch(file, () => {
    replyCache = null
  }))
}, 2000)
