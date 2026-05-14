import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { supabase } from '../lib/supabase.js';

// ── Z-Coins badge ────────────────────────────────────────────────────────────
function ZBadge({ n, size = 'md' }) {
  const big = size === 'lg';
  const amt = n == null ? 0 : Number(n);
  const label = amt >= 1_000_000
    ? (amt / 1_000_000).toFixed(1) + 'M'
    : amt >= 1000
    ? Math.round(amt / 1000) + 'K'
    : amt.toLocaleString();
  return (
    <div style={{
      display:'inline-flex', alignItems:'center', gap: big ? 7 : 5,
      background:'linear-gradient(135deg,#fef3c7,#fde68a)',
      border:'1.5px solid rgba(245,158,11,.35)',
      borderRadius:20, padding: big ? '8px 14px' : '5px 10px',
      boxShadow:'0 2px 10px rgba(245,158,11,.2)',
    }}>
      <span style={{ fontSize: big ? 17 : 13, lineHeight:1 }}>🪙</span>
      <div style={{ display:'flex', flexDirection:'column', lineHeight:1 }}>
        <span style={{
          fontWeight:900, fontSize: big ? 16 : 13,
          background:'linear-gradient(135deg,#d97706,#b45309)',
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
        }}>
          {label}
        </span>
        {big && <span style={{ fontSize:9, fontWeight:700, color:'#92400e', marginTop:1, letterSpacing:'.05em' }}>Z-COINS</span>}
      </div>
    </div>
  );
}

// ── Rarity tier ───────────────────────────────────────────────────────────────
function rarity(price) {
  if (price >= 200_000) return { label:'ЛЕГЕНДА', color:'#9333ea', bg:'rgba(147,51,234,.12)', glow:'rgba(147,51,234,.25)' };
  if (price >= 75_000)  return { label:'РЕДКИЙ',  color:'#2563eb', bg:'rgba(37,99,235,.12)',  glow:'rgba(37,99,235,.2)'  };
  if (price >= 25_000)  return { label:'ЦЕННЫЙ',  color:'#d97706', bg:'rgba(217,119,6,.12)',  glow:'rgba(217,119,6,.2)'  };
  return null;
}

// ── Card gradients ─────────────────────────────────────────────────────────
const USERNAME_GRADS = [
  'linear-gradient(135deg,#667eea,#764ba2)',
  'linear-gradient(135deg,#f093fb,#f5576c)',
  'linear-gradient(135deg,#4facfe,#00f2fe)',
  'linear-gradient(135deg,#43e97b,#38f9d7)',
  'linear-gradient(135deg,#fa709a,#fee140)',
  'linear-gradient(135deg,#a18cd1,#fbc2eb)',
  'linear-gradient(135deg,#fccb90,#d57eeb)',
  'linear-gradient(135deg,#e0c3fc,#8ec5fc)',
];
const NUMBER_GRADS = [
  'linear-gradient(135deg,#0f0c29,#302b63,#24243e)',
  'linear-gradient(135deg,#141e30,#243b55)',
  'linear-gradient(135deg,#0a3d62,#1e3799)',
  'linear-gradient(135deg,#2c3e50,#3498db)',
];

function cardGrad(item, type) {
  const seed = item.id?.charCodeAt(0) ?? 0;
  const arr  = type === 'username' ? USERNAME_GRADS : NUMBER_GRADS;
  return arr[seed % arr.length];
}

