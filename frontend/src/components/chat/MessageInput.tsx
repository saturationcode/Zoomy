import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Message, ReactionType } from '../../types';
import { useChatStore } from '../../store/chatStore';
import {
  IconSend,
  IconAttach,
  IconMic,
  IconClose,
  IconReply,
  ReactionFire,
  ReactionHeart,
  ReactionLike,
  ReactionMindblown,
  ReactionLaugh,
  ReactionGhost,
  IconSmile,
} from '../icons';

// ─── Reaction insert panel ────────────────────────────────────────────────────

const REACTION_CHARS: { type: ReactionType; Icon: React.FC<{ size?: number }>; insert: string }[] = [
  { type: 'fire',      Icon: ReactionFire,      insert: '[fire]'      },
  { type: 'heart',     Icon: ReactionHeart,     insert: '[heart]'     },
  { type: 'like',      Icon: ReactionLike,      insert: '[like]'      },
  { type: 'mindblown', Icon: ReactionMindblown, insert: '[mindblown]' },
  { type: 'laugh',     Icon: ReactionLaugh,     insert: '[laugh]'     },
  { type: 'ghost',     Icon: ReactionGhost,     insert: '[ghost]'     },
];

// ─── Voice recording timer ────────────────────────────────────────────────────

function useRecordingTimer(running: boolean) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!running) { setSeconds(0); return; }
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);
  const label = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  return label;
}

// ─── Reply preview bar ────────────────────────────────────────────────────────

function ReplyBar({ message, onCancel }: { message: Message; onCancel: () => void }) {
  const preview =
    message.is_deleted
      ? 'Message deleted'
      : message.type === 'image'
      ? 'Photo'
      : message.type === 'voice'
      ? 'Voice message'
      : message.type === 'file'
      ? 'File'
      : (message.content ?? '').slice(0, 100);

  const senderName = message.sender?.display_name ?? message.sender?.username ?? 'Unknown';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.15 }}
      className="flex items-center gap-3 px-4 py-2 mx-0"
      style={{
        borderTop: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(124,58,237,0.08)',
      }}
    >
      <div style={{ color: '#7c3aed', flexShrink: 0 }}>
        <IconReply size={16} />
      </div>
      <div
        className="flex-1 min-w-0 pl-2"
        style={{ borderLeft: '3px solid #7c3aed' }}
      >
        <div style={{ fontSize: 11, fontWeight: 700, color: '#7c3aed', marginBottom: 1 }}>
          {senderName}
        </div>
        <div
          style={{
            fontSize: 12,
            color: '#64748b',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {preview}
        </div>
      </div>
      <button
        onClick={onCancel}
        style={{ color: '#475569', flexShrink: 0 }}
        className="p-1 rounded-lg transition-colors"
        onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = '#94a3b8')}
        onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = '#475569')}
        aria-label="Cancel reply"
      >
        <IconClose size={16} />
      </button>
    </motion.div>
  );
}

// ─── Waveform animation (recording) ──────────────────────────────────────────

