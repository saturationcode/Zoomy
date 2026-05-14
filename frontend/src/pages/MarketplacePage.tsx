import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useStarsStore } from '../store/starsStore';
import { useUIStore } from '../store/uiStore';
import type { GiftType, AnonymousNumber, NFTUsername, Rarity } from '../types';
import { RARITY_CONFIG } from '../types';

// ─── SVG icons ────────────────────────────────────────────────────────────────

function IconPhone() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92V19.92C22 20.48 21.76 21.02 21.34 21.4C20.91 21.78 20.35 21.96 19.78 21.9C16.56 21.55 13.46 20.4 10.77 18.56C8.27 16.88 6.15 14.77 4.48 12.27C2.63 9.57 1.48 6.45 1.14 3.22C1.08 2.65 1.26 2.09 1.64 1.67C2.01 1.24 2.55 1 3.11 1H6.11C7.1 .99 7.95 1.69 8.11 2.67C8.24 3.58 8.47 4.47 8.81 5.33C9.07 6.02 8.9 6.8 8.38 7.31L7.09 8.6C8.61 11.19 10.71 13.29 13.3 14.81L14.59 13.52C15.11 13 15.89 12.83 16.58 13.09C17.44 13.43 18.33 13.66 19.24 13.79C20.24 13.95 20.94 14.82 20.91 15.82L22 16.92Z"/>
    </svg>
  );
}

function IconAt() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4"/>
      <path d="M16 8V13C16 14.1 16.9 15 18 15C19.1 15 20 14.1 20 13V12C20 7.58 16.42 4 12 4C7.58 4 4 7.58 4 12C4 16.42 7.58 20 12 20H16"/>
    </svg>
  );
}

function IconGift() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 12 20 22 4 22 4 12"/>
      <rect x="2" y="7" width="20" height="5"/>
      <line x1="12" y1="22" x2="12" y2="7"/>
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7Z"/>
      <path d="M12 7H16.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7Z"/>
    </svg>
  );
}

function IconStar({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
    </svg>
  );
}

function IconFire() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 3z"/>
    </svg>
  );
}

// ─── Demo data ────────────────────────────────────────────────────────────────

const DEMO_GIFTS: GiftType[] = [
  { id:'g1', name:'Flame Heart',   description:'A fiery token of affection',     emoji_fallback:'fire-heart', animation_url:null, image_url:null, rarity:'legendary', stars_price:2000, supply_limit:1000, total_minted:247, gradient:'linear-gradient(135deg,#ef4444 0%,#f59e0b 100%)', created_at:'' },
  { id:'g2', name:'Crystal Star',  description:'Rare crystallized starlight',    emoji_fallback:'star',      animation_url:null, image_url:null, rarity:'epic',      stars_price:500,  supply_limit:5000, total_minted:1203, gradient:'linear-gradient(135deg,#7c3aed 0%,#38bdf8 100%)', created_at:'' },
  { id:'g3', name:'Neon Rose',     description:'Synthwave flower in bloom',      emoji_fallback:'rose',      animation_url:null, image_url:null, rarity:'rare',      stars_price:150,  supply_limit:null, total_minted:8921, gradient:'linear-gradient(135deg,#ec4899 0%,#8b5cf6 100%)', created_at:'' },
  { id:'g4', name:'Lucky Clover',  description:'For a little good luck',         emoji_fallback:'clover',    animation_url:null, image_url:null, rarity:'common',    stars_price:25,   supply_limit:null, total_minted:42100, gradient:'linear-gradient(135deg,#10b981 0%,#06b6d4 100%)', created_at:'' },
  { id:'g5', name:'Thunder Bolt',  description:'Raw power channeled',            emoji_fallback:'bolt',      animation_url:null, image_url:null, rarity:'epic',      stars_price:750,  supply_limit:2000, total_minted:589,  gradient:'linear-gradient(135deg,#f59e0b 0%,#7c3aed 100%)', created_at:'' },
  { id:'g6', name:'Ice Comet',     description:'A frozen trail across the void', emoji_fallback:'comet',     animation_url:null, image_url:null, rarity:'legendary', stars_price:5000, supply_limit:100,  total_minted:12,   gradient:'linear-gradient(135deg,#38bdf8 0%,#818cf8 100%)', created_at:'' },
  { id:'g7', name:'Golden Crown',  description:'Wear the mark of royalty',       emoji_fallback:'crown',     animation_url:null, image_url:null, rarity:'legendary', stars_price:10000, supply_limit:50,  total_minted:7,    gradient:'linear-gradient(135deg,#f59e0b 0%,#d97706 100%)', created_at:'' },
  { id:'g8', name:'Shadow Orb',    description:'Darkness compressed into beauty',emoji_fallback:'orb',       animation_url:null, image_url:null, rarity:'epic',      stars_price:400,  supply_limit:3000, total_minted:921,  gradient:'linear-gradient(135deg,#1e1b4b 0%,#7c3aed 100%)', created_at:'' },
  { id:'g9', name:'Aurora',        description:'Northern lights captured',        emoji_fallback:'aurora',    animation_url:null, image_url:null, rarity:'rare',      stars_price:200,  supply_limit:null, total_minted:5432, gradient:'linear-gradient(135deg,#06b6d4 0%,#10b981 100%)', created_at:'' },
  { id:'g10',name:'Dragon Seal',   description:'Ancient power, modern form',      emoji_fallback:'dragon',    animation_url:null, image_url:null, rarity:'legendary', stars_price:8000, supply_limit:200, total_minted:34,   gradient:'linear-gradient(135deg,#dc2626 0%,#7c3aed 100%)', created_at:'' },
];

