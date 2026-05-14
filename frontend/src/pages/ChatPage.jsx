import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { supabase } from '../lib/supabase.js';
import { playMessageSound, requestNotificationPermission, showNotification } from '../lib/notify.js';
import PhoneInput from '../components/PhoneInput.jsx';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const PALETTE = ['#4a7cf7','#7b5cf0','#22c55e','#ef4444','#f97316','#06b6d4','#ec4899','#eab308'];

function hashColor(name) {
  if (!name) return PALETTE[0];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return PALETTE[Math.abs(h) % PALETTE.length];
}
function getColor(name, override) { return override || hashColor(name); }
function letter(name) { return name ? name[0].toUpperCase() : '?'; }

function zid(uuid) {
  if (!uuid) return 'ZID-????????';
  return 'ZID-' + uuid.replace(/-/g, '').slice(0, 8).toUpperCase();
}

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

// ─────────────────────────────────────────────
// Avatar component
// ─────────────────────────────────────────────
function Av({ name, color, avatarUrl, size = 'av-40', onClick, showPip }) {
  const c = getColor(name, color);
  return (
    <div className="av-wrap" onClick={onClick} style={onClick ? { cursor:'pointer' } : {}}>
      <div className="av-glow" style={{ background: avatarUrl ? 'transparent' : c }} />
      {avatarUrl ? (
        <img
          src={avatarUrl}
          className={`av ${size}`}
          style={{ objectFit:'cover', background:'#eee' }}
          alt={name}
        />
      ) : (
        <div className={`av ${size}`} style={{ background: c }}>{letter(name)}</div>
      )}
      {showPip && <span className="online-pip" />}
    </div>
  );
}

