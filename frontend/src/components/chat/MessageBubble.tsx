import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Message, ReactionType } from '../../types';
import { useAuthStore } from '../../store/authStore';
import Avatar from '../ui/Avatar';
import {
  IconReply,
  IconDelete,
  IconEdit,
  IconPin,
  IconPlay,
  IconPause,
  IconFile,
  IconClose,
  ReactionFire,
  ReactionHeart,
  ReactionLike,
  ReactionMindblown,
  ReactionLaugh,
  ReactionGhost,
} from '../icons';

// ─── Reaction registry ────────────────────────────────────────────────────────

interface ReactionMeta {
  type: ReactionType;
  Icon: React.FC<{ size?: number; className?: string }>;
  color: string;
}

const REACTIONS: ReactionMeta[] = [
  { type: 'fire',      Icon: ReactionFire,      color: '#f97316' },
  { type: 'heart',     Icon: ReactionHeart,     color: '#f43f5e' },
  { type: 'like',      Icon: ReactionLike,      color: '#3b82f6' },
  { type: 'mindblown', Icon: ReactionMindblown, color: '#a78bfa' },
  { type: 'laugh',     Icon: ReactionLaugh,     color: '#facc15' },
  { type: 'ghost',     Icon: ReactionGhost,     color: '#94a3b8' },
];