function RecordingWaveform() {
  return (
    <div className="flex items-center gap-[3px]">
      {Array.from({ length: 16 }, (_, i) => (
        <div
          key={i}
          style={{
            width: 2,
            height: 4 + Math.abs(Math.sin(i * 1.1)) * 12,
            borderRadius: 2,
            background: '#ef4444',
            animation: `rec-bar 0.8s ease-in-out ${(i * 0.06).toFixed(2)}s infinite alternate`,
          }}
        />
      ))}
      <style>{`
        @keyframes rec-bar {
          from { transform: scaleY(0.4); opacity: 0.5; }
          to   { transform: scaleY(1);   opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ─── Icon button helper ───────────────────────────────────────────────────────

function IconBtn({
  onClick,
  children,
  label,
  active,
  danger,
}: {
  onClick: () => void;
  children: React.ReactNode;
  label: string;
  active?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-xl transition-all"
      style={{
        color: danger ? '#f87171' : active ? '#a78bfa' : '#64748b',
        background: active ? 'rgba(124,58,237,0.15)' : 'transparent',
      }}
      onMouseEnter={(e) => {
        if (!active)
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = active
          ? 'rgba(124,58,237,0.15)'
          : 'transparent';
      }}
    >
      {children}
    </button>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface MessageInputProps {
  chatId: string;
  replyTo?: Message | null;
  onCancelReply?: () => void;
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function MessageInput({ chatId, replyTo, onCancelReply }: MessageInputProps) {
  const sendMessage = useChatStore((s) => s.sendMessage);

  const [text, setText] = useState('');
  const [showReactionPanel, setShowReactionPanel] = useState(false);

  // Voice recording state
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerLabel = useRecordingTimer(recording);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  const resizeTextarea = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const maxHeight = 4 * 24 + 26; // ~4 rows
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
  }, []);

  useEffect(() => {
    resizeTextarea();
  }, [text, resizeTextarea]);

  // Focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, [chatId]);

  // ── Send text ─────────────────────────────────────────────────────────────

  const doSend = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setText('');
    resizeTextarea();
    await sendMessage(chatId, trimmed, 'text', replyTo?.id ?? undefined);
    if (replyTo) onCancelReply?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      doSend();
    }
  };

  // ── File attach ───────────────────────────────────────────────────────────

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // For now: send the file name as a text placeholder;
    // a full implementation would upload to Supabase Storage first.
    const isImage = file.type.startsWith('image/');
    const type = isImage ? 'image' : 'file';
    await sendMessage(chatId, file.name, type as any);
    e.target.value = '';
  };

  // ── Voice recording ───────────────────────────────────────────────────────

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mr.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        // In production: upload blob to storage, get URL, then sendMessage with media_url
        // For now we send a stub voice message
        await sendMessage(chatId, '[Voice message]', 'voice');
        stream.getTracks().forEach((t) => t.stop());
      };

      mr.start();
      mediaRecorderRef.current = mr;
      setRecording(true);
    } catch {
      // Microphone permission denied — silently ignore
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
    mediaRecorderRef.current = null;
  };

  const toggleRecording = () => {
    if (recording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // ── Reaction insert ───────────────────────────────────────────────────────

  const insertReaction = (insert: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart ?? text.length;
    const end = el.selectionEnd ?? text.length;
    const next = text.slice(0, start) + insert + text.slice(end);
    setText(next);
    setShowReactionPanel(false);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + insert.length, start + insert.length);
    }, 0);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  const hasText = text.trim().length > 0;

  return (
    <div
      className="glass-strong relative flex-shrink-0"
      style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Reply bar */}
      <AnimatePresence>
        {replyTo && (
          <ReplyBar message={replyTo} onCancel={() => onCancelReply?.()} />
        )}
      </AnimatePresence>

      {/* Recording UI */}
      <AnimatePresence>
        {recording && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            className="flex items-center gap-3 px-4 py-2 overflow-hidden"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
          >
            {/* Pulsing dot */}
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: '#ef4444',
                boxShadow: '0 0 8px #ef4444',
                animation: 'pulse-dot 1s ease-in-out infinite',
                flexShrink: 0,
              }}
            />
            <style>{`@keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.25)} }`}</style>

            <span style={{ fontSize: 13, color: '#ef4444', fontVariantNumeric: 'tabular-nums', minWidth: 36 }}>
              {timerLabel}
            </span>

            <RecordingWaveform />

            <span style={{ fontSize: 12, color: '#64748b', marginLeft: 'auto' }}>
              Tap mic to stop
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reaction insert panel */}
      <AnimatePresence>
        {showReactionPanel && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowReactionPanel(false)} />
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.14 }}
              className="absolute left-4 glass-strong rounded-2xl flex items-center gap-1 px-3 py-2 z-20"
              style={{ bottom: 'calc(100% + 8px)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
            >
              {REACTION_CHARS.map(({ type, Icon, insert }) => (
                <button
                  key={type}
                  onClick={() => insertReaction(insert)}
                  className="flex items-center justify-center rounded-xl transition-transform"
                  style={{ width: 34, height: 34 }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.25)')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)')}
                  aria-label={type}
                >
                  <Icon size={20} />
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main input row */}
      <div className="flex items-end gap-2 px-3 py-3">
        {/* Attach */}
        <IconBtn label="Attach file" onClick={() => fileInputRef.current?.click()}>
          <IconAttach size={18} />
        </IconBtn>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*,application/pdf,.doc,.docx,.txt,.zip"
          onChange={handleFileChange}
        />

        {/* Reaction toggle */}
        <IconBtn
          label="Insert reaction"
          onClick={() => setShowReactionPanel((v) => !v)}
          active={showReactionPanel}
        >
          <IconSmile size={18} />
        </IconBtn>

        {/* Textarea */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message..."
            rows={1}
            className="l-input resize-none block"
            style={{
              borderRadius: 14,
              lineHeight: '1.5',
              padding: '10px 14px',
              maxHeight: 120,
              overflowY: 'auto',
            }}
            disabled={recording}
          />
        </div>

        {/* Send / Mic button */}
        <AnimatePresence mode="wait">
          {hasText && !recording ? (
            <motion.button
              key="send"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.14 }}
              type="button"
              onClick={doSend}
              aria-label="Send message"
              className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-xl"
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                color: '#fff',
                boxShadow: '0 4px 14px rgba(124,58,237,0.4)',
              }}
            >
              <IconSend size={16} />
            </motion.button>
          ) : (
            <motion.button
              key="mic"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.14 }}
              type="button"
              onClick={toggleRecording}
              aria-label={recording ? 'Stop recording' : 'Start voice recording'}
              className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-xl transition-all"
              style={{
                background: recording
                  ? 'rgba(239,68,68,0.2)'
                  : 'transparent',
                color: recording ? '#f87171' : '#64748b',
                border: recording ? '1px solid rgba(239,68,68,0.3)' : 'none',
              }}
            >
              <IconMic size={18} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
