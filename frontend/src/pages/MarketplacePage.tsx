import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useStarsStore } from '../store/starsStore';
import { useUIStore } from '../store/uiStore';
import type { GiftType, AnonymousNumber, NFTUsername, Rarity } from '../types';
import { RARITY_CONFIG } from '../types';

// ─── Demo data ────────────────────────────────────────────────────────────────

const DEMO_GIFTS: GiftType[] = [
  {
    id: '1', name: 'Flame Heart', description: 'A fiery token of affection',
    emoji_fallback: 'fire-heart', animation_url: null, image_url: null,
    rarity: 'legendary', stars_price: 500,
    supply_limit: 1000, total_minted: 247,
    gradient: 'linear-gradient(135deg, #ef4444 0%, #f59e0b 100%)',
    created_at: '',
  },
  {
    id: '2', name: 'Crystal Star', description: 'Rare crystallized starlight',
    emoji_fallback: 'star', animation_url: null, image_url: null,
    rarity: 'epic', stars_price: 250,
    supply_limit: 5000, total_minted: 1203,
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #38bdf8 100%)',
    created_at: '',
  },
  {
    id: '3', name: 'Neon Rose', description: 'Synthwave flower in bloom',
    emoji_fallback: 'rose', animation_url: null, image_url: null,
    rarity: 'rare', stars_price: 100,
    supply_limit: null, total_minted: 8921,
    gradient: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
    created_at: '',
  },
  {
    id: '4', name: 'Lucky Clover', description: 'For a little good luck',
    emoji_fallback: 'clover', animation_url: null, image_url: null,
    rarity: 'common', stars_price: 25,
    supply_limit: null, total_minted: 42100,
    gradient: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
    created_at: '',
  },
  {
    id: '5', name: 'Thunder Bolt', description: 'Raw power channeled',
    emoji_fallback: 'bolt', animation_url: null, image_url: null,
    rarity: 'epic', stars_price: 300,
    supply_limit: 2000, total_minted: 589,
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #7c3aed 100%)',
    created_at: '',
  },
  {
    id: '6', name: 'Ice Comet', description: 'A frozen trail across the void',
    emoji_fallback: 'comet', animation_url: null, image_url: null,
    rarity: 'legendary', stars_price: 1000,
    supply_limit: 100, total_minted: 12,
    gradient: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)',
    created_at: '',
  },
  {
    id: '7', name: 'Golden Crown', description: 'Wear the mark of royalty',
    emoji_fallback: 'crown', animation_url: null, image_url: null,
    rarity: 'legendary', stars_price: 2000,
    supply_limit: 50, total_minted: 7,
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    created_at: '',
  },
  {
    id: '8', name: 'Shadow Orb', description: 'Darkness compressed into beauty',
    emoji_fallback: 'orb', animation_url: null, image_url: null,
    rarity: 'epic', stars_price: 400,
    supply_limit: 3000, total_minted: 921,
    gradient: 'linear-gradient(135deg, #1e1b4b 0%, #7c3aed 100%)',
    created_at: '',
  },
];

const DEMO_NUMBERS: AnonymousNumber[] = [
  { id: 'n1', number: '+888 100 2049', owner_id: null, stars_price: 500,  is_available: true, rarity: 'rare',      flag: 'fragment', created_at: '' },
  { id: 'n2', number: '+888 777 0001', owner_id: null, stars_price: 2500, is_available: true, rarity: 'legendary', flag: 'fragment', created_at: '' },
  { id: 'n3', number: '+888 420 6969', owner_id: null, stars_price: 1200, is_available: true, rarity: 'epic',      flag: 'fragment', created_at: '' },
  { id: 'n4', number: '+888 200 0042', owner_id: null, stars_price: 300,  is_available: true, rarity: 'common',    flag: 'fragment', created_at: '' },
  { id: 'n5', number: '+888 100 8888', owner_id: null, stars_price: 5000, is_available: true, rarity: 'legendary', flag: 'fragment', created_at: '' },
  { id: 'n6', number: '+888 333 3333', owner_id: null, stars_price: 7500, is_available: true, rarity: 'legendary', flag: 'fragment', created_at: '' },
  { id: 'n7', number: '+888 555 0099', owner_id: null, stars_price: 800,  is_available: true, rarity: 'rare',      flag: 'fragment', created_at: '' },
  { id: 'n8', number: '+888 010 0101', owner_id: null, stars_price: 150,  is_available: true, rarity: 'common',    flag: 'fragment', created_at: '' },
];

