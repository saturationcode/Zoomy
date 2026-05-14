import { useEffect, useState } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useStarsStore, STARS_TIERS } from '../store/starsStore';
import { useUIStore } from '../store/uiStore';
import type { StarsTransaction } from '../types';

// ─── Light tokens ──────────────────────────────────────────────────────────────

const C = {
  bg:       '#f2f2f7',
  surface:  '#ffffff',
  surface2: '#f9f9fb',
  border:   'rgba(60,60,67,0.1)',
  text:     '#1c1c1e',
  textSub:  '#6e6e73',
  accent:   '#6d28d9',
  accentBg: 'rgba(109,40,217,0.08)',
  gold:     '#ff9f0a',
  goldBg:   'rgba(255,159,10,0.1)',
  goldBdr:  'rgba(255,159,10,0.25)',
  green:    '#34c759',
  red:      '#ff3b30',
};

function StarIcon({ size=18, filled=false }: { size?:number; filled?:boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24"
      fill={filled?'currentColor':'none'} stroke={filled?'none':'currentColor'}
      strokeWidth={filled?0:1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
    </svg>
  );
}

// ─── Balance card ──────────────────────────────────────────────────────────────

function BalanceCard({ balance }: { balance:number }) {
  return (
    <motion.div
      initial={{ opacity:0, scale:0.96, y:12 }}
      animate={{ opacity:1, scale:1, y:0 }}
      transition={{ type:'spring', stiffness:380, damping:28 }}
      style={{
        margin:'16px',
        padding:'28px 24px',
        borderRadius:24,
        background:'linear-gradient(135deg, #6d28d9 0%, #2563eb 100%)',
        boxShadow:'0 12px 40px rgba(109,40,217,0.35)',
        textAlign:'center', position:'relative', overflow:'hidden',
      }}
    >
      <motion.div
        animate={{ x:['-100%','220%'] }}
        transition={{ duration:3.2, repeat:Infinity, repeatDelay:2.2, ease:'easeInOut' }}
        style={{
          position:'absolute', inset:0,
          background:'linear-gradient(90deg,transparent,rgba(255,255,255,.15),transparent)',
          pointerEvents:'none',
        }}
      />
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, marginBottom:4 }}>
        <span style={{ color:'#fbbf24', filter:'drop-shadow(0 0 8px rgba(251,191,36,.8))' }}>
          <StarIcon size={28} filled/>
        </span>
        <motion.span
          key={balance}
          initial={{ scale:1.3, opacity:0 }}
          animate={{ scale:1, opacity:1 }}
          transition={{ type:'spring', stiffness:400, damping:20 }}
          style={{ fontSize:48, fontWeight:800, color:'#fff', letterSpacing:'-2px', lineHeight:1 }}
        >
          {balance.toLocaleString()}
        </motion.span>
      </div>
      <p style={{ color:'rgba(255,255,255,0.65)', fontSize:14, margin:0 }}>Баланс Stars</p>
    </motion.div>
  );
}

// ─── Tier card ─────────────────────────────────────────────────────────────────

