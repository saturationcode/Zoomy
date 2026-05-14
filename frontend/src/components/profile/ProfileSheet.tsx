import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Profile, Gift, GiftType, AnonymousNumber, Rarity } from '../../types';
import { RARITY_CONFIG } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { useStarsStore } from '../../store/starsStore';
import { useChatStore } from '../../store/chatStore';
import { supabase } from '../../lib/supabase';
import Avatar from '../ui/Avatar';
import {
  IconClose,
  IconUser,
  IconStar,
  IconPhone,
  IconSend,
  IconEdit,
} from '../icons';

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  online: 'Online',
  away: 'Away',
  dnd: 'Do not disturb',
  offline: 'Offline',
};

const STATUS_COLOR: Record<string, string> = {
  online: '#22c55e',
  away: '#f59e0b',
  dnd: '#ef4444',
  offline: '#475569',
};

type TabId = 'profile' | 'gifts' | 'numbers';

// ─── Demo data ────────────────────────────────────────────────────────────────

interface DemoGift {
  id: string;
  gift_type: GiftType;
}

const DEMO_GIFTS: DemoGift[] = [
  {
    id: 'demo-1',
    gift_type: {
      id: 'gt-1',
      name: 'Crystal Star',
      description: 'A shimmering crystal star',
      emoji_fallback: 'star',
      animation_url: null,
      image_url: null,
      rarity: 'rare',
      stars_price: 250,
      supply_limit: null,
      total_minted: 42,
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #7c3aed 100%)',
      created_at: new Date().toISOString(),
    },
  },
  {
    id: 'demo-2',
    gift_type: {
      id: 'gt-2',
      name: 'Void Rose',
      description: 'A rose from the void',
      emoji_fallback: 'rose',
      animation_url: null,
      image_url: null,
      rarity: 'epic',
      stars_price: 750,
      supply_limit: 100,
      total_minted: 17,
      gradient: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
      created_at: new Date().toISOString(),
    },
  },
  {
    id: 'demo-3',
    gift_type: {
      id: 'gt-3',
      name: 'Golden Flame',
      description: 'An eternal golden flame',
      emoji_fallback: 'flame',
      animation_url: null,
      image_url: null,
      rarity: 'legendary',
      stars_price: 2000,
      supply_limit: 10,
      total_minted: 3,
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
      created_at: new Date().toISOString(),
    },
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLOR[status] ?? STATUS_COLOR.offline;
  const label = STATUS_LABEL[status] ?? 'Offline';
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full"
      style={{
        fontSize: 12,
        fontWeight: 600,
        background: `${color}22`,
        color,
        border: `1px solid ${color}44`,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: color,
          display: 'inline-block',
          flexShrink: 0,
        }}
      />
      {label}
    </span>
  );
}

function RarityBadge({ rarity }: { rarity: Rarity }) {
  const cfg = RARITY_CONFIG[rarity];
  return (
    <span
      style={{
        fontSize: 9,
        fontWeight: 800,
        padding: '2px 6px',
        borderRadius: 5,
        background: cfg.bg,
        color: cfg.color,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        flexShrink: 0,
      }}
    >
      {cfg.label}
    </span>
  );
}

function StarsBalanceBadge({ balance }: { balance: number }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full"
      style={{
        fontSize: 13,
        fontWeight: 700,
        background: 'rgba(245,158,11,0.12)',
        color: '#f59e0b',
        border: '1px solid rgba(245,158,11,0.25)',
      }}
    >
      <IconStar size={13} />
      {balance.toLocaleString()}
    </span>
  );
}

// ─── Gift card ────────────────────────────────────────────────────────────────