const DEMO_USERNAMES: NFTUsername[] = [
  { id: 'u1',  username: '@diamond',   owner_id: null, stars_price: 50000, is_listed: true, rarity: 'legendary', created_at: '' },
  { id: 'u2',  username: '@crypto',    owner_id: null, stars_price: 25000, is_listed: true, rarity: 'legendary', created_at: '' },
  { id: 'u3',  username: '@nova',      owner_id: null, stars_price: 10000, is_listed: true, rarity: 'epic',      created_at: '' },
  { id: 'u4',  username: '@pixel',     owner_id: null, stars_price: 5000,  is_listed: true, rarity: 'rare',      created_at: '' },
  { id: 'u5',  username: '@light',     owner_id: null, stars_price: 8000,  is_listed: true, rarity: 'epic',      created_at: '' },
  { id: 'u6',  username: '@echo',      owner_id: null, stars_price: 2500,  is_listed: true, rarity: 'rare',      created_at: '' },
  { id: 'u7',  username: '@sprout',    owner_id: null, stars_price: 500,   is_listed: true, rarity: 'common',    created_at: '' },
  { id: 'u8',  username: '@phantom',   owner_id: null, stars_price: 18000, is_listed: true, rarity: 'legendary', created_at: '' },
  { id: 'u9',  username: '@zenith',    owner_id: null, stars_price: 12000, is_listed: true, rarity: 'epic',      created_at: '' },
  { id: 'u10', username: '@drift',     owner_id: null, stars_price: 3200,  is_listed: true, rarity: 'rare',      created_at: '' },
];

// ─── Tabs ─────────────────────────────────────────────────────────────────────

type TabId = 'gifts' | 'numbers' | 'usernames';
const TAB_ORDER: TabId[] = ['gifts', 'numbers', 'usernames'];

// ─── Gift filter chips ────────────────────────────────────────────────────────

type GiftFilter = 'all' | 'legendary' | 'epic' | 'rare' | 'common' | 'trending';
type RarityFilter = 'all' | 'legendary' | 'epic' | 'rare' | 'common';
type UsernameFilter = 'all' | 'trending' | 'legendary' | 'epic' | 'rare' | 'common';
type SortMode = 'price-asc' | 'price-desc';

// ─── SVG icons ────────────────────────────────────────────────────────────────

function IconPhone() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92V19.92C22.0011 20.4853 21.7605 21.0238 21.3353 21.4001C20.9101 21.7764 20.3474 21.9565 19.78 21.9C16.5552 21.5517 13.4574 20.4013 10.77 18.56C8.27078 16.8836 6.15447 14.7673 4.48 12.27C2.6325 9.57063 1.48179 6.45987 1.14 3.22C1.08355 2.65452 1.2625 2.09319 1.63677 1.66855C2.01104 1.24391 2.54693 1.00297 3.11 1H6.11C7.10519 0.990206 7.95287 1.68546 8.11 2.67C8.23662 3.58 8.47145 4.47273 8.81 5.33C9.07413 6.01886 8.90477 6.79617 8.38 7.31L7.09 8.6C8.61448 11.1856 10.7144 13.2855 13.3 14.81L14.59 13.52C15.1138 12.9952 15.8911 12.8259 16.58 13.09C17.4373 13.4286 18.33 13.6634 19.24 13.79C20.2395 13.9487 20.9381 14.8136 20.91 15.82L22 16.92Z"/>
    </svg>
  );
}

function IconFire() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 3z"/>
    </svg>
  );
}

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

// ─── Filter chip ──────────────────────────────────────────────────────────────

function FilterChip({
  label, active, onClick,
}: {
  label: string; active: boolean; onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.92 }}
      animate={active
        ? { scale: 1.04, background: 'rgba(124,58,237,.22)', borderColor: 'rgba(124,58,237,.4)', color: '#a78bfa' }
        : { scale: 1, background: 'rgba(255,255,255,.04)', borderColor: 'rgba(255,255,255,.08)', color: '#64748b' }
      }
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      style={{
        padding: '6px 14px',
        borderRadius: 20,
        border: '1px solid',
        fontSize: 12, fontWeight: 600,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
    >
      {label}
    </motion.button>
  );
}

