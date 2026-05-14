import { useState, useRef } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useStarsStore } from '../store/starsStore';
import { useUIStore } from '../store/uiStore';

// ─── Color tokens (light premium) ────────────────────────────────────────────

const C = {
  bg:         '#f2f2f7',
  surface:    '#ffffff',
  surface2:   '#f9f9fb',
  border:     'rgba(60,60,67,0.1)',
  text:       '#1c1c1e',
  textSub:    '#6e6e73',
  textTert:   '#aeaeb2',
  accent:     '#6d28d9',
  accentBg:   'rgba(109,40,217,0.08)',
  accentBdr:  'rgba(109,40,217,0.2)',
  gold:       '#ff9f0a',
  goldBg:     'rgba(255,159,10,0.1)',
  goldBdr:    'rgba(255,159,10,0.25)',
  red:        '#ff3b30',
  green:      '#34c759',
};

// ─── Gift SVG icons ───────────────────────────────────────────────────────────

function BearIcon({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="11" cy="13" r="7" fill="#c4956a"/>
      <circle cx="37" cy="13" r="7" fill="#c4956a"/>
      <ellipse cx="24" cy="30" rx="17" ry="15" fill="#d4a574"/>
      <circle cx="18" cy="27" r="3.5" fill="#8b5e3c" opacity=".7"/>
      <circle cx="30" cy="27" r="3.5" fill="#8b5e3c" opacity=".7"/>
      <ellipse cx="24" cy="34" rx="6" ry="4" fill="#b8895a"/>
      <circle cx="24" cy="34" r="2.5" fill="#8b5e3c"/>
      <circle cx="11" cy="13" r="4.5" fill="#d4a574"/>
      <circle cx="37" cy="13" r="4.5" fill="#d4a574"/>
    </svg>
  );
}

function RoseIcon({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <path d="M24 8C24 8 14 14 14 22C14 27.52 18.48 32 24 32C29.52 32 34 27.52 34 22C34 14 24 8 24 8Z" fill="#ff6b8a"/>
      <path d="M24 12C24 12 18 17 18 22C18 25.31 20.69 28 24 28C27.31 28 30 25.31 30 22C30 17 24 12 24 12Z" fill="#ff4d6d"/>
      <path d="M24 28V42" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M24 34C22 32 18 30 18 30" stroke="#22c55e" strokeWidth="2" strokeLinecap="round"/>
      <path d="M24 36C26 34 30 32 30 32" stroke="#22c55e" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="24" cy="20" r="3" fill="#ff9eb8" opacity=".6"/>
    </svg>
  );
}

function CarIcon({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <rect x="4" y="24" width="40" height="12" rx="4" fill="#3b82f6"/>
      <path d="M10 24L15 14H33L38 24H10Z" fill="#2563eb"/>
      <rect x="8" y="32" width="6" height="4" rx="2" fill="#1e293b"/>
      <rect x="34" y="32" width="6" height="4" rx="2" fill="#1e293b"/>
      <circle cx="11" cy="34" r="4" fill="#1e293b"/>
      <circle cx="37" cy="34" r="4" fill="#1e293b"/>
      <circle cx="11" cy="34" r="2" fill="#64748b"/>
      <circle cx="37" cy="34" r="2" fill="#64748b"/>
      <rect x="17" y="16" width="7" height="7" rx="1.5" fill="#93c5fd" opacity=".8"/>
      <rect x="25" y="16" width="7" height="7" rx="1.5" fill="#93c5fd" opacity=".8"/>
    </svg>
  );
}

function DiamondIcon({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <path d="M24 6L38 18L24 42L10 18L24 6Z" fill="#60a5fa"/>
      <path d="M24 6L38 18H10L24 6Z" fill="#93c5fd"/>
      <path d="M24 6L32 18L24 42L16 18L24 6Z" fill="#3b82f6" opacity=".6"/>
      <path d="M14 18L24 42L10 18H14Z" fill="#1d4ed8" opacity=".4"/>
      <path d="M34 18L24 42L38 18H34Z" fill="#1d4ed8" opacity=".4"/>
      <path d="M24 12L30 18L24 14L18 18L24 12Z" fill="#fff" opacity=".5"/>
    </svg>
  );
}

