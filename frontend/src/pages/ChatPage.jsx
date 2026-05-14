import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { supabase } from '../lib/supabase.js';

// ── constants ──────────────────────────────────────────────
const PALETTE = [
  '#4a7cf7','#7b5cf0','#22c55e','#ef4444',
  '#f97316','#06b6d4','#ec4899','#a855f7',
];

function hashColor(name) {
  if (!name) return PALETTE[0];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return PALETTE[Math.abs(h) % PALETTE.length];
}

function getColor(name, override) { return override || hashColor(name); }
function letter(name) { return name ? name[0].toUpperCase() : '?'; }

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('ru-RU', { hour:'2-digit', minute:'2-digit' });
}
function formatDate(iso) {
  const d = new Date(iso), today = new Date(), yest = new Date(today);
  yest.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Сегодня';
  if (d.toDateString() === yest.toDateString()) return 'Вчера';
  return d.toLocaleDateString('ru-RU', { day:'numeric', month:'long' });
}

// ── Avatar ─────────────────────────────────────────────────
function Av({ name, color, size = 'av-40', onClick }) {
  const c = getColor(name, color);
  return (
    <div className="av-wrap" onClick={onClick} style={onClick ? { cursor:'pointer' } : {}}>
      <div className="av-glow" style={{ background: c }} />
      <div className={`av ${size}`} style={{ background: c }}>{letter(name)}</div>
    </div>
  );
}

// ── MyProfile sheet ────────────────────────────────────────
function MyProfile({ auth, onClose, logout, onColorChange }) {
  const { username, avatar_color } = auth.user;
  const [chosen, setChosen] = useState(avatar_color || hashColor(username));
  const [saving, setSaving] = useState(false);

  const save = async (c) => {
    setChosen(c);
    setSaving(true);
    await supabase.from('profiles').update({ avatar_color: c }).eq('id', auth.user.id);
    onColorChange(c);
    setSaving(false);
  };

  const c = chosen;
  return (
    <>
      <div className="overlay" onClick={onClose} />
      <div className="sheet">
        <div className="sheet-handle" />

        {/* Avatar big */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12, marginBottom:24 }}>
          <div style={{ position:'relative' }}>
            <div style={{ position:'absolute', inset:-12, borderRadius:'50%', background:c, opacity:.22, filter:'blur(16px)' }} />
            <div className="av av-80" style={{ background: c }}>
              {letter(username)}
            </div>
            {saving && (
              <div style={{ position:'absolute', inset:0, borderRadius:'50%', background:'rgba(255,255,255,.5)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <div className="spinner" style={{ margin:0, width:20, height:20, borderWidth:2 }} />
              </div>
            )}
          </div>

          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:22, fontWeight:800, color:'var(--text)', letterSpacing:'-.3px' }}>
              {username}
            </div>
            <div style={{ fontSize:13, color:'var(--text-muted)', marginTop:2 }}>
              @{username}
            </div>
          </div>
        </div>

        {/* Color picker */}
        <div style={{ background:'var(--surface-2)', borderRadius:20, padding:'16px 18px' }}>
          <div style={{ fontSize:12, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.06em' }}>
            Цвет аватара
          </div>
          <div className="color-grid">
            {PALETTE.map(p => (
              <div
                key={p}
                className={`color-swatch${chosen === p ? ' selected' : ''}`}
                style={{ background:p, outlineColor: p }}
                onClick={() => save(p)}
              />
            ))}
          </div>
        </div>

        {/* Stats */}
        <div style={{ display:'flex', gap:10, margin:'16px 0' }}>
          <div style={{ flex:1, background:'var(--surface-2)', borderRadius:18, padding:'14px 16px', textAlign:'center' }}>
            <div style={{ fontSize:18, fontWeight:800, color:'var(--text)' }}>🟢</div>
            <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:3 }}>Онлайн</div>
          </div>
          <div style={{ flex:2, background:'var(--surface-2)', borderRadius:18, padding:'14px 16px', textAlign:'center' }}>
            <div style={{ fontSize:15, fontWeight:700, color:'var(--accent)' }}>Zoomy</div>
            <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:3 }}>Мессенджер</div>
          </div>
        </div>

        <button onClick={logout} style={{
          width:'100%', background:'linear-gradient(135deg,#ef4444,#dc2626)',
          color:'#fff', borderRadius:'var(--radius-pill)',
          padding:'15px', fontWeight:700, fontSize:16, border:'none', cursor:'pointer',
          boxShadow:'0 6px 20px rgba(239,68,68,.35)',
          transition:'transform .15s, box-shadow .15s',
        }}
          onMouseEnter={e => e.currentTarget.style.transform='scale(1.02)'}
          onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}
        >
          Выйти из аккаунта
        </button>
      </div>
    </>
  );
}