// ─── Gift SVG art map ─────────────────────────────────────────────────────────

function GiftArt({ type }: { type: string }) {
  const map: Record<string, React.ReactNode> = {
    'fire-heart': (
      <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
        <path d="M26 44C26 44 10 33 10 20C10 14.477 14.477 10 20 10C22.657 10 25.093 11.044 26.911 12.8C26.388 13.996 26 15.462 26 17C26 21.418 29.582 25 34 25C35.692 25 37.26 24.471 38.552 23.575C39.476 24.924 40 26.396 40 28C40 36 26 44 26 44Z"
          fill="rgba(255,255,255,.15)" stroke="rgba(255,255,255,.5)" strokeWidth="1.5"/>
        <path d="M40 16C40 22 34 26 34 26C34 26 28 22 28 16C28 12.686 30.686 10 34 10C37.314 10 40 12.686 40 16Z"
          fill="rgba(255,255,255,.22)" stroke="rgba(255,255,255,.6)" strokeWidth="1.5"/>
      </svg>
    ),
    'star': (
      <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
        <path d="M26 7L30.5 18H42L33 25L36.5 37L26 30.5L15.5 37L19 25L10 18H21.5L26 7Z"
          fill="rgba(255,255,255,.25)" stroke="rgba(255,255,255,.6)" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M26 13L28.8 20.2H36.4L30.3 24.6L32.6 31.8L26 27.8L19.4 31.8L21.7 24.6L15.6 20.2H23.2L26 13Z"
          fill="rgba(255,255,255,.15)"/>
      </svg>
    ),
    'rose': (
      <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
        <circle cx="26" cy="20" r="9" fill="rgba(255,255,255,.18)" stroke="rgba(255,255,255,.55)" strokeWidth="1.5"/>
        <circle cx="26" cy="20" r="5" fill="rgba(255,255,255,.28)" stroke="rgba(255,255,255,.45)" strokeWidth="1"/>
        <circle cx="26" cy="20" r="2.5" fill="rgba(255,255,255,.4)"/>
        <path d="M26 29V42" stroke="rgba(255,255,255,.45)" strokeWidth="2" strokeLinecap="round"/>
        <path d="M22 36L17 31" stroke="rgba(255,255,255,.3)" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M30 34L35 29" stroke="rgba(255,255,255,.2)" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    'clover': (
      <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
        <circle cx="26" cy="18" r="7" fill="rgba(255,255,255,.2)" stroke="rgba(255,255,255,.5)" strokeWidth="1.5"/>
        <circle cx="18" cy="28" r="7" fill="rgba(255,255,255,.2)" stroke="rgba(255,255,255,.5)" strokeWidth="1.5"/>
        <circle cx="34" cy="28" r="7" fill="rgba(255,255,255,.2)" stroke="rgba(255,255,255,.5)" strokeWidth="1.5"/>
        <circle cx="26" cy="26" r="5" fill="rgba(255,255,255,.12)"/>
        <path d="M26 32V43" stroke="rgba(255,255,255,.45)" strokeWidth="2" strokeLinecap="round"/>
        <path d="M22 43H30" stroke="rgba(255,255,255,.3)" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    'bolt': (
      <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
        <path d="M30 7L17 27H26L22 45L35 25H26L30 7Z"
          fill="rgba(255,255,255,.28)" stroke="rgba(255,255,255,.65)" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    ),
    'comet': (
      <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
        <circle cx="34" cy="18" r="9" fill="rgba(255,255,255,.25)" stroke="rgba(255,255,255,.55)" strokeWidth="1.5"/>
        <path d="M27 25L10 42" stroke="rgba(255,255,255,.45)" strokeWidth="3.5" strokeLinecap="round"/>
        <path d="M25 28L14 37" stroke="rgba(255,255,255,.2)" strokeWidth="2" strokeLinecap="round"/>
        <path d="M23 31L15 38" stroke="rgba(255,255,255,.12)" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    'crown': (
      <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
        <path d="M10 38H42L38 18L30 28L26 14L22 28L14 18L10 38Z"
          fill="rgba(255,255,255,.22)" stroke="rgba(255,255,255,.6)" strokeWidth="1.5" strokeLinejoin="round"/>
        <rect x="10" y="38" width="32" height="5" rx="2.5"
          fill="rgba(255,255,255,.2)" stroke="rgba(255,255,255,.45)" strokeWidth="1"/>
        <circle cx="26" cy="14" r="2.5" fill="rgba(255,255,255,.6)"/>
        <circle cx="14" cy="18" r="2.5" fill="rgba(255,255,255,.5)"/>
        <circle cx="38" cy="18" r="2.5" fill="rgba(255,255,255,.5)"/>
      </svg>
    ),
    'orb': (
      <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
        <circle cx="26" cy="26" r="16" fill="rgba(255,255,255,.08)" stroke="rgba(255,255,255,.4)" strokeWidth="1.5"/>
        <circle cx="26" cy="26" r="10" fill="rgba(255,255,255,.12)" stroke="rgba(255,255,255,.3)" strokeWidth="1"/>
        <circle cx="26" cy="26" r="5" fill="rgba(255,255,255,.25)"/>
        <circle cx="20" cy="20" r="3" fill="rgba(255,255,255,.35)" stroke="rgba(255,255,255,.5)" strokeWidth="0.5"/>
        <path d="M10 26C10 17.163 17.163 10 26 10" stroke="rgba(255,255,255,.3)" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  };
  return <>{map[type] ?? (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
      <polygon points="26,8 32,20 46,22 36,32 38,46 26,40 14,46 16,32 6,22 20,20"
        fill="rgba(255,255,255,.2)" stroke="rgba(255,255,255,.5)" strokeWidth="1.5"/>
    </svg>
  )}</>;
}

// ─── Gift card ────────────────────────────────────────────────────────────────

function GiftCard({
  gift, index, trending, onTap,
}: {
  gift: GiftType; index: number; trending: boolean; onTap: (g: GiftType) => void;
}) {
  const cfg = RARITY_CONFIG[gift.rarity];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.055, type: 'spring', stiffness: 380, damping: 28 }}
      whileHover={{ y: -4, boxShadow: `0 12px 40px ${cfg.glow}` }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onTap(gift)}
      style={{
        borderRadius: 20,
        overflow: 'hidden',
        border: `1px solid ${cfg.glow}`,
        background: 'rgba(255,255,255,.03)',
        cursor: 'pointer',
        boxShadow: `0 4px 20px ${cfg.glow}33`,
        position: 'relative',
      }}
    >
      {/* Trending badge */}
      {trending && (
        <div style={{
          position: 'absolute', top: 10, left: 10, zIndex: 2,
          display: 'flex', alignItems: 'center', gap: 4,
          background: 'rgba(239,68,68,.85)', backdropFilter: 'blur(4px)',
          borderRadius: 10, padding: '3px 8px',
          fontSize: 10, fontWeight: 700, color: '#fff',
        }}>
          <IconFire />
          Trending
        </div>
      )}

      {/* Visual area */}
      <div style={{
        height: 120,
        background: gift.gradient,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        <div className="gift-shimmer" style={{ position: 'absolute', inset: 0 }} />
        <GiftArt type={gift.emoji_fallback} />
      </div>

      {/* Info */}
      <div style={{ padding: '12px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', lineHeight: 1.3 }}>
            {gift.name}
          </span>
          <RarityBadge rarity={gift.rarity} />
        </div>

        {gift.supply_limit && (
          <p style={{ fontSize: 10, color: '#4b5563', marginTop: 4 }}>
            {gift.total_minted.toLocaleString()} / {gift.supply_limit.toLocaleString()} minted
          </p>
        )}

        <div style={{
          marginTop: 10, paddingTop: 8,
          borderTop: '1px solid rgba(255,255,255,.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#fbbf24' }}>
            <span style={{ fontSize: 13, fontWeight: 800 }}>★</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: '#f1f5f9' }}>
              {gift.stars_price.toLocaleString()}
            </span>
          </div>
          <span style={{ fontSize: 11, color: '#334155' }}>Tap</span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Number card ──────────────────────────────────────────────────────────────

function NumberCard({
  item, index, onBuy,
}: {
  item: AnonymousNumber; index: number; onBuy: (i: AnonymousNumber) => void;
}) {
  const cfg = RARITY_CONFIG[item.rarity];
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.055, type: 'spring', stiffness: 380, damping: 28 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onBuy(item)}
      style={{
        padding: '16px 18px',
        borderRadius: 18,
        background: 'rgba(255,255,255,.03)',
        border: `1px solid ${cfg.glow}44`,
        display: 'flex', alignItems: 'center', gap: 14,
        cursor: 'pointer',
      }}
    >
      {/* Phone icon */}
      <div style={{
        width: 46, height: 46, borderRadius: 14,
        background: cfg.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: cfg.color, flexShrink: 0,
      }}>
        <IconPhone />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', fontFamily: 'ui-monospace, monospace' }}>
          {item.number}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 5 }}>
          <RarityBadge rarity={item.rarity} />
          <span style={{
            fontSize: 10, fontWeight: 600, color: '#3b82f6',
            background: 'rgba(59,130,246,.1)', border: '1px solid rgba(59,130,246,.2)',
            borderRadius: 8, padding: '1px 6px',
          }}>
            Fragment
          </span>
          <span style={{ fontSize: 11, color: '#374151' }}>Anonymous</span>
        </div>
      </div>

      {/* Buy button */}
      <div style={{
        padding: '8px 14px', borderRadius: 12, flexShrink: 0, textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(124,58,237,.22), rgba(37,99,235,.15))',
        border: '1px solid rgba(124,58,237,.2)',
      }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#f1f5f9' }}>
          {item.stars_price.toLocaleString()}
        </div>
        <div style={{ fontSize: 10, color: '#fbbf24', marginTop: 1 }}>★ Stars</div>
      </div>
    </motion.div>
  );
}

