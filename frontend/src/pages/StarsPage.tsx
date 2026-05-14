import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useStarsStore, STARS_TIERS } from '../store/starsStore';
import { useUIStore } from '../store/uiStore';
import type { StarsTransaction } from '../types';

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconStar({ size = 18, filled = false }: { size?: number; filled?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor" strokeWidth={filled ? 0 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
    </svg>
  );
}

function IconTag({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41L13.42 20.58C13.2343 20.766 13.0137 20.9135 12.7709 21.0141C12.5281 21.1148 12.2678 21.1666 12.005 21.1666C11.7422 21.1666 11.4819 21.1148 11.2391 21.0141C10.9963 20.9135 10.7757 20.766 10.59 20.58L2 12V2H12L20.59 10.59C20.9625 10.9647 21.1716 11.4716 21.1716 12C21.1716 12.5284 20.9625 13.0353 20.59 13.41Z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  );
}

function IconHistory({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3V9H9" />
      <path d="M3.07 13C3.64 16.56 6.46 19.41 10.12 19.96C13.78 20.51 17.27 18.54 18.84 15.19C20.41 11.84 19.63 7.85 16.96 5.33C14.29 2.81 10.27 2.28 7 4L3 7" />
      <path d="M12 7V12L15 14" />
    </svg>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function txIcon(type: StarsTransaction['type']): string {
  const map: Record<StarsTransaction['type'], string> = {
    purchase:      '💳',
    gift_send:     '🎁',
    gift_receive:  '🎁',
    username_buy:  '@',
    number_buy:    '#',
    promo:         '🎟',
  };
  return map[type] ?? '⭐';
}

// ─── Floating star particle ───────────────────────────────────────────────────

function FloatingStar({ delay, x }: { delay: number; x: string }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 0 }}
      animate={{ opacity: [0, 0.55, 0], y: -52 }}
      transition={{
        duration: 2.4,
        delay,
        repeat: Infinity,
        repeatDelay: 1.2,
        ease: 'easeOut',
      }}
      style={{
        position: 'absolute',
        bottom: 18,
        left: x,
        fontSize: 14,
        color: '#fbbf24',
        pointerEvents: 'none',
        filter: 'drop-shadow(0 0 4px rgba(251,191,36,.7))',
        userSelect: 'none',
      }}
    >
      ★
    </motion.span>
  );
}

// ─── Stars balance header ─────────────────────────────────────────────────────

function BalanceCard({ balance }: { balance: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        margin: '0 16px 24px',
        padding: '28px 24px',
        borderRadius: 24,
        background: 'linear-gradient(135deg, rgba(124,58,237,.18) 0%, rgba(37,99,235,.12) 100%)',
        border: '1px solid rgba(124,58,237,.22)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background shimmer */}
      <div className="gift-shimmer" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />

      {/* Floating star particles */}
      <FloatingStar delay={0}    x="18%" />
      <FloatingStar delay={0.7}  x="42%" />
      <FloatingStar delay={1.3}  x="65%" />
      <FloatingStar delay={0.4}  x="82%" />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 6 }}>
        <span style={{ color: '#fbbf24', filter: 'drop-shadow(0 0 6px rgba(251,191,36,.6))' }}>
          <IconStar size={26} filled />
        </span>
        <span style={{ fontSize: 42, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-1px', lineHeight: 1 }}>
          {balance.toLocaleString()}
        </span>
      </div>
      <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Your Stars balance</p>
    </motion.div>
  );
}

// ─── Tier card ────────────────────────────────────────────────────────────────

interface TierCardProps {
  stars: number;
  price: number;
  label: string;
  popular?: boolean;
  bonus?: string;
  index: number;
  onBuy: () => void;
}