// ── UserProfile sheet ──────────────────────────────────────
function UserProfile({ user, isOnline, onClose, onMessage }) {
  const c = getColor(user.username, user.avatar_color);
  return (
    <>
      <div className="overlay" onClick={onClose} />
      <div className="sheet">
        <div className="sheet-handle" />

        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12, marginBottom:24 }}>
          <div style={{ position:'relative' }}>
            <div style={{ position:'absolute', inset:-12, borderRadius:'50%', background:c, opacity:.22, filter:'blur(16px)' }} />
            <div className="av av-80" style={{ background: c }}>{letter(user.username)}</div>
            {isOnline && (
              <div style={{
                position:'absolute', bottom:4, right:4,
                width:16, height:16, borderRadius:'50%',
                background:'var(--online)', border:'3px solid white',
                boxShadow:'0 0 0 2px rgba(34,197,94,.3)',
              }} />
            )}
          </div>

          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:22, fontWeight:800, color:'var(--text)', letterSpacing:'-.3px' }}>
              {user.username}
            </div>
            <div style={{ fontSize:13, color: isOnline ? 'var(--online)' : 'var(--text-muted)', marginTop:4, fontWeight:600 }}>
              {isOnline ? '● Онлайн сейчас' : 'Оффлайн'}
            </div>
          </div>
        </div>

        <button onClick={() => { onMessage(); onClose(); }} style={{
          width:'100%',
          background:'linear-gradient(135deg,#4a7cf7,#7b5cf0)',
          color:'#fff', borderRadius:'var(--radius-pill)',
          padding:'15px', fontWeight:700, fontSize:16, border:'none', cursor:'pointer',
          boxShadow:'0 6px 20px rgba(74,124,247,.38)',
          transition:'transform .15s',
        }}
          onMouseEnter={e => e.currentTarget.style.transform='scale(1.02)'}
          onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}
        >
          Написать сообщение
        </button>
      </div>
    </>
  );
}

