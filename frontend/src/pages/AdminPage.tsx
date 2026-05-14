import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useStarsStore } from '../store/starsStore';
import { useUIStore } from '../store/uiStore';
import { supabase } from '../lib/supabase';

// Only accessible if username === 'sex'

function IconStar() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
    </svg>
  );
}

type Section = 'stars' | 'numbers' | 'gifts';

const SECTION_TABS: { id: Section; label: string; emoji: string }[] = [
  { id: 'stars',   label: 'Stars',     emoji: '⭐' },
  { id: 'numbers', label: 'Numbers',   emoji: '📱' },
  { id: 'gifts',   label: 'Gifts',     emoji: '🎁' },
];

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', letterSpacing: '0.07em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function AdminInput({
  value, onChange, placeholder, type = 'text',
}: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: '100%', padding: '12px 14px', borderRadius: 12, boxSizing: 'border-box',
        background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)',
        color: '#f1f5f9', fontSize: 14, outline: 'none',
      }}
    />
  );
}

function ActionBtn({ label, onClick, danger }: { label: string; onClick: () => void; danger?: boolean }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      whileHover={{ scale: 1.02 }}
      style={{
        width: '100%', padding: '13px', borderRadius: 14, border: 'none', cursor: 'pointer',
        fontSize: 14, fontWeight: 700, marginTop: 4,
        background: danger
          ? 'linear-gradient(135deg, rgba(239,68,68,.4), rgba(220,38,38,.3))'
          : 'linear-gradient(135deg, rgba(124,58,237,.6), rgba(37,99,235,.5))',
        color: '#f1f5f9',
        boxShadow: danger
          ? '0 4px 20px rgba(239,68,68,.2)'
          : '0 4px 20px rgba(124,58,237,.3)',
      }}
    >
      {label}
    </motion.button>
  );
}

// ─── Stars section ────────────────────────────────────────────────────────────

function StarsSection() {
  const profile = useAuthStore(s => s.profile);
  const { adminGiveStars } = useStarsStore();
  const { showToast } = useUIStore();
  const [target, setTarget] = useState('');
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);

  const handleGive = async () => {
    if (!target || !amount || !profile) return;
    setBusy(true);
    const n = parseInt(amount, 10);
    if (isNaN(n) || n <= 0) { showToast('Укажи нормальное количество', 'error'); setBusy(false); return; }
    const { ok, message } = await adminGiveStars(target, n, profile.id);
    showToast(message, ok ? 'success' : 'error');
    if (ok) { setTarget(''); setAmount(''); }
    setBusy(false);
  };

  return (
    <div>
      <Row label="Username получателя">
        <AdminInput value={target} onChange={setTarget} placeholder="@username" />
      </Row>
      <Row label="Количество Stars">
        <AdminInput value={amount} onChange={setAmount} placeholder="500" type="number" />
      </Row>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
        {[100, 500, 1000, 5000, 10000, 99999].map(n => (
          <motion.button
            key={n}
            whileTap={{ scale: 0.94 }}
            onClick={() => setAmount(String(n))}
            style={{
              padding: '8px', borderRadius: 10,
              background: amount === String(n) ? 'rgba(124,58,237,.35)' : 'rgba(255,255,255,.05)',
              border: `1px solid ${amount === String(n) ? 'rgba(124,58,237,.6)' : 'rgba(255,255,255,.08)'}`,
              color: amount === String(n) ? '#c4b5fd' : '#6b7280',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}
          >
            {n >= 1000 ? `${n/1000}k` : n}★
          </motion.button>
        ))}
      </div>
      <ActionBtn label={busy ? 'Отправка…' : `Выдать ${amount || '?'}★ → @${target || '?'}`} onClick={handleGive} />
    </div>
  );
}

// ─── Numbers section ──────────────────────────────────────────────────────────