function GiftCard({ giftType }: { giftType: GiftType }) {
  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <div
        style={{
          height: 80,
          background: giftType.gradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          width={28}
          height={28}
          viewBox="0 0 24 24"
          fill="none"
          stroke="rgba(255,255,255,0.85)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 12v10H4V12" />
          <path d="M22 7H2v5h20V7z" />
          <path d="M12 22V7" />
          <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
          <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
        </svg>
      </div>
      <div style={{ padding: '8px 10px 10px' }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: '#e2e8f0',
            marginBottom: 5,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {giftType.name}
        </div>
        <RarityBadge rarity={giftType.rarity} />
      </div>
    </div>
  );
}

// ─── Number row ───────────────────────────────────────────────────────────────

function NumberRow({ number }: { number: AnonymousNumber }) {
  return (
    <div
      className="flex items-center gap-3 py-3 px-4 rounded-xl"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <span style={{ color: '#64748b', flexShrink: 0 }}>
        <IconPhone size={16} />
      </span>
      <span style={{ fontSize: 14, color: '#e2e8f0', flex: 1, fontFamily: 'monospace' }}>
        {number.number}
      </span>
      <RarityBadge rarity={number.rarity} />
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ message }: { message: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center py-12 gap-3"
      style={{ color: '#475569' }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <IconUser size={20} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 500 }}>{message}</span>
    </div>
  );
}

// ─── Tab button ───────────────────────────────────────────────────────────────

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: '8px 0',
        fontSize: 13,
        fontWeight: active ? 700 : 500,
        color: active ? '#a78bfa' : '#64748b',
        background: 'none',
        border: 'none',
        borderBottom: active ? '2px solid #a78bfa' : '2px solid transparent',
        cursor: 'pointer',
        transition: 'color 0.15s, border-color 0.15s',
      }}
    >
      {children}
    </button>
  );
}

// ─── Profile tab (own) ────────────────────────────────────────────────────────

interface ProfileTabProps {
  profile: Profile;
  onSaved: () => void;
}

const STATUS_OPTIONS: Array<{ value: string; label: string; color: string }> = [
  { value: 'online', label: 'Online', color: '#22c55e' },
  { value: 'away', label: 'Away', color: '#f59e0b' },
  { value: 'dnd', label: 'Do not disturb', color: '#ef4444' },
  { value: 'offline', label: 'Offline', color: '#475569' },
];

function ProfileTab({ profile, onSaved }: ProfileTabProps) {
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const showToast = useUIStore((s) => s.showToast);

  const [displayName, setDisplayName] = useState(profile.display_name);
  const [username, setUsername] = useState(profile.username);
  const [bio, setBio] = useState(profile.bio ?? '');
  const [status, setStatus] = useState(profile.status);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        display_name: displayName.trim(),
        username: username.trim(),
        bio: bio.trim() || null,
        status: status as Profile['status'],
      });
      showToast('Profile updated', 'success');
      onSaved();
    } catch {
      showToast('Failed to save profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Display name */}
      <div>
        <label
          style={{
            display: 'block',
            fontSize: 11,
            fontWeight: 600,
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: 6,
          }}
        >
          Display name
        </label>
        <input
          className="l-input"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Your name"
          maxLength={60}
        />
      </div>

      {/* Username */}
      <div>
        <label
          style={{
            display: 'block',
            fontSize: 11,
            fontWeight: 600,
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: 6,
          }}
        >
          Username
        </label>
        <div style={{ position: 'relative' }}>
          <span
            style={{
              position: 'absolute',
              left: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#64748b',
              fontSize: 14,
              pointerEvents: 'none',
              zIndex: 1,
            }}
          >
            @
          </span>
          <input
            className="l-input"
            value={username}
            onChange={(e) =>
              setUsername(e.target.value.replace(/[^a-z0-9._]/gi, '').toLowerCase())
            }
            placeholder="username"
            maxLength={32}
            style={{ paddingLeft: 28 }}
          />
        </div>
      </div>

      {/* Bio */}
      <div>
        <label
          style={{
            display: 'block',
            fontSize: 11,
            fontWeight: 600,
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: 6,
          }}
        >
          Bio
        </label>
        <textarea
          className="l-input resize-none"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell something about yourself..."
          rows={3}
          maxLength={200}
          style={{ borderRadius: 14 }}
        />
      </div>

      {/* Status chips */}
      <div>
        <label
          style={{
            display: 'block',
            fontSize: 11,
            fontWeight: 600,
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: 8,
          }}
        >
          Status
        </label>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatus(opt.value as Profile['status'])}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                border: status === opt.value ? `1.5px solid ${opt.color}` : '1.5px solid rgba(255,255,255,0.08)',
                background: status === opt.value ? `${opt.color}22` : 'rgba(255,255,255,0.03)',
                color: status === opt.value ? opt.color : '#64748b',
                transition: 'all 0.15s',
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: opt.color,
                  display: 'inline-block',
                  flexShrink: 0,
                }}
              />
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="btn-primary"
        style={{ marginTop: 4 }}
      >
        {saving ? 'Saving...' : 'Save changes'}
      </button>
    </div>
  );
}

// ─── Gifts tab ────────────────────────────────────────────────────────────────

function GiftsTab({ gifts }: { gifts: DemoGift[] | Gift[] }) {
  const items = gifts as DemoGift[];
  if (items.length === 0) {
    return <EmptyState message="No gifts yet" />;
  }
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 10,
      }}
    >
      {items.map((g) =>
        g.gift_type ? <GiftCard key={g.id} giftType={g.gift_type} /> : null,
      )}
    </div>
  );
}

