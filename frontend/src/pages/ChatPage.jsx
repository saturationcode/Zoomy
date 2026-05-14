import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { supabase } from '../lib/supabase.js';

function avatarLetter(name) {
  return name ? name[0].toUpperCase() : '?';
}

function avatarColor(name) {
  const colors = [
    '#4a7cf7', '#7b5cf0', '#30d158', '#ff6b6b',
    '#ffa500', '#00bcd4', '#e91e63', '#795548',
  ];
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

function Avatar({ name, size = '' }) {
  const color = avatarColor(name);
  return (
    <div className="avatar-wrap">
      <div
        className="avatar-glow"
        style={{ background: color }}
      />
      <div
        className={`avatar${size ? ' ' + size : ''}`}
        style={{ background: color }}
      >
        {avatarLetter(name)}
      </div>
    </div>
  );
}

export default function ChatPage() {
  const { auth, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const activeUserRef = useRef(null);

  const isMobile = () => window.innerWidth <= 640;

  useEffect(() => { activeUserRef.current = activeUser; }, [activeUser]);

  useEffect(() => {
    supabase.from('profiles')
      .select('id, username')
      .neq('id', auth.user.id)
      .order('username')
      .then(({ data }) => setUsers(data || []));
  }, [auth.user.id]);

  useEffect(() => {
    const ch = supabase.channel('online-users');
    ch.on('presence', { event: 'sync' }, () => {
      const state = ch.presenceState();
      setOnlineUsers(Object.values(state).flat().map(p => p.user_id));
    }).subscribe(async (status) => {
      if (status === 'SUBSCRIBED') await ch.track({ user_id: auth.user.id });
    });
    return () => { supabase.removeChannel(ch); };
  }, [auth.user.id]);

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
        const senderUsername = msg.sender_id === me ? auth.user.username : activeUserRef.current?.username;
        setMessages(prev => {
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, { ...msg, sender: { username: senderUsername } }];
        });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [auth.user.id, auth.user.username]);

  useEffect(() => {
    if (!activeUser) { setMessages([]); return; }
    setLoadingMsgs(true);
    const me = auth.user.id;
    const other = activeUser.id;
    supabase.from('messages')
      .select('*, sender:profiles!sender_id(username)')
      .or(`and(sender_id.eq.${me},receiver_id.eq.${other}),and(sender_id.eq.${other},receiver_id.eq.${me})`)
      .order('created_at')
      .then(({ data }) => { setMessages(data || []); setLoadingMsgs(false); });
  }, [activeUser, auth.user.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectUser = (u) => {
    setActiveUser(u);
    if (isMobile()) setShowSidebar(false);
  };

  const backToSidebar = () => {
    setShowSidebar(true);
    setActiveUser(null);
  };

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
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const grouped = [];
  let lastDate = null;
  for (const msg of messages) {
    const date = formatDate(msg.created_at);
    if (date !== lastDate) { grouped.push({ type: 'divider', date }); lastDate = date; }
    grouped.push({ type: 'msg', msg });
  }

  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="chat-layout">
      {/* Sidebar */}
      <aside className={`sidebar${isMobile() && !showSidebar ? ' hidden' : ''}`}>
        <div className="sidebar-header">
          <h2>Чаты</h2>
          <button className="btn-logout" onClick={logout}>Выйти</button>
        </div>

        <div className="sidebar-search">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск по юзернейму"
          />
        </div>

        <div className="sidebar-me">
          <Avatar name={auth.user.username} size="avatar-sm" />
          <div className="sidebar-me-info">
            <div className="sidebar-me-name">{auth.user.username}</div>
            <div className="sidebar-me-label">Вы</div>
          </div>
        </div>

        <div className="users-list">
          {filteredUsers.length === 0 && (
            <div style={{ padding: '16px 20px', color: 'var(--text-muted)', fontSize: 13 }}>
              {search ? 'Никого не найдено' : 'Пока никого нет'}
            </div>
          )}
          {filteredUsers.map((u) => {
            const isOnline = onlineUsers.includes(u.id);
            return (
              <div
                key={u.id}
                className={`user-item${activeUser?.id === u.id ? ' active' : ''}`}
                onClick={() => selectUser(u)}
              >
                <div style={{ position: 'relative' }}>
                  <Avatar name={u.username} size="avatar-sm" />
                  {isOnline && <span className="online-badge" />}
                </div>
                <div className="user-item-info">
                  <div className="user-item-name">{u.username}</div>
                  <div className={`user-item-status${isOnline ? ' online-text' : ''}`}>
                    {isOnline ? '● онлайн' : 'оффлайн'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* Chat area */}
      <main className={`chat-area${isMobile() && showSidebar ? ' hidden' : ''}`}>
        {!activeUser ? (
          <div className="chat-empty">
            <div className="chat-empty-icon">💬</div>
            <div className="chat-empty-text">Выберите собеседника</div>
          </div>
        ) : (
          <>
            <div className="chat-header">
              {isMobile() && (
                <button
                  onClick={backToSidebar}
                  style={{
                    background: 'none', border: 'none', padding: '0 8px 0 0',
                    color: 'var(--accent)', fontSize: 22, lineHeight: 1, cursor: 'pointer'
                  }}
                >‹</button>
              )}
              <Avatar name={activeUser.username} size="avatar-lg" />
              <div className="chat-header-info">
                <div className="chat-header-name">{activeUser.username}</div>
                <div className={`chat-header-status${onlineUsers.includes(activeUser.id) ? ' online' : ''}`}>
                  {onlineUsers.includes(activeUser.id) ? '● онлайн' : 'оффлайн'}
                </div>
              </div>
            </div>

            <div className="messages">
              {loadingMsgs && <div className="spinner" />}
              {!loadingMsgs && messages.length === 0 && (
                <div style={{ alignSelf: 'center', color: 'var(--text-muted)', fontSize: 14, marginTop: 24 }}>
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
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
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