function NumbersSection() {
  const { showToast } = useUIStore();
  const profile = useAuthStore(s => s.profile);
  const [prefix, setPrefix] = useState('+999');
  const [digits, setDigits] = useState('');
  const [recipientUser, setRecipientUser] = useState('');
  const [busy, setBusy] = useState(false);

  const generated = digits ? `${prefix} ${digits.slice(0, 3)} ${digits.slice(3, 7)}` : `${prefix} ??? ????`;

  const handleCreate = async () => {
    if (!digits || digits.length < 7) { showToast('Введи минимум 7 цифр', 'error'); return; }
    setBusy(true);
    try {
      const { data: target } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', recipientUser.replace('@', ''))
        .single();
      if (!target && recipientUser) { showToast('Пользователь не найден', 'error'); setBusy(false); return; }

      // Store number in local log
      const log = JSON.parse(localStorage.getItem('admin_numbers') ?? '[]');
      log.unshift({ number: generated, owner: recipientUser || 'unassigned', created: new Date().toISOString() });
      localStorage.setItem('admin_numbers', JSON.stringify(log.slice(0, 50)));

      showToast(`Номер ${generated} создан${recipientUser ? ` → @${recipientUser}` : ''}`, 'success');
      setDigits('');
    } catch { showToast('Ошибка', 'error'); }
    setBusy(false);
  };

  return (
    <div>
      <Row label="Тип номера">
        <div style={{ display: 'flex', gap: 8 }}>
          {['+999', '+888'].map(p => (
            <motion.button
              key={p}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPrefix(p)}
              style={{
                flex: 1, padding: '10px', borderRadius: 12, cursor: 'pointer',
                background: prefix === p ? 'linear-gradient(135deg, rgba(245,158,11,.35), rgba(124,58,237,.25))' : 'rgba(255,255,255,.05)',
                border: `1px solid ${prefix === p ? 'rgba(245,158,11,.5)' : 'rgba(255,255,255,.08)'}`,
                color: prefix === p ? '#fbbf24' : '#6b7280',
                fontWeight: 700, fontSize: 15,
              }}
            >{p}</motion.button>
          ))}
        </div>
      </Row>
      <Row label="Цифры номера">
        <AdminInput value={digits} onChange={v => setDigits(v.replace(/\D/g, '').slice(0, 10))} placeholder="9999999999" type="number" />
      </Row>
      <div style={{
        padding: '12px 16px', borderRadius: 12, marginBottom: 16,
        background: 'rgba(245,158,11,.08)', border: '1px solid rgba(245,158,11,.2)',
        textAlign: 'center', fontSize: 18, fontWeight: 800, color: '#fbbf24', letterSpacing: '0.05em',
      }}>
        {generated}
      </div>
      <Row label="Выдать пользователю (опционально)">
        <AdminInput value={recipientUser} onChange={setRecipientUser} placeholder="@username" />
      </Row>
      <ActionBtn label={busy ? 'Создание…' : 'Создать номер'} onClick={handleCreate} />
    </div>
  );
}

// ─── Gifts section ────────────────────────────────────────────────────────────

