import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { supabase } from '../lib/supabase.js';

function avatarLetter(name) {
  return name ? name[0].toUpperCase() : '?';
}

function avatarColor(name) {
  const colors = ['#2f81f7', '#3fb950', '#d29922', '#f0883e', '#8957e5', '#ec6547'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(iso) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Сегодня';
  if (d.toDateString() === yesterday.toDateString()) return 'Вчера';
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
}

export default function ChatPage() {
  const { auth, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const activeUserRef = useRef(null);

  useEffect(() => { activeUserRef.current = activeUser; }, [activeUser]);

  // Load user list
  useEffect(() => {
    supabase.from('profiles')
      .select('id, username')
      .neq('id', auth.user.id)
      .order('username')
      .then(({ data }) => setUsers(data || []));
  }, [auth.user.id]);

  // Presence: online users
  useEffect(() => {
    const ch = supabase.channel('online-users');
    ch.on('presence', { event: 'sync' }, () => {
      const state = ch.presenceState();
      setOnlineUsers(Object.values(state).flat().map(p => p.user_id));
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await ch.track({ user_id: auth.user.id });
      }
    });
    return () => { supabase.removeChannel(ch); };
  }, [auth.user.id]);

  // Realtime: new messages
  useEffect(() => {
    const ch = supabase.channel('messages-rt')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const msg = payload.new;
        const me = auth.user.id;
        const other = activeUserRef.current?.id;
        const isRelevant =
          (msg.sender_id === me && msg.receiver_id === other) ||
          (msg.sender_id === other && msg.receiver_id === me);
        if (!isRelevant) return;

        const senderUsername = msg.sender_id === me
          ? auth.user.username
          : activeUserRef.current?.username;
        setMessages(prev => {
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, { ...msg, sender: { username: senderUsername } }];
        });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [auth.user.id, auth.user.username]);

  // Load messages for selected conversation
  useEffect(() => {
    if (!activeUser) { setMessages([]); return; }
    setLoadingMsgs(true);
    const me = auth.user.id;
    const other = activeUser.id;
    supabase.from('messages')
      .select('*, sender:profiles!sender_id(username)')
      .or(`and(sender_id.eq.${me},receiver_id.eq.${other}),and(sender_id.eq.${other},receiver_id.eq.${me})`)
      .order('created_at')
      .then(({ data }) => {
        setMessages(data || []);
        setLoadingMsgs(false);
      });
  }, [activeUser, auth.user.id]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async () => {
    const content = input.trim();
    if (!content || !activeUser) return;
    setInput('');
    textareaRef.current?.focus();
    await supabase.from('messages').insert({
      sender_id: auth.user.id,
      receiver_id: activeUser.id,
      content,
    });
  }, [input, activeUser, auth.user.id]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Group messages by date for dividers
  const grouped = [];
  let lastDate = null;
  for (const msg of messages) {
    const date = formatDate(msg.created_at);
    if (date !== lastDate) { grouped.push({ type: 'divider', date }); lastDate = date; }
    grouped.push({ type: 'msg', msg });
  }

  return (
    <div className="chat-layout">
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
              {!loadingMsgs && grouped.map((item, i) =>
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
