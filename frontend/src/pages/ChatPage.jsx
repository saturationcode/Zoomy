import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { supabase } from '../lib/supabase.js';

function avatarLetter(name) { return name ? name[0].toUpperCase() : '?'; }

function avatarColor(name) {
  if (!name) return '#4a7cf7';
  const colors = ['#4a7cf7','#7b5cf0','#30d158','#ff6b6b','#ffa500','#00bcd4','#e91e63','#795548'];
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
      <div className="avatar-glow" style={{ background: color }} />
      <div className={`avatar${size ? ' ' + size : ''}`} style={{ background: color }}>
        {avatarLetter(name)}
      </div>
    </div>
  );
}

function ProfileSheet({ username, onClose, logout }) {
  const color = avatarColor(username);
  const initials = username[0]?.toUpperCase();

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)',
        backdropFilter: 'blur(4px)', zIndex: 100,
        animation: 'fadeInOverlay 0.2s ease',
      }} />
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(255,255,255,0.96)',
        backdropFilter: 'blur(24px)',
        borderRadius: '28px 28px 0 0',
        padding: '28px 28px 40px',
        zIndex: 101,
        boxShadow: '0 -8px 40px rgba(74,124,247,0.15)',
        animation: 'sheetUp 0.35s cubic-bezier(0.34, 1.26, 0.64, 1)',
        maxWidth: 480, margin: '0 auto',
      }}>
        {/* Handle */}
        <div style={{
          width: 40, height: 4, borderRadius: 2,
          background: '#dde3f5', margin: '0 auto 24px',
        }} />

        {/* Avatar big */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute', inset: -10, borderRadius: '50%',
              background: color, opacity: 0.22, filter: 'blur(14px)',
            }} />
            <div style={{
              width: 86, height: 86, borderRadius: '50%',
              background: color, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 34, fontWeight: 800,
              color: '#fff', position: 'relative', zIndex: 1,
              boxShadow: `0 6px 24px ${color}55`,
            }}>{initials}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#1a1d2e', letterSpacing: -0.3 }}>
              {username}
            </div>
            <div style={{ fontSize: 13, color: '#8a90b0', marginTop: 3 }}>
              @{username} · Zoomy
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{
          display: 'flex', gap: 12, marginBottom: 24,
        }}>
          {[
            { label: 'Статус', value: '🟢 Онлайн' },
            { label: 'Мессенджер', value: 'Zoomy' },
          ].map(({ label, value }) => (
            <div key={label} style={{
              flex: 1, background: '#f4f7ff', borderRadius: 18,
              padding: '14px 16px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1d2e' }}>{value}</div>
              <div style={{ fontSize: 12, color: '#8a90b0', marginTop: 3 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Logout */}
        <button onClick={logout} style={{
          width: '100%',
          background: 'linear-gradient(135deg, #f05565, #e03050)',
          color: '#fff', borderRadius: 50,
          padding: '15px', fontWeight: 700, fontSize: 16,
          border: 'none', cursor: 'pointer',
          boxShadow: '0 6px 20px rgba(240,85,101,0.35)',
          transition: 'transform 0.15s, box-shadow 0.15s',
        }}
          onMouseEnter={e => { e.target.style.transform='scale(1.02)'; }}
          onMouseLeave={e => { e.target.style.transform='scale(1)'; }}
        >
          Выйти из аккаунта
        </button>
      </div>
      <style>{`
        @keyframes fadeInOverlay { from{opacity:0} to{opacity:1} }
        @keyframes sheetUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </>
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
  const [showProfile, setShowProfile] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const activeUserRef = useRef(null);

  const isMobile = () => window.innerWidth <= 640;

  useEffect(() => { activeUserRef.current = activeUser; }, [activeUser]);

  useEffect(() => {
    supabase.from('profiles').select('id, username').neq('id', auth.user.id).order('username')
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
      }).subscribe();
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
    <>
      <div className="chat-layout">
        {/* Sidebar */}
        <aside className={`sidebar${isMobile() && !showSidebar ? ' hidden' : ''}`}>
          <div className="sidebar-header">
            <h2>Чаты</h2>
            <button className="btn-logout" onClick={() => setShowProfile(true)}>Профиль</button>
          </div>

          <div className="sidebar-search">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск по юзернейму" />
          </div>

          <div className="sidebar-me" onClick={() => setShowProfile(true)} style={{ cursor: 'pointer' }}>
            <Avatar name={auth.user.username} size="avatar-sm" />
            <div className="sidebar-me-info">
              <div className="sidebar-me-name">{auth.user.username}</div>
              <div className="sidebar-me-label">Нажми для профиля</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8a90b0" strokeWidth="2" strokeLinecap="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
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
              <div style={{ fontSize: 13, color: 'var(--text-muted)', opacity: 0.7 }}>
                Чтобы начать переписку
              </div>
            </div>
          ) : (
            <>
              <div className="chat-header">
                {isMobile() && (
                  <button onClick={() => { setShowSidebar(true); setActiveUser(null); }} style={{
                    background: 'none', border: 'none', padding: '0 10px 0 0',
                    color: 'var(--accent)', fontSize: 24, lineHeight: 1, cursor: 'pointer',
                  }}>‹</button>
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
                  <div style={{ alignSelf: 'center', color: 'var(--text-muted)', fontSize: 14, marginTop: 32, textAlign: 'center' }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>👋</div>
                    Начните переписку с {activeUser.username}
                  </div>
                )}
                {!loadingMsgs && grouped.map((item, i) =>
                  item.type === 'divider' ? (
                    <div key={`d-${i}`} className="message-date-divider">{item.date}</div>
                  ) : (
                    <div key={item.msg.id} className={`message ${item.msg.sender_id === auth.user.id ? 'out' : 'in'}`}>
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
                <button className="btn-send" onClick={sendMessage} disabled={!input.trim()}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              </div>
            </>
          )}
        </main>
      </div>

      {showProfile && (
        <ProfileSheet
          username={auth.user.username}
          onClose={() => setShowProfile(false)}
          logout={logout}
        />
      )}
    </>
  );
}