function TierCard({
  stars, price, label, popular, bonus, index, onBuy,
}: { stars:number; price:number; label:string; popular?:boolean; bonus?:string; index:number; onBuy:()=>void }) {
  return (
    <motion.button
      initial={{ opacity:0, y:16 }}
      animate={{ opacity:1, y:0 }}
      transition={{ delay:index*0.07, type:'spring', stiffness:380, damping:28 }}
      whileTap={{ scale:0.97 }}
      whileHover={{ y:-2 }}
      onClick={onBuy}
      style={{
        width:'100%', textAlign:'left', cursor:'pointer',
        background: popular
          ? 'linear-gradient(135deg,rgba(109,40,217,.08),rgba(37,99,235,.05))'
          : C.surface,
        border:`1.5px solid ${popular ? 'rgba(109,40,217,0.22)' : C.border}`,
        borderRadius:18, padding:'16px 18px',
        display:'flex', alignItems:'center', gap:14,
        boxShadow: popular
          ? '0 4px 20px rgba(109,40,217,0.12)'
          : '0 1px 6px rgba(0,0,0,0.06)',
      }}
    >
      <div style={{
        width:48, height:48, borderRadius:14, flexShrink:0,
        background: popular
          ? 'linear-gradient(135deg,rgba(109,40,217,.2),rgba(37,99,235,.12))'
          : C.goldBg,
        display:'flex', alignItems:'center', justifyContent:'center',
        color: popular ? C.accent : C.gold,
      }}>
        <StarIcon size={22} filled/>
      </div>

      <div style={{ flex:1 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
          <span style={{ fontSize:16, fontWeight:700, color:C.text }}>{label}</span>
          {bonus && (
            <span style={{
              fontSize:11, fontWeight:700, color:C.gold,
              background:C.goldBg, border:`1px solid ${C.goldBdr}`,
              borderRadius:20, padding:'2px 8px',
            }}>{bonus}</span>
          )}
          {popular && !bonus && (
            <span style={{
              fontSize:10, fontWeight:700, color:C.accent,
              background:C.accentBg, border:`1px solid rgba(109,40,217,.2)`,
              borderRadius:20, padding:'2px 8px',
              textTransform:'uppercase', letterSpacing:'0.04em',
            }}>Popular</span>
          )}
        </div>
        <span style={{ fontSize:12, color:C.textSub, marginTop:2, display:'block' }}>
          ≈ ${price.toFixed(2)}
        </span>
      </div>

      <div style={{
        padding:'9px 16px', borderRadius:14, flexShrink:0,
        background: popular ? 'linear-gradient(135deg,#6d28d9,#2563eb)' : C.surface2,
        border: popular ? 'none' : `1px solid ${C.border}`,
        color: popular ? '#fff' : C.text,
        fontWeight:700, fontSize:14,
        boxShadow: popular ? '0 4px 16px rgba(109,40,217,.3)' : 'none',
      }}>
        ${price.toFixed(2)}
      </div>
    </motion.button>
  );
}

// ─── Promo ─────────────────────────────────────────────────────────────────────

function PromoSection({ userId }: { userId:string }) {
  const { applyPromo } = useStarsStore();
  const { showToast }  = useUIStore();
  const [code, setCode]       = useState('');
  const [loading, setLoading] = useState(false);

  const handleApply = async () => {
    if (!code.trim()) return;
    setLoading(true);
    const r = await applyPromo(userId, code);
    setLoading(false);
    showToast(r.message, r.ok ? 'success' : 'error');
    if (r.ok) setCode('');
  };

  return (
    <motion.div
      initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}
      style={{
        margin:'16px',
        padding:'18px', borderRadius:20,
        background:C.surface, border:`1px solid ${C.border}`,
        boxShadow:'0 1px 6px rgba(0,0,0,0.06)',
      }}
    >
      <p style={{ fontSize:13,fontWeight:600,color:C.text,margin:'0 0 12px',
        display:'flex',alignItems:'center',gap:6 }}>
        <span style={{fontSize:16}}>🎟</span> Промокод
      </p>
      <div style={{ display:'flex', gap:8 }}>
        <input
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          onKeyDown={e => e.key==='Enter' && handleApply()}
          placeholder="Введи промокод"
          style={{
            flex:1, padding:'12px 14px', borderRadius:12,
            background:C.surface2, border:`1.5px solid ${C.border}`,
            color:C.text, fontSize:14, fontFamily:'inherit',
            letterSpacing:'0.05em', fontWeight:600, outline:'none',
            transition:'border-color .2s',
          }}
          onFocus={e => e.target.style.borderColor='rgba(109,40,217,.4)'}
          onBlur={e  => e.target.style.borderColor=C.border}
        />
        <motion.button
          onClick={handleApply}
          whileTap={{ scale:0.95 }}
          disabled={loading || !code.trim()}
          style={{
            padding:'0 18px', borderRadius:12, border:'none', cursor:'pointer',
            background:'linear-gradient(135deg,#6d28d9,#2563eb)',
            color:'#fff', fontWeight:700, fontSize:14,
            opacity:(loading||!code.trim())?0.4:1,
            transition:'opacity .15s',
            boxShadow:'0 4px 14px rgba(109,40,217,.3)',
          }}
        >{loading?'...':'OK'}</motion.button>
      </div>
    </motion.div>
  );
}

// ─── Transaction row ───────────────────────────────────────────────────────────

function TransactionRow({ tx, index, total }: { tx:StarsTransaction; index:number; total:number }) {
  const pos = tx.amount > 0;
  const icons: Record<string,string> = {
    purchase:'💳', gift_send:'🎁', gift_receive:'🎁',
    username_buy:'@', number_buy:'📱', promo:'🎟',
  };
  return (
    <motion.div
      initial={{ opacity:0, x:-12 }}
      animate={{ opacity:1, x:0 }}
      transition={{ delay:index*0.04, duration:0.22, ease:'easeOut' }}
      style={{
        display:'flex', alignItems:'center', gap:12,
        padding:'13px 0',
        borderBottom: index < total-1 ? `1px solid ${C.border}` : 'none',
      }}
    >
      <div style={{
        width:40, height:40, borderRadius:12, flexShrink:0,
        background: pos ? 'rgba(52,199,89,0.1)' : 'rgba(255,59,48,0.08)',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:18,
      }}>{icons[tx.type]??'⭐'}</div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:14,fontWeight:500,color:C.text,
          whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>
          {tx.description}
        </div>
        <div style={{ fontSize:12, color:C.textSub, marginTop:1 }}>
          {new Date(tx.created_at).toLocaleDateString('ru',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}
        </div>
      </div>
      <div style={{ fontSize:15,fontWeight:700,color:pos?C.green:C.red,flexShrink:0 }}>
        {pos?'+':''}{tx.amount.toLocaleString()}<span style={{fontSize:11,marginLeft:2,color:C.textSub}}>★</span>
      </div>
    </motion.div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────

type TabId = 'buy' | 'history';

export default function StarsPage() {
  const { profile }   = useAuthStore();
  const { balance, transactions, loadBalance, loadTransactions, addStars, loadingTx } = useStarsStore();
  const { showToast } = useUIStore();
  const [tab, setTab] = useState<TabId>('buy');

  useEffect(() => {
    if (!profile) return;
    loadBalance(profile.id);
    loadTransactions(profile.id);
  }, [profile?.id]);

  const handleBuy = async (stars:number, price:number) => {
    if (!profile) return;
    await addStars(profile.id, stars, 'purchase', `Куплено ${stars} Stars`);
    showToast(`+${stars} ★ добавлено!`, 'success');
  };

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:C.bg, overflow:'hidden' }}>

      {/* Header */}
      <motion.div
        initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}}
        style={{ padding:'20px 20px 0', background:C.bg, flexShrink:0 }}
      >
        <h1 style={{ fontSize:24,fontWeight:800,color:C.text,margin:0,letterSpacing:'-0.4px' }}>Stars</h1>
        <p style={{ fontSize:12,color:C.textSub,margin:'2px 0 0' }}>Покупай подарки, номера, юзерники</p>
      </motion.div>

      {/* Tabs */}
      <LayoutGroup>
        <div style={{
          display:'flex', padding:'12px 20px 0',
          borderBottom:`1px solid ${C.border}`,
          flexShrink:0, background:C.bg,
        }}>
          {(['buy','history'] as TabId[]).map(t => {
            const active = tab === t;
            return (
              <motion.button
                key={t} onClick={() => setTab(t)}
                whileTap={{ scale:0.94 }}
                style={{
                  padding:'10px 20px 8px', background:'none', border:'none', cursor:'pointer',
                  position:'relative', color: active?C.accent:C.textSub,
                  fontSize:14, fontWeight:active?700:500, transition:'color 0.2s',
                }}
              >
                {t==='buy'?'Купить':'История'}
                {active && (
                  <motion.div
                    layoutId="stars-tab-line"
                    style={{
                      position:'absolute', bottom:0, left:'10%', right:'10%',
                      height:2.5, borderRadius:2,
                      background:`linear-gradient(90deg,${C.accent},#4f46e5)`,
                    }}
                    transition={{ type:'spring', stiffness:500, damping:38 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </LayoutGroup>

      {/* Content */}
      <div style={{ flex:1, overflowY:'auto', WebkitOverflowScrolling:'touch' } as React.CSSProperties}>
        <AnimatePresence mode="wait" initial={false}>
          {tab==='buy' ? (
            <motion.div
              key="buy"
              initial={{opacity:0,x:-22}} animate={{opacity:1,x:0}} exit={{opacity:0,x:22}}
              transition={{duration:0.26,ease:[0.32,0,0.67,0]}}
            >
              <BalanceCard balance={balance}/>
              <div style={{ padding:'0 16px', display:'flex', flexDirection:'column', gap:10 }}>
                {STARS_TIERS.map((tier,i) => (
                  <TierCard key={tier.stars} stars={tier.stars} price={tier.price_usd}
                    label={tier.label} popular={tier.popular} bonus={tier.bonus}
                    index={i} onBuy={() => handleBuy(tier.stars, tier.price_usd)}/>
                ))}
              </div>
              {profile && <PromoSection userId={profile.id}/>}
              <div style={{height:32}}/>
            </motion.div>
          ) : (
            <motion.div
              key="history"
              initial={{opacity:0,x:22}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-22}}
              transition={{duration:0.26,ease:[0.32,0,0.67,0]}}
            >
              {loadingTx ? (
                <div style={{padding:'48px',textAlign:'center',color:C.textSub,fontSize:14}}>Загрузка...</div>
              ) : transactions.length===0 ? (
                <div style={{padding:'60px 24px',textAlign:'center'}}>
                  <div style={{fontSize:44,marginBottom:12,opacity:.2}}>★</div>
                  <p style={{color:C.textSub,fontSize:14}}>Транзакций пока нет</p>
                  <p style={{color:'#aeaeb2',fontSize:12,marginTop:4}}>Купи Stars или отправь подарок</p>
                </div>
              ) : (
                <div style={{
                  margin:'16px', background:C.surface, borderRadius:20,
                  border:`1px solid ${C.border}`, padding:'4px 16px',
                  boxShadow:'0 1px 6px rgba(0,0,0,0.06)',
                }}>
                  {transactions.map((tx,i) => (
                    <TransactionRow key={tx.id} tx={tx} index={i} total={transactions.length}/>
                  ))}
                </div>
              )}
              <div style={{height:32}}/>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
