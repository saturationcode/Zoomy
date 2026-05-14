import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useStarsStore } from '../store/starsStore';
import { useUIStore } from '../store/uiStore';
import { supabase } from '../lib/supabase';
import type { GiftType, AnonymousNumber, NFTUsername, Rarity } from '../types';
import { RARITY_CONFIG } from '../types';

// ─── Placeholder data (used until DB is seeded) ───────────────────────────────

const DEMO_GIFTS: GiftType[] = [
  {
    id: '1', name: 'Flame Heart', description: 'A fiery token of affection',
    emoji_fallback: 'fire-heart',
    animation_url: null, image_url: null,
    rarity: 'legendary', stars_price: 500,
    supply_limit: 1000, total_minted: 247,
    gradient: 'linear-gradient(135deg, #ef4444 0%, #f59e0b 100%)',
    created_at: '',
  },
  {
    id: '2', name: 'Crystal Star', description: 'Rare crystallized starlight',
    emoji_fallback: 'star',
    animation_url: null, image_url: null,
    rarity: 'epic', stars_price: 250,
    supply_limit: 5000, total_minted: 1203,
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #38bdf8 100%)',
    created_at: '',
  },
  {
    id: '3', name: 'Neon Rose', description: 'Synthwave flower in bloom',
    emoji_fallback: 'rose',
    animation_url: null, image_url: null,
    rarity: 'rare', stars_price: 100,
    supply_limit: null, total_minted: 8921,
    gradient: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
    created_at: '',
  },
  {
    id: '4', name: 'Lucky Clover', description: 'For a little good luck',
    emoji_fallback: 'clover',
    animation_url: null, image_url: null,
    rarity: 'common', stars_price: 25,
    supply_limit: null, total_minted: 42100,
    gradient: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
    created_at: '',
  },
  {
    id: '5', name: 'Thunder Bolt', description: 'Raw power channeled',
    emoji_fallback: 'bolt',
    animation_url: null, image_url: null,
    rarity: 'epic', stars_price: 300,
    supply_limit: 2000, total_minted: 589,
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #7c3aed 100%)',
    created_at: '',
  },
  {
    id: '6', name: 'Ice Comet', description: 'A frozen trail across the void',
    emoji_fallback: 'comet',
    animation_url: null, image_url: null,
    rarity: 'legendary', stars_price: 1000,
    supply_limit: 100, total_minted: 12,
    gradient: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)',
    created_at: '',
  },
];

const DEMO_NUMBERS: AnonymousNumber[] = [
  { id: 'n1', number: '+888 100 2049', owner_id: null, stars_price: 500, is_available: true, rarity: 'rare', flag: 'fragment', created_at: '' },
  { id: 'n2', number: '+888 777 0001', owner_id: null, stars_price: 2500, is_available: true, rarity: 'legendary', flag: 'fragment', created_at: '' },
  { id: 'n3', number: '+888 420 6969', owner_id: null, stars_price: 1200, is_available: true, rarity: 'epic', flag: 'fragment', created_at: '' },
  { id: 'n4', number: '+888 200 0042', owner_id: null, stars_price: 300, is_available: true, rarity: 'common', flag: 'fragment', created_at: '' },
  { id: 'n5', number: '+888 100 8888', owner_id: null, stars_price: 5000, is_available: true, rarity: 'legendary', flag: 'fragment', created_at: '' },
];

const DEMO_USERNAMES: NFTUsername[] = [
  { id: 'u1', username: '@diamond',  owner_id: null, stars_price: 50000, is_listed: true, rarity: 'legendary', created_at: '' },
  { id: 'u2', username: '@crypto',   owner_id: null, stars_price: 25000, is_listed: true, rarity: 'legendary', created_at: '' },
  { id: 'u3', username: '@nova',     owner_id: null, stars_price: 10000, is_listed: true, rarity: 'epic', created_at: '' },
  { id: 'u4', username: '@pixel',    owner_id: null, stars_price: 5000,  is_listed: true, rarity: 'rare', created_at: '' },
  { id: 'u5', username: '@light',    owner_id: null, stars_price: 8000,  is_listed: true, rarity: 'epic', created_at: '' },
  { id: 'u6', username: '@echo',     owner_id: null, stars_price: 2500,  is_listed: true, rarity: 'rare', created_at: '' },
  { id: 'u7', username: '@sprout',   owner_id: null, stars_price: 500,   is_listed: true, rarity: 'common', created_at: '' },
];

