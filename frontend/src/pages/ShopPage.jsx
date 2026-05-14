import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { supabase } from '../lib/supabase.js';
import ZIcon from '../components/ZIcon.jsx';

// ── Data ──────────────────────────────────────────────────────────────────────
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
          version: 3, merchantIdentifier: 'merchant.app.zoomy',
          merchantCapabilities: ['supports3DS'],
          supportedNetworks: ['masterCard', 'visa'], countryCode: 'RU',
        }},
       { supportedMethods: 'basic-card', data: { supportedNetworks:['visa','mastercard'] } }
      ],
      { total: { label:`${coins} Z-Coins`, amount:{ currency:'RUB', value:String(price) } } }
    );
    if (!await req.canMakePayment()) return false;
    const result = await req.show();
    await result.complete('success');
    return true;
  } catch (_) { return false; }
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function ShopPage() {
  const { auth } = useAuth();
  const [balance,   setBalance]   = useState(auth.user.z_coins || 0);
  const [promo,     setPromo]     = useState('');
  const [promoMsg,  setPromoMsg]  = useState(null);
  const [buying,    setBuying]    = useState(null);
  const [toast,     setToast]     = useState(null);
  const [promoUsed, setPromoUsed] = useState(false);

  useEffect(() => {
    supabase.from('profiles').select('z_coins').eq('id', auth.user.id).single()
      .then(({ data }) => {
        if (data) { setBalance(data.z_coins || 0); auth.user.z_coins = data.z_coins || 0; }
      });
  }, [auth.user.id]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const addCoins = async (amount) => {
    const nb = balance + amount;
    const { error } = await supabase.from('profiles').update({ z_coins: nb }).eq('id', auth.user.id);
    if (!error) { setBalance(nb); auth.user.z_coins = nb; }
    return !error;
  };

  const applyPromo = async () => {
    if (promoUsed) { setPromoMsg({ text:'Промокод уже использован', err:true }); return; }
    if (promo.trim().toUpperCase() !== PROMO_CODE) {
      setPromoMsg({ text:'Неверный промокод', err:true }); return;
    }
    const ok = await addCoins(10000);
    if (ok) {
      setPromoMsg({ text:'Промокод применён — +10 000 Z-Coins зачислено', err:false });
      setPromoUsed(true); setPromo('');
      showToast('+10 000 Z-Coins зачислено');
    }
  };

  const buyTier = async (tier) => {
    setBuying(tier.coins);
    try {
      if (await tryApplePay(tier.coins, tier.price)) {
        if (await addCoins(tier.coins)) showToast(`+${tier.coins.toLocaleString()} Z-Coins зачислено`);
      } else {
        showToast('Apple Pay недоступен. Используйте промокод.', 'info');
      }
    } catch (_) { showToast('Оплата отменена', 'info'); }
    setBuying(null);
  };

  return (
    <div style={{ minHeight:'100%', background:'#f0f2f8', paddingBottom:88 }}>

      {/* ── Hero ── */}
      <div style={{
        background:'linear-gradient(160deg,#0f1229 0%,#1e2d6b 55%,#142054 100%)',
        padding:'56px 24px 36px',
        display:'flex', flexDirection:'column', alignItems:'center',
        position:'relative', overflow:'hidden',
      }}>
        {/* Ambient glow */}
        <div style={{
          position:'absolute', width:320, height:320, borderRadius:'50%',
          background:'radial-gradient(circle,rgba(245,158,11,.18) 0%,transparent 70%)',
          top:'50%', left:'50%', transform:'translate(-50%,-50%)',
          pointerEvents:'none',
        }}/>
        <div style={{
          position:'absolute', width:180, height:180, borderRadius:'50%',
          background:'radial-gradient(circle,rgba(245,158,11,.25) 0%,transparent 70%)',
          top:'35%', left:'50%', transform:'translate(-50%,-50%)',
          pointerEvents:'none',
        }}/>

        {/* Coin */}
        <div style={{ position:'relative', marginBottom:18, filter:'drop-shadow(0 8px 24px rgba(245,158,11,.45))' }}>
          <ZIcon size={80} />
        </div>

        <h1 style={{ color:'#fff', fontSize:28, fontWeight:900, margin:0, letterSpacing:'-.5px' }}>
          Z-Coins
        </h1>
        <p style={{ color:'rgba(255,255,255,.5)', fontSize:14, margin:'6px 0 0', fontWeight:500 }}>
          Внутренняя валюта Zoomy
        </p>

        {/* Balance pill */}
        <div style={{
          marginTop:22,
          background:'rgba(255,255,255,.09)',
          border:'1px solid rgba(255,255,255,.14)',
          borderRadius:24, padding:'11px 22px',
          display:'flex', alignItems:'center', gap:9,
          backdropFilter:'blur(12px)',
        }}>
          <ZIcon size={20}/>
          <span style={{ color:'#fff', fontWeight:900, fontSize:19, letterSpacing:'-.3px' }}>
            {balance.toLocaleString()}
          </span>
          <span style={{ color:'rgba(255,255,255,.45)', fontSize:13, fontWeight:600 }}>
            на балансе
          </span>
        </div>
      </div>

      <div style={{ padding:'20px 16px 0' }}>

        {/* ── Section label ── */}
        <div style={{
          fontSize:12, fontWeight:700, color:'#7a82a8',
          textTransform:'uppercase', letterSpacing:'.08em',
          marginBottom:10, marginLeft:6,
        }}>
          Пополнение
        </div>

        {/* ── Tiers list ── */}
        <div style={{
          background:'#fff', borderRadius:22,
          overflow:'hidden', boxShadow:'0 2px 24px rgba(0,0,0,.07)',
        }}>
          {TIERS.map((tier, idx) => (
            <div key={tier.coins}>
              {idx > 0 && (
                <div style={{ height:1, background:'rgba(0,0,0,.055)', margin:'0 70px 0 82px' }}/>
              )}
              <button
                onClick={() => buyTier(tier)}
                disabled={!!buying}
                style={{
                  width:'100%', display:'flex', alignItems:'center', gap:14,
                  padding:'13px 18px 13px 14px',
                  background: tier.popular ? 'linear-gradient(95deg,rgba(74,124,247,.07),rgba(123,92,240,.07))' : 'transparent',
                  border:'none', cursor: buying ? 'not-allowed' : 'pointer',
                  textAlign:'left',
                  opacity: buying && buying !== tier.coins ? .45 : 1,
                  transition:'opacity .18s, background .18s',
                }}
                onMouseEnter={e => !buying && (e.currentTarget.style.background = tier.popular ? 'linear-gradient(95deg,rgba(74,124,247,.12),rgba(123,92,240,.12))' : 'rgba(0,0,0,.03)')}
                onMouseLeave={e => e.currentTarget.style.background = tier.popular ? 'linear-gradient(95deg,rgba(74,124,247,.07),rgba(123,92,240,.07))' : 'transparent'}
              >
                {/* Left icon */}
                <div style={{
                  width:52, height:52, borderRadius:16, flexShrink:0,
                  background: tier.popular
                    ? 'linear-gradient(135deg,#4a7cf7,#7b5cf0)'
                    : 'linear-gradient(135deg,rgba(245,158,11,.15),rgba(245,158,11,.08))',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  boxShadow: tier.popular ? '0 4px 14px rgba(74,124,247,.28)' : 'none',
                }}>
                  <ZIcon size={26}/>
                </div>

                {/* Text */}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:7, flexWrap:'wrap' }}>
                    <span style={{ fontWeight:800, fontSize:16, color:'#12152a' }}>
                      {tier.coins >= 1000 ? (tier.coins / 1000) + 'K' : tier.coins}
                      {' '}Z-Coins
                    </span>
                    {tier.popular && (
                      <span style={{
                        background:'linear-gradient(135deg,#4a7cf7,#7b5cf0)',
                        color:'#fff', fontSize:10, fontWeight:800,
                        borderRadius:8, padding:'2px 8px', letterSpacing:'.05em',
                        flexShrink:0,
                      }}>
                        ВЫГОДНО
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize:12, color:'#9098c0', marginTop:2, fontWeight:500 }}>
                    {(tier.price / tier.coins * 100).toFixed(1)} ₽ за 100 монет
                  </div>
                </div>

                {/* Price + arrow */}
                <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
                  <div style={{
                    fontWeight:800, fontSize:16,
                    color: tier.popular ? '#4a7cf7' : '#12152a',
                  }}>
                    {buying === tier.coins ? '…' : tier.price.toLocaleString() + ' ₽'}
                  </div>
                  <svg width="7" height="13" viewBox="0 0 7 13" fill="none">
                    <path d="M1 1l5 5.5L1 12" stroke={tier.popular ? '#7b9cf9' : '#c0c8e0'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </button>
            </div>
          ))}
        </div>

        {/* ── Promo code ── */}
        <div style={{
          fontSize:12, fontWeight:700, color:'#7a82a8',
          textTransform:'uppercase', letterSpacing:'.08em',
          margin:'22px 0 10px 6px',
        }}>
          Промокод
        </div>
        <div style={{
          background:'#fff', borderRadius:18,
          boxShadow:'0 2px 24px rgba(0,0,0,.07)',
          display:'flex', alignItems:'center',
          padding:'6px 6px 6px 18px', gap:8,
        }}>
          <input
            value={promo}
            onChange={e => { setPromo(e.target.value.toUpperCase()); setPromoMsg(null); }}
            placeholder="Введите промокод"
            maxLength={20}
            style={{
              flex:1, border:'none', background:'transparent', outline:'none',
              fontSize:15, fontWeight:700, color:'#12152a',
              letterSpacing:'.06em', padding:'10px 0',
            }}
            onKeyDown={e => e.key === 'Enter' && applyPromo()}
          />
          <button onClick={applyPromo} style={{
            background:'linear-gradient(135deg,#4a7cf7,#7b5cf0)',
            color:'#fff', border:'none', borderRadius:14,
            padding:'12px 20px', fontWeight:700, fontSize:14,
            cursor:'pointer', flexShrink:0,
            boxShadow:'0 4px 14px rgba(74,124,247,.3)',
          }}>
            Применить
          </button>
        </div>
        {promoMsg && (
          <div style={{
            marginTop:8, fontSize:13, fontWeight:600, marginLeft:4,
            color: promoMsg.err ? '#ef4444' : '#16a34a',
          }}>
            {promoMsg.text}
          </div>
        )}

        <div style={{
          textAlign:'center', color:'#a0a8cc', fontSize:12,
          padding:'20px 16px 4px', lineHeight:1.8,
        }}>
          Z-Coins используются для покупки NFT имён и анонимных
          номеров в Маркетплейсе. Оплата через Apple Pay.
        </div>
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position:'fixed', bottom:90, left:'50%', transform:'translateX(-50%)',
          background:
            toast.type === 'error' ? '#ef4444' :
            toast.type === 'info'  ? '#6b7280' :
            'linear-gradient(135deg,#1e2d6b,#4a7cf7)',
          color:'#fff', borderRadius:20, padding:'12px 24px',
          fontWeight:700, fontSize:14, zIndex:999,
          boxShadow:'0 8px 24px rgba(0,0,0,.25)',
          animation:'msgPop .25s cubic-bezier(.34,1.4,.64,1)',
          whiteSpace:'nowrap', maxWidth:'90vw', textAlign:'center',
        }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
