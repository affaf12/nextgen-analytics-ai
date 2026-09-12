import { parseReply } from '../parseReply'
import CodeBlock from './CodeBlock'
import { downloadZip } from '../api'

export default function MessageBubble({ role, content, time }) {
  if (role === 'user') {
    return (
      <div className="msg user">
        <div className="bubble user">{content}</div>
      </div>
    )
  }

  const segments = parseReply(content)
  const codeBlocks = segments.filter((s) => s.type === 'code')

  return (
    <div className="msg assistant">
      <div className="avatar-sm">N</div>
      <div className="assistant-col">
        <div className="bubble assistant">
          {segments.map((seg, i) =>
            seg.type === 'text' ? (
              <p key={i} className="msg-text">{seg.content}</p>
            ) : (
              <CodeBlock key={i} filename={seg.filename} lang={seg.lang} content={seg.content} />
            )
          )}
        </div>
        {codeBlocks.length > 1 && (
          <button
            className="btn-download-all"
            onClick={() => downloadZip(codeBlocks.map((c) => ({ name: c.filename, content: c.content })))}
          >
            Download all {codeBlocks.length} files as .zip
          </button>
        )}
        {time && <div className="msg-time">{time}</div>}
      </div>
    </div>
  )
}
