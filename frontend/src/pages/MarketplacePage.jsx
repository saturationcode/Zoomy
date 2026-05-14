import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { supabase } from '../lib/supabase.js';

const COIN = '⚡';

function ZCoin({ n, size = 14 }) {
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:3, fontWeight:700,
      color:'#f59e0b', fontSize:size }}>
      <span>⚡</span>{n.toLocaleString()}
    </span>
  );
}

function ItemCard({ item, type, onBuy, myCoins, owned }) {
  const [buying, setBuying] = useState(false);
  const canAfford = myCoins >= item.price;
  const label = type === 'username' ? '@' + item.username : item.number;
  const flag  = type === 'username' ? '✦' : item.flag;

  const buy = async () => {
    if (!canAfford || owned) return;
    setBuying(true);
    await onBuy(item);
    setBuying(false);
  };

  return (
    <div style={{
      background: owned ? 'rgba(74,124,247,.06)' : 'rgba(255,255,255,.85)',
      backdropFilter: 'blur(12px)',
      borderRadius: 20,
      padding: '16px 18px',
      border: owned ? '1.5px solid rgba(74,124,247,.22)' : '1.5px solid rgba(90,120,220,.1)',
      display: 'flex', alignItems: 'center', gap: 14,
      transition: 'transform .18s cubic-bezier(.34,1.56,.64,1), box-shadow .18s',
      boxShadow: '0 2px 12px rgba(74,124,247,.07)',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 6px 24px rgba(74,124,247,.14)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 2px 12px rgba(74,124,247,.07)'; }}
    >
      {/* Icon */}
      <div style={{
        width: 48, height: 48, borderRadius: 14,
        background: owned
          ? 'linear-gradient(135deg,rgba(74,124,247,.18),rgba(123,92,240,.18))'
          : 'linear-gradient(135deg,rgba(74,124,247,.1),rgba(123,92,240,.1))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: type === 'username' ? 20 : 22, flexShrink: 0,
      }}>
        {flag}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontWeight: 800, fontSize: 15, color: 'var(--text)',
          letterSpacing: type === 'number' ? '.04em' : '-.2px',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {label}
        </div>
        <div style={{ marginTop: 3 }}>
          {owned
            ? <span style={{ fontSize:12, fontWeight:700, color:'var(--accent)' }}>✓ Куплено</span>
            : <ZCoin n={item.price} size={13} />
          }
        </div>
      </div>

      {/* Buy */}
      {!owned && (
        <button onClick={buy} disabled={buying || !canAfford} style={{
          background: canAfford
            ? 'linear-gradient(135deg,#4a7cf7,#7b5cf0)'
            : 'rgba(0,0,0,.08)',
          color: canAfford ? '#fff' : 'var(--text-muted)',
          border: 'none', borderRadius: 14, padding: '9px 16px',
          fontWeight: 700, fontSize: 13, cursor: canAfford ? 'pointer' : 'not-allowed',
          flexShrink: 0, whiteSpace: 'nowrap',
          transition: 'transform .15s, opacity .15s',
          opacity: buying ? .6 : 1,
        }}
          onMouseEnter={e => canAfford && (e.currentTarget.style.transform='scale(1.05)')}
          onMouseLeave={e => e.currentTarget.style.transform=''}
        >
          {buying ? '…' : canAfford ? 'Купить' : 'Мало ⚡'}
        </button>
      )}
    </div>
  );
}

export default function MarketplacePage() {
  const { auth } = useAuth();
  const [tab, setTab]             = useState('usernames');
  const [usernames, setUsernames] = useState([]);
  const [numbers,   setNumbers]   = useState([]);
  const [myCoins,   setMyCoins]   = useState(auth.user.z_coins || 0);
  const [ownedU,    setOwnedU]    = useState(new Set());
  const [ownedN,    setOwnedN]    = useState(new Set());
  const [toast,     setToast]     = useState(null);

  useEffect(() => {
    supabase.from('nft_usernames').select('*').order('price')
      .then(({ data }) => {
        setUsernames(data || []);
        setOwnedU(new Set((data || []).filter(u => u.owner_id === auth.user.id).map(u => u.id)));
      });
    supabase.from('anonymous_numbers').select('*').order('price')
      .then(({ data }) => {
        setNumbers(data || []);
        setOwnedN(new Set((data || []).filter(n => n.owner_id === auth.user.id).map(n => n.id)));
      });
    supabase.from('profiles').select('z_coins').eq('id', auth.user.id).single()
      .then(({ data }) => data && setMyCoins(data.z_coins || 0));
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
    setOwnedN(s => new Set([...s, item.id]));
    setNumbers(ns => ns.map(n => n.id === item.id ? { ...n, owner_id: auth.user.id, is_listed: false } : n));
    showToast(`Номер куплен!`);
  };

  const items    = tab === 'usernames' ? usernames : numbers;
  const owned    = tab === 'usernames' ? ownedU : ownedN;
  const onBuy    = tab === 'usernames' ? buyUsername : buyNumber;

  return (
    <div style={{
      minHeight: '100%', background: 'var(--bg-grad)',
      paddingBottom: 80,
    }}>
      {/* Header */}
      <div style={{
        background: 'rgba(255,255,255,.85)', backdropFilter: 'blur(24px)',
        padding: '52px 20px 16px', borderBottom: '1px solid rgba(90,120,220,.1)',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
          <div>
            <h1 style={{ fontSize:28, fontWeight:800, letterSpacing:'-.5px',
              background:'linear-gradient(135deg,#12152a,#4a7cf7)',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
              backgroundClip:'text',
            }}>Маркетплейс</h1>
            <div style={{ fontSize:13, color:'var(--text-muted)', marginTop:2 }}>NFT имена и анонимные номера</div>
          </div>
          <div style={{
            display:'flex', alignItems:'center', gap:6,
            background:'linear-gradient(135deg,rgba(245,158,11,.12),rgba(234,179,8,.12))',
            border:'1px solid rgba(245,158,11,.25)',
            borderRadius:20, padding:'8px 14px',
          }}>
            <span style={{ fontSize:16 }}>⚡</span>
            <span style={{ fontWeight:800, fontSize:15, color:'#b45309' }}>{myCoins.toLocaleString()}</span>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:8 }}>
          {[
            { key:'usernames', label:'NFT Имена', icon:'✦' },
            { key:'numbers',   label:'Анон. номера', icon:'🏴‍☠️' },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              flex:1, padding:'10px 14px', borderRadius:14, border:'none', cursor:'pointer',
              fontWeight:700, fontSize:13,
              background: tab === t.key ? 'linear-gradient(135deg,#4a7cf7,#7b5cf0)' : 'var(--surface-2)',
              color: tab === t.key ? '#fff' : 'var(--text-muted)',
              boxShadow: tab === t.key ? '0 4px 14px rgba(74,124,247,.3)' : 'none',
              transition: 'all .2s',
            }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Items */}
      <div style={{ padding:'16px 16px 0', display:'flex', flexDirection:'column', gap:10 }}>
        {items.length === 0 && (
          <div style={{ textAlign:'center', color:'var(--text-muted)', padding:'48px 0', fontSize:14 }}>
            Загрузка…
          </div>
        )}
        {items.map(item => (
          <ItemCard
            key={item.id}
            item={item}
            type={tab === 'usernames' ? 'username' : 'number'}
            onBuy={onBuy}
            myCoins={myCoins}
            owned={owned.has(item.id)}
          />
        ))}
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position:'fixed', bottom:90, left:'50%', transform:'translateX(-50%)',
          background: toast.type === 'error' ? '#ef4444' : 'linear-gradient(135deg,#4a7cf7,#7b5cf0)',
          color:'#fff', borderRadius:20, padding:'12px 24px',
          fontWeight:700, fontSize:14, zIndex:999,
          boxShadow:'0 8px 24px rgba(0,0,0,.2)',
          animation:'msgPop .25s cubic-bezier(.34,1.4,.64,1)',
        }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
