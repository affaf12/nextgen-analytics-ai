import { downloadFile } from '../api'

export default function CodeBlock({ filename, lang, content }) {
  return (
    <div className="code-block">
      <div className="code-header">
        <span>{filename} · {lang}</span>
        <button className="btn-download-code" onClick={() => downloadFile(filename, content)}>
          Download
        </button>
      </div>
      <pre className="code-content"><code>{content}</code></pre>
    </div>
  )
}