function TierCard({ stars, price, label, popular, bonus, index, onBuy }: TierCardProps) {
  const [pressed, setPressed] = useState(false);

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      whileTap={{ scale: 0.96 }}
      whileHover={{ y: -2, boxShadow: '0 8px 32px rgba(124,58,237,.25)' }}
      onClick={onBuy}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      style={{
        width: '100%',
        background: popular
          ? 'linear-gradient(135deg, rgba(124,58,237,.16) 0%, rgba(37,99,235,.1) 100%)'
          : 'rgba(255,255,255,.03)',
        border: `1.5px solid ${popular ? 'rgba(124,58,237,.32)' : 'rgba(255,255,255,.07)'}`,
        borderRadius: 18,
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'background .15s',
        boxShadow: popular ? '0 0 24px rgba(124,58,237,.12)' : 'none',
      }}
    >
      {/* Star icon */}
      <div style={{
        width: 46, height: 46, borderRadius: 14,
        background: popular
          ? 'linear-gradient(135deg, rgba(124,58,237,.3), rgba(37,99,235,.2))'
          : 'rgba(255,255,255,.05)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        color: '#fbbf24',
      }}>
        <IconStar size={22} filled />
      </div>

      {/* Label + bonus */}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>{label}</span>
          {bonus && (
            <span style={{
              fontSize: 11, fontWeight: 700, color: '#fbbf24',
              background: 'rgba(251,191,36,.12)',
              border: '1px solid rgba(251,191,36,.2)',
              borderRadius: 20, padding: '2px 7px',
            }}>
              {bonus}
            </span>
          )}
          {popular && !bonus && (
            <span style={{
              fontSize: 10, fontWeight: 700, color: '#a78bfa',
              background: 'rgba(124,58,237,.15)',
              border: '1px solid rgba(124,58,237,.22)',
              borderRadius: 20, padding: '2px 7px',
              textTransform: 'uppercase', letterSpacing: '0.04em',
            }}>
              Popular
            </span>
          )}
        </div>
        <span style={{ fontSize: 13, color: '#64748b', marginTop: 2, display: 'block' }}>
          ~${price.toFixed(2)}
        </span>
      </div>

      {/* Price button */}
      <div style={{
        padding: '8px 14px',
        background: popular
          ? 'linear-gradient(135deg, #7c3aed, #2563eb)'
          : 'rgba(255,255,255,.06)',
        border: popular ? 'none' : '1px solid rgba(255,255,255,.1)',
        borderRadius: 12,
        fontSize: 14, fontWeight: 700,
        color: popular ? '#fff' : '#94a3b8',
        flexShrink: 0,
        transition: 'opacity .1s',
        opacity: pressed ? 0.75 : 1,
      }}>
        ${price.toFixed(2)}
      </div>
    </motion.button>
  );
}

// ─── Promo code input ─────────────────────────────────────────────────────────

function PromoSection({ userId }: { userId: string }) {
  const { applyPromo } = useStarsStore();
  const { showToast } = useUIStore();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApply = async () => {
    if (!code.trim()) return;
    setLoading(true);
    const result = await applyPromo(userId, code);
    setLoading(false);
    showToast(result.message, result.ok ? 'success' : 'error');
    if (result.ok) setCode('');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        margin: '24px 16px 0',
        padding: '20px',
        borderRadius: 20,
        background: 'rgba(255,255,255,.03)',
        border: '1px solid rgba(255,255,255,.07)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <span style={{ color: '#94a3b8' }}><IconTag size={16} /></span>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9' }}>Promo Code</span>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          className="l-input"
          placeholder="Enter code..."
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === 'Enter' && handleApply()}
          style={{ letterSpacing: '0.08em', fontWeight: 600 }}
        />
        <button
          onClick={handleApply}
          disabled={loading || !code.trim()}
          style={{
            padding: '0 18px',
            background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
            border: 'none', borderRadius: 14,
            color: '#fff', fontWeight: 700, fontSize: 14,
            cursor: 'pointer', flexShrink: 0,
            opacity: (loading || !code.trim()) ? 0.45 : 1,
            transition: 'opacity .15s',
          }}
        >
          {loading ? '...' : 'Apply'}
        </button>
      </div>
    </motion.div>
  );
}

// ─── Transaction history ──────────────────────────────────────────────────────