// ─── Username card ────────────────────────────────────────────────────────────

function UsernameCard({
  item, index, onBuy,
}: {
  item: NFTUsername; index: number; onBuy: (i: NFTUsername) => void;
}) {
  const cfg = RARITY_CONFIG[item.rarity];
  const name = item.username.startsWith('@') ? item.username.slice(1) : item.username;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 380, damping: 28 }}
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
      {/* @ badge */}
      <div style={{
        width: 44, height: 44, borderRadius: 13,
        background: cfg.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20, fontWeight: 900, color: cfg.color,
        flexShrink: 0,
      }}>
        @
      </div>

      {/* Name + rarity */}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>
          <span style={{ color: cfg.color, fontWeight: 900 }}>@</span>{name}
        </div>
        <div style={{ marginTop: 4 }}>
          <RarityBadge rarity={item.rarity} />
        </div>
      </div>

      {/* Price */}
      <div style={{
        padding: '8px 14px', borderRadius: 12, flexShrink: 0, textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(124,58,237,.22), rgba(37,99,235,.15))',
        border: '1px solid rgba(124,58,237,.2)',
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

// ─── Gift purchase modal ──────────────────────────────────────────────────────

function GiftModal({
  gift, onClose, onConfirm,
}: {
  gift: GiftType; onClose: () => void; onConfirm: () => void;
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
        background: 'rgba(0,0,0,.72)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        padding: '0 0 env(safe-area-inset-bottom, 0px)',
      }}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 420, damping: 36 }}
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 480,
          background: 'rgba(11,11,24,.98)',
          border: '1px solid rgba(255,255,255,.1)',
          borderRadius: '26px 26px 0 0',
          padding: '24px 24px 32px',
        }}
      >
        {/* Handle */}
        <div style={{ width: 38, height: 4, borderRadius: 2, background: 'rgba(255,255,255,.1)', margin: '0 auto 20px' }} />

        {/* Gift preview */}
        <div style={{
          height: 148, borderRadius: 20,
          background: gift.gradient,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 20, position: 'relative', overflow: 'hidden',
        }}>
          <div className="gift-shimmer" style={{ position: 'absolute', inset: 0 }} />
          <div className="gift-receive-anim">
            <GiftArt type={gift.emoji_fallback} />
          </div>
        </div>

        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9', marginBottom: 4 }}>
          {gift.name}
        </h2>
        <p style={{ fontSize: 14, color: '#64748b', marginBottom: 18 }}>{gift.description}</p>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <RarityBadge rarity={gift.rarity} />
          {gift.supply_limit && (
            <span style={{ fontSize: 12, color: '#374151' }}>
              {gift.total_minted.toLocaleString()} / {gift.supply_limit.toLocaleString()} minted
            </span>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ fontSize: 14, color: '#fbbf24' }}>★</span>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#f1f5f9' }}>
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

