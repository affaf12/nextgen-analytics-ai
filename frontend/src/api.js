// File upload/download calls to the FastAPI backend. Chat itself goes
// through src/puter.js (client-side, OAuth, no server API keys involved).
//
// In local dev, Vite proxies /api to localhost:8000 (see vite.config.js).
// In production (GitHub Pages), the frontend and backend live on different
// domains, so VITE_API_BASE points straight at the deployed backend - set
// it as a GitHub Actions repo variable, see README.

const BASE = (import.meta.env.VITE_API_BASE || '/api')

export async function uploadFiles(fileList) {
  const form = new FormData()
  for (const f of fileList) form.append('files', f)
  const res = await fetch(`${BASE}/upload`, { method: 'POST', body: form })
  if (!res.ok) throw new Error('Upload failed')
  return (await res.json()).files
}

export async function downloadFile(filename, content) {
  const res = await fetch(`${BASE}/download`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename, content }),
  })
  const blob = await res.blob()
  triggerDownload(blob, filename)
}

export async function downloadZip(files, zipName = 'nextgen-fixed-files.zip') {
  const res = await fetch(`${BASE}/download-zip`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ files, zip_name: zipName }),
  })
  const blob = await res.blob()
  triggerDownload(blob, zipName)
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
