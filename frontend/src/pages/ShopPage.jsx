import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { supabase } from '../lib/supabase.js';

const TIERS = [
  { coins: 100,   price: 129,   popular: false },
  { coins: 200,   price: 249,   popular: false },
  { coins: 500,   price: 550,   popular: false },
  { coins: 1000,  price: 959,   popular: true  },
  { coins: 2500,  price: 1999,  popular: false },
  { coins: 5000,  price: 3699,  popular: false },
  { coins: 10000, price: 5499,  popular: false },
];

const PROMO_CODE = 'SZ9L';

async function tryApplePay(coins, price) {
  if (!window.PaymentRequest) return false;
  try {
    const req = new window.PaymentRequest(
      [{ supportedMethods: 'https://apple.com/apple-pay', data: {
          version: 3,
          merchantIdentifier: 'merchant.app.zoomy',
          merchantCapabilities: ['supports3DS'],
          supportedNetworks: ['masterCard', 'visa'],
          countryCode: 'RU',
        }},
       { supportedMethods: 'basic-card', data: { supportedNetworks:['visa','mastercard'] } }
      ],
      {
        total: { label: `${coins.toLocaleString()} Z-Coins`, amount: { currency:'RUB', value: String(price) } },
        displayItems: [{ label:'Z-Coins Zoomy', amount:{ currency:'RUB', value: String(price) } }],
      }
    );
    const canPay = await req.canMakePayment();
    if (!canPay) return false;
    const result = await req.show();
    await result.complete('success');
    return true;
  } catch (_) {
    return false;
  }
}

// ── Shared Z-Coins badge ────────────────────────────────────────────────────
function ZBadge({ n }) {
  return (
    <div style={{
      display:'flex', alignItems:'center', gap:7,
      background:'linear-gradient(135deg,#fef3c7,#fde68a)',
      border:'1.5px solid rgba(245,158,11,.35)',
      borderRadius:22, padding:'8px 16px',
      boxShadow:'0 2px 12px rgba(245,158,11,.18)',
    }}>
      <span style={{ fontSize:18, lineHeight:1 }}>🪙</span>
      <div style={{ display:'flex', flexDirection:'column', lineHeight:1 }}>
        <span style={{
          fontWeight:900, fontSize:17,
          background:'linear-gradient(135deg,#d97706,#b45309)',
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
        }}>{n.toLocaleString()}</span>
        <span style={{ fontSize:10, fontWeight:700, color:'#92400e', marginTop:1, letterSpacing:'.04em' }}>Z-COINS</span>
      </div>
    </div>
  );
}