// ─── Numbers tab ─────────────────────────────────────────────────────────────

function NumbersTab({ numbers }: { numbers: AnonymousNumber[] }) {
  if (numbers.length === 0) {
    return <EmptyState message="No numbers" />;
  }
  return (
    <div className="flex flex-col gap-2">
      {numbers.map((n) => (
        <NumberRow key={n.id} number={n} />
      ))}
    </div>
  );
}

// ─── Section motion wrapper ───────────────────────────────────────────────────

function Section({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ProfileSheet() {
  const myProfile = useAuthStore((s) => s.profile);
  const balance = useStarsStore((s) => s.balance);

  const { profileSheetOpen, profileSheetUserId, closeProfileSheet } = useUIStore((s) => ({
    profileSheetOpen: s.profileSheetOpen,
    profileSheetUserId: s.profileSheetUserId,
    closeProfileSheet: s.closeProfileSheet,
  }));

  const showToast = useUIStore((s) => s.showToast);
  const createDM = useChatStore((s) => s.createDM);
  const selectChat = useChatStore((s) => s.selectChat);

  const [targetProfile, setTargetProfile] = useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const [gifts, setGifts] = useState<DemoGift[]>(DEMO_GIFTS);
  const [numbers, setNumbers] = useState<AnonymousNumber[]>([]);

  const [activeTab, setActiveTab] = useState<TabId>('profile');

  const isOwnProfile = !profileSheetUserId || profileSheetUserId === myProfile?.id;
  const displayProfile = isOwnProfile ? myProfile : targetProfile;

  // Reset state on close
  useEffect(() => {
    if (!profileSheetOpen) {
      setTargetProfile(null);
      setActiveTab('profile');
      setGifts(DEMO_GIFTS);
      setNumbers([]);
    }
  }, [profileSheetOpen]);

  // Fetch other user's profile
  useEffect(() => {
    if (!profileSheetOpen || isOwnProfile) return;
    setLoadingProfile(true);
    supabase
      .from('profiles')
      .select('*')
      .eq('id', profileSheetUserId!)
      .single()
      .then(({ data }) => {
        if (data) setTargetProfile(data as Profile);
        setLoadingProfile(false);
      });
  }, [profileSheetOpen, profileSheetUserId, isOwnProfile]);

  // Fetch gifts for displayed profile
  useEffect(() => {
    const uid = isOwnProfile ? myProfile?.id : profileSheetUserId;
    if (!uid || !profileSheetOpen) return;
    supabase
      .from('gifts')
      .select('*, gift_type:gift_types(*)')
      .eq('to_user_id', uid)
      .order('received_at', { ascending: false })
      .limit(20)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setGifts(data as unknown as DemoGift[]);
        } else if (isOwnProfile) {
          setGifts(DEMO_GIFTS);
        } else {
          setGifts([]);
        }
      });
  }, [profileSheetOpen, profileSheetUserId, isOwnProfile, myProfile?.id]);

  // Fetch anonymous numbers
  useEffect(() => {
    const uid = isOwnProfile ? myProfile?.id : profileSheetUserId;
    if (!uid || !profileSheetOpen) return;
    supabase
      .from('anonymous_numbers')
      .select('*')
      .eq('owner_id', uid)
      .then(({ data }) => {
        if (data) setNumbers(data as AnonymousNumber[]);
      });
  }, [profileSheetOpen, profileSheetUserId, isOwnProfile, myProfile?.id]);

  const handleSendMessage = async () => {
    if (!myProfile || !targetProfile) return;
    try {
      const chatId = await createDM(myProfile.id, targetProfile.id);
      await selectChat(chatId);
      closeProfileSheet();
    } catch {
      showToast('Could not open conversation', 'error');
    }
  };

  // Tab labels based on context
  const tabs: Array<{ id: TabId; label: string }> = [
    { id: 'profile', label: isOwnProfile ? 'Profile' : 'Profile' },
    { id: 'gifts', label: 'Gifts' },
    { id: 'numbers', label: 'Numbers' },
  ];

  const effectiveTab = !isOwnProfile && activeTab === 'profile' ? 'gifts' : activeTab;

  return (
    <AnimatePresence>
      {profileSheetOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="ps-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(3px)' }}
            onClick={closeProfileSheet}
          />

          {/* Sheet */}
          <motion.div
            key="ps-sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 32 }}
            className="fixed bottom-0 left-0 right-0 z-50 flex justify-center"
            style={{ pointerEvents: 'none' }}
          >
            <div
              className="glass-strong flex flex-col overflow-hidden relative"
              style={{
                width: '100%',
                maxWidth: 500,
                height: '90vh',
                borderRadius: '24px 24px 0 0',
                boxShadow: '0 -8px 48px rgba(0,0,0,0.5)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderBottom: 'none',
                pointerEvents: 'all',
              }}
            >
              {/* Close button */}
              <button
                onClick={closeProfileSheet}
                aria-label="Close profile"
                className="absolute top-4 right-4 z-10 flex items-center justify-center w-8 h-8 rounded-xl transition-colors"
                style={{ color: '#64748b', background: 'rgba(255,255,255,0.05)' }}
              >
                <IconClose size={16} />
              </button>

              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
                <div
                  style={{
                    width: 36,
                    height: 4,
                    borderRadius: 2,
                    background: 'rgba(255,255,255,0.12)',
                  }}
                />
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                {loadingProfile && !displayProfile ? (
                  <div className="flex items-center justify-center" style={{ height: 200 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        border: '3px solid rgba(255,255,255,0.08)',
                        borderTopColor: '#7c3aed',
                        animation: 'spin 0.8s linear infinite',
                      }}
                    />
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                  </div>
                ) : displayProfile ? (
                  <div className="flex flex-col" style={{ padding: '8px 0 32px' }}>
                    {/* ── Header ── */}
                    <Section delay={0}>
                      <div
                        className="flex flex-col items-center gap-3 px-6 py-6"
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                      >
                        <Avatar profile={displayProfile} size={88} showStatus />

                        <div className="text-center">
                          <h2
                            style={{
                              fontSize: 20,
                              fontWeight: 700,
                              color: '#f1f5f9',
                              marginBottom: 3,
                            }}
                          >
                            {displayProfile.display_name || displayProfile.username}
                          </h2>
                          <p style={{ fontSize: 14, color: '#64748b' }}>
                            @{displayProfile.username}
                          </p>
                        </div>

                        <StatusBadge status={displayProfile.status} />

                        {displayProfile.bio && (
                          <p
                            style={{
                              fontSize: 13,
                              color: '#94a3b8',
                              fontStyle: 'italic',
                              lineHeight: 1.6,
                              textAlign: 'center',
                              maxWidth: 340,
                            }}
                          >
                            {displayProfile.bio}
                          </p>
                        )}

                        <StarsBalanceBadge
                          balance={
                            isOwnProfile
                              ? balance || displayProfile.stars_balance || 0
                              : displayProfile.stars_balance || 0
                          }
                        />
                      </div>
                    </Section>

                    {/* ── Other user actions ── */}
                    {!isOwnProfile && (
                      <Section delay={0.05}>
                        <div
                          className="flex gap-3 px-6 py-4"
                          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                        >
                          <button
                            onClick={handleSendMessage}
                            className="btn-primary flex-1 flex items-center justify-center gap-2"
                          >
                            <IconSend size={15} />
                            Send Message
                          </button>
                          <button
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl transition-colors"
                            style={{
                              background: 'rgba(255,255,255,0.04)',
                              border: '1px solid rgba(255,255,255,0.09)',
                              color: '#94a3b8',
                              fontSize: 14,
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            <IconStar size={15} />
                            Send Gift
                          </button>
                        </div>
                      </Section>
                    )}

                    {/* ── Tabs ── */}
                    <Section delay={0.1}>
                      <div
                        className="flex px-6"
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                      >
                        {tabs
                          .filter((t) => isOwnProfile || t.id !== 'profile')
                          .map((t) => (
                            <TabButton
                              key={t.id}
                              active={effectiveTab === t.id}
                              onClick={() => setActiveTab(t.id)}
                            >
                              {t.label}
                            </TabButton>
                          ))}
                      </div>
                    </Section>

                    {/* ── Tab content ── */}
                    <Section delay={0.15}>
                      <div style={{ padding: '16px 20px 0' }}>
                        {effectiveTab === 'profile' && isOwnProfile && (
                          <ProfileTab
                            profile={displayProfile}
                            onSaved={() => {
                              /* already toasted inside */
                            }}
                          />
                        )}
                        {effectiveTab === 'gifts' && (
                          <GiftsTab gifts={gifts} />
                        )}
                        {effectiveTab === 'numbers' && (
                          <NumbersTab numbers={numbers} />
                        )}
                      </div>
                    </Section>
                  </div>
                ) : null}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
