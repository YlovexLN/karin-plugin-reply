/**
 * 回复内容与 WebUI 输入框之间的文本互转。
 *
 * Karin WebUI 的 input 组件是单行输入框（InputProps.type 只有 text/email/url 等，
 * 没有 textarea），浏览器会丢弃其中的真实换行符。因此界面统一用字面量 `\n`
 * 表示换行：读取时把真实换行转成 `\n` 显示，保存时再把 `\n` 还原成真实换行。
 * 这样多行规则在“打开 → 保存”之间不会丢失换行。
 */

/** 占位符：临时替换已转义的反斜杠，避免被当作换行转义处理 */
const SENTINEL = '\u0000'

/**
 * 把存储的回复内容转换成 WebUI 单行输入框的显示文本。
 * 数组按行拼接；真实换行与反斜杠都会转义，保证可无损还原。
 * @param {string|string[]|null|undefined} reply 存储格式的回复内容
 * @returns {string} 单行显示文本，换行以字面量 `\n` 表示
 */
export function replyToInput (reply) {
  const lines = Array.isArray(reply) ? reply : [reply]
  return lines
    .map(line => String(line ?? '')
      .replace(/\r\n?/g, '\n')
      .replace(/\\/g, '\\\\')
      .replace(/\n/g, '\\n'))
    .join('\\n')
}

/**
 * 把 WebUI 输入框的文本转换成存储格式。
 * 同时接受字面量 `\n` 和真实换行（粘贴/多行输入场景），保留中间空行，仅去掉末尾空行。
 * @param {string|null|undefined} input 输入框文本
 * @returns {string|string[]} 单行为字符串，多行为字符串数组
 */
export function inputToReply (input) {
  if (input === null || input === undefined) return ''

  let text = String(input).replace(/\r\n?/g, '\n')
  // 先保护 `\\`（字面反斜杠），再还原 `\n` / `\r`
  text = text.replace(/\\\\/g, SENTINEL)
  text = text.replace(/\\n|\\r/g, '\n')
  text = text.split(SENTINEL).join('\\')

  const lines = text.split('\n')
  while (lines.length > 0 && lines[lines.length - 1] === '') {
    lines.pop()
  }

  if (lines.length === 0) return ''
  if (lines.length === 1) return lines[0]
  return lines
}
