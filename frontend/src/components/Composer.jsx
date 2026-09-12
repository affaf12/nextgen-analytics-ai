import { useRef, useState } from 'react'

const QUICK_PROMPTS = [
  'Is file ko best practice se edit karo aur fixed version do',
  'Bugs fix karo aur optimize karo',
  'Code ko clean aur production-ready banao',
  'Kya kharab hai explain karo, phir fixed file do',
]

export default function Composer({ onSend, attachedFiles, onAttach, onRemoveFile, sending }) {
  const [text, setText] = useState('')
  const fileInputRef = useRef(null)

  function handleSend(promptOverride) {
    const message = promptOverride ?? text
    if (!message.trim() && attachedFiles.length === 0) return
    onSend(message)
    setText('')
  }

  return (
    <div className="composer">
      <div className="composer-inner">
        <div className="quick-prompts">
          {QUICK_PROMPTS.map((p) => (
            <button key={p} className="quick-btn" onClick={() => handleSend(p)}>{p}</button>
          ))}
        </div>

        {attachedFiles.length > 0 && (
          <div className="file-chips">
            {attachedFiles.map((f, i) => (
              <div key={i} className="file-chip">
                <span>{f.name}</span>
                <button onClick={() => onRemoveFile(i)}>×</button>
              </div>
            ))}
          </div>
        )}

        <div className="input-box">
          <button className="attach-btn" onClick={() => fileInputRef.current?.click()} title="Attach files or a .zip">
            📎
          </button>
          <textarea
            className="textarea"
            placeholder="File upload karo ya likho 'is file ko best banao'..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
          />
          <button className="send-btn" onClick={() => handleSend()} disabled={sending}>
            {sending ? '…' : '↑'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            hidden
            onChange={(e) => { onAttach(e.target.files); e.target.value = '' }}
          />
        </div>
        <div className="composer-hint">Any file type, including .zip archives, is supported.</div>
      </div>
    </div>
  )
}