function TransactionRow({ tx }: { tx: StarsTransaction }) {
  const positive = tx.amount > 0;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 16px',
      borderBottom: '1px solid rgba(255,255,255,.04)',
    }}>
      {/* Icon */}
      <div style={{
        width: 38, height: 38, borderRadius: 12,
        background: positive ? 'rgba(34,197,94,.1)' : 'rgba(239,68,68,.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 17, flexShrink: 0,
      }}>
        {txIcon(tx.type)}
      </div>

      {/* Description */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {tx.description}
        </div>
        <div style={{ fontSize: 12, color: '#4b5563', marginTop: 2 }}>
          {fmtDate(tx.created_at)}
        </div>
      </div>

      {/* Amount */}
      <div style={{
        fontSize: 15, fontWeight: 700,
        color: positive ? '#4ade80' : '#f87171',
        flexShrink: 0,
      }}>
        {positive ? '+' : ''}{tx.amount.toLocaleString()}
        <span style={{ fontSize: 12, fontWeight: 500, marginLeft: 3, color: '#64748b' }}>★</span>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

type TabId = 'buy' | 'history';

export default function StarsPage() {
  const { profile } = useAuthStore();
  const { balance, transactions, loadBalance, loadTransactions, addStars, loadingTx } = useStarsStore();
  const { showToast } = useUIStore();
  const [tab, setTab] = useState<TabId>('buy');

  useEffect(() => {
    if (!profile) return;
    loadBalance(profile.id);
    loadTransactions(profile.id);
  }, [profile?.id]);

  const handleBuy = async (stars: number, price: number) => {
    if (!profile) return;
    showToast(`Payment system coming soon — adding ${stars} Stars for demo`, 'info');
    await addStars(profile.id, stars, 'purchase', `Purchased ${stars} Stars`);
    showToast(`+${stars} Stars added!`, 'success');
  };

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: '#07070f',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px 12px',
        borderBottom: '1px solid rgba(255,255,255,.06)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: '#fbbf24', filter: 'drop-shadow(0 0 8px rgba(251,191,36,.5))' }}>
            <IconStar size={22} filled />
          </span>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.3px' }}>
            Lighty Stars
          </h1>
        </div>
        <p style={{ fontSize: 13, color: '#4b5563', marginTop: 4 }}>
          Use Stars to send gifts, buy usernames & numbers
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        padding: '12px 16px 0',
        gap: 8,
        flexShrink: 0,
      }}>
        {(['buy', 'history'] as TabId[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '7px 16px',
              borderRadius: 20,
              border: 'none',
              background: tab === t ? 'linear-gradient(135deg, rgba(124,58,237,.3), rgba(37,99,235,.2))' : 'rgba(255,255,255,.04)',
              color: tab === t ? '#a78bfa' : '#4b5563',
              fontSize: 13, fontWeight: 600,
              cursor: 'pointer',
              transition: 'all .15s',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            {t === 'buy' ? <><IconStar size={13} filled={tab === 'buy'} /> Buy</> : <><IconHistory size={13} /> History</>}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="scroll-container" style={{ flex: 1, paddingTop: 16 }}>
        <AnimatePresence mode="wait" initial={false}>
          {tab === 'buy' ? (
            <motion.div
              key="buy"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.2 }}
            >
              <BalanceCard balance={balance} />

              <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {STARS_TIERS.map((tier, i) => (
                  <TierCard
                    key={tier.stars}
                    stars={tier.stars}
                    price={tier.price_usd}
                    label={tier.label}
                    popular={tier.popular}
                    bonus={tier.bonus}
                    index={i}
                    onBuy={() => handleBuy(tier.stars, tier.price_usd)}
                  />
                ))}
              </div>

              {profile && <PromoSection userId={profile.id} />}

              <div style={{ height: 32 }} />
            </motion.div>
          ) : (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
            >
              {loadingTx ? (
                <div style={{ padding: '32px 0', textAlign: 'center', color: '#4b5563', fontSize: 14 }}>
                  Loading...
                </div>
              ) : transactions.length === 0 ? (
                <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                  <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.3 }}>★</div>
                  <p style={{ color: '#4b5563', fontSize: 14 }}>No transactions yet</p>
                </div>
              ) : (
                <div style={{
                  margin: '0 16px',
                  borderRadius: 20,
                  background: 'rgba(255,255,255,.03)',
                  border: '1px solid rgba(255,255,255,.07)',
                  overflow: 'hidden',
                }}>
                  {transactions.map(tx => (
                    <TransactionRow key={tx.id} tx={tx} />
                  ))}
                </div>
              )}
              <div style={{ height: 32 }} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