// ─── Rarity badge ─────────────────────────────────────────────────────────────

function RarityBadge({ rarity }: { rarity: Rarity }) {
  const cfg = RARITY_CONFIG[rarity];
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: '2px 7px',
      borderRadius: 20, letterSpacing: '0.04em',
      textTransform: 'uppercase',
      color: cfg.color,
      background: cfg.bg,
      border: `1px solid ${cfg.glow}`,
      display: 'inline-flex', alignItems: 'center',
    }}>
      {cfg.label}
    </span>
  );
}

// ─── Gift card ────────────────────────────────────────────────────────────────

function GiftCard({ gift, onSend }: { gift: GiftType; onSend: (gift: GiftType) => void }) {
  const rarityGlow = RARITY_CONFIG[gift.rarity].glow;

  return (
    <motion.div
      whileTap={{ scale: 0.95 }}
      onClick={() => onSend(gift)}
      style={{
        borderRadius: 20,
        overflow: 'hidden',
        border: `1px solid ${RARITY_CONFIG[gift.rarity].glow}`,
        background: 'rgba(255,255,255,.03)',
        cursor: 'pointer',
        boxShadow: `0 4px 20px ${rarityGlow}33`,
        position: 'relative',
      }}
    >
      {/* Gift visual */}
      <div style={{
        height: 120,
        background: gift.gradient,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 42,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div className="gift-shimmer" style={{ position: 'absolute', inset: 0 }} />
        <GiftEmoji type={gift.emoji_fallback} />
      </div>

      {/* Info */}
      <div style={{ padding: '12px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', lineHeight: 1.3 }}>
            {gift.name}
          </span>
          <RarityBadge rarity={gift.rarity} />
        </div>
        {gift.supply_limit && (
          <p style={{ fontSize: 11, color: '#4b5563', marginTop: 4 }}>
            {gift.total_minted.toLocaleString()} / {gift.supply_limit.toLocaleString()} minted
          </p>
        )}
        <div style={{
          marginTop: 10, padding: '7px 0',
          borderTop: '1px solid rgba(255,255,255,.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#fbbf24' }}>
            <span style={{ fontSize: 14 }}>★</span>
            <span style={{ fontSize: 15, fontWeight: 800, color: '#f1f5f9' }}>
              {gift.stars_price.toLocaleString()}
            </span>
          </div>
          <span style={{ fontSize: 12, color: '#4b5563' }}>Tap to send</span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Gift emoji SVG map ───────────────────────────────────────────────────────

function GiftEmoji({ type }: { type: string }) {
  const map: Record<string, React.ReactNode> = {
    'fire-heart': (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <path d="M24 42C24 42 8 32 8 20C8 14.477 12.477 10 18 10C20.657 10 23.093 11.044 24.911 12.8C24.388 13.996 24 15.462 24 17C24 21.418 27.582 25 32 25C33.692 25 35.26 24.471 36.552 23.575C37.476 24.924 38 26.396 38 28C38 36 24 42 24 42Z" fill="rgba(255,255,255,.15)" stroke="rgba(255,255,255,.4)" strokeWidth="1.5"/>
        <path d="M38 16C38 22 32 26 32 26C32 26 26 22 26 16C26 12.686 28.686 10 32 10C35.314 10 38 12.686 38 16Z" fill="rgba(255,255,255,.2)" stroke="rgba(255,255,255,.5)" strokeWidth="1.5"/>
      </svg>
    ),
    'star': (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <path d="M24 6L28.5 17H40L31 24L34.5 36L24 29.5L13.5 36L17 24L8 17H19.5L24 6Z" fill="rgba(255,255,255,.25)" stroke="rgba(255,255,255,.6)" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    ),
    'rose': (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="20" r="8" fill="rgba(255,255,255,.2)" stroke="rgba(255,255,255,.5)" strokeWidth="1.5"/>
        <circle cx="24" cy="20" r="4" fill="rgba(255,255,255,.3)"/>
        <path d="M24 28V40" stroke="rgba(255,255,255,.4)" strokeWidth="2" strokeLinecap="round"/>
        <path d="M20 34L16 30" stroke="rgba(255,255,255,.3)" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    'clover': (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="18" r="6" fill="rgba(255,255,255,.2)" stroke="rgba(255,255,255,.5)" strokeWidth="1.5"/>
        <circle cx="18" cy="26" r="6" fill="rgba(255,255,255,.2)" stroke="rgba(255,255,255,.5)" strokeWidth="1.5"/>
        <circle cx="30" cy="26" r="6" fill="rgba(255,255,255,.2)" stroke="rgba(255,255,255,.5)" strokeWidth="1.5"/>
        <circle cx="24" cy="26" r="4" fill="rgba(255,255,255,.15)"/>
        <path d="M24 30V40" stroke="rgba(255,255,255,.4)" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    'bolt': (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <path d="M28 8L16 26H24L20 40L32 22H24L28 8Z" fill="rgba(255,255,255,.3)" stroke="rgba(255,255,255,.6)" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    ),
    'comet': (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <circle cx="30" cy="18" r="8" fill="rgba(255,255,255,.25)" stroke="rgba(255,255,255,.5)" strokeWidth="1.5"/>
        <path d="M24 24L10 38" stroke="rgba(255,255,255,.4)" strokeWidth="3" strokeLinecap="round"/>
        <path d="M22 26L12 34" stroke="rgba(255,255,255,.2)" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  };

  return <>{map[type] ?? <span style={{ fontSize: 36, filter: 'grayscale(1) brightness(2)' }}>✦</span>}</>;
}

// ─── Numbers tab ──────────────────────────────────────────────────────────────

function NumberCard({ item, onBuy }: { item: AnonymousNumber; onBuy: (item: AnonymousNumber) => void }) {
  const cfg = RARITY_CONFIG[item.rarity];
  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      onClick={() => onBuy(item)}
      style={{
        padding: '16px 20px',
        borderRadius: 18,
        background: 'rgba(255,255,255,.03)',
        border: `1px solid ${cfg.glow}44`,
        display: 'flex', alignItems: 'center', gap: 14,
        cursor: 'pointer',
      }}
    >
      <div style={{
        width: 46, height: 46, borderRadius: 14,
        background: cfg.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
          stroke={cfg.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92V19.92C22.0011 20.4853 21.7605 21.0238 21.3353 21.4001C20.9101 21.7764 20.3474 21.9565 19.78 21.9C16.5552 21.5517 13.4574 20.4013 10.77 18.56C8.27078 16.8836 6.15447 14.7673 4.48 12.27C2.6325 9.57063 1.48179 6.45987 1.14 3.22C1.08355 2.65452 1.2625 2.09319 1.63677 1.66855C2.01104 1.24391 2.54693 1.00297 3.11 1H6.11C7.10519 0.990206 7.95287 1.68546 8.11 2.67C8.23662 3.58 8.47145 4.47273 8.81 5.33C9.07413 6.01886 8.90477 6.79617 8.38 7.31L7.09 8.6C8.61448 11.1856 10.7144 13.2855 13.3 14.81L14.59 13.52C15.1138 12.9952 15.8911 12.8259 16.58 13.09C17.4373 13.4286 18.33 13.6634 19.24 13.79C20.2395 13.9487 20.9381 14.8136 20.91 15.82L22 16.92Z"/>
        </svg>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', fontFamily: 'monospace' }}>
          {item.number}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
          <RarityBadge rarity={item.rarity} />
          <span style={{ fontSize: 11, color: '#4b5563' }}>Anonymous · Fragment</span>
        </div>
      </div>

      <div style={{
        padding: '7px 13px',
        borderRadius: 12,
        background: 'linear-gradient(135deg, rgba(124,58,237,.2), rgba(37,99,235,.15))',
        border: '1px solid rgba(124,58,237,.2)',
        flexShrink: 0,
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#f1f5f9' }}>
          {item.stars_price.toLocaleString()}
        </div>
        <div style={{ fontSize: 10, color: '#fbbf24', marginTop: 1 }}>★ Stars</div>
      </div>
    </motion.div>
  );
}

// ─── Usernames tab ────────────────────────────────────────────────────────────

function UsernameCard({ item, onBuy }: { item: NFTUsername; onBuy: (item: NFTUsername) => void }) {
  const cfg = RARITY_CONFIG[item.rarity];
  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      onClick={() => onBuy(item)}
      style={{
        padding: '14px 18px',
        borderRadius: 18,
        background: 'rgba(255,255,255,.03)',
        border: `1px solid ${cfg.glow}44`,
        display: 'flex', alignItems: 'center', gap: 12,
        cursor: 'pointer',
      }}
    >
      <div style={{
        width: 42, height: 42, borderRadius: 12,
        background: cfg.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18, fontWeight: 900, color: cfg.color,
        flexShrink: 0,
      }}>
        @
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>
          {item.username}
        </div>
        <div style={{ marginTop: 3 }}>
          <RarityBadge rarity={item.rarity} />
        </div>
      </div>

      <div style={{
        padding: '7px 13px', borderRadius: 12,
        background: 'linear-gradient(135deg, rgba(124,58,237,.2), rgba(37,99,235,.15))',
        border: '1px solid rgba(124,58,237,.2)',
        flexShrink: 0, textAlign: 'center',
      }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#f1f5f9' }}>
          {item.stars_price >= 1000
            ? `${(item.stars_price / 1000).toFixed(0)}k`
            : item.stars_price.toLocaleString()}
        </div>
        <div style={{ fontSize: 10, color: '#fbbf24', marginTop: 1 }}>★ Stars</div>
      </div>
    </motion.div>
  );
}

// ─── Gift send modal ──────────────────────────────────────────────────────────

function GiftSendModal({
  gift, onClose, onConfirm
}: {
  gift: GiftType;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const { balance } = useStarsStore();
  const canAfford = balance >= gift.stars_price;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,.7)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        padding: '0 0 env(safe-area-inset-bottom, 0px)',
      }}
    >
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 480,
          background: 'rgba(13,13,26,.98)',
          border: '1px solid rgba(255,255,255,.1)',
          borderRadius: '24px 24px 0 0',
          padding: '24px 24px 32px',
        }}
      >
        {/* Gift preview */}
        <div style={{
          height: 140,
          borderRadius: 18,
          background: gift.gradient,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 20,
          position: 'relative', overflow: 'hidden',
        }}>
          <div className="gift-shimmer" style={{ position: 'absolute', inset: 0 }} />
          <div className="gift-receive-anim">
            <GiftEmoji type={gift.emoji_fallback} />
          </div>
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#f1f5f9', marginBottom: 4 }}>
          {gift.name}
        </h2>
        <p style={{ fontSize: 14, color: '#64748b', marginBottom: 16 }}>{gift.description}</p>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <RarityBadge rarity={gift.rarity} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ fontSize: 14, color: '#fbbf24' }}>★</span>
            <span style={{ fontSize: 17, fontWeight: 800, color: '#f1f5f9' }}>
              {gift.stars_price.toLocaleString()}
            </span>
          </div>
        </div>

        {!canAfford && (
          <div style={{
            padding: '10px 14px', borderRadius: 12, marginBottom: 14,
            background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)',
            fontSize: 13, color: '#f87171',
          }}>
            Insufficient Stars — you have {balance.toLocaleString()} ★
          </div>
        )}

        <button
          onClick={onConfirm}
          disabled={!canAfford}
          className="btn-primary"
          style={{ marginBottom: 10 }}
        >
          Send Gift · {gift.stars_price.toLocaleString()} ★
        </button>
        <button onClick={onClose} className="btn-ghost" style={{ width: '100%' }}>
          Cancel
        </button>
      </motion.div>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

type TabId = 'gifts' | 'numbers' | 'usernames';

export default function MarketplacePage() {
  const { profile } = useAuthStore();
  const { balance, spendStars } = useStarsStore();
  const { showToast } = useUIStore();
  const [tab, setTab] = useState<TabId>('gifts');
  const [selectedGift, setSelectedGift] = useState<GiftType | null>(null);

  const handleSendGift = (gift: GiftType) => setSelectedGift(gift);

  const handleConfirmGift = async () => {
    if (!selectedGift || !profile) return;
    const ok = await spendStars(
      profile.id, selectedGift.stars_price,
      'gift_send', `Sent ${selectedGift.name}`,
    );
    if (ok) {
      showToast(`${selectedGift.name} sent!`, 'success');
      setSelectedGift(null);
    } else {
      showToast('Not enough Stars', 'error');
    }
  };

  const handleBuyNumber = async (item: AnonymousNumber) => {
    if (!profile) return;
    const ok = await spendStars(profile.id, item.stars_price, 'number_buy', `Bought ${item.number}`);
    showToast(ok ? `${item.number} is yours!` : 'Not enough Stars', ok ? 'success' : 'error');
  };

  const handleBuyUsername = async (item: NFTUsername) => {
    if (!profile) return;
    const ok = await spendStars(profile.id, item.stars_price, 'username_buy', `Bought ${item.username}`);
    showToast(ok ? `${item.username} is yours!` : 'Not enough Stars', ok ? 'success' : 'error');
  };

  const tabs: { id: TabId; label: string }[] = [
    { id: 'gifts',     label: 'Gifts'     },
    { id: 'numbers',   label: 'Numbers'   },
    { id: 'usernames', label: 'Usernames' },
  ];

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: '#07070f', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px 12px',
        borderBottom: '1px solid rgba(255,255,255,.06)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.3px' }}>
            Marketplace
          </h1>
          {/* Stars balance chip */}
          <div className="stars-badge">
            <span>★</span>
            <span>{balance.toLocaleString()}</span>
          </div>
        </div>
        <p style={{ fontSize: 13, color: '#4b5563', marginTop: 4 }}>
          NFT gifts, anonymous numbers, rare usernames
        </p>
      </div>

      {/* Tab bar */}
      <div style={{
        display: 'flex', gap: 6, padding: '12px 16px 0',
        flexShrink: 0,
      }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              flex: 1,
              padding: '8px 0',
              borderRadius: 20,
              border: 'none',
              background: tab === t.id
                ? 'linear-gradient(135deg, rgba(124,58,237,.28), rgba(37,99,235,.18))'
                : 'rgba(255,255,255,.04)',
              color: tab === t.id ? '#a78bfa' : '#4b5563',
              fontSize: 13, fontWeight: 600,
              cursor: 'pointer', transition: 'all .15s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="scroll-container" style={{ flex: 1, paddingTop: 16 }}>
        <AnimatePresence mode="wait" initial={false}>
          {tab === 'gifts' && (
            <motion.div
              key="gifts"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 12,
                padding: '0 16px',
              }}
            >
              {DEMO_GIFTS.map((g, i) => (
                <motion.div key={g.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <GiftCard gift={g} onSend={handleSendGift} />
                </motion.div>
              ))}
              <div style={{ gridColumn: '1 / -1', height: 16 }} />
            </motion.div>
          )}

          {tab === 'numbers' && (
            <motion.div
              key="numbers"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 16px' }}
            >
              {DEMO_NUMBERS.map((n, i) => (
                <motion.div key={n.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                  <NumberCard item={n} onBuy={handleBuyNumber} />
                </motion.div>
              ))}
              <div style={{ height: 16 }} />
            </motion.div>
          )}

          {tab === 'usernames' && (
            <motion.div
              key="usernames"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 16px' }}
            >
              {DEMO_USERNAMES.map((u, i) => (
                <motion.div key={u.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                  <UsernameCard item={u} onBuy={handleBuyUsername} />
                </motion.div>
              ))}
              <div style={{ height: 16 }} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Gift send modal */}
      <AnimatePresence>
        {selectedGift && (
          <GiftSendModal
            gift={selectedGift}
            onClose={() => setSelectedGift(null)}
            onConfirm={handleConfirmGift}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
