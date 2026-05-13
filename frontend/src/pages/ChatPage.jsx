import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';

function avatarLetter(name) {
  return name ? name[0].toUpperCase() : '?';
}

function avatarColor(name) {
  const colors = ['#2f81f7', '#3fb950', '#d29922', '#f0883e', '#8957e5', '#ec6547'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function formatTime(ts) {
  const d = new Date(ts * 1000);
  return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(ts) {
  const d = new Date(ts * 1000);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return 'Сегодня';
  if (d.toDateString() === yesterday.toDateString()) return 'Вчера';
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
}

export default function ChatPage() {
  const { auth, logout } = useAuth();
  const { socket, onlineUsers } = useSocket();

  const [users, setUsers] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Load user list
  useEffect(() => {
    fetch('/api/users', {
      headers: { Authorization: `Bearer ${auth.token}` },
    })
      .then((r) => r.json())
      .then(setUsers);
  }, [auth.token]);

  // Load messages when active user changes
  useEffect(() => {
    if (!activeUser) return;
    setLoadingMsgs(true);
    fetch(`/api/messages/${activeUser.id}`, {
      headers: { Authorization: `Bearer ${auth.token}` },
    })
      .then((r) => r.json())
      .then((msgs) => {
        setMessages(msgs);
        setLoadingMsgs(false);
      });
  }, [activeUser, auth.token]);

  // Socket: receive messages
  useEffect(() => {
    const sock = socket.current;
    if (!sock) return;

    const handler = (msg) => {
      const isRelevant =
        (msg.sender_id === activeUser?.id && msg.receiver_id === auth.user.id) ||
        (msg.sender_id === auth.user.id && msg.receiver_id === activeUser?.id);
      if (isRelevant) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      }
    };

    sock.on('message:new', handler);
    return () => sock.off('message:new', handler);
  }, [socket, activeUser, auth.user.id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(() => {
    const content = input.trim();
    if (!content || !activeUser || !socket.current) return;
    socket.current.emit('message:send', { receiverId: activeUser.id, content });
    setInput('');
    textareaRef.current?.focus();
  }, [input, activeUser, socket]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Group messages by date
  const groupedMessages = [];
  let lastDate = null;
  for (const msg of messages) {
    const date = formatDate(msg.created_at);
    if (date !== lastDate) {
      groupedMessages.push({ type: 'divider', date });
      lastDate = date;
    }
    groupedMessages.push({ type: 'message', msg });
  }

  return (
    <div className="chat-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Zoomy</h2>
          <button className="btn-logout" onClick={logout}>Выйти</button>
        </div>
        <div className="sidebar-me">
          <div className="avatar avatar-sm" style={{ background: avatarColor(auth.user.username) }}>
            {avatarLetter(auth.user.username)}
          </div>
          <span><strong>{auth.user.username}</strong> — вы</span>
        </div>
        <div className="users-list">
          <div className="users-list-title">Пользователи</div>
          {users.length === 0 && (
            <div style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: 13 }}>
              Пока никого нет
            </div>
          )}
          {users.map((u) => (
            <div
              key={u.id}
              className={`user-item${activeUser?.id === u.id ? ' active' : ''}`}
              onClick={() => setActiveUser(u)}
            >
              <div className="avatar avatar-sm" style={{ background: avatarColor(u.username) }}>
                {avatarLetter(u.username)}
              </div>
              <span className="user-item-name">{u.username}</span>
              {onlineUsers.includes(u.id)
                ? <span className="online-dot" title="Онлайн" />
                : <span className="offline-dot" title="Оффлайн" />}
            </div>
          ))}
        </div>
      </aside>

      {/* Chat area */}
      <main className="chat-area">
        {!activeUser ? (
          <div className="chat-empty">
            <div className="chat-empty-icon">💬</div>
            <div>Выберите собеседника слева</div>
          </div>
        ) : (
          <>
            <div className="chat-header">
              <div className="avatar" style={{ background: avatarColor(activeUser.username) }}>
                {avatarLetter(activeUser.username)}
              </div>
              <div>
                <div className="chat-header-name">{activeUser.username}</div>
                <div className={`chat-header-status${onlineUsers.includes(activeUser.id) ? ' online' : ''}`}>
                  {onlineUsers.includes(activeUser.id) ? 'онлайн' : 'оффлайн'}
                </div>
              </div>
            </div>

            <div className="messages">
              {loadingMsgs && <div className="spinner" />}
              {!loadingMsgs && messages.length === 0 && (
                <div style={{ alignSelf: 'center', color: 'var(--text-muted)', fontSize: 13, marginTop: 20 }}>
                  Начните переписку с {activeUser.username}
                </div>
              )}
              {!loadingMsgs && groupedMessages.map((item, i) =>
                item.type === 'divider' ? (
                  <div key={`d-${i}`} className="message-date-divider">{item.date}</div>
                ) : (
                  <div
                    key={item.msg.id}
                    className={`message ${item.msg.sender_id === auth.user.id ? 'out' : 'in'}`}
                  >
                    <div className="message-bubble">{item.msg.content}</div>
                    <div className="message-time">{formatTime(item.msg.created_at)}</div>
                  </div>
                )
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-area">
              <textarea
                ref={textareaRef}
                className="chat-input"
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Написать ${activeUser.username}...`}
              />
              <button
                className="btn-send"
                onClick={sendMessage}
                disabled={!input.trim()}
                title="Отправить (Enter)"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