function CrownIcon({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <path d="M6 36H42V40H6V36Z" fill="#f59e0b"/>
      <path d="M6 20L12 36H36L42 20L34 28L24 14L14 28L6 20Z" fill="#fbbf24"/>
      <circle cx="6"  cy="20" r="3" fill="#f59e0b"/>
      <circle cx="24" cy="14" r="3" fill="#f59e0b"/>
      <circle cx="42" cy="20" r="3" fill="#f59e0b"/>
      <circle cx="16" cy="33" r="2" fill="#fff" opacity=".5"/>
      <circle cx="24" cy="33" r="2" fill="#fff" opacity=".5"/>
      <circle cx="32" cy="33" r="2" fill="#fff" opacity=".5"/>
    </svg>
  );
}

function RocketIcon({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <path d="M24 4C24 4 36 10 36 26C36 32 33 36 30 38L24 44L18 38C15 36 12 32 12 26C12 10 24 4 24 4Z" fill="#a855f7"/>
      <ellipse cx="24" cy="22" rx="6" ry="8" fill="#e9d5ff"/>
      <circle cx="24" cy="22" r="4" fill="#7c3aed"/>
      <path d="M12 26C8 28 6 34 8 38L12 38C12 34 14 30 18 28L12 26Z" fill="#f97316"/>
      <path d="M36 26C40 28 42 34 40 38L36 38C36 34 34 30 30 28L36 26Z" fill="#f97316"/>
      <path d="M20 38C20 38 20 42 24 44C28 42 28 38 28 38" fill="#f97316" opacity=".7"/>
    </svg>
  );
}

function FlowerIcon({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="14" r="6" fill="#fb7185"/>
      <circle cx="34" cy="20" r="6" fill="#f472b6"/>
      <circle cx="34" cy="32" r="6" fill="#fb7185"/>
      <circle cx="24" cy="38" r="6" fill="#f472b6"/>
      <circle cx="14" cy="32" r="6" fill="#fb7185"/>
      <circle cx="14" cy="20" r="6" fill="#f472b6"/>
      <circle cx="24" cy="26" r="7" fill="#fde68a"/>
      <circle cx="24" cy="26" r="4" fill="#fbbf24"/>
    </svg>
  );
}

function StarGiftIcon({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <path d="M24 6L28.9 16.9L41 18.7L32.5 27L34.7 39L24 33.3L13.3 39L15.5 27L7 18.7L19.1 16.9L24 6Z" fill="#fbbf24"/>
      <path d="M24 10L27.7 18.1L36.8 19.5L30.4 25.7L32 35L24 30.7L16 35L17.6 25.7L11.2 19.5L20.3 18.1L24 10Z" fill="#fff" opacity=".3"/>
    </svg>
  );
}

// ─── Gift data ─────────────────────────────────────────────────────────────────

interface Gift {
  id: string;
  name: string;
  description: string;
  stars: number;
  color: string; // card accent color
  Icon: React.FC<{ size?: number }>;
}

const GIFTS: Gift[] = [
  { id:'g1', name:'Мишка',       description:'Плюшевый мишка',      stars: 50,   color:'#d4a574', Icon: BearIcon   },
  { id:'g2', name:'Роза',        description:'Нежная роза',          stars: 75,   color:'#ff6b8a', Icon: RoseIcon   },
  { id:'g3', name:'Машина',      description:'Крутой болид',         stars: 100,  color:'#3b82f6', Icon: CarIcon    },
  { id:'g4', name:'Ракета',      description:'Взлёт!',               stars: 150,  color:'#a855f7', Icon: RocketIcon },
  { id:'g5', name:'Цветок',      description:'Букет цветов',         stars: 200,  color:'#fb7185', Icon: FlowerIcon },
  { id:'g6', name:'Бриллиант',   description:'Редкая красота',       stars: 500,  color:'#60a5fa', Icon: DiamondIcon},
  { id:'g7', name:'Корона',      description:'Знак избранных',       stars: 1000, color:'#f59e0b', Icon: CrownIcon  },
  { id:'g8', name:'Звезда',      description:'Ультра-подарок',       stars: 2500, color:'#fbbf24', Icon: StarGiftIcon},
];

