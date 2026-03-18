import { logger } from 'node-karin'
import { customReply } from './apps/reply.js'
import { basename } from './utils/replyConfig.js'

logger.info(`${logger.green('[karin-plugin-reply]')} ${logger.violet(basename)} 自定义关键词回复插件加载完成~`)

// 导出插件
export { customReply }