// ─────────────────────────────────────────────
// MyProfile sheet
// ─────────────────────────────────────────────
function MyProfile({ auth, onClose, logout, onUpdated }) {
  const u = auth.user;
  const [nickname, setNickname] = useState(u.nickname || '');
  const [phone,    setPhone]    = useState(u.phone    || '');
  const [color,    setColor]    = useState(u.avatar_color || hashColor(u.username));
  const [avatarUrl, setAvatarUrl] = useState(u.avatar_url || '');
  const [uploading, setUploading] = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [ownedNames, setOwnedNames] = useState([]);
  const [ownedNums,  setOwnedNums]  = useState([]);
  const [coins,      setCoins]      = useState(u.z_coins || 0);
  const fileRef = useRef();

  useEffect(() => {
    supabase.from('nft_usernames').select('username').eq('owner_id', u.id)
      .then(({ data }) => setOwnedNames(data || []));
    supabase.from('anonymous_numbers').select('number,flag').eq('owner_id', u.id)
      .then(({ data }) => setOwnedNums(data || []));
    supabase.from('profiles').select('z_coins').eq('id', u.id).single()
      .then(({ data }) => data && setCoins(data.z_coins || 0));
  }, [u.id]);

  const uploadAvatar = async (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('Максимум 5 МБ'); return; }
    setUploading(true);
    try {
      const path = `${u.id}/avatar`;
      const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
      const url = publicUrl + '?t=' + Date.now();
      setAvatarUrl(url);
      await supabase.from('profiles').update({ avatar_url: url }).eq('id', u.id);
      onUpdated({ avatar_url: url });
    } catch (e) { alert('Ошибка загрузки: ' + e.message); }
    finally { setUploading(false); }
  };

  const removeAvatar = async () => {
    setUploading(true);
    try {
      await supabase.storage.from('avatars').remove([`${u.id}/avatar`]);
      await supabase.from('profiles').update({ avatar_url: null }).eq('id', u.id);
      setAvatarUrl('');
      onUpdated({ avatar_url: null });
    } catch (_) {}
    finally { setUploading(false); }
  };

  const saveProfile = async () => {
    setSaving(true);
    await supabase.from('profiles').update({
      nickname: nickname.trim() || null,
      phone:    phone.trim()    || null,
      avatar_color: color,
    }).eq('id', u.id);
    onUpdated({ nickname: nickname.trim() || null, phone: phone.trim() || null, avatar_color: color });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const pickColor = async (c) => {
    setColor(c);
    await supabase.from('profiles').update({ avatar_color: c }).eq('id', u.id);
    onUpdated({ avatar_color: c });
  };

  const displayName = u.nickname || u.username;

  return (
    <>
      <div className="overlay" onClick={onClose} />
      <div className="sheet profile-sheet">
        <div className="sheet-handle" />

        {/* Avatar row */}
        <div className="profile-av-row">
          <div className="profile-av-wrap">
            {uploading ? (
              <div className="av av-80" style={{ background:'#eef' }}>
                <div className="spinner" style={{ margin:0, width:24, height:24, borderWidth:2 }} />
              </div>
            ) : (
              <Av name={u.username} color={color} avatarUrl={avatarUrl} size="av-80" />
            )}
            <button className="av-camera-btn" onClick={() => fileRef.current.click()}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }}
              onChange={e => uploadAvatar(e.target.files[0])} />
          </div>

          <div className="profile-id-col">
            <div className="profile-displayname">{displayName}</div>
            <div className="profile-username">@{u.username}</div>
            <div style={{
              display:'inline-flex', alignItems:'center', gap:6,
              background:'linear-gradient(135deg,rgba(245,158,11,.12),rgba(234,179,8,.12))',
              border:'1px solid rgba(245,158,11,.25)',
              borderRadius:20, padding:'4px 10px', marginTop:6,
            }}>
              <span>⚡</span>
              <span style={{ fontSize:13, fontWeight:800, color:'#b45309' }}>{coins.toLocaleString()} Z-Coins</span>
            </div>
            {avatarUrl && (
              <button onClick={removeAvatar} className="btn-remove-av">Удалить фото</button>
            )}
          </div>
        </div>

        {/* Fields */}
        <div className="profile-fields">
          <div className="profile-field">
            <div className="profile-field-label">Никнейм</div>
            <input className="profile-field-input" value={nickname}
              onChange={e => setNickname(e.target.value)} placeholder={u.username} maxLength={32} />
          </div>
          <div className="profile-field">
            <div className="profile-field-label">Телефон</div>
            <PhoneInput value={phone} onChange={v => setPhone(v)} />
          </div>
        </div>

        {/* NFT Usernames */}
        <div className="nft-block">
          <div className="nft-block-header">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            NFT Usernames
          </div>
          <div className="nft-item">
            <span className="nft-tag">main</span>
            <span>@{u.username}</span>
          </div>
          {ownedNames.map(n => (
            <div key={n.username} className="nft-item">
              <span className="nft-tag nft-tag-verified">NFT</span>
              <span>@{n.username}</span>
            </div>
          ))}
          {ownedNums.map(n => (
            <div key={n.number} className="nft-item">
              <span className="nft-tag" style={{ background:'rgba(239,68,68,.1)', color:'#dc2626' }}>anon</span>
              <span style={{ letterSpacing:'.03em' }}>{n.flag} {n.number}</span>
            </div>
          ))}
          {ownedNames.length === 0 && ownedNums.length === 0 && (
            <div style={{ fontSize:12, color:'var(--text-muted)', padding:'6px 0' }}>
              Купите NFT имена в Маркетплейсе ✦
            </div>
          )}
        </div>

        {/* Color picker */}
        <div className="color-picker-block">
          <div className="cpb-label">Цвет аватара</div>
          <div className="color-grid">
            {PALETTE.map(p => (
              <div key={p} className={`color-swatch${color === p ? ' selected' : ''}`}
                style={{ background:p, outlineColor:p }} onClick={() => pickColor(p)} />
            ))}
          </div>
        </div>

        <button className="btn-save-profile" onClick={saveProfile} disabled={saving}>
          {saved ? '✓ Сохранено' : saving ? 'Сохраняем…' : 'Сохранить изменения'}
        </button>
        <button className="btn-logout-sheet" onClick={logout}>Выйти из аккаунта</button>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// UserProfile sheet
// ─────────────────────────────────────────────
function UserProfile({ user, isOnline, onClose, onMessage }) {
  const c = getColor(user.username, user.avatar_color);
  const displayName = user.nickname || user.username;

  return (
    <>
      <div className="overlay" onClick={onClose} />
      <div className="sheet profile-sheet">
        <div className="sheet-handle" />

        <div className="profile-av-row" style={{ justifyContent:'center', flexDirection:'column', alignItems:'center', gap:16 }}>
          <div style={{ position:'relative' }}>
            <div style={{
              position:'absolute', inset:-14, borderRadius:'50%',
              background: user.avatar_url ? '#aaa' : c,
              opacity:.18, filter:'blur(18px)',
            }} />
            <Av
              name={user.username} color={user.avatar_color}
              avatarUrl={user.avatar_url} size="av-80"
            />
            {isOnline && (
              <div style={{
                position:'absolute', bottom:3, right:3,
                width:18, height:18, borderRadius:'50%',
                background:'var(--online)', border:'3px solid white',
                boxShadow:'0 0 0 2px rgba(34,197,94,.3)',
              }} />
            )}
          </div>

          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:22, fontWeight:800, color:'var(--text)', letterSpacing:'-.3px' }}>
              {displayName}
            </div>
            {user.nickname && (
              <div style={{ fontSize:13, color:'var(--text-muted)', marginTop:2 }}>@{user.username}</div>
            )}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginTop:8 }}>
              <div style={{
                display:'inline-flex', alignItems:'center', gap:5,
                background: isOnline ? 'rgba(34,197,94,.1)' : 'rgba(0,0,0,.05)',
                borderRadius:20, padding:'5px 12px',
              }}>
                <div style={{
                  width:7, height:7, borderRadius:'50%',
                  background: isOnline ? 'var(--online)' : '#aaa',
                }} />
                <span style={{
                  fontSize:13, fontWeight:600,
                  color: isOnline ? '#16a34a' : 'var(--text-muted)',
                }}>
                  {isOnline ? 'В сети' : 'Не в сети'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* NFT usernames */}
        <div className="nft-block" style={{ marginTop:16 }}>
          <div className="nft-block-header">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            NFT Usernames
          </div>
          <div className="nft-item nft-item-main">
            <span className="nft-tag">main</span>
            <span>@{user.username}</span>
          </div>
          <div className="nft-item nft-item-zid">
            <span className="nft-tag nft-tag-verified">verified</span>
            <span>{zid(user.id)}</span>
          </div>
        </div>

        <button className="btn-save-profile" style={{ marginTop:20 }}
          onClick={() => { onMessage(); onClose(); }}>
          Написать сообщение
        </button>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// ChatPage