// ── Main ChatPage ──────────────────────────────────────────
export default function ChatPage() {
  const { auth, logout } = useAuth();
  const [users, setUsers]           = useState([]);
  const [search, setSearch]         = useState('');
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages]     = useState([]);
  const [input, setInput]           = useState('');
  const [online, setOnline]         = useState([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [myProfile, setMyProfile]     = useState(false);
  const [viewUser, setViewUser]       = useState(null);
  const [myColor, setMyColor]         = useState(auth.user.avatar_color || hashColor(auth.user.username));

  const messagesEnd = useRef(null);
  const textarea    = useRef(null);
  const activeRef   = useRef(null);

  const isMobile = () => window.innerWidth <= 640;

  useEffect(() => { activeRef.current = activeUser; }, [activeUser]);

  // Load users with avatar_color
  useEffect(() => {
    supabase.from('profiles')
      .select('id, username, avatar_color')
      .neq('id', auth.user.id)
      .order('username')
      .then(({ data }) => setUsers(data || []));
  }, [auth.user.id]);

  // Presence
  useEffect(() => {
    const ch = supabase.channel('online-users');
    ch.on('presence', { event:'sync' }, () => {
      const state = ch.presenceState();
      setOnline(Object.values(state).flat().map(p => p.user_id));
    }).subscribe(async (s) => {
      if (s === 'SUBSCRIBED') await ch.track({ user_id: auth.user.id });
    });
    return () => { supabase.removeChannel(ch); };
  }, [auth.user.id]);

  // Realtime messages
  useEffect(() => {
    const ch = supabase.channel('messages-rt')
      .on('postgres_changes', { event:'INSERT', schema:'public', table:'messages' }, ({ new: msg }) => {
        const me = auth.user.id, other = activeRef.current?.id;
        const ok = (msg.sender_id === me && msg.receiver_id === other)
                || (msg.sender_id === other && msg.receiver_id === me);
        if (!ok) return;
        const senderUsername = msg.sender_id === me ? auth.user.username : activeRef.current?.username;
        setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, { ...msg, sender:{ username:senderUsername } }]);
      }).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [auth.user.id, auth.user.username]);

  // Load conversation
  useEffect(() => {
    if (!activeUser) { setMessages([]); return; }
    setLoadingMsgs(true);
    const me = auth.user.id, other = activeUser.id;
    supabase.from('messages')
      .select('*, sender:profiles!sender_id(username)')
      .or(`and(sender_id.eq.${me},receiver_id.eq.${other}),and(sender_id.eq.${other},receiver_id.eq.${me})`)
      .order('created_at')
      .then(({ data }) => { setMessages(data || []); setLoadingMsgs(false); });
  }, [activeUser, auth.user.id]);

  useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior:'smooth' }); }, [messages]);

  const selectUser = (u) => {
    setActiveUser(u);
    if (isMobile()) setShowSidebar(false);
  };

  const send = useCallback(async () => {
    const content = input.trim();
    if (!content || !activeUser) return;
    setInput('');
    textarea.current?.focus();
    await supabase.from('messages').insert({ sender_id: auth.user.id, receiver_id: activeUser.id, content });
  }, [input, activeUser, auth.user.id]);

  const onKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };

  // Group by date
  const grouped = [];
  let lastDate = null;
  for (const msg of messages) {
    const d = formatDate(msg.created_at);
    if (d !== lastDate) { grouped.push({ type:'divider', date:d }); lastDate = d; }
    grouped.push({ type:'msg', msg });
  }

  const filtered = users.filter(u => u.username.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <div className="chat-layout">
        {/* ── Sidebar ── */}
        <aside className={`sidebar${isMobile() && !showSidebar ? ' hidden' : ''}`}>
          <div className="sidebar-header">
            <span className="sidebar-title">Чаты</span>
            <button className="btn-profile-icon" onClick={() => setMyProfile(true)} title="Мой профиль">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
              </svg>
            </button>
          </div>

          {/* Me */}
          <div className="sidebar-me" onClick={() => setMyProfile(true)}>
            <Av name={auth.user.username} color={myColor} size="av-34" />
            <div className="sidebar-me-info">
              <div className="sidebar-me-name">{auth.user.username}</div>
              <div className="sidebar-me-sub">Мой профиль</div>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
          </div>

          {/* Search */}
          <div className="sidebar-search">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск по юзернейму" />
          </div>

          {/* Users */}
          <div className="users-list">
            {filtered.length === 0 && (
              <div style={{ padding:'16px 14px', color:'var(--text-muted)', fontSize:13 }}>
                {search ? 'Никого не найдено' : 'Других пользователей пока нет'}
              </div>
            )}
            {filtered.map(u => {
              const isOn = online.includes(u.id);
              return (
                <div key={u.id} className={`user-item${activeUser?.id === u.id ? ' active' : ''}`}>
                  <div style={{ position:'relative' }} onClick={() => setViewUser(u)}>
                    <Av name={u.username} color={u.avatar_color} size="av-40" />
                    {isOn && <span className="online-pip" />}
                  </div>
                  <div className="user-item-info" onClick={() => selectUser(u)}>
                    <div className="user-item-name">{u.username}</div>
                    <div className={`user-item-sub${isOn ? ' is-online' : ''}`}>
                      {isOn ? '● онлайн' : 'оффлайн'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* ── Chat area ── */}
        <main className={`chat-area${isMobile() && showSidebar ? ' hidden' : ''}`}>
          {!activeUser ? (
            <div className="chat-bg" style={{ justifyContent:'center' }}>
              <div className="chat-empty">
                <div className="chat-empty-bubble">💬</div>
                <div className="chat-empty-title">Выберите собеседника</div>
                <div className="chat-empty-sub">Нажмите на имя слева, чтобы начать</div>
              </div>
            </div>
          ) : (
            <>
              <div className="chat-header">
                {isMobile() && (
                  <button onClick={() => { setShowSidebar(true); setActiveUser(null); }} style={{
                    background:'none', border:'none', color:'var(--accent)',
                    fontSize:26, lineHeight:1, cursor:'pointer', padding:'0 8px 0 0',
                  }}>‹</button>
                )}
                <button className="btn-header-avatar" onClick={() => setViewUser(activeUser)}>
                  <div style={{ position:'relative' }}>
                    <Av name={activeUser.username} color={activeUser.avatar_color} size="av-40" />
                    {online.includes(activeUser.id) && <span className="online-pip" />}
                  </div>
                </button>
                <div className="chat-header-info">
                  <div className="chat-header-name">{activeUser.username}</div>
                  <div className={`chat-header-status${online.includes(activeUser.id) ? ' is-online' : ''}`}>
                    {online.includes(activeUser.id) ? '● онлайн' : 'оффлайн'}
                  </div>
                </div>
              </div>

              <div className="chat-bg">
                <div className="messages">
                  {loadingMsgs && <div className="spinner" />}
                  {!loadingMsgs && messages.length === 0 && (
                    <div style={{ alignSelf:'center', textAlign:'center', color:'var(--text-muted)', marginTop:40 }}>
                      <div style={{ fontSize:30, marginBottom:8 }}>👋</div>
                      Начните переписку с {activeUser.username}
                    </div>
                  )}
                  {!loadingMsgs && grouped.map((item, i) =>
                    item.type === 'divider' ? (
                      <div key={`d${i}`} className="message-date-divider">{item.date}</div>
                    ) : (
                      <div key={item.msg.id} className={`message ${item.msg.sender_id === auth.user.id ? 'out' : 'in'}`}>
                        <div className="message-bubble">{item.msg.content}</div>
                        <div className="message-time">{formatTime(item.msg.created_at)}</div>
                      </div>
                    )
                  )}
                  <div ref={messagesEnd} />
                </div>
              </div>

              <div className="chat-input-area">
                <textarea
                  ref={textarea}
                  className="chat-input"
                  rows={1}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={onKey}
                  placeholder={`Написать ${activeUser.username}…`}
                />
                <button className="btn-send" onClick={send} disabled={!input.trim()}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                  </svg>
                </button>
              </div>
            </>
          )}
        </main>
      </div>

      {/* ── My Profile sheet ── */}
      {myProfile && (
        <MyProfile
          auth={auth}
          onClose={() => setMyProfile(false)}
          logout={logout}
          onColorChange={(c) => {
            setMyColor(c);
            auth.user.avatar_color = c;
          }}
        />
      )}

      {/* ── Other user profile sheet ── */}
      {viewUser && (
        <UserProfile
          user={viewUser}
          isOnline={online.includes(viewUser.id)}
          onClose={() => setViewUser(null)}
          onMessage={() => selectUser(viewUser)}
        />
      )}
    </>
  );
}