// ─── Gifts tab content ────────────────────────────────────────────────────────

function GiftsTab({ onGiftTap }: { onGiftTap: (g: GiftType) => void }) {
  const [filter, setFilter] = useState<GiftFilter>('all');
  const filters: { id: GiftFilter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'legendary', label: 'Legendary' },
    { id: 'epic', label: 'Epic' },
    { id: 'rare', label: 'Rare' },
    { id: 'common', label: 'Common' },
    { id: 'trending', label: 'Trending' },
  ];

  const TRENDING_IDS = new Set(['1', '2']);

  const filtered = DEMO_GIFTS.filter(g => {
    if (filter === 'all') return true;
    if (filter === 'trending') return TRENDING_IDS.has(g.id);
    return g.rarity === filter;
  });

  return (
    <>
      {/* Filter chips */}
      <div style={{
        display: 'flex', gap: 8, padding: '0 16px 14px',
        overflowX: 'auto', scrollbarWidth: 'none',
      }}>
        {filters.map(f => (
          <FilterChip key={f.id} label={f.label} active={filter === f.id} onClick={() => setFilter(f.id)} />
        ))}
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 12, padding: '0 16px',
      }}>
        {filtered.map((g, i) => (
          <GiftCard
            key={g.id}
            gift={g}
            index={i}
            trending={TRENDING_IDS.has(g.id)}
            onTap={onGiftTap}
          />
        ))}
      </div>
      <div style={{ height: 24 }} />
    </>
  );
}