function reactionIcon(type: ReactionType, size = 14) {
  const meta = REACTIONS.find((r) => r.type === type);
  if (!meta) return null;
  const { Icon, color } = meta;
  return <Icon size={size} className="" style={{ color } as React.CSSProperties} />;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Voice player ─────────────────────────────────────────────────────────────

function VoicePlayer({ url, duration }: { url: string; duration?: number }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().catch(() => null);
      setPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    setProgress(audio.currentTime / audio.duration);
  };

  const handleEnded = () => {
    setPlaying(false);
    setProgress(0);
  };

  const durationSecs = duration ?? 0;
  const displayDuration = `${Math.floor(durationSecs / 60)}:${String(Math.floor(durationSecs % 60)).padStart(2, '0')}`;

  const bars = Array.from({ length: 24 }, (_, i) => {
    const h = 4 + Math.abs(Math.sin(i * 1.3 + 1)) * 16;
    const filled = progress * 24 > i;
    return { h, filled };
  });

  return (
    <div className="flex items-center gap-3" style={{ minWidth: 180 }}>
      <audio
        ref={audioRef}
        src={url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        preload="metadata"
      />
      <button
        onClick={toggle}
        className="flex-shrink-0 flex items-center justify-center rounded-full"
        style={{
          width: 34,
          height: 34,
          background: 'rgba(255,255,255,0.15)',
          color: '#fff',
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.25)')}
        onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.15)')}
        aria-label={playing ? 'Pause' : 'Play'}
      >
        {playing ? <IconPause size={14} /> : <IconPlay size={14} />}
      </button>

      {/* Waveform */}
      <div className="flex items-end gap-[2px]" style={{ height: 24 }}>
        {bars.map(({ h, filled }, i) => (
          <div
            key={i}
            style={{
              width: 2,
              height: h,
              borderRadius: 2,
              background: filled ? '#fff' : 'rgba(255,255,255,0.3)',
              transition: 'background 0.1s',
            }}
          />
        ))}
      </div>

      <span style={{ fontSize: 11, opacity: 0.7, whiteSpace: 'nowrap' }}>
        {displayDuration}
      </span>
    </div>
  );
}

// ─── Reply preview (inside bubble) ───────────────────────────────────────────

function ReplyPreview({ reply }: { reply: Message }) {
  const text =
    reply.is_deleted
      ? 'Message deleted'
      : reply.type === 'image'
      ? 'Photo'
      : reply.type === 'voice'
      ? 'Voice message'
      : reply.type === 'file'
      ? 'File'
      : reply.content ?? '';

  const senderName = reply.sender?.display_name ?? reply.sender?.username ?? 'Unknown';

  return (
    <div
      className="mb-2 pl-3 rounded-lg"
      style={{
        borderLeft: '3px solid rgba(255,255,255,0.4)',
        background: 'rgba(255,255,255,0.07)',
        padding: '6px 10px 6px 10px',
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.85, marginBottom: 2 }}>
        {senderName}
      </div>
      <div
        style={{
          fontSize: 12,
          opacity: 0.65,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: 240,
        }}
      >
        {text}
      </div>
    </div>
  );
}

// ─── Context menu ─────────────────────────────────────────────────────────────

interface ContextMenuProps {
  x: number;
  y: number;
  isOwn: boolean;
  onClose: () => void;
  onReply: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onPin: () => void;
  onOpenReactions: () => void;
}

function ContextMenu({
  x, y, isOwn, onClose, onReply, onDelete, onEdit, onPin, onOpenReactions,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Adjust so menu doesn't go off screen
  const safeX = Math.min(x, window.innerWidth - 180);
  const safeY = Math.min(y, window.innerHeight - 240);

  const items: { label: string; icon?: React.ReactNode; action: () => void; danger?: boolean }[] = [
    { label: 'Reply',  icon: <IconReply size={15} />,  action: onReply },
    { label: 'React',  icon: <ReactionHeart size={15} />, action: onOpenReactions },
    { label: 'Pin',    icon: <IconPin size={15} />,    action: onPin },
    ...(isOwn
      ? [
          { label: 'Edit',   icon: <IconEdit size={15} />,   action: onEdit },
          { label: 'Delete', icon: <IconDelete size={15} />, action: onDelete, danger: true },
        ]
      : []),
  ];

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        transition={{ duration: 0.12 }}
        className="glass-strong fixed z-50 rounded-2xl overflow-hidden"
        style={{
          left: safeX,
          top: safeY,
          minWidth: 164,
          boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
        }}
      >
        {items.map((item, idx) => (
          <button
            key={item.label}
            onClick={() => { item.action(); onClose(); }}
            className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
            style={{
              fontSize: 14,
              color: item.danger ? '#f87171' : '#e2e8f0',
              borderBottom: idx < items.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'transparent')}
          >
            <span style={{ color: item.danger ? '#f87171' : '#94a3b8' }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </motion.div>
    </>
  );
}

// ─── Reaction picker ──────────────────────────────────────────────────────────

function ReactionPicker({ onPick, onClose }: { onPick: (r: ReactionType) => void; onClose: () => void }) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.88, y: 8 }}
        transition={{ duration: 0.14 }}
        className="glass-strong absolute z-50 rounded-2xl flex items-center gap-1 px-3 py-2"
        style={{
          bottom: 'calc(100% + 8px)',
          left: '50%',
          transform: 'translateX(-50%)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          whiteSpace: 'nowrap',
        }}
      >
        {REACTIONS.map(({ type, Icon, color }) => (
          <button
            key={type}
            onClick={() => { onPick(type); onClose(); }}
            className="flex items-center justify-center rounded-xl transition-transform"
            style={{ width: 34, height: 34 }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.3)')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)')}
            aria-label={type}
          >
            <Icon size={20} style={{ color } as React.CSSProperties} />
          </button>
        ))}
      </motion.div>
    </>
  );
}

// ─── NFT card ─────────────────────────────────────────────────────────────────

function NFTCard({ meta }: { meta: Record<string, unknown> }) {
  const name = (meta.name as string) ?? 'NFT';
  const imageUrl = meta.image_url as string | undefined;
  const chain = (meta.chain as string) ?? 'ETH';

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        width: 200,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(124,58,237,0.35)',
        boxShadow: '0 0 20px rgba(124,58,237,0.15)',
      }}
    >
      {imageUrl ? (
        <img src={imageUrl} alt={name} style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }} />
      ) : (
        <div
          style={{
            height: 160,
            background: 'linear-gradient(135deg,#7c3aed,#2563eb)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </div>
      )}
      <div className="px-3 py-2">
        <div style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9', marginBottom: 4 }}>{name}</div>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            padding: '2px 6px',
            borderRadius: 6,
            background: 'rgba(124,58,237,0.25)',
            color: '#a78bfa',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {chain}
        </span>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
  onReact: (messageId: string, reaction: string) => void;
  onReply: (message: Message) => void;
}

