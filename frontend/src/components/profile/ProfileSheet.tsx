import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Profile, NFTItem } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { useChatStore } from '../../store/chatStore';
import { supabase } from '../../lib/supabase';
import Avatar from '../ui/Avatar';
import {
  IconClose,
  IconUser,
  IconSettings,
  IconEdit,
  IconWallet,
  IconNFT,
  IconLogout,
  IconPhone,
  IconMore,
} from '../icons';

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  online:  'Online',
  away:    'Away',
  dnd:     'Do not disturb',
  offline: 'Offline',
};
const STATUS_COLOR: Record<string, string> = {
  online:  '#22c55e',
  away:    '#f59e0b',
  dnd:     '#ef4444',
  offline: '#475569',
};

function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLOR[status] ?? STATUS_COLOR.offline;
  const label = STATUS_LABEL[status] ?? 'Offline';
  return (
    <span
      className="inline-flex items-center gap-1 px-3 py-1 rounded-full"
      style={{
        fontSize: 12,
        fontWeight: 600,
        background: `${color}22`,
        color,
        border: `1px solid ${color}44`,
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, display: 'inline-block' }} />
      {label}
    </span>
  );
}

// ─── Info row ─────────────────────────────────────────────────────────────────

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <span style={{ color: '#475569', flexShrink: 0 }}>{icon}</span>
      <div className="flex-1 min-w-0">
        <div style={{ fontSize: 11, color: '#475569', marginBottom: 1, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
          {label}
        </div>
        <div style={{ fontSize: 14, color: '#e2e8f0', wordBreak: 'break-all' }}>{value}</div>
      </div>
    </div>
  );
}

// ─── NFT card ─────────────────────────────────────────────────────────────────

const CHAIN_COLORS: Record<string, string> = {
  ETH:      '#627eea',
  SOL:      '#9945ff',
  MATIC:    '#8247e5',
  BNB:      '#f0b90b',
  AVAX:     '#e84142',
};