// ─── Numbers tab content ──────────────────────────────────────────────────────

function NumbersTab({ onBuy }: { onBuy: (i: AnonymousNumber) => void }) {
  const [filter, setFilter] = useState<RarityFilter>('all');
  const filters: { id: RarityFilter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'legendary', label: 'Legendary' },
    { id: 'epic', label: 'Epic' },
    { id: 'rare', label: 'Rare' },
    { id: 'common', label: 'Common' },
  ];

  const filtered = DEMO_NUMBERS.filter(n => filter === 'all' || n.rarity === filter);

  return (
    <>
      {/* Filter chips */}
      <div style={{
        display: 'flex', gap: 8, padding: '0 16px 14px',
        overflowX: 'auto', scrollbarWidth: 'none',
      }}>
        {filters.map(f => (
          <FilterChip key={f.id} label={f.label} active={filter === f.id} onClick={() => setFilter(f.id)} />
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 16px' }}>
        {filtered.map((n, i) => (
          <NumberCard key={n.id} item={n} index={i} onBuy={onBuy} />
        ))}
      </div>
      <div style={{ height: 24 }} />
    </>
  );
}

// ─── Usernames tab content ────────────────────────────────────────────────────

function UsernamesTab({ onBuy }: { onBuy: (i: NFTUsername) => void }) {
  const [filter, setFilter] = useState<UsernameFilter>('all');
  const [sort, setSort] = useState<SortMode>('price-desc');

  const filters: { id: UsernameFilter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'trending', label: 'Trending' },
    { id: 'legendary', label: 'Legendary' },
    { id: 'epic', label: 'Epic' },
    { id: 'rare', label: 'Rare' },
    { id: 'common', label: 'Common' },
  ];

  const TRENDING_USERNAMES = new Set(['u1', 'u3', 'u5']);

  const filtered = DEMO_USERNAMES
    .filter(u => {
      if (filter === 'all') return true;
      if (filter === 'trending') return TRENDING_USERNAMES.has(u.id);
      return u.rarity === filter;
    })
    .sort((a, b) => sort === 'price-desc' ? b.stars_price - a.stars_price : a.stars_price - b.stars_price);

  return (
    <>
      {/* Filter chips */}
      <div style={{
        display: 'flex', gap: 8, padding: '0 16px 10px',
        overflowX: 'auto', scrollbarWidth: 'none',
      }}>
        {filters.map(f => (
          <FilterChip key={f.id} label={f.label} active={filter === f.id} onClick={() => setFilter(f.id)} />
        ))}
      </div>

      {/* Sort chips */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6, padding: '0 16px 14px',
      }}>
        <span style={{ fontSize: 11, color: '#374151', flexShrink: 0 }}>Price:</span>
        {(['price-desc', 'price-asc'] as SortMode[]).map(s => (
          <FilterChip
            key={s}
            label={s === 'price-desc' ? 'High → Low' : 'Low → High'}
            active={sort === s}
            onClick={() => setSort(s)}
          />
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 16px' }}>
        {filtered.map((u, i) => (
          <UsernameCard key={u.id} item={u} index={i} onBuy={onBuy} />
        ))}
      </div>
      <div style={{ height: 24 }} />
    </>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function MarketplacePage() {
  const { profile } = useAuthStore();
  const { balance, spendStars } = useStarsStore();
  const { showToast } = useUIStore();

  const [tab, setTab] = useState<TabId>('gifts');
  const [search, setSearch] = useState('');
  const [selectedGift, setSelectedGift] = useState<GiftType | null>(null);
  const prevTabRef = useRef<TabId>('gifts');

  const direction = TAB_ORDER.indexOf(tab) - TAB_ORDER.indexOf(prevTabRef.current);

  const switchTab = (next: TabId) => {
    prevTabRef.current = tab;
    setTab(next);
    setSearch('');
  };

  const handleConfirmGift = async () => {
    if (!selectedGift || !profile) return;
    const ok = await spendStars(profile.id, selectedGift.stars_price, 'gift_send', `Sent ${selectedGift.name}`);
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
    { id: 'gifts', label: 'Gifts' },
    { id: 'numbers', label: 'Numbers' },
    { id: 'usernames', label: 'Usernames' },
  ];

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: '#07070f', overflow: 'hidden',
    }}>
      {/* ── Header ── */}
      <div style={{
        padding: '16px 20px 12px',
        borderBottom: '1px solid rgba(255,255,255,.06)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.4px' }}>
            Marketplace
          </h1>
          <div className="stars-badge">
            <span>★</span>
            <span>{balance.toLocaleString()}</span>
          </div>
        </div>

        {/* Search */}
        <input
          className="l-input"
          placeholder={`Search ${tab}...`}
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ fontSize: 14 }}
        />
      </div>

      {/* ── Tab bar ── */}
      <div style={{
        display: 'flex', gap: 6, padding: '12px 16px 0', flexShrink: 0,
        position: 'relative',
      }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => switchTab(t.id)}
            style={{
              flex: 1, padding: '8px 0', borderRadius: 20, border: 'none',
              background: 'transparent',
              color: tab === t.id ? '#a78bfa' : '#4b5563',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              position: 'relative', zIndex: 1,
            }}
          >
            {tab === t.id && (
              <motion.div
                layoutId="tab-bg"
                style={{
                  position: 'absolute', inset: 0, borderRadius: 20,
                  background: 'linear-gradient(135deg, rgba(124,58,237,.28), rgba(37,99,235,.18))',
                  zIndex: -1,
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 36 }}
              />
            )}
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      <div className="scroll-container" style={{ flex: 1, paddingTop: 16 }}>
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={tab}
            custom={direction}
            initial={{ opacity: 0, x: direction * 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -20 }}
            transition={{ type: 'spring', stiffness: 380, damping: 34 }}
          >
            {tab === 'gifts' && (
              <GiftsTab onGiftTap={setSelectedGift} />
            )}
            {tab === 'numbers' && (
              <NumbersTab onBuy={handleBuyNumber} />
            )}
            {tab === 'usernames' && (
              <UsernamesTab onBuy={handleBuyUsername} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Gift modal ── */}
      <AnimatePresence>
        {selectedGift && (
          <GiftModal
            gift={selectedGift}
            onClose={() => setSelectedGift(null)}
            onConfirm={handleConfirmGift}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
