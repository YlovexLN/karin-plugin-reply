import { karin } from 'node-karin'
import { replyConfig } from '../utils/replyConfig.js'

/**
 * 构建回复内容（支持字符串和数组）
 * @param {string|string[]} reply
 * @returns {string}
 */
function buildReply (reply) {
  if (Array.isArray(reply)) {
    return reply[Math.floor(Math.random() * reply.length)]
  }
  return String(reply)
}

/**
 * 清理消息中的@信息（处理有空格和无空格的情况）
 * @param {string} text 原始消息
 * @param {object} e 事件对象
 * @returns {string}
 */
function cleanMessageText (text, e) {
  if (!e.isGroup) {
    return text
  }
  
  const selfId = e.self_id || e.bot?.self_id
  
  if (selfId) {
    // 移除 CQ 码格式的@机器人（处理有空格和无空格）
    const cqAtPattern1 = new RegExp(`\\[CQ:at,qq=${selfId}\\]\\s*`, 'gi')  // 有空格
    const cqAtPattern2 = new RegExp(`\\[CQ:at,qq=${selfId}\\]`, 'gi')      // 无空格
    text = text.replace(cqAtPattern1, '').trim()
    text = text.replace(cqAtPattern2, '').trim()
    
    // 移除纯文本@机器人（处理有空格和无空格）
    const textAtPattern1 = new RegExp(`@${selfId}\\s+`, 'gi')  // 有空格
    const textAtPattern2 = new RegExp(`@${selfId}`, 'gi')      // 无空格
    text = text.replace(textAtPattern1, '').trim()
    text = text.replace(textAtPattern2, '').trim()
  }
  
  // 移除@全体成员
  text = text.replace(/\[CQ:at,qq=all\]\s*/gi, '').trim()
  text = text.replace(/@全体成员\s*/gi, '').trim()
  
  // 移除其他CQ码格式的@
  text = text.replace(/\[CQ:at,qq=\d+\]\s*/gi, '').trim()
  
  // 移除其他纯文本@
  text = text.replace(/@\d+\s*/g, '').trim()
  
  return text
}

/**
 * 检查是否需要@机器人
 * @param {object} e 事件对象
 * @param {boolean} requireAt 规则是否需要@
 * @returns {boolean}
 */
function checkAtRequirement (e, requireAt) {
  if (!requireAt) {
    return true // 不需要@机器人，直接通过
  }
  
  // 需要@机器人的情况
  if (!e.isGroup) {
    // 私聊不需要@检查
    return true
  }
  
  const selfId = e.self_id || e.bot?.self_id
  
  // 方法1：使用 Karin 提供的 atBot 字段
  if (e.atBot === true) {
    return true
  }
  
  // 方法2：检查 at 数组
  if (selfId && Array.isArray(e.at)) {
    const isAtBot = e.at.some(atId => String(atId) === String(selfId))
    if (isAtBot) {
      return true
    }
  }
  
  // 方法3：检查消息文本中的CQ码（处理有空格和无空格）
  const msg = e.msg || ''
  if (selfId) {
    // 检查 [CQ:at,qq=869835619] 当前状态（有空格）
    const cqAtPattern1 = new RegExp(`\\[CQ:at,qq=${selfId}\\]\\s+`, 'i')
    // 检查 [CQ:at,qq=869835619]当前状态（无空格）
    const cqAtPattern2 = new RegExp(`\\[CQ:at,qq=${selfId}\\]`, 'i')
    
    if (cqAtPattern1.test(msg) || cqAtPattern2.test(msg)) {
      return true
    }
  }
  
  return false
}

/**
 * 判断消息是否匹配关键词规则
 * @param {string} text 清理后的消息文本
 * @param {object} rule 规则对象
 * @returns {boolean}
 */
function isMatch (text, rule) {
  const keyword = rule.keyword || ''
  const matchType = rule.match || 'contains'

  switch (matchType) {
    case 'exact':
      return text === keyword
    case 'regex': {
      try {
        return new RegExp(keyword).test(text)
      } catch {
        return false
      }
    }
    case 'contains':
    default:
      return text.includes(keyword)
  }
}

/**
 * 自定义关键词回复插件
 * 支持群聊/私聊，支持群组专属规则，支持@机器人条件
 */
export const customReply = karin.command(
  /[\s\S]*/,
  async (e) => {
    let text = e.msg?.trim() || ''
    if (!text) return false

    const cfg = replyConfig()
    const isGroup = e.isGroup
    const groupId = isGroup ? String(e.group_id) : null

    // 1. 优先匹配群组专属规则（仅群聊）
    if (isGroup && groupId && cfg.groups && cfg.groups[groupId]) {
      const groupRules = cfg.groups[groupId]
      
      for (const rule of groupRules) {
        // 检查@机器人条件
        const requireAt = rule.requireAt || false
        if (!checkAtRequirement(e, requireAt)) {
          continue
        }
        
        // 清理消息中的@信息后进行匹配
        const cleanedText = cleanMessageText(text, e)
        
        if (isMatch(cleanedText, rule)) {
          const replyText = buildReply(rule.reply)
          console.log(`[karin-plugin-reply] 群 ${groupId} 规则命中: ${rule.keyword}`)
          await e.reply(replyText)
          return true
        }
      }
    }

    // 2. 匹配全局规则
    const globalRules = cfg.global || []
    
    for (const rule of globalRules) {
      // 场景过滤
      const scene = rule.scene || 'all'
      if (scene === 'group' && !isGroup) {
        continue
      }
      if (scene === 'private' && isGroup) {
        continue
      }
      
      // 检查@机器人条件
      const requireAt = rule.requireAt || false
      if (!checkAtRequirement(e, requireAt)) {
        continue
      }
      
      // 清理消息中的@信息后进行匹配
      const cleanedText = cleanMessageText(text, e)
      
      if (isMatch(cleanedText, rule)) {
        const replyText = buildReply(rule.reply)
        console.log(`[karin-plugin-reply] 全局规则命中: ${rule.keyword}`)
        await e.reply(replyText)
        return true
      }
    }

    return false
  },
  {
    name: '自定义关键词回复',
    event: 'message',
    perm: 'all',
    log: false,
    rank: 9000,
  }
)