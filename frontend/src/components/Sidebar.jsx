export default function Sidebar({
  user, onLogout,
  models, currentModel, onModelChange,
  chats, currentChatId, onSelectChat, onNewChat, onDeleteChat, onClearAll,
}) {
  return (
    <aside className="sidebar">
      <div className="logo-area">
        <div className="logo">
          <div className="logo-icon">N</div>
          <div>
            <div className="logo-text">nextgen-analytics-ai</div>
            <div className="logo-sub">FILE FIXER</div>
          </div>
        </div>
      </div>

      <button className="btn-new" onClick={onNewChat}>+ New chat</button>

      <div className="model-picker">
        <div className="section-label">Free models</div>
        {models.map((m) => (
          <button
            key={m.id}
            className={'model-btn' + (m.id === currentModel ? ' active' : '')}
            onClick={() => onModelChange(m.id)}
          >
            <span>{m.label}</span>
            <span className="model-provider">{m.tag}</span>
          </button>
        ))}
      </div>

      <div className="history-section">
        <div className="history-header">
          <div className="section-label" style={{ padding: 0 }}>Recent chats</div>
          {chats.length > 0 && (
            <button className="clear-all-btn" onClick={onClearAll}>Clear all</button>
          )}
        </div>
        {chats.length === 0 && <div className="empty-note">No chats yet</div>}
        {chats.slice().reverse().map((c) => (
          <div
            key={c.id}
            className={'history-item' + (c.id === currentChatId ? ' active' : '')}
            onClick={() => onSelectChat(c.id)}
          >
            <div className="history-item-title">{c.title}</div>
            <button
              className="history-delete"
              onClick={(e) => { e.stopPropagation(); onDeleteChat(c.id) }}
              aria-label="Delete chat"
              title="Delete this chat"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="user-card">
        <div className="user-info">
          <div className="avatar">{(user?.username || 'U').slice(0, 1).toUpperCase()}</div>
          <div className="user-text">
            <div className="user-name">{user?.username || 'User'}</div>
            <div className="user-email">{user?.email || 'Connected via Puter'}</div>
          </div>
          <button className="logout-btn" onClick={onLogout} title="Sign out">⏻</button>
        </div>
      </div>
    </aside>
  )
}
