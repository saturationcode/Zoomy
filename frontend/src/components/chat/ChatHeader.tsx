import React from 'react';
import { motion } from 'framer-motion';
import type { Chat } from '../../types';
import { useUIStore } from '../../store/uiStore';
import Avatar from '../ui/Avatar';
import { IconBack, IconPhone, IconMore } from '../icons';

interface ChatHeaderProps {
  chat: Chat;
  onBack?: () => void;
}

function formatLastSeen(iso: string | null): string {
  if (!iso) return 'last seen recently';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'last seen just now';
  if (mins < 60) return `last seen ${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `last seen ${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `last seen ${days}d ago`;
}

export default function ChatHeader({ chat, onBack }: ChatHeaderProps) {
  const openProfileSheet = useUIStore((s) => s.openProfileSheet);

  const isDM = chat.type === 'dm';
  const otherUser = chat.other_user ?? null;

  /* ── subtitle ── */
  let subtitle: React.ReactNode;
  if (isDM && otherUser) {
    const isOnline = otherUser.status === 'online';
    subtitle = isOnline ? (
      <span className="text-[12px] font-medium" style={{ color: '#22c55e' }}>
        online
      </span>
    ) : (
      <span className="text-[12px]" style={{ color: '#64748b' }}>
        {formatLastSeen(otherUser.last_seen)}
      </span>
    );
  } else if (chat.type === 'group') {
    const count = chat.members?.length ?? 0;
    subtitle = (
      <span className="text-[12px]" style={{ color: '#64748b' }}>
        {count} member{count !== 1 ? 's' : ''}
      </span>
    );
  } else {
    subtitle = (
      <span className="text-[12px]" style={{ color: '#64748b' }}>
        channel
      </span>
    );
  }

  /* ── display name ── */
  const displayName =
    isDM && otherUser
      ? otherUser.display_name || otherUser.username
      : chat.name ?? 'Chat';

  /* ── avatar props ── */
  const avatarProfile = isDM && otherUser ? otherUser : undefined;
  const avatarColor = chat.avatar_color ?? '#7c3aed';
  const avatarName = displayName;

  const handleAvatarClick = () => {
    if (isDM && otherUser) {
      openProfileSheet(otherUser.id);
    }
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="glass-strong sticky top-0 z-10 flex items-center gap-3 px-4"
      style={{
        height: 64,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Back button — mobile only */}
      {onBack && (
        <button
          onClick={onBack}
          className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl transition-colors"
          style={{ color: '#94a3b8' }}
          aria-label="Back"
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.background =
              'rgba(255,255,255,0.06)')
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.background = 'transparent')
          }
        >
          <IconBack size={20} />
        </button>
      )}

      {/* Avatar + info */}
      <div
        className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer select-none"
        onClick={handleAvatarClick}
        role={isDM && otherUser ? 'button' : undefined}
        tabIndex={isDM && otherUser ? 0 : undefined}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && isDM && otherUser) handleAvatarClick();
        }}
      >
        <Avatar
          profile={avatarProfile}
          name={avatarName}
          color={avatarColor}
          size={36}
          showStatus={isDM}
        />
        <div className="flex flex-col min-w-0">
          <span
            className="font-semibold leading-tight truncate"
            style={{ fontSize: 15, color: '#f1f5f9' }}
          >
            {displayName}
          </span>
          <span className="leading-tight truncate">{subtitle}</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1">
        <button
          className="flex items-center justify-center w-9 h-9 rounded-xl transition-colors"
          style={{ color: '#64748b' }}
          aria-label="Call"
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = '#f1f5f9';
            (e.currentTarget as HTMLButtonElement).style.background =
              'rgba(255,255,255,0.06)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = '#64748b';
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
          }}
        >
          <IconPhone size={18} />
        </button>
        <button
          className="flex items-center justify-center w-9 h-9 rounded-xl transition-colors"
          style={{ color: '#64748b' }}
          aria-label="More options"
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = '#f1f5f9';
            (e.currentTarget as HTMLButtonElement).style.background =
              'rgba(255,255,255,0.06)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = '#64748b';
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
          }}
        >
          <IconMore size={18} />
        </button>
      </div>
    </motion.header>
  );
}
