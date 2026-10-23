import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import {
  watch,
  basePath,
  filesByExt,
  copyConfigSync,
  requireFileSync,
  clearRequireFile,
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
/** 用户配置目录 - 使用与 copyConfigSync 一致的路径 */
export const dirConfig = `${basePath}/@karinjs/${pluginName}/config`

console.log(`[karin-plugin-reply] 配置目录: ${dirConfig}`)
/** 默认配置目录 */
const defConfig = `${dirPath}/config/config`

// 初始化：将默认配置复制到用户目录（不覆盖已有文件）
copyConfigSync(defConfig, dirConfig, ['.yaml'])

/** 缓存 */
let replyCache = null

/** 已注册监听的文件，避免重复注册 */
const watchedFiles = new Set()

/**
 * 监听配置文件变化，清空内存缓存
 * @param {string} file 配置文件绝对路径
 */
const watchFile = (file) => {
  if (watchedFiles.has(file)) return
  watchedFiles.add(file)
  try {
    watch(file, () => {
      replyCache = null
    })
  } catch (err) {
    watchedFiles.delete(file)
    console.error(`[karin-plugin-reply] 监听配置文件失败: ${file}`, err)
  }
}

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

  // 用户配置强制读盘：requireFileSync 默认缓存 300 秒，保存后必须立即生效
  try { user = requireFileSync(userFile, { force: true }) || {} } catch {}
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
      // 添加 requireAt 字段（仅当为 true 时显示）
      if (rule.requireAt === true) {
        lines.push(`    requireAt: true`)
      }
      // 添加 enabled 字段（仅当为 false 时显示，默认启用）
      if (rule.enabled === false) {
        lines.push(`    enabled: false`)
      }
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
        // 添加 requireAt 字段（仅当为 true 时显示）
        if (rule.requireAt === true) {
          lines.push(`      requireAt: true`)
        }
        // 添加 enabled 字段（仅当为 false 时显示，默认启用）
        if (rule.enabled === false) {
          lines.push(`      enabled: false`)
        }
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
  if (str === null || str === undefined) return ''
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
  console.log(`[karin-plugin-reply] 保存配置到: ${userFile}`)

  const yamlContent = toYAML(config)
  console.log(`[karin-plugin-reply] 生成的 YAML 内容:\n${yamlContent}`)

  // 确保目录存在
  const dir = path.dirname(userFile)
  if (!fs.existsSync(dir)) {
    console.log(`[karin-plugin-reply] 创建目录: ${dir}`)
    fs.mkdirSync(dir, { recursive: true })
  }

  fs.writeFileSync(userFile, yamlContent, 'utf-8')
  console.log(`[karin-plugin-reply] 配置文件已保存`)

  // 清除 node-karin 的文件缓存与内存缓存，保证保存后立即生效
  try { clearRequireFile(userFile) } catch {}
  watchFile(userFile)
  replyCache = null
}

/** 监听配置文件变化，自动清除缓存 */
setTimeout(() => {
  const list = filesByExt(dirConfig, '.yaml', 'abs')
  list.forEach(watchFile)
}, 2000)