function GiftsSection() {
  const { showToast } = useUIStore();
  const [giftName, setGiftName] = useState('');
  const [rarity, setRarity] = useState<'common'|'rare'|'epic'|'legendary'>('rare');
  const [recipientUser, setRecipientUser] = useState('');
  const [busy, setBusy] = useState(false);

  const rarities = ['common', 'rare', 'epic', 'legendary'] as const;
  const rarityColors: Record<string, string> = {
    common: '#6b7280', rare: '#3b82f6', epic: '#a855f7', legendary: '#f59e0b',
  };

  const handleCreate = async () => {
    if (!giftName) { showToast('Введи название подарка', 'error'); return; }
    setBusy(true);
    const log = JSON.parse(localStorage.getItem('admin_gifts') ?? '[]');
    log.unshift({ name: giftName, rarity, recipient: recipientUser || 'unassigned', created: new Date().toISOString() });
    localStorage.setItem('admin_gifts', JSON.stringify(log.slice(0, 50)));
    showToast(`🎁 ${giftName} (${rarity}) создан${recipientUser ? ` → @${recipientUser}` : ''}`, 'success');
    setGiftName('');
    setBusy(false);
  };

  return (
    <div>
      <Row label="Название NFT подарка">
        <AdminInput value={giftName} onChange={setGiftName} placeholder="Golden Phoenix" />
      </Row>
      <Row label="Редкость">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
          {rarities.map(r => (
            <motion.button
              key={r}
              whileTap={{ scale: 0.94 }}
              onClick={() => setRarity(r)}
              style={{
                padding: '10px', borderRadius: 10, cursor: 'pointer',
                background: rarity === r ? `${rarityColors[r]}22` : 'rgba(255,255,255,.04)',
                border: `1px solid ${rarity === r ? rarityColors[r] + '66' : 'rgba(255,255,255,.08)'}`,
                color: rarity === r ? rarityColors[r] : '#6b7280',
                fontWeight: 700, fontSize: 13, textTransform: 'capitalize',
              }}
            >{r}</motion.button>
          ))}
        </div>
      </Row>
      <Row label="Выдать пользователю (опционально)">
        <AdminInput value={recipientUser} onChange={setRecipientUser} placeholder="@username" />
      </Row>
      <ActionBtn label={busy ? 'Создание…' : `Создать ${rarity} подарок`} onClick={handleCreate} />
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const profile = useAuthStore(s => s.profile);
  const [section, setSection] = useState<Section>('stars');

  // Access gate
  if (!profile || profile.username !== 'sex') {
    return (
      <div style={{
        height: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 12,
        background: '#07070f', color: '#334155',
      }}>
        <span style={{ fontSize: 40 }}>🔒</span>
        <p style={{ fontSize: 14, margin: 0 }}>Доступ запрещён</p>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: '#07070f' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ padding: '24px 20px 0' }}
      >
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '4px 10px', borderRadius: 8,
          background: 'rgba(239,68,68,.12)', border: '1px solid rgba(239,68,68,.25)',
          marginBottom: 8,
        }}>
          <span style={{ fontSize: 10, fontWeight: 800, color: '#f87171', letterSpacing: '0.1em' }}>ADMIN PANEL</span>
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9', margin: '0 0 4px', letterSpacing: '-0.3px' }}>
          Control Panel
        </h1>
        <p style={{ fontSize: 12, color: '#4b5563', margin: 0 }}>@{profile.username} · Full access</p>
      </motion.div>

      {/* Section tabs */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{
          display: 'flex', gap: 6,
          background: 'rgba(255,255,255,.04)',
          border: '1px solid rgba(255,255,255,.07)',
          borderRadius: 16, padding: 4,
        }}>
          {SECTION_TABS.map(t => {
            const active = section === t.id;
            return (
              <motion.button
                key={t.id}
                onClick={() => setSection(t.id)}
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
                    layoutId="admin-tab-bg"
                    style={{
                      position: 'absolute', inset: 0, borderRadius: 13,
                      background: 'linear-gradient(135deg, rgba(124,58,237,.4), rgba(37,99,235,.3))',
                    }}
                    transition={{ type: 'spring', stiffness: 500, damping: 36 }}
                  />
                )}
                <span style={{ position: 'relative', zIndex: 1, fontSize: 18 }}>{t.emoji}</span>
                <span style={{
                  position: 'relative', zIndex: 1,
                  fontSize: 10, fontWeight: active ? 700 : 500,
                  color: active ? '#c4b5fd' : '#4b5563',
                }}>{t.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Section content */}
      <div style={{ padding: '20px 20px 100px' }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={section}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{
              background: 'rgba(255,255,255,.03)',
              border: '1px solid rgba(255,255,255,.07)',
              borderRadius: 20,
              padding: '20px',
            }}
          >
            {section === 'stars'   && <StarsSection />}
            {section === 'numbers' && <NumbersSection />}
            {section === 'gifts'   && <GiftsSection />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
