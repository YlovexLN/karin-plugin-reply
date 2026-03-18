// Web 配置文件
// 注意：在 Karin 运行时环境中，defineConfig 和 components 会自动注入

export default {
  /** 插件信息配置 */
  info: {
    id: 'karin-plugin-reply',
    name: '自定义关键词回复',
    author: {
      name: '开发者',
      home: 'https://github.com/your-repo/karin-plugin-reply',
      avatar: 'https://github.com/your-repo.png'
    },
    icon: {
      name: 'reply',
      size: 24,
      color: '#4CAF50'
    },
    version: '1.0.0',
    description: '自定义关键词回复插件，支持群聊/私聊，支持群组专属规则，支持@机器人条件'
  },

  /** 动态渲染的组件 */
  components: () => {
    // 在 Karin 运行时环境中，components 会自动注入
    const { components } = require('node-karin')
    
    return [
      // 全局规则配置
      components.accordion.create('global-rules', {
        label: '全局规则配置',
        children: [
          components.accordion.createItem('global-rules-item', {
            title: '全局关键词规则',
            subtitle: '这些规则在所有群聊和私聊中生效',
            children: [
              components.input.string('global-rules-input', {
                label: '全局规则配置',
                placeholder: '请编辑 reply.yaml 配置文件',
                description: '全局规则需要在配置文件中编辑，保存后会自动重新加载',
                isReadOnly: true,
                color: 'warning'
              })
            ]
          })
        ]
      }),

      // 分隔线
      components.divider.create('divider-1'),

      // 群组专属规则配置
      components.accordion.create('group-rules', {
        label: '群组专属规则配置',
        children: [
          components.accordion.createItem('group-rules-item', {
            title: '群组专属关键词规则',
            subtitle: '为特定群组设置专属的关键词回复规则',
            children: [
              components.input.string('group-rules-input', {
                label: '群组规则配置',
                placeholder: '请编辑 reply.yaml 配置文件',
                description: '群组专属规则需要在配置文件中编辑，保存后会自动重新加载',
                isReadOnly: true,
                color: 'warning'
              })
            ]
          })
        ]
      }),

      // 分隔线
      components.divider.create('divider-2'),

      // 配置说明
      components.accordion.create('config-help', {
        label: '配置说明',
        children: [
          components.accordion.createItem('config-help-item', {
            title: '如何配置关键词规则',
            subtitle: '配置文件路径和格式说明',
            children: [
              components.input.string('config-path', {
                label: '配置文件路径',
                value: '@karinjs/karin-plugin-reply/config/reply.yaml',
                isReadOnly: true,
                color: 'primary'
              }),
              
              components.divider.create('help-divider-1', { transparent: true }),
              
              components.input.string('config-format', {
                label: '配置文件格式',
                value: 'YAML 格式，支持以下字段：',
                isReadOnly: true,
                color: 'success'
              }),
              
              components.divider.create('help-divider-2', { transparent: true }),
              
              // 配置字段说明
              components.accordion.create('field-help', {
                label: '配置字段说明',
                children: [
                  components.accordion.createItem('field-help-item', {
                    title: '规则字段说明',
                    children: [
                      components.input.string('field-keyword', {
                        label: 'keyword',
                        value: '关键词内容（必填）',
                        isReadOnly: true,
                        color: 'default'
                      }),
                      
                      components.input.string('field-reply', {
                        label: 'reply',
                        value: '回复内容（必填，支持字符串或数组）',
                        isReadOnly: true,
                        color: 'default'
                      }),
                      
                      components.input.string('field-match', {
                        label: 'match',
                        value: '匹配模式：exact（精确）、contains（包含）、regex（正则）',
                        isReadOnly: true,
                        color: 'default'
                      }),
                      
                      components.input.string('field-scene', {
                        label: 'scene',
                        value: '生效场景：all（全部）、group（仅群聊）、private（仅私聊）',
                        isReadOnly: true,
                        color: 'default'
                      }),
                      
                      components.input.string('field-requireAt', {
                        label: 'requireAt',
                        value: '是否需要@机器人：true（需要）、false（不需要）',
                        isReadOnly: true,
                        color: 'default'
                      })
                    ]
                  })
                ]
              }),
              
              components.divider.create('help-divider-3', { transparent: true }),
              
              // 示例配置
              components.accordion.create('config-example', {
                label: '配置示例',
                children: [
                  components.accordion.createItem('config-example-item', {
                    title: 'YAML 配置示例',
                    children: [
                      components.input.string('example-global', {
                        label: '全局规则示例',
                        value: 'global:\n  - keyword: "你好"\n    reply: "你好呀！"\n    match: contains\n    scene: all\n    requireAt: false',
                        isReadOnly: true,
                        color: 'secondary'
                      }),
                      
                      components.divider.create('example-divider', { transparent: true }),
                      
                      components.input.string('example-group', {
                        label: '群组专属规则示例',
                        value: 'groups:\n  "797397796":\n    - keyword: "服务器"\n      reply: "服务器信息..."\n      match: exact\n      requireAt: false\n    - keyword: "当前状态"\n      reply: "机器人运行正常！"\n      match: exact\n      requireAt: true',
                        isReadOnly: true,
                        color: 'secondary'
                      })
                    ]
                  })
                ]
              })
            ]
          })
        ]
      }),

      // 分隔线
      components.divider.create('divider-3'),

      // 插件状态
      components.accordion.create('plugin-status', {
        label: '插件状态',
        children: [
          components.accordion.createItem('plugin-status-item', {
            title: '当前状态',
            subtitle: '插件运行状态信息',
            children: [
              components.switch.create('plugin-enabled', {
                label: '插件启用状态',
                startText: '已启用',
                endText: '已禁用',
                defaultSelected: true,
                isReadOnly: true,
                color: 'success'
              }),
              
              components.divider.create('status-divider', { transparent: true }),
              
              components.input.string('rules-count', {
                label: '已加载规则数量',
                value: '全局规则: 5条，群组专属规则: 2条',
                isReadOnly: true,
                color: 'info'
              }),
              
              components.divider.create('status-divider-2', { transparent: true }),
              
              components.input.string('last-reload', {
                label: '最后重载时间',
                value: new Date().toLocaleString('zh-CN'),
                isReadOnly: true,
                color: 'info'
              })
            ]
          })
        ]
      })
    ]
  },

  /** 前端点击保存之后调用的方法 */
  save: (config) => {
    console.log('[karin-plugin-reply] Web 配置保存:', config)
    
    // 这里可以添加保存配置的逻辑
    // 注意：由于我们的配置是通过文件管理的，这里主要是显示信息
    
    return {
      success: true,
      message: '配置信息已更新（实际配置请编辑 reply.yaml 文件）'
    }
  }
}