// +999 premium and regular +888 numbers
const DEMO_NUMBERS: AnonymousNumber[] = [
  // +999 — ultra-premium Telegram Fragment style
  { id:'p1', number:'+999 999 9999', owner_id:null, stars_price:200000, is_available:true, rarity:'legendary', flag:'+999', created_at:'' },
  { id:'p2', number:'+999 888 8888', owner_id:null, stars_price:150000, is_available:true, rarity:'legendary', flag:'+999', created_at:'' },
  { id:'p3', number:'+999 777 7777', owner_id:null, stars_price:120000, is_available:true, rarity:'legendary', flag:'+999', created_at:'' },
  { id:'p4', number:'+999 100 0001', owner_id:null, stars_price:50000,  is_available:true, rarity:'epic',      flag:'+999', created_at:'' },
  { id:'p5', number:'+999 420 0000', owner_id:null, stars_price:30000,  is_available:true, rarity:'epic',      flag:'+999', created_at:'' },
  { id:'p6', number:'+999 500 1234', owner_id:null, stars_price:10000,  is_available:true, rarity:'rare',      flag:'+999', created_at:'' },
  // +888 — regular anonymous
  { id:'n1', number:'+888 100 2049', owner_id:null, stars_price:500,    is_available:true, rarity:'rare',      flag:'+888', created_at:'' },
  { id:'n2', number:'+888 777 0001', owner_id:null, stars_price:300,    is_available:true, rarity:'common',    flag:'+888', created_at:'' },
  { id:'n3', number:'+888 420 6969', owner_id:null, stars_price:400,    is_available:true, rarity:'rare',      flag:'+888', created_at:'' },
  { id:'n4', number:'+888 200 0042', owner_id:null, stars_price:200,    is_available:true, rarity:'common',    flag:'+888', created_at:'' },
];

const DEMO_USERNAMES: NFTUsername[] = [
  { id:'u1',  username:'@diamond',  owner_id:null, stars_price:50000, is_listed:true, rarity:'legendary', created_at:'' },
  { id:'u2',  username:'@crypto',   owner_id:null, stars_price:25000, is_listed:true, rarity:'legendary', created_at:'' },
  { id:'u3',  username:'@nova',     owner_id:null, stars_price:10000, is_listed:true, rarity:'epic',      created_at:'' },
  { id:'u4',  username:'@pixel',    owner_id:null, stars_price:5000,  is_listed:true, rarity:'rare',      created_at:'' },
  { id:'u5',  username:'@light',    owner_id:null, stars_price:8000,  is_listed:true, rarity:'epic',      created_at:'' },
  { id:'u6',  username:'@echo',     owner_id:null, stars_price:2500,  is_listed:true, rarity:'rare',      created_at:'' },
  { id:'u7',  username:'@sprout',   owner_id:null, stars_price:500,   is_listed:true, rarity:'common',    created_at:'' },
  { id:'u8',  username:'@phantom',  owner_id:null, stars_price:18000, is_listed:true, rarity:'legendary', created_at:'' },
  { id:'u9',  username:'@zenith',   owner_id:null, stars_price:12000, is_listed:true, rarity:'epic',      created_at:'' },
  { id:'u10', username:'@drift',    owner_id:null, stars_price:3200,  is_listed:true, rarity:'rare',      created_at:'' },
];

