import { useEffect, useRef, useState } from 'react'
import Sidebar from './components/Sidebar'
import LoginHero from './components/LoginHero'
import MessageBubble from './components/MessageBubble'
import Composer from './components/Composer'
import { uploadFiles } from './api'
import { FREE_MODELS, isSignedIn, getUser, signIn, signOut, chat as puterChat } from './puter'

const STORAGE_KEY = 'nextgen_filefixer_chats'

function loadChats() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}
function saveChats(chats) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(chats))
}
function newId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}
function welcomeMessage() {
  return {
    id: 'welcome',
    role: 'assistant',
    content:
      "Welcome to **nextgen-analytics-ai**.\n\n" +
      "Attach a broken file (or a .zip of your project), and tell me what to fix. " +
      "I'll send back the corrected file(s) with a download button on each one.",
    time: new Date().toLocaleTimeString(),
  }
}

const SYSTEM_PROMPT =
  "You are nextgen-analytics-ai. The user uploads code or documents " +
  "that are broken, messy, or need improvement. Rewrite the file(s) they attach " +
  "into a clean, correct, production-quality version.\n" +
  "Rules:\n" +
  "1. Always return the FULL corrected content of each file, never a diff or partial snippet.\n" +
  "2. Wrap each file's corrected content in its own fenced code block, starting the " +
  "fence with the language and the original filename, like:\n" +
  "```language:filename.ext\n<full file content>\n```\n" +
  "3. Before each code block, add one short line explaining what you fixed.\n" +
  "4. If nothing is broken, say so plainly and still return the cleaned-up file.\n" +
  "5. Keep explanations brief - the user mainly wants the fixed file back."

export default function App() {
  const [authChecked, setAuthChecked] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)
  const [loggingIn, setLoggingIn] = useState(false)
  const [user, setUser] = useState(null)

  const [currentModel, setCurrentModel] = useState(FREE_MODELS[0].id)
  const [chats, setChats] = useState(loadChats)
  const [currentChatId, setCurrentChatId] = useState(chats[0]?.id ?? null)
  const [attachedFiles, setAttachedFiles] = useState([])
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)
  const messagesRef = useRef(null)

  useEffect(() => {
    (async () => {
      try {
        const signedIn = await isSignedIn()
        if (signedIn) {
          setUser(await getUser())
          setLoggedIn(true)
          if (chats.length === 0) createNewChat()
        }
      } catch {
        // Puter SDK not reachable yet - user can still try Sign in manually
      } finally {
        setAuthChecked(true)
      }
    })()
  }, [])

  useEffect(() => {
    if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight
  })

  async function handleLogin() {
    setLoggingIn(true)
    setError(null)
    try {
      const u = await signIn()
      setUser(u)
      setLoggedIn(true)
      if (chats.length === 0) createNewChat()
    } catch (e) {
      setError('Sign-in failed: ' + e.message)
    } finally {
      setLoggingIn(false)
    }
  }

  async function handleLogout() {
    await signOut()
    setLoggedIn(false)
    setUser(null)
  }

  function createNewChat() {
    const chat = { id: newId(), title: 'New chat', messages: [welcomeMessage()] }
    setChats((prev) => {
      const next = [...prev, chat]
      saveChats(next)
      return next
    })
    setCurrentChatId(chat.id)
  }

  function deleteChat(id) {
    setChats((prev) => {
      const next = prev.filter((c) => c.id !== id)
      saveChats(next)
      if (currentChatId === id) setCurrentChatId(next[next.length - 1]?.id ?? null)
      return next
    })
  }

  function clearAllHistory() {
    if (!confirm('Delete all chat history? This cannot be undone.')) return
    setChats([])
    saveChats([])
    setCurrentChatId(null)
    createNewChat()
  }

  async function handleAttach(fileList) {
    try {
      const files = await uploadFiles(fileList)
      setAttachedFiles((prev) => [...prev, ...files].slice(0, 20))
    } catch {
      setError('Upload failed - is the backend running on :8000?')
    }
  }

  function removeFile(i) {
    setAttachedFiles((prev) => prev.filter((_, idx) => idx !== i))
  }

  async function handleSend(message) {
    let chat = chats.find((c) => c.id === currentChatId)
    if (!chat) { createNewChat(); return }

    const userMsg = {
      id: newId(),
      role: 'user',
      content: message || `Attached ${attachedFiles.length} file(s) for fixing`,
      time: new Date().toLocaleTimeString(),
    }
    const title = chat.messages.length <= 1 && message ? message.slice(0, 48) : chat.title
    let updated = chats.map((c) =>
      c.id === chat.id ? { ...c, title, messages: [...c.messages, userMsg] } : c
    )
    setChats(updated)
    saveChats(updated)

    const filesForRequest = attachedFiles
    setAttachedFiles([])
    setSending(true)
    setError(null)

    try {
      const fileContext = filesForRequest.length
        ? '\n\nThe user attached these files. Fix/rewrite each one and return the full ' +
          'corrected content for every file, per the formatting rules above.\n\n' +
          filesForRequest.map((f) => `--- FILE: ${f.name} ---\n${f.content}\n--- END FILE: ${f.name} ---`).join('\n\n')
        : ''

      const history = chat.messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({ role: m.role, content: m.content }))

      const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...history,
        { role: 'user', content: message + fileContext },
      ]

      const reply = await puterChat(messages, currentModel)
      const assistantMsg = { id: newId(), role: 'assistant', content: reply, time: new Date().toLocaleTimeString() }
      updated = updated.map((c) =>
        c.id === chat.id ? { ...c, messages: [...c.messages, assistantMsg] } : c
      )
    } catch (e) {
      const errMsg = {
        id: newId(), role: 'assistant',
        content: `Error: ${e.message}. Try switching to another free model from the sidebar.`,
        time: new Date().toLocaleTimeString(),
      }
      updated = updated.map((c) =>
        c.id === chat.id ? { ...c, messages: [...c.messages, errMsg] } : c
      )
    } finally {
      setChats(updated)
      saveChats(updated)
      setSending(false)
    }
  }

  if (!authChecked) return null
  if (!loggedIn) return <LoginHero onLogin={handleLogin} loading={loggingIn} />

  const activeChat = chats.find((c) => c.id === currentChatId)

  return (
    <div className="app">
      <Sidebar
        user={user}
        onLogout={handleLogout}
        models={FREE_MODELS}
        currentModel={currentModel}
        onModelChange={setCurrentModel}
        chats={chats}
        currentChatId={currentChatId}
        onSelectChat={setCurrentChatId}
        onNewChat={createNewChat}
        onDeleteChat={deleteChat}
        onClearAll={clearAllHistory}
      />
      <main className="main">
        <div className="topbar">
          <div className="topbar-title">nextgen-analytics-ai</div>
          <span className="model-badge">{FREE_MODELS.find((m) => m.id === currentModel)?.label}</span>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <div className="messages" ref={messagesRef}>
          {activeChat?.messages.map((m) => (
            <MessageBubble key={m.id} role={m.role} content={m.content} time={m.time} />
          ))}
          {sending && (
            <div className="msg assistant">
              <div className="avatar-sm">N</div>
              <div className="bubble assistant">Fixing your file…</div>
            </div>
          )}
        </div>

        <Composer
          onSend={handleSend}
          attachedFiles={attachedFiles}
          onAttach={handleAttach}
          onRemoveFile={removeFile}
          sending={sending}
        />
      </main>
    </div>
  )
}