// ─── Numbers (+999 only) ───────────────────────────────────────────────────────

interface Number999 {
  id: string;
  number: string;
  stars: number;
  tag?: string; // "beautiful" / "premium" / null
}

const NUMBERS: Number999[] = [
  { id:'p1',  number:'+999 900 0001', stars: 25000,  tag: undefined  },
  { id:'p2',  number:'+999 500 1234', stars: 30000,  tag: undefined  },
  { id:'p3',  number:'+999 777 0099', stars: 80000,  tag:'Красивый'  },
  { id:'p4',  number:'+999 100 0000', stars: 90000,  tag:'Красивый'  },
  { id:'p5',  number:'+999 888 1234', stars: 120000, tag:'Красивый'  },
  { id:'p6',  number:'+999 555 5555', stars: 250000, tag:'Премиум'   },
  { id:'p7',  number:'+999 777 7777', stars: 350000, tag:'Премиум'   },
  { id:'p8',  number:'+999 999 9999', stars: 500000, tag:'Премиум'   },
];

// ─── Usernames ─────────────────────────────────────────────────────────────────

interface Username {
  id: string;
  name: string;
  stars: number;
  chars: number;
}

const USERNAMES: Username[] = [
  { id:'u1',  name:'@diamond',  stars: 20000,  chars: 7 },
  { id:'u2',  name:'@crypto',   stars: 20000,  chars: 6 },
  { id:'u3',  name:'@nova',     stars: 35000,  chars: 4 },
  { id:'u4',  name:'@pixel',    stars: 30000,  chars: 5 },
  { id:'u5',  name:'@light',    stars: 35000,  chars: 5 },
  { id:'u6',  name:'@echo',     stars: 35000,  chars: 4 },
  { id:'u7',  name:'@ion',      stars: 85000,  chars: 3 },
  { id:'u8',  name:'@phantom',  stars: 20000,  chars: 7 },
  { id:'u9',  name:'@zen',      stars: 85000,  chars: 3 },
  { id:'u10', name:'@drift',    stars: 30000,  chars: 5 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  if (n >= 1000000) return `${(n/1000000).toFixed(1)}M`;
  if (n >= 1000)    return `${(n/1000).toFixed(0)}K`;
  return String(n);
}

function StarIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
    </svg>
  );
}

function PriceTag({ stars }: { stars: number }) {
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:3,
      fontWeight:700, fontSize:14, color: C.gold,
    }}>
      <StarIcon size={12}/>{fmt(stars)}
    </span>
  );
}

// ─── Gift card ────────────────────────────────────────────────────────────────