// ─── Gift SVG art (based on gift name) ───────────────────────────────────────

function GiftArt({ gift }: { gift: GiftType }) {
  const size = 64;
  const style: React.CSSProperties = {
    width: size, height: size,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 36,
    filter: 'drop-shadow(0 4px 16px rgba(0,0,0,.4))',
  };
  const arts: Record<string, string> = {
    'fire-heart': '❤️‍🔥', star: '⭐', rose: '🌹', clover: '🍀',
    bolt: '⚡', comet: '☄️', crown: '👑', orb: '🔮',
    aurora: '🌌', dragon: '🐉',
  };
  return <div style={style}>{arts[gift.emoji_fallback] ?? '🎁'}</div>;
}

// ─── Rarity border/glow styles ────────────────────────────────────────────────

function rarityBorder(rarity: Rarity): string {
  const map: Record<Rarity, string> = {
    common:    '1px solid rgba(107,114,128,.4)',
    rare:      '1px solid rgba(59,130,246,.7)',
    epic:      '1px solid rgba(168,85,247,.8)',
    legendary: '1px solid rgba(245,158,11,.9)',
  };
  return map[rarity];
}
function rarityGlow(rarity: Rarity): string {
  const map: Record<Rarity, string> = {
    common:    '0 4px 20px rgba(107,114,128,.15)',
    rare:      '0 4px 24px rgba(59,130,246,.35), 0 0 40px rgba(59,130,246,.15)',
    epic:      '0 4px 28px rgba(168,85,247,.45), 0 0 50px rgba(168,85,247,.2)',
    legendary: '0 4px 32px rgba(245,158,11,.55), 0 0 60px rgba(245,158,11,.25)',
  };
  return map[rarity];
}

// ─── Gift card ─────────────────────────────────────────────────────────────────

function GiftCard({ gift, onBuy }: { gift: GiftType; onBuy: (g: GiftType) => void }) {
  const cfg = RARITY_CONFIG[gift.rarity];
  const isLegendary = gift.rarity === 'legendary';

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      onClick={() => onBuy(gift)}
      style={{
        borderRadius: 20,
        overflow: 'hidden',
        border: rarityBorder(gift.rarity),
        boxShadow: rarityGlow(gift.rarity),
        background: 'rgba(255,255,255,.03)',
        cursor: 'pointer',
        position: 'relative',
      }}
    >
      {/* Gradient top section */}
      <div style={{
        background: gift.gradient,
        padding: '24px 16px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Shimmer for legendary */}
        {isLegendary && (
          <motion.div
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 1.8, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,.18) 50%, transparent 100%)',
              pointerEvents: 'none',
            }}
          />
        )}

        <GiftArt gift={gift} />

        {/* Supply pill */}
        {gift.supply_limit && (
          <div style={{
            fontSize: 10, fontWeight: 600,
            color: 'rgba(255,255,255,.7)',
            background: 'rgba(0,0,0,.25)',
            padding: '2px 8px', borderRadius: 20,
            letterSpacing: '0.04em',
          }}>
            {gift.total_minted}/{gift.supply_limit}
          </div>
        )}
      </div>

      {/* Card body */}
      <div style={{ padding: '12px 14px 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', margin: 0, lineHeight: 1.2 }}>
            {gift.name}
          </p>
          <RarityBadge rarity={gift.rarity} />
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          color: '#fbbf24', fontWeight: 700, fontSize: 14,
        }}>
          <IconStar size={13} />
          {gift.stars_price.toLocaleString()}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Number card ───────────────────────────────────────────────────────────────