// ── Item card ─────────────────────────────────────────────────────────────
function ItemCard({ item, type, onBuy, myCoins, owned }) {
  const [buying, setBuying] = useState(false);
  const canAfford = myCoins >= item.price;
  const label  = type === 'username' ? '@' + item.username : item.number;
  const icon   = type === 'username' ? '✦' : (item.flag || '🏴‍☠️');
  const rare   = rarity(item.price);
  const grad   = cardGrad(item, type);

  const buy = async () => {
    if (!canAfford || owned) return;
    setBuying(true);
    await onBuy(item);
    setBuying(false);
  };

  return (
    <div style={{
      background:'rgba(255,255,255,.94)',
      backdropFilter:'blur(16px)',
      borderRadius:22,
      border: owned
        ? '2px solid rgba(74,124,247,.4)'
        : rare
        ? `2px solid ${rare.glow}`
        : '1.5px solid rgba(90,120,220,.1)',
      overflow:'hidden',
      boxShadow: owned
        ? '0 4px 20px rgba(74,124,247,.15)'
        : rare
        ? `0 4px 20px ${rare.glow}`
        : '0 2px 12px rgba(0,0,0,.06)',
      transition:'transform .2s cubic-bezier(.34,1.56,.64,1), box-shadow .2s',
      position:'relative',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px) scale(1.01)'; e.currentTarget.style.boxShadow='0 12px 32px rgba(74,124,247,.18)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''; }}
    >
      {/* Rarity badge */}
      {rare && !owned && (
        <div style={{
          position:'absolute', top:10, right:10, zIndex:2,
          background:rare.bg, border:`1px solid ${rare.color}40`,
          borderRadius:8, padding:'2px 7px',
          fontSize:9, fontWeight:900, color:rare.color, letterSpacing:'.06em',
        }}>
          {rare.label}
        </div>
      )}

      {/* Gradient banner */}
      <div style={{
        height:76, background: owned ? 'linear-gradient(135deg,#4a7cf7,#7b5cf0)' : grad,
        display:'flex', alignItems:'center', justifyContent:'center',
        position:'relative', overflow:'hidden',
      }}>
        {/* Subtle shine */}
        <div style={{
          position:'absolute', top:'-50%', left:'-20%',
          width:'60%', height:'200%',
          background:'rgba(255,255,255,.08)',
          transform:'rotate(25deg)',
          pointerEvents:'none',
        }} />
        <span style={{
          fontSize: type === 'username' ? 30 : 26,
          filter:'drop-shadow(0 2px 8px rgba(0,0,0,.3))',
          color:'#fff', fontWeight:900,
        }}>
          {icon}
        </span>
      </div>

      {/* Content */}
      <div style={{ padding:'12px 14px 14px' }}>
        <div style={{
          fontWeight:800, fontSize:14,
          color:'var(--text)', letterSpacing: type === 'number' ? '.04em' : '-.2px',
          whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
          marginBottom:8,
        }}>
          {label}
        </div>

        {owned ? (
          <div style={{
            display:'flex', alignItems:'center', gap:5,
            background:'rgba(74,124,247,.1)', borderRadius:10, padding:'6px 10px',
            color:'#4a7cf7', fontWeight:700, fontSize:12,
          }}>
            <span>✓</span><span>Куплено</span>
          </div>
        ) : (
          <>
            <ZBadge n={item.price} />
            <button onClick={buy} disabled={buying || !canAfford} style={{
              display:'block', width:'100%', marginTop:10,
              background: canAfford
                ? 'linear-gradient(135deg,#4a7cf7,#7b5cf0)'
                : 'rgba(0,0,0,.06)',
              color: canAfford ? '#fff' : 'var(--text-muted)',
              border:'none', borderRadius:12, padding:'9px 0',
              fontWeight:700, fontSize:13, cursor: canAfford ? 'pointer' : 'not-allowed',
              opacity: buying ? .6 : 1,
              transition:'transform .15s, opacity .15s',
              boxShadow: canAfford ? '0 4px 12px rgba(74,124,247,.3)' : 'none',
            }}
              onMouseEnter={e => canAfford && (e.currentTarget.style.transform='scale(1.03)')}
              onMouseLeave={e => e.currentTarget.style.transform=''}
            >
              {buying ? '…' : canAfford ? 'Купить' : 'Мало 🪙'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function MarketplacePage() {
  const { auth } = useAuth();
  const [tab,       setTab]       = useState('usernames');
  const [usernames, setUsernames] = useState([]);
  const [numbers,   setNumbers]   = useState([]);
  const [myCoins,   setMyCoins]   = useState(auth.user.z_coins || 0);
  const [ownedU,    setOwnedU]    = useState(new Set());
  const [ownedN,    setOwnedN]    = useState(new Set());
  const [toast,     setToast]     = useState(null);
  const [sort,      setSort]      = useState('price_desc'); // 'price_desc' | 'price_asc'
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      supabase.from('nft_usernames').select('*').order('price', { ascending: false }),
      supabase.from('anonymous_numbers').select('*').order('price', { ascending: false }),
      supabase.from('profiles').select('z_coins').eq('id', auth.user.id).single(),
    ]).then(([u, n, p]) => {
      setUsernames(u.data || []);
      setOwnedU(new Set((u.data || []).filter(x => x.owner_id === auth.user.id).map(x => x.id)));
      setNumbers(n.data || []);
      setOwnedN(new Set((n.data || []).filter(x => x.owner_id === auth.user.id).map(x => x.id)));
      if (p.data) { setMyCoins(p.data.z_coins || 0); auth.user.z_coins = p.data.z_coins || 0; }
    }).catch(() => {}).finally(() => setLoading(false));
  }, [auth.user.id]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const buyUsername = async (item) => {
    if (myCoins < item.price) return;
    const newCoins = myCoins - item.price;
    const [r1, r2] = await Promise.all([
      supabase.from('profiles').update({ z_coins: newCoins }).eq('id', auth.user.id),
      supabase.from('nft_usernames').update({ owner_id: auth.user.id, is_listed: false }).eq('id', item.id),
    ]);
    if (r1.error || r2.error) { showToast('Ошибка покупки', 'error'); return; }
    setMyCoins(newCoins);
    auth.user.z_coins = newCoins;
    setOwnedU(s => new Set([...s, item.id]));
    setUsernames(us => us.map(u => u.id === item.id ? { ...u, owner_id: auth.user.id, is_listed: false } : u));
    showToast(`@${item.username} теперь ваш!`);
  };

  const buyNumber = async (item) => {
    if (myCoins < item.price) return;
    const newCoins = myCoins - item.price;
    const [r1, r2] = await Promise.all([
      supabase.from('profiles').update({ z_coins: newCoins }).eq('id', auth.user.id),
      supabase.from('anonymous_numbers').update({ owner_id: auth.user.id, is_listed: false }).eq('id', item.id),
    ]);
    if (r1.error || r2.error) { showToast('Ошибка покупки', 'error'); return; }
    setMyCoins(newCoins);
    auth.user.z_coins = newCoins;
    setOwnedN(s => new Set([...s, item.id]));
    setNumbers(ns => ns.map(n => n.id === item.id ? { ...n, owner_id: auth.user.id, is_listed: false } : n));
    showToast('Номер куплен!');
  };

  const rawItems = tab === 'usernames' ? usernames : numbers;
  const owned    = tab === 'usernames' ? ownedU    : ownedN;
  const onBuy    = tab === 'usernames' ? buyUsername : buyNumber;

  const sorted = [...rawItems].sort((a, b) =>
    sort === 'price_desc' ? b.price - a.price : a.price - b.price
  );

  const ownedItems    = sorted.filter(i => owned.has(i.id));
  const availItems    = sorted.filter(i => !owned.has(i.id));
  const featuredItems = availItems.filter(i => rarity(i.price) !== null).slice(0, 4);
  const regularItems  = availItems.filter(i => !featuredItems.includes(i));

  return (
    <div style={{ minHeight:'100%', background:'var(--bg-grad)', paddingBottom:88 }}>

      {/* ── Header ── */}
      <div style={{
        background:'rgba(255,255,255,.88)', backdropFilter:'blur(24px)',
        padding:'52px 20px 16px', borderBottom:'1px solid rgba(90,120,220,.1)',
        position:'sticky', top:0, zIndex:10,
      }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
          <div>
            <h1 style={{
              fontSize:28, fontWeight:800, letterSpacing:'-.5px',
              background:'linear-gradient(135deg,#12152a,#4a7cf7)',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
            }}>Маркетплейс</h1>
            <div style={{ fontSize:13, color:'var(--text-muted)', marginTop:2 }}>NFT имена и анонимные номера</div>
          </div>
          <ZBadge n={myCoins} size="lg" />
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:8 }}>
          {[
            { key:'usernames', label:'NFT Имена',    icon:'✦' },
            { key:'numbers',   label:'Анон. номера', icon:'🏴‍☠️' },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              flex:1, padding:'10px 14px', borderRadius:14, border:'none', cursor:'pointer',
              fontWeight:700, fontSize:13,
              background: tab === t.key ? 'linear-gradient(135deg,#4a7cf7,#7b5cf0)' : 'var(--surface-2)',
              color: tab === t.key ? '#fff' : 'var(--text-muted)',
              boxShadow: tab === t.key ? '0 4px 14px rgba(74,124,247,.3)' : 'none',
              transition:'all .2s',
            }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding:'16px 14px 0' }}>

        {/* ── Sort row ── */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
          <span style={{ fontSize:13, color:'var(--text-muted)', fontWeight:600 }}>
            {loading ? 'Загрузка…' : `${availItems.length} доступно`}
          </span>
          <div style={{ display:'flex', gap:6 }}>
            {[
              { key:'price_desc', label:'Дорогие ↓' },
              { key:'price_asc',  label:'Дешевые ↑' },
            ].map(s => (
              <button key={s.key} onClick={() => setSort(s.key)} style={{
                padding:'5px 12px', borderRadius:10, border:'none', cursor:'pointer',
                fontSize:12, fontWeight:700,
                background: sort === s.key ? 'linear-gradient(135deg,#4a7cf7,#7b5cf0)' : 'var(--surface-2)',
                color: sort === s.key ? '#fff' : 'var(--text-muted)',
                transition:'all .18s',
              }}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Featured row ── */}
        {!loading && featuredItems.length > 0 && (
          <>
            <div style={{ fontSize:12, fontWeight:800, color:'var(--text-muted)',
              textTransform:'uppercase', letterSpacing:'.07em', marginBottom:10 }}>
              🔥 Топ лоты
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:20 }}>
              {featuredItems.map(item => (
                <ItemCard key={item.id} item={item} type={tab==='usernames'?'username':'number'}
                  onBuy={onBuy} myCoins={myCoins} owned={owned.has(item.id)} />
              ))}
            </div>
          </>
        )}

        {/* ── All available items ── */}
        {!loading && regularItems.length > 0 && (
          <>
            {featuredItems.length > 0 && (
              <div style={{ fontSize:12, fontWeight:800, color:'var(--text-muted)',
                textTransform:'uppercase', letterSpacing:'.07em', marginBottom:10 }}>
                Все лоты
              </div>
            )}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:20 }}>
              {regularItems.map(item => (
                <ItemCard key={item.id} item={item} type={tab==='usernames'?'username':'number'}
                  onBuy={onBuy} myCoins={myCoins} owned={owned.has(item.id)} />
              ))}
            </div>
          </>
        )}

        {/* ── Owned items ── */}
        {!loading && ownedItems.length > 0 && (
          <>
            <div style={{ fontSize:12, fontWeight:800, color:'#4a7cf7',
              textTransform:'uppercase', letterSpacing:'.07em', marginBottom:10 }}>
              ✓ Мои покупки
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:20 }}>
              {ownedItems.map(item => (
                <ItemCard key={item.id} item={item} type={tab==='usernames'?'username':'number'}
                  onBuy={onBuy} myCoins={myCoins} owned={true} />
              ))}
            </div>
          </>
        )}

        {/* ── Empty / loading ── */}
        {loading && (
          <div style={{ textAlign:'center', padding:'60px 0' }}>
            <div style={{ fontSize:32, marginBottom:12 }}>⏳</div>
            <div style={{ color:'var(--text-muted)', fontSize:14 }}>Загрузка маркетплейса…</div>
          </div>
        )}
        {!loading && rawItems.length === 0 && (
          <div style={{ textAlign:'center', padding:'60px 0' }}>
            <div style={{ fontSize:40, marginBottom:12 }}>🛒</div>
            <div style={{ color:'var(--text-muted)', fontSize:14 }}>Нет доступных лотов</div>
          </div>
        )}
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position:'fixed', bottom:90, left:'50%', transform:'translateX(-50%)',
          background: toast.type === 'error' ? '#ef4444' : 'linear-gradient(135deg,#4a7cf7,#7b5cf0)',
          color:'#fff', borderRadius:20, padding:'12px 24px',
          fontWeight:700, fontSize:14, zIndex:999,
          boxShadow:'0 8px 24px rgba(0,0,0,.2)',
          animation:'msgPop .25s cubic-bezier(.34,1.4,.64,1)',
          whiteSpace:'nowrap', maxWidth:'90vw', textAlign:'center',
        }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
