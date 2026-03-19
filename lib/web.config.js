import { defineConfig, components } from 'node-karin'
import { replyConfig, saveReplyConfig, dirConfig } from './utils/replyConfig.js'

/**
 * 将回复内容转换为字符串（用于 Web UI 显示）
 * @param {string|string[]} reply
 * @returns {string}
 */
function replyToString(reply) {
  if (Array.isArray(reply)) {
    return reply.join('\n')
  }
  return reply || ''
}

/**
 * 将 Web UI 输入的字符串转换为回复内容
 * 支持 \n 换行符
 * @param {string} str
 * @returns {string|string[]}
 */
function stringToReply(str) {
  if (!str) return ''
  const processed = str.replace(/\\n/g, '\n')
  const lines = processed.split('\n').filter(line => line.trim() !== '')
  if (lines.length === 0) return ''
  if (lines.length === 1) return lines[0]
  return lines
}

export default defineConfig({
  /** 插件信息 */
  info: {
    id: 'karin-plugin-reply',
    name: '关键词回复配置',
    author: {
      name: 'YlovexLN',
      home: 'https://github.com/YlovexLN/karin-plugin-reply',
      avatar: 'https://github.com/YlovexLN.png',
    },
    icon: {
      name: 'reply',
      size: 24,
      color: '#4F46E5',
    },
    version: '0.0.6',
    description: '自定义关键词回复插件配置界面，支持群聊/私聊，支持群组专属规则',
  },

  /** 动态渲染的组件 */
  components: () => {
    const currentConfig = replyConfig()
    console.log('[karin-plugin-reply] 加载配置:', JSON.stringify(currentConfig, null, 2))

    // 转换全局规则为 accordionPro 数据格式
    // title 自动使用 keyword 的值，subtitle 自动使用 reply 的值
    const globalData = (currentConfig.global || []).length > 0
      ? (currentConfig.global || []).map((rule) => ({
          title: rule.keyword || '新项目',
          subtitle: rule.reply ? replyToString(rule.reply) : '暂未配置内容',
          keyword: rule.keyword || '',
          reply: replyToString(rule.reply),
          match: rule.match || 'contains',
          scene: rule.scene || 'all',
          requireAt: rule.requireAt || false,
          enabled: rule.enabled !== false,  // 默认启用
        }))
      : []  // 没有配置时返回空数组，让用户自己添加

    // 转换群组规则为 accordionPro 数据格式（扁平化）
    const groupsData = []
    if (currentConfig.groups) {
      for (const [groupId, rules] of Object.entries(currentConfig.groups)) {
        for (let i = 0; i < rules.length; i++) {
          const rule = rules[i]
          groupsData.push({
            title: rule.keyword || '新项目',
            subtitle: rule.reply ? replyToString(rule.reply) : '暂未配置内容',
            groupId: groupId,
            keyword: rule.keyword || '',
            reply: replyToString(rule.reply),
            match: rule.match || 'contains',
            requireAt: rule.requireAt || false,
            enabled: rule.enabled !== false,  // 默认启用
          })
        }
      }
    }

    return [
      // ==================== 全局规则部分 ====================
      components.divider.create('divider-global', {
        description: '全局关键词规则（对所有群聊和私聊生效）',
        descPosition: 50,
        orientation: 'horizontal',
      }),

      components.accordionPro.create(
        'global-rules',
        globalData,
        {
          label: '全局关键词规则',
          // 新添加项的默认值
          defaultData: {
            match: 'contains',
            scene: 'all',
            requireAt: false,
          },
          children: components.accordion.createItem('global-item', {
            children: [
              // 规则启用开关（最上面，方便快速点击）
              components.switch.create('enabled', {
                label: '启用规则',
                startText: '启用',
                endText: '禁用',
                color: 'success',
                description: '启用和禁用规则',
                defaultSelected: true,
              }),

              // 关键词输入（灰色样式）
              components.input.string('keyword', {
                label: '关键词',
                placeholder: '请输入触发关键词',
                description: '触发关键词，支持正则表达式（如 ^你好$ 表示精确匹配）',
                isRequired: true,
                isClearable: true,
                color: 'default',
              }),

              // 回复内容（灰色样式）
              components.input.create('reply', {
                label: '回复内容',
                placeholder: '请输入回复内容人',
                description: '换行方法：输入 \\n 表示换行，多行内容会完整发送',
                isRequired: true,
                isClearable: true,
                color: 'default',
              }),

              // 匹配类型
              components.radio.group('match', {
                label: '匹配方式（不选时默认为"包含匹配"）',
                orientation: 'horizontal',
                color: 'primary',
                value: 'match',
                radio: [
                  components.radio.create('match-exact', { value: 'exact', label: '精确匹配' }),
                  components.radio.create('match-contains', { value: 'contains', label: '包含匹配' }),
                  components.radio.create('match-regex', { value: 'regex', label: '正则匹配' }),
                ],
              }),

              // 应用场景
              components.radio.group('scene', {
                label: '应用场景（不选时默认为"全部"）',
                orientation: 'horizontal',
                color: 'primary',
                value: 'scene',
                radio: [
                  components.radio.create('scene-all', { value: 'all', label: '全部' }),
                  components.radio.create('scene-group', { value: 'group', label: '仅群聊' }),
                  components.radio.create('scene-private', { value: 'private', label: '仅私聊' }),
                ],
              }),

              // 是否需要 @ 开关
              components.switch.create('requireAt', {
                label: '开启@条件',
                startText: '开启',
                endText: '关闭',
                color: 'primary',
                description: '是否需要@机器人，仅在群聊中生效',
                defaultSelected: false,
              }),
            ],
          }),
        }
      ),

      // ==================== 群组规则部分 ====================
      components.divider.create('divider-groups', {
        description: '群组专属规则（优先级高于全局规则）',
        descPosition: 50,
        orientation: 'horizontal',
      }),

      // 群聊配置 - 扁平化结构
      components.accordionPro.create(
        'group-rules',
        groupsData,
        {
          label: '群组专属规则',
          // 新添加项的默认值
          defaultData: {
            match: 'contains',
            requireAt: false,
          },
          children: components.accordion.createItem('group-item', {
            children: [
              // 规则启用开关（最上面，方便快速点击）
              components.switch.create('enabled', {
                label: '启用规则',
                startText: '启用',
                endText: '禁用',
                color: 'success',
                description: '启用和禁用群组专属规则',
                defaultSelected: true,
              }),

              // 群号（黄色/警告样式）
              components.input.string('groupId', {
                label: '群号',
                placeholder: '请输入 QQ 群号',
                description: '指定此规则生效的 QQ 群号码',
                isRequired: true,
                isClearable: true,
                color: 'warning',
              }),

              // 关键词（灰色样式）
              components.input.string('keyword', {
                label: '关键词',
                placeholder: '请输入触发关键词',
                description: '触发关键词，支持正则表达式',
                isRequired: true,
                isClearable: true,
                color: 'default',
              }),

              // 回复内容（灰色样式）
              components.input.create('reply', {
                label: '回复内容',
                placeholder: '请输入回复内容人',
                description: '换行方法：输入 \\n 表示换行，多行内容会完整发送',
                isRequired: true,
                isClearable: true,
                color: 'default',
              }),

              // 匹配类型
              components.radio.group('match', {
                label: '匹配方式（不选时默认为"包含匹配"）',
                orientation: 'horizontal',
                color: 'primary',
                value: 'match',
                radio: [
                  components.radio.create('group-match-exact', { value: 'exact', label: '精确匹配' }),
                  components.radio.create('group-match-contains', { value: 'contains', label: '包含匹配' }),
                  components.radio.create('group-match-regex', { value: 'regex', label: '正则匹配' }),
                ],
              }),

              // 是否需要 @ 开关
              components.switch.create('requireAt', {
                label: '开启@条件',
                startText: '开启',
                endText: '关闭',
                color: 'primary',
                description: '是否需要@机器人，仅在群聊中生效',
                defaultSelected: false,
              }),
            ],
          }),
        }
      ),
    ]
  },

  /** 保存配置 */
  save: (config) => {
    console.log('[karin-plugin-reply] 收到原始配置:', JSON.stringify(config, null, 2))

    try {
      // 转换全局规则 - 只保留有关键词的规则
      const globalRules = []
      for (const item of config['global-rules'] || []) {
        const keyword = item.keyword?.trim()
        if (!keyword) continue  // 跳过空关键词
        
        // 智能处理 requireAt：私聊场景自动设为 false
        let requireAtValue = false
        if (item.scene === 'group' || item.scene === 'all') {
          requireAtValue = item.requireAt === true
        }
        
        globalRules.push({
          keyword: keyword,
          reply: stringToReply(item.reply),
          match: item.match || 'contains',
          scene: item.scene || 'all',
          requireAt: requireAtValue,
          enabled: item.enabled !== false,  // 默认启用
        })
      }

      console.log('[karin-plugin-reply] 全局规则:', JSON.stringify(globalRules, null, 2))

      // 转换群组规则 - 按 groupId 分组，只保留有群号和关键词的规则
      const groups = {}
      for (const item of config['group-rules'] || []) {
        const groupId = item.groupId?.trim()
        const keyword = item.keyword?.trim()
        
        // 跳过空项（群号或关键词为空）
        if (!groupId || !keyword) continue

        if (!groups[groupId]) {
          groups[groupId] = []
        }

        groups[groupId].push({
          keyword: keyword,
          reply: stringToReply(item.reply),
          match: item.match || 'contains',
          requireAt: item.requireAt === true,
          enabled: item.enabled !== false,  // 默认启用
        })
      }

      console.log('[karin-plugin-reply] 群组规则:', JSON.stringify(groups, null, 2))

      const finalConfig = {
        global: globalRules,
        groups: groups,
      }

      console.log('[karin-plugin-reply] 最终配置:', JSON.stringify(finalConfig, null, 2))

      // 使用插件自带的保存方法
      saveReplyConfig(finalConfig)

      console.log('[karin-plugin-reply] 配置已保存到文件')

      // 生成友好的成功消息
      const globalCount = globalRules.length
      const groupCount = Object.keys(groups).length
      let message = '保存成功！'
      if (globalCount > 0) {
        message += `共 ${globalCount} 条全局规则`
      }
      if (groupCount > 0) {
        message += `${globalCount > 0 ? '，' : ''}${groupCount} 个群组的规则`
      }
      if (globalCount === 0 && groupCount === 0) {
        message = '保存成功！配置已清空'
      }

      return {
        success: true,
        message: message,
      }
    } catch (err) {
      console.error('[karin-plugin-reply] 保存失败:', err)
      return {
        success: false,
        message: `保存失败：${err.message}`,
      }
    }
  },
})
