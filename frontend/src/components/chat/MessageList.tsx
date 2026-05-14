import React, { useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Message } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';
import MessageBubble from './MessageBubble';
import { IconLock, IconPin } from '../icons';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDayLabel(date: Date): string {
  const now = new Date();
  if (isSameDay(date, now)) return 'Today';
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(date, yesterday)) return 'Yesterday';
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
}

const GROUP_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

// ─── Skeleton bubbles ─────────────────────────────────────────────────────────

function SkeletonBubble({ isOwn }: { isOwn: boolean }) {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} px-4 my-2`}>
      <div
        className="rounded-2xl"
        style={{
          width: 160 + Math.random() * 80,
          height: 40,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.05)',
          animation: 'pulse 1.6s ease-in-out infinite',
        }}
      />
    </div>
  );
}

function SkeletonList() {
  const rows = [true, false, false, true, false, true, true, false];
  return (
    <div className="py-4">
      {rows.map((own, i) => (
        <SkeletonBubble key={i} isOwn={own} />
      ))}
    </div>
  );
}

// ─── Date separator ───────────────────────────────────────────────────────────

function DateSeparator({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center my-4 px-4 select-none">
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: '#475569',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.07)',
          padding: '4px 14px',
          borderRadius: 20,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </div>
    </div>
  );
}

// ─── Pinned message banner ────────────────────────────────────────────────────

function PinnedBanner({ message }: { message: Message }) {
  const preview =
    message.type === 'image'
      ? 'Photo'
      : message.type === 'voice'
      ? 'Voice message'
      : message.type === 'file'
      ? 'File'
      : (message.content ?? '').slice(0, 80);

  return (
    <div
      className="mx-4 mb-2 flex items-center gap-3 rounded-xl px-3 py-2 cursor-pointer"
      style={{
        background: 'rgba(124,58,237,0.1)',
        border: '1px solid rgba(124,58,237,0.22)',
        borderLeft: '3px solid #7c3aed',
      }}
    >
      <IconPin size={14} style={{ color: '#7c3aed', flexShrink: 0 } as React.CSSProperties} />
      <div className="flex-1 min-w-0">
        <div style={{ fontSize: 10, fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 1 }}>
          Pinned message
        </div>
        <div
          style={{
            fontSize: 12,
            color: '#94a3b8',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {preview}
        </div>
      </div>
    </div>
  );
}

// ─── Typing indicator ─────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 px-4 my-2">
      <div style={{ width: 28 }} />
      <div
        className="msg-in flex items-center gap-1"
        style={{ borderRadius: 18, borderBottomLeftRadius: 6, padding: '10px 14px' }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#64748b',
              animation: `typing-dot 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
      <style>{`
        @keyframes typing-dot {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-4 px-8 select-none">
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#334155',
        }}
      >
        <IconLock size={22} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 15, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
          No messages yet
        </p>
        <p style={{ fontSize: 13, color: '#334155' }}>
          Send a message to start the conversation
        </p>
      </div>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface MessageListProps {
  chatId: string;
  replyTo: Message | null;
  setReplyTo: (msg: Message | null) => void;
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function MessageList({ chatId, replyTo: _replyTo, setReplyTo }: MessageListProps) {
  const profile = useAuthStore((s) => s.profile);
  const messages = useChatStore((s) => s.messages[chatId] ?? []);
  const loadingMessages = useChatStore((s) => s.loadingMessages);
  const addReaction = useChatStore((s) => s.addReaction);
  const removeReaction = useChatStore((s) => s.removeReaction);

  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Track previous message count to detect newly added messages vs. initial load
  const prevCountRef = useRef<number>(0);
  const isInitialLoadRef = useRef<boolean>(true);

  // Auto-scroll to bottom on new messages (smooth)
  useEffect(() => {
    if (!bottomRef.current) return;
    bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // After first render with messages, mark initial load done
  useEffect(() => {
    if (messages.length > 0 && isInitialLoadRef.current) {
      // Allow a tick so stagger animations play, then mark done
      const id = setTimeout(() => {
        isInitialLoadRef.current = false;
      }, messages.length * 40 + 350);
      return () => clearTimeout(id);
    }
  }, [messages.length]);

  // Pinned message (first one found)
  const pinnedMessage = useMemo(
    () => messages.find((m) => m.is_pinned && !m.is_deleted) ?? null,
    [messages]
  );

  // Handle react: toggle (add or remove)
  const handleReact = async (messageId: string, reaction: string) => {
    if (!profile) return;
    const msg = messages.find((m) => m.id === messageId);
    if (!msg) return;
    const existing = (msg.reactions ?? []).find(
      (r) => r.user_id === profile.id && r.reaction === reaction
    );
    if (existing) {
      await removeReaction(messageId, chatId, reaction, profile.id);
    } else {
      await addReaction(messageId, chatId, reaction, profile.id);
    }
  };

  // Build grouped list with date separators
  type ListItem =
    | { kind: 'date'; label: string; key: string }
    | { kind: 'message'; message: Message; showAvatar: boolean; key: string; index: number };

  const listItems = useMemo((): ListItem[] => {
    const items: ListItem[] = [];
    let lastDate: Date | null = null;
    let lastSenderId: string | null = null;
    let lastTimestamp: number | null = null;
    let msgIndex = 0;

    for (const msg of messages) {
      const msgDate = new Date(msg.created_at);

      // Date separator
      if (!lastDate || !isSameDay(lastDate, msgDate)) {
        items.push({ kind: 'date', label: formatDayLabel(msgDate), key: `date-${msg.id}` });
        lastDate = msgDate;
        lastSenderId = null;
        lastTimestamp = null;
      }

      // Grouping: show avatar only for first message in a group
      const isGrouped =
        lastSenderId === msg.sender_id &&
        lastTimestamp !== null &&
        msgDate.getTime() - lastTimestamp < GROUP_THRESHOLD_MS;

      items.push({
        kind: 'message',
        message: msg,
        showAvatar: !isGrouped,
        key: msg.id,
        index: msgIndex,
      });

      msgIndex++;
      lastSenderId = msg.sender_id;
      lastTimestamp = msgDate.getTime();
    }

    return items;
  }, [messages]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      ref={containerRef}
      className="flex flex-col flex-1 overflow-y-auto"
      style={{
        minHeight: 0,
        WebkitOverflowScrolling: 'touch',
        overscrollBehaviorY: 'contain',
      } as React.CSSProperties}
    >
      {/* Pinned banner */}
      {pinnedMessage && (
        <div className="sticky top-0 z-10 pt-2">
          <PinnedBanner message={pinnedMessage} />
        </div>
      )}

      {/* Loading skeleton */}
      {loadingMessages && messages.length === 0 && <SkeletonList />}

      {/* Empty state */}
      {!loadingMessages && messages.length === 0 && <EmptyState />}

      {/* Message list */}
      {messages.length > 0 && (
        <div className="py-3">
          <AnimatePresence initial={false}>
            {listItems.map((item) => {
              if (item.kind === 'date') {
                return (
                  <motion.div
                    key={item.key}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  >
                    <DateSeparator label={item.label} />
                  </motion.div>
                );
              }

              const { message, showAvatar, index } = item;
              const isOwn = message.sender_id === profile?.id;

              // Stagger delay only during initial load
              const staggerDelay = isInitialLoadRef.current
                ? Math.min(index * 0.04, 0.3)
                : 0;

              return (
                <motion.div
                  key={item.key}
                  initial={{ opacity: 0, y: 12, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{
                    type: 'spring',
                    stiffness: 380,
                    damping: 30,
                    delay: staggerDelay,
                  }}
                >
                  <MessageBubble
                    message={message}
                    isOwn={isOwn}
                    showAvatar={showAvatar}
                    onReact={handleReact}
                    onReply={setReplyTo}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Typing indicator stub */}
          {/* <TypingIndicator /> */}
        </div>
      )}

      {/* Scroll anchor */}
      <div ref={bottomRef} style={{ height: 8 }} />
    </div>
  );
}