function NumberCard({ num, onBuy }: { num: AnonymousNumber; onBuy: (n: AnonymousNumber) => void }) {
  const cfg = RARITY_CONFIG[num.rarity];
  const isPremium = num.flag === '+999';

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      onClick={() => onBuy(num)}
      style={{
        borderRadius: 16,
        border: rarityBorder(num.rarity),
        boxShadow: rarityGlow(num.rarity),
        background: isPremium
          ? 'linear-gradient(135deg, rgba(245,158,11,.08) 0%, rgba(124,58,237,.06) 100%)'
          : 'rgba(255,255,255,.03)',
        padding: '14px 16px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {isPremium && (
        <motion.div
          animate={{ x: ['-100%', '250%'] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
          style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(90deg, transparent, rgba(245,158,11,.12), transparent)',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Icon */}
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: isPremium
          ? 'linear-gradient(135deg, rgba(245,158,11,.2), rgba(124,58,237,.15))'
          : cfg.bg,
        border: `1px solid ${cfg.glow}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: cfg.color,
      }}>
        <IconPhone />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', letterSpacing: '0.02em' }}>
            {num.number}
          </span>
          {isPremium && (
            <span style={{
              fontSize: 9, fontWeight: 800, padding: '1px 5px', borderRadius: 6,
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: '#000', letterSpacing: '0.06em',
            }}>PREMIUM</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <RarityBadge rarity={num.rarity} />
          <span style={{ fontSize: 11, color: '#64748b' }}>{num.flag}</span>
        </div>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 3,
        color: '#fbbf24', fontWeight: 700, fontSize: 13, flexShrink: 0,
      }}>
        <IconStar size={11} />
        {num.stars_price.toLocaleString()}
      </div>
    </motion.div>
  );
}

// ─── Username card ─────────────────────────────────────────────────────────────

function UsernameCard({ un, onBuy }: { un: NFTUsername; onBuy: (u: NFTUsername) => void }) {
  const cfg = RARITY_CONFIG[un.rarity];
  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      onClick={() => onBuy(un)}
      style={{
        borderRadius: 14,
        border: rarityBorder(un.rarity),
        boxShadow: rarityGlow(un.rarity),
        background: cfg.bg,
        padding: '12px 14px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <div style={{
        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
        background: `linear-gradient(135deg, ${cfg.color}22, ${cfg.color}11)`,
        border: `1px solid ${cfg.glow}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: cfg.color, fontSize: 16, fontWeight: 800,
      }}>@</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 2 }}>
          {un.username}
        </div>
        <RarityBadge rarity={un.rarity} />
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 3,
        color: '#fbbf24', fontWeight: 700, fontSize: 13, flexShrink: 0,
      }}>
        <IconStar size={11} />
        {un.stars_price.toLocaleString()}
      </div>
    </motion.div>
  );
}

// ─── Rarity badge ─────────────────────────────────────────────────────────────