export default function ShopPage() {
  const { auth } = useAuth();
  const [balance,   setBalance]   = useState(auth.user.z_coins || 0);
  const [promo,     setPromo]     = useState('');
  const [promoMsg,  setPromoMsg]  = useState(null);
  const [buying,    setBuying]    = useState(null);
  const [toast,     setToast]     = useState(null);
  const [promoUsed, setPromoUsed] = useState(false);

  // Always fetch fresh balance from DB (may be stale if coins spent in Marketplace)
  useEffect(() => {
    supabase.from('profiles').select('z_coins').eq('id', auth.user.id).single()
      .then(({ data }) => { if (data) { setBalance(data.z_coins || 0); auth.user.z_coins = data.z_coins || 0; } });
  }, [auth.user.id]);

  const showToast = (msg, type='success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const addCoins = async (amount) => {
    const newBal = balance + amount;
    const { error } = await supabase.from('profiles')
      .update({ z_coins: newBal }).eq('id', auth.user.id);
    if (!error) { setBalance(newBal); auth.user.z_coins = newBal; }
    return !error;
  };

  const applyPromo = async () => {
    if (promoUsed) { setPromoMsg({ text:'Промокод уже использован', err:true }); return; }
    if (promo.trim().toUpperCase() !== PROMO_CODE) {
      setPromoMsg({ text:'Неверный промокод', err:true }); return;
    }
    const ok = await addCoins(10000);
    if (ok) {
      setPromoMsg({ text:'✓ Промокод применён! +10 000 зачислено', err:false });
      setPromoUsed(true);
      setPromo('');
      showToast('+10 000 Z-Coins зачислено!');
    }
  };

  const buyTier = async (tier) => {
    setBuying(tier.coins);
    try {
      const paid = await tryApplePay(tier.coins, tier.price);
      if (paid) {
        const ok = await addCoins(tier.coins);
        if (ok) showToast(`+${tier.coins.toLocaleString()} Z-Coins зачислено!`);
      } else {
        showToast('Apple Pay недоступен на этом устройстве. Используйте промокод.', 'info');
      }
    } catch (_) {
      showToast('Оплата отменена', 'info');
    }
    setBuying(null);
  };

  return (
    <div style={{ minHeight:'100%', background:'var(--bg-grad)', paddingBottom:90 }}>

      {/* ── Header ── */}
      <div style={{
        background:'rgba(255,255,255,.88)', backdropFilter:'blur(24px)',
        padding:'52px 20px 20px', borderBottom:'1px solid rgba(90,120,220,.1)',
        position:'sticky', top:0, zIndex:10,
      }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <h1 style={{
              fontSize:28, fontWeight:800, letterSpacing:'-.5px',
              background:'linear-gradient(135deg,#d97706,#f59e0b)',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
            }}>Магазин</h1>
            <div style={{ fontSize:13, color:'var(--text-muted)', marginTop:2 }}>Пополнение Z-Coins</div>
          </div>
          <ZBadge n={balance} />
        </div>
      </div>

      <div style={{ padding:'20px 16px 0' }}>

        {/* ── Promo code ── */}
        <div style={{
          background:'rgba(255,255,255,.88)', backdropFilter:'blur(16px)',
          borderRadius:22, padding:'18px 18px',
          border:'1.5px solid rgba(90,120,220,.12)', marginBottom:20,
        }}>
          <div style={{ fontSize:13, fontWeight:800, color:'var(--text-muted)',
            textTransform:'uppercase', letterSpacing:'.07em', marginBottom:12 }}>
            🎁 Промокод
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <input
              value={promo}
              onChange={e => { setPromo(e.target.value.toUpperCase()); setPromoMsg(null); }}
              placeholder="Введите промокод"
              maxLength={20}
              style={{
                flex:1, background:'var(--surface-2)', border:'1.5px solid var(--border)',
                borderRadius:14, padding:'12px 16px', color:'var(--text)', outline:'none',
                fontWeight:700, letterSpacing:'.06em', fontSize:15, transition:'border-color .2s',
              }}
              onFocus={e => e.target.style.borderColor='var(--accent)'}
              onBlur={e => e.target.style.borderColor=''}
              onKeyDown={e => e.key === 'Enter' && applyPromo()}
            />
            <button onClick={applyPromo} style={{
              background:'linear-gradient(135deg,#4a7cf7,#7b5cf0)',
              color:'#fff', border:'none', borderRadius:14,
              padding:'12px 20px', fontWeight:700, fontSize:14, cursor:'pointer',
              boxShadow:'0 4px 14px rgba(74,124,247,.3)', transition:'transform .15s',
            }}
              onMouseEnter={e => e.currentTarget.style.transform='scale(1.04)'}
              onMouseLeave={e => e.currentTarget.style.transform=''}
            >
              Применить
            </button>
          </div>
          {promoMsg && (
            <div style={{
              marginTop:10, fontSize:13, fontWeight:600,
              color: promoMsg.err ? '#ef4444' : '#16a34a',
            }}>
              {promoMsg.text}
            </div>
          )}
        </div>

        {/* ── Tiers label ── */}
        <div style={{ fontSize:13, fontWeight:800, color:'var(--text-muted)',
          textTransform:'uppercase', letterSpacing:'.07em', marginBottom:12 }}>
          💳 Пополнение через Apple Pay
        </div>

        {/* ── Tier grid ── */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:24 }}>
          {TIERS.map(tier => (
            <button key={tier.coins} onClick={() => buyTier(tier)}
              disabled={buying === tier.coins}
              style={{
                background: tier.popular
                  ? 'linear-gradient(135deg,#4a7cf7,#7b5cf0)'
                  : 'rgba(255,255,255,.88)',
                backdropFilter:'blur(12px)',
                border: tier.popular ? 'none' : '1.5px solid rgba(90,120,220,.12)',
                borderRadius:20, padding:'18px 14px',
                cursor:'pointer', position:'relative', overflow:'hidden',
                boxShadow: tier.popular ? '0 6px 24px rgba(74,124,247,.35)' : '0 2px 12px rgba(74,124,247,.07)',
                transition:'transform .18s cubic-bezier(.34,1.56,.64,1), box-shadow .18s',
                opacity: buying && buying !== tier.coins ? .6 : 1,
              }}
              onMouseEnter={e => { e.currentTarget.style.transform='scale(1.04)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform=''; }}
            >
              {tier.popular && (
                <div style={{
                  position:'absolute', top:10, right:10,
                  background:'rgba(255,255,255,.25)', borderRadius:10,
                  padding:'2px 8px', fontSize:10, fontWeight:800,
                  color:'#fff', letterSpacing:'.04em',
                }}>ВЫГОДНО</div>
              )}

              {/* Coin amount */}
              <div style={{
                fontSize:26, fontWeight:900, letterSpacing:'-.5px',
                color: tier.popular ? '#fff' : 'var(--text)', marginBottom:2,
              }}>
                {tier.coins >= 1000 ? (tier.coins/1000)+'K' : tier.coins}
              </div>
              <div style={{
                fontSize:11, fontWeight:700, letterSpacing:'.06em',
                color: tier.popular ? 'rgba(255,255,255,.8)' : 'var(--text-muted)',
                marginBottom:12,
              }}>
                🪙 Z-COINS
              </div>

              {/* Price pill */}
              <div style={{
                background: tier.popular ? 'rgba(255,255,255,.2)' : 'var(--surface-2)',
                borderRadius:12, padding:'8px',
                display:'flex', alignItems:'center', justifyContent:'center', gap:6,
              }}>
                <svg width="15" height="15" viewBox="0 0 814 1000" fill={tier.popular ? '#fff' : '#555'}>
                  <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-37.5-155.5-127.4C46 790.7 0 663.7 0 541.8c0-207.5 135.4-317.3 269-317.3 71 0 130.5 46.4 175 46.4 42.5 0 109.2-49 191.3-49 30.8 0 130.5 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"/>
                </svg>
                <span style={{
                  fontWeight:800, fontSize:14,
                  color: tier.popular ? '#fff' : 'var(--text)',
                }}>
                  {buying === tier.coins ? '…' : `${tier.price.toLocaleString()} ₽`}
                </span>
              </div>
            </button>
          ))}
        </div>

        <div style={{
          textAlign:'center', color:'var(--text-muted)', fontSize:12,
          padding:'0 20px 20px', lineHeight:1.7,
        }}>
          Оплата через Apple Pay. Средства зачисляются мгновенно.
          Z-Coins используются для покупки NFT имён и анонимных номеров в Маркетплейсе.
        </div>
      </div>

      {toast && (
        <div style={{
          position:'fixed', bottom:90, left:'50%', transform:'translateX(-50%)',
          background:
            toast.type === 'error' ? '#ef4444' :
            toast.type === 'info'  ? '#6b7280' :
            'linear-gradient(135deg,#d97706,#f59e0b)',
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