export default function MessageBubble({
  message,
  isOwn,
  showAvatar = true,
  onReact,
  onReply,
}: MessageBubbleProps) {
  const profile = useAuthStore((s) => s.profile);

  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number } | null>(null);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);

  // ── Context menu trigger ──────────────────────────────────────────────────

  const openCtxMenu = useCallback((x: number, y: number) => {
    setCtxMenu({ x, y });
  }, []);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    openCtxMenu(e.clientX, e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    longPressTimer.current = setTimeout(() => {
      openCtxMenu(touch.clientX, touch.clientY);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  // ── Reactions ─────────────────────────────────────────────────────────────

  const reactionGroups: Map<ReactionType, { count: number; hasOwn: boolean }> = new Map();
  for (const r of message.reactions ?? []) {
    const existing = reactionGroups.get(r.reaction) ?? { count: 0, hasOwn: false };
    reactionGroups.set(r.reaction, {
      count: existing.count + 1,
      hasOwn: existing.hasOwn || r.user_id === profile?.id,
    });
  }

  const handleReactionClick = (type: ReactionType) => {
    onReact(message.id, type);
  };

  // ── System message ────────────────────────────────────────────────────────

  if (message.type === 'system') {
    return (
      <div className="flex justify-center my-2 px-4">
        <span
          style={{
            fontSize: 12,
            color: '#475569',
            fontStyle: 'italic',
            background: 'rgba(255,255,255,0.03)',
            padding: '4px 12px',
            borderRadius: 20,
          }}
        >
          {message.content}
        </span>
      </div>
    );
  }

  // ── Deleted message ───────────────────────────────────────────────────────

  if (message.is_deleted) {
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} px-4 my-1`}>
        <span
          style={{
            fontSize: 13,
            color: '#475569',
            fontStyle: 'italic',
            padding: '8px 14px',
            borderRadius: 16,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          Message deleted
        </span>
      </div>
    );
  }

  // ── Bubble content ────────────────────────────────────────────────────────

  const renderContent = () => {
    switch (message.type) {
      case 'text':
        return (
          <p
            style={{
              fontSize: 15,
              lineHeight: 1.5,
              color: isOwn ? '#fff' : '#e2e8f0',
              wordBreak: 'break-word',
              whiteSpace: 'pre-wrap',
            }}
          >
            {message.content}
          </p>
        );

      case 'image':
        return (
          <div>
            <img
              src={message.media_url ?? ''}
              alt="Image"
              className="rounded-xl block"
              style={{ maxWidth: 280, width: '100%', objectFit: 'cover' }}
            />
            {message.content && (
              <p style={{ fontSize: 13, color: isOwn ? 'rgba(255,255,255,0.85)' : '#94a3b8', marginTop: 6 }}>
                {message.content}
              </p>
            )}
          </div>
        );

      case 'voice': {
        const dur = (message.media_meta?.duration as number) ?? 0;
        return <VoicePlayer url={message.media_url ?? ''} duration={dur} />;
      }

      case 'file': {
        const fileName = (message.media_meta?.name as string) ?? 'file';
        const fileSize = (message.media_meta?.size as number) ?? 0;
        return (
          <a
            href={message.media_url ?? '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 no-underline"
            style={{ minWidth: 160 }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: 'rgba(255,255,255,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: isOwn ? '#fff' : '#a78bfa',
              }}
            >
              <IconFile size={18} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: isOwn ? '#fff' : '#e2e8f0' }}>
                {fileName}
              </div>
              {fileSize > 0 && (
                <div style={{ fontSize: 11, color: isOwn ? 'rgba(255,255,255,0.6)' : '#64748b' }}>
                  {formatFileSize(fileSize)}
                </div>
              )}
            </div>
          </a>
        );
      }

      case 'nft':
        return <NFTCard meta={message.media_meta ?? {}} />;

      default:
        return (
          <p style={{ fontSize: 15, color: isOwn ? '#fff' : '#e2e8f0' }}>
            {message.content}
          </p>
        );
    }
  };

  // ── Footer: timestamp + read receipt ─────────────────────────────────────

  const footer = (
    <div
      className="flex items-center gap-1 mt-1 select-none"
      style={{ justifyContent: 'flex-end' }}
    >
      <span style={{ fontSize: 11, color: isOwn ? 'rgba(255,255,255,0.55)' : '#475569' }}>
        {formatTime(message.created_at)}
      </span>
      {message.edited_at && (
        <span style={{ fontSize: 10, color: isOwn ? 'rgba(255,255,255,0.4)' : '#334155' }}>
          edited
        </span>
      )}
      {isOwn && (
        <span style={{ color: 'rgba(255,255,255,0.55)' }}>
          {/* Always show double-check for delivered; you'd pass read state as a prop if needed */}
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="17 6 9 17 4 12" />
            <polyline points="22 6 12 17" />
          </svg>
        </span>
      )}
    </div>
  );

  // ── Full render ───────────────────────────────────────────────────────────

  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      className={`flex ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end gap-2 px-4 my-[2px]`}
    >
      {/* Avatar for incoming messages */}
      {!isOwn && (
        <div style={{ width: 28, flexShrink: 0 }}>
          {showAvatar ? (
            <Avatar profile={message.sender} size={28} />
          ) : null}
        </div>
      )}

      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[min(420px,75%)]`}>
        {/* Sender name for group messages (non-own) */}
        {!isOwn && showAvatar && message.sender && (
          <span style={{ fontSize: 11, fontWeight: 600, color: '#7c3aed', marginBottom: 3, paddingLeft: 2 }}>
            {message.sender.display_name ?? message.sender.username}
          </span>
        )}

        {/* Reaction picker (positioned relative to bubble) */}
        <div className="relative w-full">
          <AnimatePresence>
            {showReactionPicker && (
              <ReactionPicker
                onPick={handleReactionClick}
                onClose={() => setShowReactionPicker(false)}
              />
            )}
          </AnimatePresence>

          {/* Bubble */}
          <div
            ref={bubbleRef}
            className={isOwn ? 'msg-out' : 'msg-in'}
            onContextMenu={handleContextMenu}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchMove={handleTouchEnd}
            style={{
              borderRadius: 18,
              padding: '10px 14px',
              cursor: 'default',
              userSelect: 'text',
              position: 'relative',
              // slightly sharpen corners toward the avatar side
              ...(isOwn
                ? { borderBottomRightRadius: 6 }
                : { borderBottomLeftRadius: 6 }),
            }}
          >
            {/* Reply preview */}
            {message.reply_to && <ReplyPreview reply={message.reply_to} />}

            {renderContent()}
            {footer}
          </div>
        </div>

        {/* Reactions row */}
        {reactionGroups.size > 0 && (
          <div className="flex flex-wrap gap-1 mt-1 px-1">
            {Array.from(reactionGroups.entries()).map(([type, { count, hasOwn }]) => (
              <button
                key={type}
                onClick={() => handleReactionClick(type)}
                className="flex items-center gap-1 rounded-full transition-all"
                style={{
                  padding: '3px 8px',
                  fontSize: 12,
                  background: hasOwn
                    ? 'rgba(124,58,237,0.22)'
                    : 'rgba(255,255,255,0.06)',
                  border: hasOwn
                    ? '1px solid rgba(124,58,237,0.4)'
                    : '1px solid rgba(255,255,255,0.08)',
                  color: '#e2e8f0',
                  fontWeight: 500,
                }}
              >
                {reactionIcon(type, 13)}
                <span>{count}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Context menu */}
      <AnimatePresence>
        {ctxMenu && (
          <ContextMenu
            x={ctxMenu.x}
            y={ctxMenu.y}
            isOwn={isOwn}
            onClose={() => setCtxMenu(null)}
            onReply={() => onReply(message)}
            onDelete={() => { /* stub – parent would handle */ }}
            onEdit={() => { /* stub */ }}
            onPin={() => { /* stub */ }}
            onOpenReactions={() => setShowReactionPicker(true)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