function RarityBadge({ rarity }: { rarity: Rarity }) {
  const cfg = RARITY_CONFIG[rarity];
  return (
    <span style={{
      fontSize: 9, fontWeight: 800, padding: '2px 6px',
      borderRadius: 20, letterSpacing: '0.05em', textTransform: 'uppercase',
      color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.glow}`,
      display: 'inline-flex', alignItems: 'center',
    }}>{cfg.label}</span>
  );
}

// ─── Filter chip ──────────────────────────────────────────────────────────────

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.94 }}
      style={{
        padding: '6px 14px', borderRadius: 20,
        fontSize: 12, fontWeight: active ? 700 : 500,
        border: active ? '1px solid rgba(124,58,237,.6)' : '1px solid rgba(255,255,255,.08)',
        background: active
          ? 'linear-gradient(135deg, rgba(124,58,237,.28), rgba(37,99,235,.2))'
          : 'rgba(255,255,255,.04)',
        color: active ? '#c4b5fd' : '#64748b',
        cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
        transition: 'all .15s',
      }}
    >
      {label}
    </motion.button>
  );
}

// ─── Purchase modal ────────────────────────────────────────────────────────────

type PurchaseTarget =
  | { kind: 'gift'; item: GiftType }
  | { kind: 'number'; item: AnonymousNumber }
  | { kind: 'username'; item: NFTUsername };

function PurchaseModal({
  target,
  balance,
  onConfirm,
  onClose,
}: {
  target: PurchaseTarget;
  balance: number;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const price =
    target.kind === 'gift' ? target.item.stars_price :
    target.kind === 'number' ? target.item.stars_price :
    target.item.stars_price;
  const name =
    target.kind === 'gift' ? target.item.name :
    target.kind === 'number' ? target.item.number :
    target.item.username;
  const rarity =
    target.kind === 'gift' ? target.item.rarity :
    target.kind === 'number' ? target.item.rarity :
    target.item.rarity;
  const canAfford = balance >= price;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,.6)',
          backdropFilter: 'blur(8px)',
        }}
      />
      {/* Sheet */}
      <motion.div
        initial={{ y: 120, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 101,
          background: 'rgba(15,10,30,.97)',
          border: '1px solid rgba(255,255,255,.08)',
          borderTop: `2px solid ${RARITY_CONFIG[rarity].color}`,
          borderRadius: '28px 28px 0 0',
          padding: '32px 24px 48px',
          boxShadow: `0 -20px 60px ${RARITY_CONFIG[rarity].glow}`,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>
            {target.kind === 'gift' ? '🎁' : target.kind === 'number' ? '📱' : '@'}
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: '#f1f5f9', margin: '0 0 6px' }}>
            {name}
          </h3>
          <RarityBadge rarity={rarity} />
        </div>

        {/* Price row */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '14px 18px', borderRadius: 16,
          background: 'rgba(255,255,255,.04)',
          border: '1px solid rgba(255,255,255,.07)',
          marginBottom: 12,
        }}>
          <span style={{ fontSize: 14, color: '#94a3b8' }}>Price</span>
          <span style={{ fontSize: 18, fontWeight: 800, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 5 }}>
            <IconStar size={15} />{price.toLocaleString()} Stars
          </span>
        </div>

        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '14px 18px', borderRadius: 16,
          background: canAfford ? 'rgba(34,197,94,.06)' : 'rgba(239,68,68,.06)',
          border: `1px solid ${canAfford ? 'rgba(34,197,94,.2)' : 'rgba(239,68,68,.2)'}`,
          marginBottom: 24,
        }}>
          <span style={{ fontSize: 14, color: '#94a3b8' }}>Your balance</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: canAfford ? '#86efac' : '#fca5a5', display: 'flex', alignItems: 'center', gap: 4 }}>
            <IconStar size={13} />{balance.toLocaleString()}
          </span>
        </div>

        <motion.button
          onClick={canAfford ? onConfirm : undefined}
          whileTap={canAfford ? { scale: 0.97 } : {}}
          style={{
            width: '100%', padding: '16px', borderRadius: 18,
            border: 'none', cursor: canAfford ? 'pointer' : 'not-allowed',
            fontSize: 16, fontWeight: 700,
            background: canAfford
              ? `linear-gradient(135deg, ${RARITY_CONFIG[rarity].color}, ${RARITY_CONFIG[rarity].color}bb)`
              : 'rgba(255,255,255,.06)',
            color: canAfford ? '#fff' : '#4b5563',
            boxShadow: canAfford ? `0 8px 32px ${RARITY_CONFIG[rarity].glow}` : 'none',
          }}
        >
          {canAfford ? `Buy for ${price.toLocaleString()} ★` : 'Not enough Stars'}
        </motion.button>

        {!canAfford && (
          <p style={{ textAlign: 'center', fontSize: 12, color: '#475569', marginTop: 10 }}>
            Need {(price - balance).toLocaleString()} more Stars
          </p>
        )}
      </motion.div>
    </>
  );
}

// ─── Tab types ─────────────────────────────────────────────────────────────────

type TabId = 'gifts' | 'numbers' | 'usernames';
const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'gifts',     label: 'Gifts',    icon: <IconGift /> },
  { id: 'numbers',   label: 'Numbers',  icon: <IconPhone /> },
  { id: 'usernames', label: 'Names',    icon: <IconAt /> },
];
const TAB_ORDER: TabId[] = ['gifts', 'numbers', 'usernames'];

// ─── Main page ────────────────────────────────────────────────────────────────

export default function MarketplacePage() {
  const profile = useAuthStore(s => s.profile);
  const { balance, spendStars } = useStarsStore();
  const { showToast } = useUIStore();

  const [tab, setTab] = useState<TabId>('gifts');
  const prevTabRef = useRef<TabId>('gifts');
  const [giftFilter, setGiftFilter] = useState<'all'|Rarity|'trending'>('all');
  const [numFilter, setNumFilter] = useState<'all'|'+999'|'+888'|Rarity>('all');
  const [purchase, setPurchase] = useState<PurchaseTarget | null>(null);

  const switchTab = (next: TabId) => {
    prevTabRef.current = tab;
    setTab(next);
  };

  const prevIdx = TAB_ORDER.indexOf(prevTabRef.current);
  const currIdx = TAB_ORDER.indexOf(tab);
  const dir = currIdx >= prevIdx ? 1 : -1;

  const filteredGifts = DEMO_GIFTS.filter(g =>
    giftFilter === 'all' ? true :
    giftFilter === 'trending' ? g.supply_limit !== null :
    g.rarity === giftFilter
  );

  const filteredNumbers = DEMO_NUMBERS.filter(n =>
    numFilter === 'all' ? true :
    numFilter === '+999' ? n.flag === '+999' :
    numFilter === '+888' ? n.flag === '+888' :
    n.rarity === numFilter
  );

  const handleConfirm = async () => {
    if (!purchase || !profile) return;
    const price =
      purchase.kind === 'gift' ? purchase.item.stars_price :
      purchase.kind === 'number' ? purchase.item.stars_price :
      purchase.item.stars_price;
    const name =
      purchase.kind === 'gift' ? purchase.item.name :
      purchase.kind === 'number' ? purchase.item.number :
      purchase.item.username;

    const ok = await spendStars(profile.id, price, 'number_buy', `Купил: ${name}`);
    setPurchase(null);
    if (ok) {
      showToast(`✓ ${name} приобретён!`, 'success');
    } else {
      showToast('Недостаточно Stars', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#07070f', overflowY: 'auto' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        style={{
          padding: '20px 20px 0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}
      >
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9', margin: 0, letterSpacing: '-0.3px' }}>
            Marketplace
          </h1>
          <p style={{ fontSize: 12, color: '#4b5563', margin: '2px 0 0' }}>
            NFT Gifts · Numbers · Usernames
          </p>
        </div>
        {/* Balance pill */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '7px 12px', borderRadius: 20,
          background: 'rgba(251,191,36,.1)',
          border: '1px solid rgba(251,191,36,.25)',
          color: '#fbbf24', fontWeight: 700, fontSize: 13,
        }}>
          <IconStar size={12} />{balance.toLocaleString()}
        </div>
      </motion.div>

      {/* Tab bar */}
      <div style={{ padding: '16px 20px 0', position: 'relative' }}>
        <div style={{
          display: 'flex', gap: 4,
          background: 'rgba(255,255,255,.04)',
          border: '1px solid rgba(255,255,255,.07)',
          borderRadius: 16, padding: 4,
        }}>
          {TABS.map(t => {
            const active = tab === t.id;
            return (
              <motion.button
                key={t.id}
                onClick={() => switchTab(t.id)}
                whileTap={{ scale: 0.95 }}
                style={{
                  flex: 1, padding: '10px 0', borderRadius: 13,
                  border: 'none', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                  position: 'relative', background: 'transparent',
                }}
              >
                {active && (
                  <motion.div
                    layoutId="tab-bg"
                    style={{
                      position: 'absolute', inset: 0, borderRadius: 13,
                      background: 'linear-gradient(135deg, rgba(124,58,237,.4), rgba(37,99,235,.3))',
                      boxShadow: '0 2px 16px rgba(124,58,237,.25)',
                    }}
                    transition={{ type: 'spring', stiffness: 500, damping: 36 }}
                  />
                )}
                <span style={{
                  position: 'relative', zIndex: 1,
                  color: active ? '#c4b5fd' : '#4b5563',
                  transition: 'color .15s',
                }}>{t.icon}</span>
                <span style={{
                  position: 'relative', zIndex: 1,
                  fontSize: 11, fontWeight: active ? 700 : 500,
                  color: active ? '#c4b5fd' : '#4b5563',
                  transition: 'color .15s',
                }}>{t.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Filter chips */}
      <AnimatePresence mode="wait">
        {tab === 'gifts' && (
          <motion.div
            key="gift-filters"
            initial={{ opacity: 0, x: dir * 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -dir * 20 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            style={{ padding: '12px 20px', display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none' }}
          >
            {(['all','legendary','epic','rare','common','trending'] as const).map(f => (
              <FilterChip key={f} label={f === 'all' ? 'All' : f === 'trending' ? '🔥 Hot' : f.charAt(0).toUpperCase()+f.slice(1)} active={giftFilter === f} onClick={() => setGiftFilter(f)} />
            ))}
          </motion.div>
        )}
        {tab === 'numbers' && (
          <motion.div
            key="num-filters"
            initial={{ opacity: 0, x: dir * 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -dir * 20 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            style={{ padding: '12px 20px', display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none' }}
          >
            {(['all','+999','+888','legendary','epic','rare','common'] as const).map(f => (
              <FilterChip key={f} label={f === 'all' ? 'All' : f} active={numFilter === f} onClick={() => setNumFilter(f)} />
            ))}
          </motion.div>
        )}
        {tab === 'usernames' && (
          <motion.div
            key="un-filters"
            initial={{ opacity: 0, x: dir * 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -dir * 20 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            style={{ padding: '12px 20px' }}
          />
        )}
      </AnimatePresence>

      {/* Content */}
      <div style={{ flex: 1, padding: '0 16px 100px' }}>
        <AnimatePresence mode="wait" initial={false}>
          {/* GIFTS */}
          {tab === 'gifts' && (
            <motion.div
              key="gifts"
              initial={{ opacity: 0, x: dir * 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -dir * 24 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 12,
              }}
            >
              {filteredGifts.map((gift, i) => (
                <motion.div
                  key={gift.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.25, ease: 'easeOut' }}
                >
                  <GiftCard gift={gift} onBuy={g => setPurchase({ kind:'gift', item:g })} />
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* NUMBERS */}
          {tab === 'numbers' && (
            <motion.div
              key="numbers"
              initial={{ opacity: 0, x: dir * 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -dir * 24 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
            >
              {/* +999 premium banner */}
              {(numFilter === 'all' || numFilter === '+999') && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 16,
                    background: 'linear-gradient(135deg, rgba(245,158,11,.12), rgba(124,58,237,.08))',
                    border: '1px solid rgba(245,158,11,.3)',
                    display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4,
                  }}
                >
                  <span style={{ fontSize: 22 }}>💎</span>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#fbbf24', margin: 0 }}>+999 Premium Numbers</p>
                    <p style={{ fontSize: 11, color: '#78716c', margin: 0 }}>Ultra-rare anonymous numbers — not linked to any SIM</p>
                  </div>
                </motion.div>
              )}

              {filteredNumbers.map((num, i) => (
                <motion.div
                  key={num.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.22, ease: 'easeOut' }}
                >
                  <NumberCard num={num} onBuy={n => setPurchase({ kind:'number', item:n })} />
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* USERNAMES */}
          {tab === 'usernames' && (
            <motion.div
              key="usernames"
              initial={{ opacity: 0, x: dir * 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -dir * 24 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              style={{ display: 'flex', flexDirection: 'column', gap: 9 }}
            >
              {DEMO_USERNAMES.map((un, i) => (
                <motion.div
                  key={un.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.22, ease: 'easeOut' }}
                >
                  <UsernameCard un={un} onBuy={u => setPurchase({ kind:'username', item:u })} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Purchase modal */}
      <AnimatePresence>
        {purchase && (
          <PurchaseModal
            target={purchase}
            balance={balance}
            onConfirm={handleConfirm}
            onClose={() => setPurchase(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
