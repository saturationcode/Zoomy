import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';
import { useUIStore } from '../../store/uiStore';
import { useStarsStore } from '../../store/starsStore';
import { supabase } from '../../lib/supabase';
import type { Chat, Profile } from '../../types';
import {
  LightyLogo,
  IconSearch,
  IconPlus,
  IconBell,
  IconSettings,
  IconGroup,
  IconGhost,
  IconStar,
} from '../icons';

// ─── helpers ────────────────────────────────────────────────────────────────

function formatTime(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: 'short' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map(w => w[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// ─── Avatar ──────────────────────────────────────────────────────────────────

interface AvatarProps {
  profile?: Profile | null;
  name?: string;
  color?: string;
  url?: string | null;
  size?: number;
  online?: boolean;
}

function Avatar({ profile, name, color, url, size = 44, online = false }: AvatarProps) {
  const resolvedName = profile?.display_name ?? profile?.username ?? name ?? '?';
  const resolvedColor = profile?.avatar_color ?? color ?? '#7c3aed';
  const resolvedUrl = profile?.avatar_url ?? url ?? null;

  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: resolvedUrl ? undefined : resolvedColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: size * 0.38,
          fontWeight: 700,
          color: '#fff',
          overflow: 'hidden',
          flexShrink: 0,
          border: '1.5px solid rgba(255,255,255,0.08)',
        }}
      >
        {resolvedUrl ? (
          <img src={resolvedUrl} alt={resolvedName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          getInitials(resolvedName)
        )}
      </div>
      {online && (
        <motion.span
          className="status-dot status-online"
          animate={{
            boxShadow: [
              '0 0 0 0 rgba(34,197,94,.4)',
              '0 0 0 4px rgba(34,197,94,0)',
              '0 0 0 0 rgba(34,197,94,0)',
            ],
          }}
          transition={{
            duration: 1.6,
            repeat: Infinity,
            repeatDelay: 3 - 1.6,
            ease: 'easeOut',
          }}
          style={{
            position: 'absolute',
            bottom: 1,
            right: 1,
          }}
        />
      )}
    </div>
  );
}

// ─── Skeleton chat item ──────────────────────────────────────────────────────

function SkeletonItem() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 12px',
        borderRadius: 12,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
          flexShrink: 0,
          animation: 'pulse 1.6s ease-in-out infinite',
        }}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
        <div
          style={{
            height: 12,
            width: '55%',
            borderRadius: 6,
            background: 'rgba(255,255,255,0.05)',
            animation: 'pulse 1.6s ease-in-out infinite',
          }}
        />
        <div
          style={{
            height: 10,
            width: '80%',
            borderRadius: 6,
            background: 'rgba(255,255,255,0.04)',
            animation: 'pulse 1.6s ease-in-out 0.15s infinite',
          }}
        />
      </div>
    </div>
  );
}

// ─── Chat item ────────────────────────────────────────────────────────────────

interface ChatItemProps {
  chat: Chat;
  active: boolean;
  onClick: () => void;
  myId: string;
  index: number;
}