// ─────────────────────────────────────────────
export default function ChatPage() {
  const { auth, logout } = useAuth();

  const [users,       setUsers]       = useState([]);
  const [search,      setSearch]      = useState('');
  const [activeUser,  setActiveUser]  = useState(null);
  const [messages,    setMessages]    = useState([]);
  const [input,       setInput]       = useState('');
  const [online,      setOnline]      = useState([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [myProfile,   setMyProfile]   = useState(false);
  const [viewUser,    setViewUser]    = useState(null);

  // local copy of own profile so MyProfile changes reflect instantly
  const [myData, setMyData] = useState({
    ...auth.user,
    avatar_color: auth.user.avatar_color || hashColor(auth.user.username),
  });

  const messagesEnd = useRef(null);
  const textarea    = useRef(null);
  const activeRef   = useRef(null);

  const isMobile = () => window.innerWidth <= 640;

  useEffect(() => { activeRef.current = activeUser; }, [activeUser]);

  // Request notification permission on mount
  useEffect(() => { requestNotificationPermission(); }, []);

  // Load users
  useEffect(() => {
    supabase.from('profiles')
      .select('id, username, nickname, avatar_color, avatar_url')
      .neq('id', auth.user.id)
      .order('username')
      .then(({ data }) => setUsers(data || []));
  }, [auth.user.id]);

  // Presence
  useEffect(() => {
    const ch = supabase.channel('online-users');
    ch.on('presence', { event:'sync' }, () => {
      setOnline(Object.values(ch.presenceState()).flat().map(p => p.user_id));
    }).subscribe(async s => {
      if (s === 'SUBSCRIBED') await ch.track({ user_id: auth.user.id });
    });
    return () => { supabase.removeChannel(ch); };
  }, [auth.user.id]);

  // Realtime messages
  useEffect(() => {
    const ch = supabase.channel('messages-rt')
      .on('postgres_changes', { event:'INSERT', schema:'public', table:'messages' }, ({ new: msg }) => {
        const me = auth.user.id, other = activeRef.current?.id;
        const relevant =
          (msg.sender_id === me    && msg.receiver_id === other) ||
          (msg.sender_id === other && msg.receiver_id === me);
        if (!relevant) return;

        const senderName = msg.sender_id === me
          ? (myData.nickname || myData.username)
          : (activeRef.current?.nickname || activeRef.current?.username);

        // Notification + sound when message is incoming
        if (msg.sender_id !== me) {
          playMessageSound();
          showNotification(
            senderName || 'Zoomy',
            msg.content.length > 80 ? msg.content.slice(0, 80) + '…' : msg.content,
          );
        }

        setMessages(prev =>
          prev.some(m => m.id === msg.id) ? prev : [...prev, { ...msg, sender:{ username: senderName } }]
        );
      }).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [auth.user.id, myData.username, myData.nickname]);

  // Load conversation
  useEffect(() => {
    if (!activeUser) { setMessages([]); return; }
    setLoadingMsgs(true);
    const me = auth.user.id, other = activeUser.id;
    supabase.from('messages')
      .select('*, sender:profiles!sender_id(username, nickname)')
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
    await supabase.from('messages').insert({
      sender_id: auth.user.id, receiver_id: activeUser.id, content,
    });
  }, [input, activeUser, auth.user.id]);

  const onKey = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };

  // Group by date
  const grouped = [];
  let lastDate = null;
  for (const msg of messages) {
    const d = formatDate(msg.created_at);
    if (d !== lastDate) { grouped.push({ type:'divider', date:d }); lastDate = d; }
    grouped.push({ type:'msg', msg });
  }

  const filtered = users.filter(u =>
    (u.username + (u.nickname || '')).toLowerCase().includes(search.toLowerCase())
  );

  const myDisplayName = myData.nickname || myData.username;

  return (
    <>
      <div className="chat-layout">
        {/* ── Sidebar ── */}
        <aside className={`sidebar${isMobile() && !showSidebar ? ' hidden' : ''}`}>
          <div className="sidebar-header">
            <span className="sidebar-title">Чаты</span>
            <button className="btn-profile-icon" onClick={() => setMyProfile(true)}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <circle cx="12" cy="8" r="4"/>
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
              </svg>
            </button>
          </div>

          <div className="sidebar-me" onClick={() => setMyProfile(true)}>
            <Av
              name={myData.username}
              color={myData.avatar_color}
              avatarUrl={myData.avatar_url}
              size="av-34"
              showPip
            />
            <div className="sidebar-me-info">
              <div className="sidebar-me-name">{myDisplayName}</div>
              <div className="sidebar-me-sub">{zid(auth.user.id)}</div>
            </div>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="var(--text-muted)" strokeWidth="2.5" strokeLinecap="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </div>

          <div className="sidebar-search">
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Поиск по юзернейму" />
          </div>

          <div className="users-list">
            {filtered.length === 0 && (
              <div style={{ padding:'16px 14px', color:'var(--text-muted)', fontSize:13 }}>
                {search ? 'Никого не найдено' : 'Других пользователей пока нет'}
              </div>
            )}
            {filtered.map(u => {
              const isOn = online.includes(u.id);
              const dName = u.nickname || u.username;
              return (
                <div key={u.id} className={`user-item${activeUser?.id === u.id ? ' active' : ''}`}>
                  <div onClick={() => setViewUser(u)}>
                    <Av name={u.username} color={u.avatar_color}
                      avatarUrl={u.avatar_url} size="av-40" showPip={isOn} />
                  </div>
                  <div className="user-item-info" onClick={() => selectUser(u)}>
                    <div className="user-item-name">{dName}</div>
                    <div className={`user-item-sub${isOn ? ' is-online' : ''}`}>
                      {isOn ? '● В сети' : '@' + u.username}
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
                  <button onClick={() => { setShowSidebar(true); setActiveUser(null); }}
                    style={{ background:'none', border:'none', color:'var(--accent)', fontSize:26, lineHeight:1, cursor:'pointer', paddingRight:8 }}>
                    ‹
                  </button>
                )}
                <button className="btn-header-avatar" onClick={() => setViewUser(activeUser)}>
                  <Av name={activeUser.username} color={activeUser.avatar_color}
                    avatarUrl={activeUser.avatar_url} size="av-40"
                    showPip={online.includes(activeUser.id)} />
                </button>
                <div className="chat-header-info">
                  <div className="chat-header-name">{activeUser.nickname || activeUser.username}</div>
                  <div className={`chat-header-status${online.includes(activeUser.id) ? ' is-online' : ''}`}>
                    {online.includes(activeUser.id) ? '● В сети' : '@' + activeUser.username}
                  </div>
                </div>
              </div>

              <div className="chat-bg">
                <div className="messages">
                  {loadingMsgs && <div className="spinner" />}
                  {!loadingMsgs && messages.length === 0 && (
                    <div style={{ alignSelf:'center', textAlign:'center', color:'var(--text-muted)', marginTop:40 }}>
                      <div style={{ fontSize:30, marginBottom:10 }}>👋</div>
                      Начните переписку с {activeUser.nickname || activeUser.username}
                    </div>
                  )}
                  {!loadingMsgs && grouped.map((item, i) =>
                    item.type === 'divider' ? (
                      <div key={`d${i}`} className="message-date-divider">{item.date}</div>
                    ) : (
                      <div key={item.msg.id}
                        className={`message ${item.msg.sender_id === auth.user.id ? 'out' : 'in'}`}>
                        <div className="message-bubble">{item.msg.content}</div>
                        <div className="message-time">{formatTime(item.msg.created_at)}</div>
                      </div>
                    )
                  )}
                  <div ref={messagesEnd} />
                </div>
              </div>

              <div className="chat-input-area">
                <textarea ref={textarea} className="chat-input" rows={1}
                  value={input} onChange={e => setInput(e.target.value)} onKeyDown={onKey}
                  placeholder={`Написать ${activeUser.nickname || activeUser.username}…`}
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

      {myProfile && (
        <MyProfile
          auth={{ ...auth, user: myData }}
          onClose={() => setMyProfile(false)}
          logout={logout}
          onUpdated={patch => setMyData(d => ({ ...d, ...patch }))}
        />
      )}

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