function NFTCard({ nft }: { nft: NFTItem | MockNFT }) {
  const chainColor = CHAIN_COLORS[nft.chain] ?? '#7c3aed';
  return (
    <div
      className="flex-shrink-0 rounded-2xl overflow-hidden"
      style={{
        width: 120,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        transition: 'border-color 0.2s',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = `${chainColor}66`)}
      onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.08)')}
    >
      {nft.image_url ? (
        <img
          src={nft.image_url}
          alt={nft.name}
          style={{ width: '100%', height: 100, objectFit: 'cover', display: 'block' }}
        />
      ) : (
        <div
          style={{
            height: 100,
            background: `linear-gradient(135deg, ${chainColor}55, #07070f)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={chainColor} strokeWidth="1.5">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </div>
      )}
      <div style={{ padding: '8px 8px 10px' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#e2e8f0', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {nft.name}
        </div>
        <span
          style={{
            fontSize: 9,
            fontWeight: 800,
            padding: '2px 5px',
            borderRadius: 5,
            background: `${chainColor}22`,
            color: chainColor,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          {nft.chain}
        </span>
      </div>
    </div>
  );
}

// ─── Mock NFTs ────────────────────────────────────────────────────────────────

interface MockNFT {
  id: string;
  name: string;
  image_url: string;
  chain: string;
}

const MOCK_NFTS: MockNFT[] = [
  { id: 'm1', name: 'Lighty #001', image_url: '', chain: 'ETH' },
  { id: 'm2', name: 'Cyber Ape',   image_url: '', chain: 'SOL' },
  { id: 'm3', name: 'Pixel Punk',  image_url: '', chain: 'ETH' },
  { id: 'm4', name: 'Dark Matter', image_url: '', chain: 'MATIC' },
  { id: 'm5', name: 'Void Rider',  image_url: '', chain: 'BNB' },
  { id: 'm6', name: 'Ghost Zero',  image_url: '', chain: 'AVAX' },
];

// ─── Edit profile modal ───────────────────────────────────────────────────────

interface EditProfileModalProps {
  profile: Profile;
  onClose: () => void;
  onSave: (data: Partial<Profile>) => Promise<void>;
}

const AVATAR_COLORS = ['#7c3aed', '#2563eb', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6'];

function EditProfileModal({ profile, onClose, onSave }: EditProfileModalProps) {
  const [displayName, setDisplayName] = useState(profile.display_name);
  const [bio, setBio] = useState(profile.bio ?? '');
  const [username, setUsername] = useState(profile.username);
  const [color, setColor] = useState(profile.avatar_color);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({ display_name: displayName.trim(), bio: bio.trim() || null, username: username.trim(), avatar_color: color });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[60]" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.94 }}
        transition={{ duration: 0.18 }}
        className="glass-strong fixed z-[70] rounded-2xl overflow-hidden"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(380px, 90vw)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        }}
      >
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>Edit Profile</span>
          <button onClick={onClose} style={{ color: '#64748b' }}>
            <IconClose size={18} />
          </button>
        </div>

        <div className="px-5 py-4 flex flex-col gap-4">
          {/* Avatar color picker */}
          <div>
            <label style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>
              Avatar color
            </label>
            <div className="flex gap-2 flex-wrap">
              {AVATAR_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: c,
                    border: color === c ? '3px solid #fff' : '3px solid transparent',
                    boxShadow: color === c ? `0 0 0 2px ${c}` : 'none',
                    transition: 'all 0.15s',
                    flexShrink: 0,
                  }}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>
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

          <div>
            <label style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>
              Username
            </label>
            <input
              className="l-input"
              value={username}
              onChange={(e) => setUsername(e.target.value.replace(/[^a-z0-9._]/gi, '').toLowerCase())}
              placeholder="username"
              maxLength={32}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>
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

          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary"
            style={{ marginTop: 4 }}
          >
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </motion.div>
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ProfileSheet() {
  const myProfile = useAuthStore((s) => s.profile);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const logout = useAuthStore((s) => s.logout);

  const { profileSheetOpen, profileSheetUserId, closeProfileSheet } = useUIStore((s) => ({
    profileSheetOpen: s.profileSheetOpen,
    profileSheetUserId: s.profileSheetUserId,
    closeProfileSheet: s.closeProfileSheet,
  }));

  const createDM = useChatStore((s) => s.createDM);
  const selectChat = useChatStore((s) => s.selectChat);

  const [targetProfile, setTargetProfile] = useState<Profile | null>(null);
  const [nfts, setNfts] = useState<NFTItem[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const isOwnProfile = !profileSheetUserId || profileSheetUserId === myProfile?.id;
  const displayProfile = isOwnProfile ? myProfile : targetProfile;

  // Fetch target profile when sheet opens
  useEffect(() => {
    if (!profileSheetOpen) { setTargetProfile(null); setNfts([]); return; }
    if (isOwnProfile) { setTargetProfile(null); return; }

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

  // Fetch NFTs for displayed profile
  useEffect(() => {
    const uid = isOwnProfile ? myProfile?.id : profileSheetUserId;
    if (!uid || !profileSheetOpen) return;
    supabase
      .from('nfts')
      .select('*')
      .eq('owner_id', uid)
      .limit(12)
      .then(({ data }) => { if (data) setNfts(data as NFTItem[]); });
  }, [profileSheetOpen, profileSheetUserId, isOwnProfile, myProfile?.id]);

  const handleMessageUser = async () => {
    if (!myProfile || !targetProfile) return;
    const chatId = await createDM(myProfile.id, targetProfile.id);
    await selectChat(chatId);
    closeProfileSheet();
  };

  const formatMemberSince = (iso: string): string => {
    try {
      return new Date(iso).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    } catch {
      return '';
    }
  };

  const formatLastSeen = (iso: string | null): string => {
    if (!iso) return 'recently';
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  const showNFTs = isOwnProfile || nfts.length > 0;
  const displayNFTs: (NFTItem | MockNFT)[] = nfts.length > 0 ? nfts : (isOwnProfile ? MOCK_NFTS : []);

  return (
    <AnimatePresence>
      {profileSheetOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}
            onClick={closeProfileSheet}
          />

          {/* Panel */}
          <motion.aside
            key="panel"
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            className="glass-strong fixed right-0 top-0 h-full z-50 flex flex-col overflow-y-auto"
            style={{
              width: 320,
              boxShadow: '-8px 0 48px rgba(0,0,0,0.5)',
              borderLeft: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            {/* Close button */}
            <button
              onClick={closeProfileSheet}
              className="absolute top-4 right-4 z-10 flex items-center justify-center w-8 h-8 rounded-xl transition-colors"
              style={{ color: '#64748b', background: 'rgba(255,255,255,0.04)' }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)')}
              aria-label="Close"
            >
              <IconClose size={16} />
            </button>

            {loadingProfile && !displayProfile ? (
              <div className="flex items-center justify-center flex-1">
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  border: '3px solid rgba(255,255,255,0.08)',
                  borderTopColor: '#7c3aed',
                  animation: 'spin 0.8s linear infinite',
                }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            ) : displayProfile ? (
              <>
                {/* ── Profile header ──────────────────────────────── */}
                <div className="pt-14 pb-6 px-5 text-center flex flex-col items-center gap-3"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <Avatar profile={displayProfile} size={80} showStatus />
                  <div>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9', marginBottom: 2 }}>
                      {displayProfile.display_name || displayProfile.username}
                    </h2>
                    <p style={{ fontSize: 13, color: '#475569' }}>@{displayProfile.username}</p>
                  </div>
                  <StatusBadge status={displayProfile.status} />
                  {displayProfile.bio && (
                    <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5, textAlign: 'center' }}>
                      {displayProfile.bio}
                    </p>
                  )}
                </div>

                {/* ── Quick actions ────────────────────────────────── */}
                {!isOwnProfile && (
                  <div className="flex gap-3 px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <button
                      onClick={handleMessageUser}
                      className="flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl transition-colors"
                      style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.2)', color: '#a78bfa' }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(124,58,237,0.2)')}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(124,58,237,0.12)')}
                    >
                      <IconUser size={18} />
                      <span style={{ fontSize: 11, fontWeight: 600 }}>Message</span>
                    </button>
                    <button
                      className="flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl transition-colors"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#64748b' }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)')}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)')}
                    >
                      <IconPhone size={18} />
                      <span style={{ fontSize: 11, fontWeight: 600 }}>Call</span>
                    </button>
                    <button
                      className="flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl transition-colors"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#64748b' }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)')}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)')}
                    >
                      <IconMore size={18} />
                      <span style={{ fontSize: 11, fontWeight: 600 }}>More</span>
                    </button>
                  </div>
                )}

                {/* ── Info section ─────────────────────────────────── */}
                <div className="px-5 py-2 mx-4 my-4 rounded-2xl"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <InfoRow
                    icon={<IconUser size={15} />}
                    label="Username"
                    value={`@${displayProfile.username}`}
                  />
                  <InfoRow
                    icon={
                      <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                      </svg>
                    }
                    label="Last seen"
                    value={
                      displayProfile.status === 'online'
                        ? 'Online now'
                        : formatLastSeen(displayProfile.last_seen)
                    }
                  />
                  <div className="py-3" style={{ borderBottom: 'none' }}>
                    <InfoRow
                      icon={
                        <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                      }
                      label="Member since"
                      value={formatMemberSince(displayProfile.created_at)}
                    />
                  </div>
                </div>

                {/* ── NFT Gallery ──────────────────────────────────── */}
                {showNFTs && (
                  <div className="px-5 mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <IconNFT size={15} style={{ color: '#7c3aed' } as React.CSSProperties} />
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>NFT Collection</span>
                        {nfts.length === 0 && isOwnProfile && (
                          <span style={{ fontSize: 10, color: '#334155', fontStyle: 'italic' }}>(demo)</span>
                        )}
                      </div>
                      {displayNFTs.length > 3 && (
                        <button style={{ fontSize: 11, color: '#7c3aed', fontWeight: 600 }}>
                          View all
                        </button>
                      )}
                    </div>

                    {/* Wallet connect if no wallet */}
                    {isOwnProfile && !displayProfile.wallet_address && (
                      <button
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl mb-3 transition-colors"
                        style={{
                          background: 'rgba(124,58,237,0.1)',
                          border: '1px dashed rgba(124,58,237,0.3)',
                          color: '#a78bfa',
                          fontSize: 13,
                          fontWeight: 600,
                        }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(124,58,237,0.18)')}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(124,58,237,0.1)')}
                      >
                        <IconWallet size={16} />
                        Connect wallet
                      </button>
                    )}

                    {/* NFT scroll */}
                    <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                      {displayNFTs.slice(0, 6).map((nft) => (
                        <NFTCard key={nft.id} nft={nft} />
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Own profile actions ──────────────────────────── */}
                {isOwnProfile && (
                  <div className="px-5 pb-6 flex flex-col gap-2 mt-auto">
                    <button
                      onClick={() => setShowEditModal(true)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-left transition-colors"
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        color: '#e2e8f0',
                        fontSize: 14,
                        fontWeight: 500,
                      }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)')}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)')}
                    >
                      <IconEdit size={16} style={{ color: '#64748b' } as React.CSSProperties} />
                      Edit Profile
                    </button>
                    <button
                      className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-left transition-colors"
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        color: '#e2e8f0',
                        fontSize: 14,
                        fontWeight: 500,
                      }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)')}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)')}
                    >
                      <IconSettings size={16} style={{ color: '#64748b' } as React.CSSProperties} />
                      Settings
                    </button>
                    <button
                      onClick={logout}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-left transition-colors"
                      style={{
                        background: 'rgba(239,68,68,0.07)',
                        border: '1px solid rgba(239,68,68,0.15)',
                        color: '#f87171',
                        fontSize: 14,
                        fontWeight: 500,
                      }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.13)')}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.07)')}
                    >
                      <IconLogout size={16} />
                      Log out
                    </button>
                  </div>
                )}
              </>
            ) : null}
          </motion.aside>

          {/* Edit profile modal */}
          <AnimatePresence>
            {showEditModal && myProfile && (
              <EditProfileModal
                key="edit-modal"
                profile={myProfile}
                onClose={() => setShowEditModal(false)}
                onSave={updateProfile}
              />
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}