function ChatItem({ chat, active, onClick, myId: _myId, index }: ChatItemProps) {
  const isDM = chat.type === 'dm';
  const displayName = isDM
    ? (chat.other_user?.display_name ?? chat.other_user?.username ?? 'Unknown')
    : (chat.name ?? 'Group');
  const isOnline = isDM && chat.other_user?.status === 'online';
  const lastMsg = chat.last_message;
  const isGhost = isDM && chat.other_user?.is_anonymous;

  const preview = (() => {
    if (!lastMsg) return null;
    if (lastMsg.is_deleted) return '🗑 Message deleted';
    if (lastMsg.type === 'image') return '📷 Photo';
    if (lastMsg.type === 'voice') return '🎙 Voice message';
    if (lastMsg.type === 'file') return '📎 File';
    return lastMsg.content ?? '';
  })();

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ delay: index * 0.04, duration: 0.2, ease: 'easeOut' }}
      whileHover={!active ? { backgroundColor: 'rgba(255,255,255,.05)' } : undefined}
      onClick={onClick}
      className={active ? 'chat-item-active' : ''}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        width: '100%',
        minHeight: 64,
        padding: '10px 12px',
        borderRadius: 12,
        background: active ? undefined : 'transparent',
        border: active ? undefined : '1px solid transparent',
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      <Avatar
        profile={isDM ? chat.other_user : undefined}
        name={displayName}
        color={chat.avatar_color ?? '#7c3aed'}
        url={chat.avatar_url}
        size={44}
        online={isOnline}
      />

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Top row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: '#f1f5f9',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1,
              minWidth: 0,
            }}
          >
            {displayName}
          </span>
          <span style={{ fontSize: 11, color: '#475569', flexShrink: 0 }}>
            {formatTime(chat.last_message_at)}
          </span>
        </div>

        {/* Bottom row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
          {isGhost ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#475569' }}>
              <IconGhost size={12} />
              <span style={{ fontSize: 12, color: '#475569' }}>Anonymous user</span>
            </div>
          ) : (
            <span
              style={{
                fontSize: 12,
                color: '#64748b',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1,
                minWidth: 0,
              }}
            >
              {preview ?? <span style={{ color: '#475569', fontStyle: 'italic' }}>No messages yet</span>}
            </span>
          )}

          {!!chat.unread_count && chat.unread_count > 0 && (
            <motion.span
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 0.4, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
              style={{
                flexShrink: 0,
                minWidth: 18,
                height: 18,
                padding: '0 5px',
                borderRadius: 99,
                background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                color: '#fff',
                fontSize: 10,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {chat.unread_count > 99 ? '99+' : chat.unread_count}
            </motion.span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── NewChatModal ─────────────────────────────────────────────────────────────

interface NewChatModalProps {
  myId: string;
  onClose: () => void;
  onChatCreated: (chatId: string) => void;
}

type NewChatTab = 'dm' | 'group';

function NewChatModal({ myId, onClose, onChatCreated }: NewChatModalProps) {
  const { createDM, createGroup } = useChatStore();
  const { showToast } = useUIStore();

  const [modalTab, setModalTab] = useState<NewChatTab>('dm');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Profile[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Profile[]>([]);
  const [groupName, setGroupName] = useState('');
  const [creating, setCreating] = useState(false);
  const searchRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchUsers = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setResults([]); return; }
    setSearching(true);
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', myId)
        .ilike('username', `%${q.trim()}%`)
        .limit(12);
      setResults((data as Profile[]) ?? []);
    } finally {
      setSearching(false);
    }
  }, [myId]);

  useEffect(() => {
    if (searchRef.current) clearTimeout(searchRef.current);
    searchRef.current = setTimeout(() => searchUsers(query), 320);
    return () => { if (searchRef.current) clearTimeout(searchRef.current); };
  }, [query, searchUsers]);

  const toggleUser = (p: Profile) => {
    if (modalTab === 'dm') {
      setSelectedUsers([p]);
    } else {
      setSelectedUsers(prev =>
        prev.find(u => u.id === p.id) ? prev.filter(u => u.id !== p.id) : [...prev, p]
      );
    }
  };

  const isSelected = (p: Profile) => selectedUsers.some(u => u.id === p.id);

  const handleCreate = async () => {
    if (selectedUsers.length === 0) return;
    setCreating(true);
    try {
      let chatId: string;
      if (modalTab === 'dm') {
        chatId = await createDM(myId, selectedUsers[0].id);
      } else {
        if (!groupName.trim()) { showToast('Group name is required', 'error'); setCreating(false); return; }
        chatId = await createGroup(groupName.trim(), selectedUsers.map(u => u.id), myId);
      }
      onChatCreated(chatId);
      onClose();
    } catch (err: any) {
      showToast(err.message ?? 'Failed to create chat', 'error');
    } finally {
      setCreating(false);
    }
  };

  // Close on backdrop click
  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={handleBackdrop}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        padding: 16,
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 20 }}
        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
        className="glass-strong"
        style={{
          width: '100%',
          maxWidth: 420,
          borderRadius: 24,
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          maxHeight: '80vh',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9' }}>New Conversation</h2>
          <button
            onClick={onClose}
            className="btn-ghost"
            style={{ padding: '6px 10px', borderRadius: 10 }}
          >
            ✕
          </button>
        </div>

        {/* Tab switcher */}
        <div
          style={{
            display: 'flex',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 12,
            padding: 3,
            gap: 3,
          }}
        >
          {(['dm', 'group'] as NewChatTab[]).map(t => (
            <button
              key={t}
              onClick={() => { setModalTab(t); setSelectedUsers([]); }}
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: modalTab === t
                  ? 'linear-gradient(135deg, rgba(124,58,237,0.5), rgba(37,99,235,0.45))'
                  : 'transparent',
                color: modalTab === t ? '#f1f5f9' : '#64748b',
                boxShadow: modalTab === t ? '0 2px 10px rgba(124,58,237,0.2)' : 'none',
              }}
            >
              {t === 'dm' ? 'Direct Message' : 'Create Group'}
            </button>
          ))}
        </div>

        {/* Group name (group tab only) */}
        <AnimatePresence>
          {modalTab === 'group' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <input
                className="l-input"
                placeholder="Group name…"
                value={groupName}
                onChange={e => setGroupName(e.target.value)}
                maxLength={60}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selected users chips (group tab) */}
        <AnimatePresence>
          {modalTab === 'group' && selectedUsers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}
            >
              {selectedUsers.map(u => (
                <span
                  key={u.id}
                  onClick={() => toggleUser(u)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '4px 10px 4px 4px',
                    borderRadius: 99,
                    background: 'rgba(124,58,237,0.25)',
                    border: '1px solid rgba(124,58,237,0.35)',
                    fontSize: 12,
                    color: '#c4b5fd',
                    cursor: 'pointer',
                  }}
                >
                  <Avatar profile={u} size={20} />
                  {u.display_name ?? u.username}
                  <span style={{ color: '#7c3aed', marginLeft: 2 }}>×</span>
                </span>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search input */}
        <div style={{ position: 'relative' }}>
          <div
            style={{
              position: 'absolute',
              left: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#475569',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none',
            }}
          >
            <IconSearch size={15} />
          </div>
          <input
            className="l-input"
            style={{ paddingLeft: 38 }}
            placeholder="Search by username…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
          />
        </div>

        {/* Results */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2, minHeight: 80 }}>
          {searching && (
            <div style={{ textAlign: 'center', padding: '20px 0', color: '#475569', fontSize: 13 }}>
              Searching…
            </div>
          )}
          {!searching && query.length >= 2 && results.length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px 0', color: '#475569', fontSize: 13 }}>
              No users found for "{query}"
            </div>
          )}
          {!searching && query.length < 2 && (
            <div style={{ textAlign: 'center', padding: '20px 0', color: '#475569', fontSize: 13 }}>
              Type at least 2 characters to search
            </div>
          )}
          {results.map(p => {
            const selected = isSelected(p);
            return (
              <button
                key={p.id}
                onClick={() => toggleUser(p)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 10px',
                  borderRadius: 12,
                  background: selected ? 'rgba(124,58,237,0.15)' : 'transparent',
                  border: `1px solid ${selected ? 'rgba(124,58,237,0.3)' : 'transparent'}`,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s',
                  width: '100%',
                }}
                onMouseEnter={e => { if (!selected) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)'; }}
                onMouseLeave={e => { if (!selected) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
              >
                <Avatar profile={p} size={38} online={p.status === 'online'} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9' }}>
                    {p.display_name ?? p.username}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>@{p.username}</div>
                </div>
                {selected && (
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 11,
                      color: '#fff',
                      flexShrink: 0,
                    }}
                  >
                    ✓
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Create button */}
        <button
          className="btn-primary"
          onClick={handleCreate}
          disabled={creating || selectedUsers.length === 0 || (modalTab === 'group' && !groupName.trim())}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        >
          {creating ? (
            <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
            </svg>
          ) : modalTab === 'dm' ? 'Start conversation' : 'Create group'}
        </button>
      </motion.div>
    </motion.div>
  );
}

// ─── SidebarNavBtn ────────────────────────────────────────────────────────────

function SidebarNavBtn({
  active, onClick, label, children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '9px 12px',
        borderRadius: 12,
        border: 'none',
        cursor: 'pointer',
        background: active
          ? 'linear-gradient(135deg, rgba(124,58,237,.18), rgba(37,99,235,.12))'
          : 'transparent',
        color: active ? '#a78bfa' : '#475569',
        fontSize: 13,
        fontWeight: active ? 600 : 500,
        transition: 'background .15s, color .15s',
        textAlign: 'left',
      }}
      onMouseEnter={e => {
        if (!active) {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,.04)';
          (e.currentTarget as HTMLButtonElement).style.color = '#94a3b8';
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
          (e.currentTarget as HTMLButtonElement).style.color = '#475569';
        }
      }}
    >
      {children}
      <span style={{ flex: 1 }}>{label}</span>
      {active && (
        <div style={{
          width: 6, height: 6, borderRadius: '50%',
          background: 'linear-gradient(135deg, #7c3aed, #38bdf8)',
          flexShrink: 0,
        }} />
      )}
    </button>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export default function Sidebar() {
  const { profile } = useAuthStore();
  const { chats, activeChatId, loadChats, selectChat, loadingChats } = useChatStore();
  const { newChatOpen, openNewChat, closeNewChat, openProfileSheet, openSettings } = useUIStore();
  const { balance } = useStarsStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [search, setSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  // Load chats on mount / when profile changes
  useEffect(() => {
    if (profile?.id) loadChats(profile.id);
  }, [profile?.id, loadChats]);

  const filtered = search.trim()
    ? chats.filter(c => {
        const name = c.type === 'dm'
          ? (c.other_user?.display_name ?? c.other_user?.username ?? '')
          : (c.name ?? '');
        return name.toLowerCase().includes(search.trim().toLowerCase());
      })
    : chats;

  const handleChatCreated = async (chatId: string) => {
    if (profile?.id) await loadChats(profile.id);
    await selectChat(chatId);
  };

  const handleSelectChat = (chatId: string) => {
    selectChat(chatId);
  };

  return (
    <>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          background: 'rgba(7,7,15,0.95)',
          borderRight: '1px solid rgba(255,255,255,0.05)',
          boxShadow: '2px 0 40px rgba(0,0,0,0.5)',
          overflow: 'hidden',
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
            flexShrink: 0,
          }}
        >
          {/* Logo + name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <LightyLogo size={24} />
            <span
              className="text-gradient"
              style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.2px' }}
            >
              Lighty
            </span>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button
              className="btn-ghost"
              style={{ padding: 8, borderRadius: 10, color: '#64748b', display: 'flex' }}
              title="Notifications"
            >
              <IconBell size={18} />
            </button>
            {/* New chat (+) button with rotation + scale on hover/tap */}
            <motion.button
              className="btn-ghost"
              onClick={openNewChat}
              whileHover={{ rotate: 90, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              style={{ padding: 8, borderRadius: 10, color: '#64748b', display: 'flex' }}
              title="New chat"
            >
              <IconPlus size={18} />
            </motion.button>
          </div>
        </div>

        {/* ── Search ── */}
        <div style={{ padding: '0 12px 8px' }}>
          <motion.div
            animate={{ scale: searchFocused ? 1.01 : 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="glass-md"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 12px',
              borderRadius: 16,
            }}
          >
            <IconSearch size={15} className="" />
            <input
              style={{
                flex: 1,
                background: 'none',
                border: 'none',
                outline: 'none',
                fontSize: 14,
                color: '#f1f5f9',
                minWidth: 0,
              }}
              placeholder="Search chats…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{ color: '#475569', fontSize: 14, lineHeight: 1, padding: 2 }}
              >
                ✕
              </button>
            )}
          </motion.div>
        </div>

        {/* ── Chat list ── */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '4px 8px',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            // Subtle fade-out at the bottom edge
            maskImage: 'linear-gradient(to bottom, black calc(100% - 32px), transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black calc(100% - 32px), transparent 100%)',
          }}
        >
          {loadingChats ? (
            // Skeleton items
            Array.from({ length: 4 }).map((_, i) => <SkeletonItem key={i} />)
          ) : filtered.length === 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                gap: 10,
                padding: '40px 20px',
                color: '#475569',
                textAlign: 'center',
              }}
            >
              <IconGhost size={32} />
              <p style={{ fontSize: 14, margin: 0 }}>
                {search ? `No results for "${search}"` : 'No chats yet'}
              </p>
              {!search && (
                <button
                  className="btn-ghost"
                  onClick={openNewChat}
                  style={{ fontSize: 13, color: '#7c3aed' }}
                >
                  Start a conversation
                </button>
              )}
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {filtered.map((chat, i) => (
                <ChatItem
                  key={chat.id}
                  chat={chat}
                  active={chat.id === activeChatId}
                  onClick={() => handleSelectChat(chat.id)}
                  myId={profile?.id ?? ''}
                  index={i}
                />
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* ── Bottom nav ── */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,.05)',
          flexShrink: 0,
          padding: '8px 8px 10px',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}>
          {/* Marketplace */}
          <SidebarNavBtn
            active={location.pathname === '/market'}
            onClick={() => navigate('/market')}
            label="Marketplace"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z"/>
              <path d="M3 6H21"/>
              <path d="M16 10C16 11.0609 15.5786 12.0783 14.8284 12.8284C14.0783 13.5786 13.0609 14 12 14C10.9391 14 9.92172 13.5786 9.17157 12.8284C8.42143 12.0783 8 11.0609 8 10"/>
            </svg>
          </SidebarNavBtn>

          {/* Stars */}
          <SidebarNavBtn
            active={location.pathname === '/stars'}
            onClick={() => navigate('/stars')}
            label={`Stars · ${balance.toLocaleString()} ★`}
          >
            <IconStar size={18} />
          </SidebarNavBtn>

          {/* Divider */}
          <div style={{ height: 1, background: 'rgba(255,255,255,.05)', margin: '4px 0' }} />

          {/* Settings + Profile row */}
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              className="btn-ghost"
              onClick={openSettings}
              style={{ flex: 1, padding: '8px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 12 }}
              title="Settings"
            >
              <IconSettings size={18} />
            </button>

            <button
              onClick={() => profile && openProfileSheet(profile.id)}
              style={{
                flex: 1, padding: '8px 0', borderRadius: 12,
                background: 'transparent', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background .15s',
              }}
              title="Your profile"
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,.04)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              {profile ? (
                <Avatar profile={profile} size={28} online />
              ) : (
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,.08)' }} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── New Chat Modal ── */}
      <AnimatePresence>
        {newChatOpen && profile && (
          <NewChatModal
            myId={profile.id}
            onClose={closeNewChat}
            onChatCreated={handleChatCreated}
          />
        )}
      </AnimatePresence>
    </>
  );
}