function GiftCard({ gift, onBuy }: { gift: Gift; onBuy: () => void }) {
  return (
    <motion.button
      onClick={onBuy}
      whileTap={{ scale: 0.95 }}
      whileHover={{ y: -3, boxShadow: `0 8px 24px ${gift.color}30` }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      style={{
        background: C.surface, border: `1px solid ${C.border}`,
        borderRadius: 20, padding: '20px 16px', cursor: 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        textAlign: 'center', width: '100%',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Color wash */}
      <div style={{
        position:'absolute', top:0, left:0, right:0, height:80,
        background: `linear-gradient(180deg, ${gift.color}18 0%, transparent 100%)`,
        borderRadius: '20px 20px 0 0',
        pointerEvents:'none',
      }}/>
      <div style={{
        width:72, height:72, borderRadius:20,
        background: `${gift.color}14`,
        display:'flex', alignItems:'center', justifyContent:'center',
        position:'relative', zIndex:1,
      }}>
        <gift.Icon size={44}/>
      </div>
      <div style={{ position:'relative', zIndex:1 }}>
        <p style={{ fontSize:14, fontWeight:700, color:C.text, margin:'0 0 2px' }}>{gift.name}</p>
        <p style={{ fontSize:11, color:C.textSub, margin:'0 0 8px' }}>{gift.description}</p>
        <div style={{
          display:'inline-flex', alignItems:'center', gap:4,
          padding:'5px 12px', borderRadius:20,
          background: C.goldBg, border:`1px solid ${C.goldBdr}`,
          color: C.gold, fontWeight:700, fontSize:13,
        }}>
          <StarIcon size={11}/>{gift.stars}
        </div>
      </div>
    </motion.button>
  );
}

// ─── Number row ────────────────────────────────────────────────────────────────

function NumberRow({ num, onBuy }: { num: Number999; onBuy: () => void }) {
  const isPremium = num.tag === 'Премиум';
  const isBeautiful = num.tag === 'Красивый';

  return (
    <motion.button
      onClick={onBuy}
      whileTap={{ scale: 0.97 }}
      whileHover={{ x: 3 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      style={{
        width:'100%', background:C.surface, border:`1px solid ${C.border}`,
        borderRadius:16, padding:'14px 16px', cursor:'pointer',
        display:'flex', alignItems:'center', gap:14,
        boxShadow:'0 1px 4px rgba(0,0,0,0.05)',
        borderLeft: isPremium ? `3px solid ${C.gold}` : isBeautiful ? `3px solid ${C.accent}` : `1px solid ${C.border}`,
      }}
    >
      {/* Bubble */}
      <div style={{
        width:44, height:44, borderRadius:14, flexShrink:0,
        background: isPremium ? `${C.gold}18` : `${C.accent}10`,
        display:'flex', alignItems:'center', justifyContent:'center',
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke={isPremium ? C.gold : C.accent} strokeWidth="1.8"
          strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92V19.92C22 20.48 21.76 21.02 21.34 21.4C20.91 21.78 20.35 21.96 19.78 21.9C16.56 21.55 13.46 20.4 10.77 18.56C8.27 16.88 6.15 14.77 4.48 12.27C2.63 9.57 1.48 6.45 1.14 3.22C1.08 2.65 1.26 2.09 1.64 1.67C2.01 1.24 2.55 1 3.11 1H6.11C7.1.99 7.95 1.69 8.11 2.67C8.24 3.58 8.47 4.47 8.81 5.33C9.07 6.02 8.9 6.8 8.38 7.31L7.09 8.6C8.61 11.19 10.71 13.29 13.3 14.81L14.59 13.52C15.11 13 15.89 12.83 16.58 13.09C17.44 13.43 18.33 13.66 19.24 13.79C20.24 13.95 20.94 14.82 20.91 15.82L22 16.92Z"/>
        </svg>
      </div>

      <div style={{ flex:1, textAlign:'left' }}>
        <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:3 }}>
          <span style={{ fontSize:16, fontWeight:700, color:C.text, letterSpacing:'0.02em' }}>
            {num.number}
          </span>
          {num.tag && (
            <span style={{
              fontSize:9, fontWeight:800, padding:'2px 6px', borderRadius:6,
              background: isPremium ? `${C.gold}18` : `${C.accent}12`,
              color: isPremium ? C.gold : C.accent,
              letterSpacing:'0.06em', textTransform:'uppercase',
            }}>{num.tag}</span>
          )}
        </div>
        <span style={{ fontSize:12, color:C.textSub }}>+999 · Анонимный</span>
      </div>

      <PriceTag stars={num.stars}/>
    </motion.button>
  );
}

// ─── Username row ──────────────────────────────────────────────────────────────

function UsernameRow({ un, onBuy }: { un: Username; onBuy: () => void }) {
  const is3 = un.chars <= 3;
  const is4 = un.chars === 4;
  return (
    <motion.button
      onClick={onBuy}
      whileTap={{ scale: 0.97 }}
      whileHover={{ x: 3 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      style={{
        width:'100%', background:C.surface, border:`1px solid ${C.border}`,
        borderRadius:16, padding:'14px 16px', cursor:'pointer',
        display:'flex', alignItems:'center', gap:14,
        boxShadow:'0 1px 4px rgba(0,0,0,0.05)',
      }}
    >
      <div style={{
        width:44, height:44, borderRadius:14, flexShrink:0,
        background: is3 ? `${C.gold}15` : is4 ? `${C.accent}12` : `rgba(60,60,67,0.06)`,
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:18, fontWeight:800,
        color: is3 ? C.gold : is4 ? C.accent : C.textSub,
      }}>@</div>
      <div style={{ flex:1, textAlign:'left' }}>
        <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:2 }}>
          <span style={{ fontSize:16, fontWeight:700, color:C.text }}>{un.name}</span>
          {is3 && <span style={{
            fontSize:9, fontWeight:800, padding:'2px 6px', borderRadius:6,
            background:`${C.gold}15`, color:C.gold, letterSpacing:'0.06em',
          }}>RARE</span>}
        </div>
        <span style={{ fontSize:12, color:C.textSub }}>{un.chars} символа</span>
      </div>
      <PriceTag stars={un.stars}/>
    </motion.button>
  );
}

// ─── Purchase sheet ────────────────────────────────────────────────────────────

type PurchaseItem =
  | { kind:'gift';     item:Gift }
  | { kind:'number';   item:Number999 }
  | { kind:'username'; item:Username };

function PurchaseSheet({
  item, balance, onConfirm, onClose,
}: { item:PurchaseItem; balance:number; onConfirm:()=>void; onClose:()=>void }) {
  const stars = item.kind==='gift' ? item.item.stars : item.kind==='number' ? item.item.stars : item.item.stars;
  const name  = item.kind==='gift' ? item.item.name  : item.kind==='number' ? item.item.number : item.item.name;
  const canAfford = balance >= stars;

  return (
    <>
      <motion.div
        initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
        onClick={onClose}
        style={{ position:'fixed',inset:0,zIndex:100,background:'rgba(0,0,0,0.35)',backdropFilter:'blur(6px)' }}
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type:'spring', stiffness:420, damping:38 }}
        style={{
          position:'fixed', bottom:0, left:0, right:0, zIndex:101,
          background:C.surface, borderRadius:'24px 24px 0 0',
          padding:'8px 24px 48px',
          boxShadow:'0 -8px 40px rgba(0,0,0,0.15)',
        }}
      >
        {/* Handle */}
        <div style={{ width:36,height:4,borderRadius:2,background:'rgba(60,60,67,0.2)',margin:'0 auto 24px' }}/>

        <h3 style={{ fontSize:20,fontWeight:700,color:C.text,textAlign:'center',marginBottom:6 }}>{name}</h3>
        <p style={{ fontSize:13,color:C.textSub,textAlign:'center',marginBottom:24 }}>
          {item.kind==='gift' ? 'Отправить подарок' : item.kind==='number' ? 'Купить номер' : 'Купить юзернейм'}
        </p>

        <div style={{
          display:'flex',justifyContent:'space-between',alignItems:'center',
          padding:'14px 16px', borderRadius:14,
          background:C.surface2, border:`1px solid ${C.border}`, marginBottom:10,
        }}>
          <span style={{fontSize:14,color:C.textSub}}>Стоимость</span>
          <span style={{fontSize:17,fontWeight:800,color:C.gold,display:'flex',alignItems:'center',gap:4}}>
            <StarIcon size={14}/>{stars.toLocaleString()} Stars
          </span>
        </div>

        <div style={{
          display:'flex',justifyContent:'space-between',alignItems:'center',
          padding:'14px 16px', borderRadius:14,
          background: canAfford ? 'rgba(52,199,89,0.06)' : 'rgba(255,59,48,0.06)',
          border: `1px solid ${canAfford ? 'rgba(52,199,89,0.2)' : 'rgba(255,59,48,0.2)'}`,
          marginBottom:20,
        }}>
          <span style={{fontSize:14,color:C.textSub}}>Ваш баланс</span>
          <span style={{fontSize:15,fontWeight:700,color:canAfford?C.green:C.red,display:'flex',alignItems:'center',gap:4}}>
            <StarIcon size={12}/>{balance.toLocaleString()}
          </span>
        </div>

        <motion.button
          onClick={canAfford ? onConfirm : undefined}
          whileTap={canAfford ? {scale:0.97} : {}}
          style={{
            width:'100%', padding:'16px', borderRadius:16, border:'none',
            cursor: canAfford ? 'pointer' : 'not-allowed',
            fontSize:16, fontWeight:700,
            background: canAfford
              ? 'linear-gradient(135deg, #6d28d9, #2563eb)'
              : 'rgba(60,60,67,0.1)',
            color: canAfford ? '#fff' : C.textTert,
            boxShadow: canAfford ? '0 6px 24px rgba(109,40,217,0.35)' : 'none',
          }}
        >
          {canAfford ? `Купить за ${stars.toLocaleString()} ★` : 'Недостаточно Stars'}
        </motion.button>
      </motion.div>
    </>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

type TabId = 'gifts' | 'numbers' | 'usernames';
const TABS: { id: TabId; label: string }[] = [
  { id:'gifts',     label:'Подарки' },
  { id:'numbers',   label:'Номера' },
  { id:'usernames', label:'Юзерники' },
];
const TAB_ORDER: TabId[] = ['gifts','numbers','usernames'];

// ─── Main page ────────────────────────────────────────────────────────────────

export default function MarketplacePage() {
  const profile  = useAuthStore(s => s.profile);
  const { balance, spendStars } = useStarsStore();
  const { showToast } = useUIStore();

  const [tab, setTab] = useState<TabId>('gifts');
  const prevTabRef = useRef<TabId>('gifts');
  const [purchase, setPurchase] = useState<PurchaseItem | null>(null);

  function switchTab(next: TabId) {
    prevTabRef.current = tab;
    setTab(next);
  }

  const dir = TAB_ORDER.indexOf(tab) >= TAB_ORDER.indexOf(prevTabRef.current) ? 1 : -1;

  const handleConfirm = async () => {
    if (!purchase || !profile) return;
    const stars = purchase.kind==='gift' ? purchase.item.stars : purchase.kind==='number' ? purchase.item.stars : purchase.item.stars;
    const name  = purchase.kind==='gift' ? purchase.item.name  : purchase.kind==='number' ? purchase.item.number : purchase.item.name;
    const ok = await spendStars(profile.id, stars, 'number_buy', `Купил: ${name}`);
    setPurchase(null);
    showToast(ok ? `✓ ${name} куплен!` : 'Недостаточно Stars', ok ? 'success' : 'error');
  };

  return (
    <div style={{ height:'100%', overflowY:'auto', background:C.bg }}>
      {/* Header */}
      <motion.div
        initial={{ opacity:0, y:-10 }}
        animate={{ opacity:1, y:0 }}
        transition={{ duration:0.3, ease:'easeOut' }}
        style={{ padding:'20px 20px 0', background:C.bg }}
      >
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <h1 style={{ fontSize:24,fontWeight:800,color:C.text,margin:0,letterSpacing:'-0.4px' }}>Магазин</h1>
            <p style={{ fontSize:12,color:C.textSub,margin:'2px 0 0' }}>Подарки, номера, юзерники</p>
          </div>
          {/* Balance */}
          <div style={{
            display:'flex', alignItems:'center', gap:5,
            padding:'7px 14px', borderRadius:20,
            background: C.goldBg, border:`1px solid ${C.goldBdr}`,
            color:C.gold, fontWeight:700, fontSize:14,
          }}>
            <StarIcon size={12}/>{balance.toLocaleString()}
          </div>
        </div>
      </motion.div>

      {/* Tabs — animated underline */}
      <LayoutGroup>
        <div style={{
          display:'flex', padding:'16px 20px 0',
          borderBottom:`1px solid ${C.border}`,
          gap:0, background:C.bg,
          position:'sticky', top:0, zIndex:10,
        }}>
          {TABS.map(t => {
            const active = tab === t.id;
            return (
              <motion.button
                key={t.id}
                onClick={() => switchTab(t.id)}
                whileTap={{ scale: 0.95 }}
                style={{
                  flex:1, padding:'12px 0 10px', background:'none', border:'none',
                  cursor:'pointer', position:'relative',
                  color: active ? C.accent : C.textSub,
                  fontSize:14, fontWeight: active ? 700 : 500,
                  transition:'color 0.2s',
                }}
              >
                {t.label}
                {active && (
                  <motion.div
                    layoutId="tab-line"
                    style={{
                      position:'absolute', bottom:0, left:'15%', right:'15%',
                      height:2.5, borderRadius:2,
                      background:`linear-gradient(90deg, ${C.accent}, #4f46e5)`,
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
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={tab}
          initial={{ opacity:0, x: dir * 28 }}
          animate={{ opacity:1, x:0 }}
          exit={{ opacity:0, x: -dir * 28 }}
          transition={{ duration:0.28, ease:[0.32,0,0.67,0] }}
          style={{ padding:'16px 16px 100px' }}
        >
          {/* GIFTS */}
          {tab === 'gifts' && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:12 }}>
              {GIFTS.map((g, i) => (
                <motion.div key={g.id}
                  initial={{opacity:0,y:18}} animate={{opacity:1,y:0}}
                  transition={{delay:i*0.04,duration:0.25,ease:'easeOut'}}>
                  <GiftCard gift={g} onBuy={() => setPurchase({kind:'gift',item:g})} />
                </motion.div>
              ))}
            </div>
          )}

          {/* NUMBERS */}
          {tab === 'numbers' && (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {/* Banner */}
              <motion.div
                initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}
                style={{
                  padding:'14px 16px', borderRadius:16,
                  background:`linear-gradient(135deg, ${C.goldBg}, rgba(109,40,217,0.06))`,
                  border:`1px solid ${C.goldBdr}`, display:'flex', alignItems:'center', gap:12, marginBottom:4,
                }}>
                <span style={{fontSize:28}}>📱</span>
                <div>
                  <p style={{fontSize:13,fontWeight:700,color:C.text,margin:0}}>Анонимные +999 номера</p>
                  <p style={{fontSize:11,color:C.textSub,margin:0}}>Не привязаны к SIM-карте</p>
                </div>
              </motion.div>
              {NUMBERS.map((n, i) => (
                <motion.div key={n.id}
                  initial={{opacity:0,x:-14}} animate={{opacity:1,x:0}}
                  transition={{delay:i*0.04,duration:0.22,ease:'easeOut'}}>
                  <NumberRow num={n} onBuy={() => setPurchase({kind:'number',item:n})}/>
                </motion.div>
              ))}
            </div>
          )}

          {/* USERNAMES */}
          {tab === 'usernames' && (
            <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
              {USERNAMES.map((u, i) => (
                <motion.div key={u.id}
                  initial={{opacity:0,x:-14}} animate={{opacity:1,x:0}}
                  transition={{delay:i*0.04,duration:0.22,ease:'easeOut'}}>
                  <UsernameRow un={u} onBuy={() => setPurchase({kind:'username',item:u})}/>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Purchase sheet */}
      <AnimatePresence>
        {purchase && (
          <PurchaseSheet
            item={purchase}
            balance={balance}
            onConfirm={handleConfirm}
            onClose={() => setPurchase(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
