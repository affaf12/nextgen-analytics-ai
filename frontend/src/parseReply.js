// Splits an assistant reply into alternating text and code-block segments.
// Recognises fences written as ```language:filename.ext so each block can
// carry its own filename for the download button. Falls back to a generic
// name when the model didn't include one.

let counter = 0

export function parseReply(text) {
  const fence = /```([\w+-]*)(?::([^\n`]+))?\n([\s\S]*?)```/g
  const segments = []
  let lastIndex = 0
  let match

  while ((match = fence.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', content: text.slice(lastIndex, match.index) })
    }
    const [, lang, filename, code] = match
    const ext = lang || 'txt'
    segments.push({
      type: 'code',
      lang: ext,
      filename: filename?.trim() || `fixed-file-${++counter}.${extFor(ext)}`,
      content: code.trim(),
    })
    lastIndex = fence.lastIndex
  }
  if (lastIndex < text.length) {
    segments.push({ type: 'text', content: text.slice(lastIndex) })
  }
  return segments
}

function extFor(lang) {
  const map = {
    javascript: 'js', typescript: 'ts', python: 'py', html: 'html',
    css: 'css', json: 'json', jsx: 'jsx', tsx: 'tsx', bash: 'sh',
    shell: 'sh', markdown: 'md', yaml: 'yml',
  }
  return map[lang.toLowerCase()] || lang || 'txt'
}
