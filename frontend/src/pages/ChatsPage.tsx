import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { useUIStore } from '../store/uiStore';
import Sidebar from '../components/layout/Sidebar';
import ChatHeader from '../components/chat/ChatHeader';
import MessageList from '../components/chat/MessageList';
import MessageInput from '../components/chat/MessageInput';
import ProfileSheet from '../components/profile/ProfileSheet';
import { Message } from '../types';
import { LightyLogo, IconBack } from '../components/icons';

// ── Empty / welcome state ────────────────────────────────────
function WelcomePane() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-5 select-none"
      style={{ background: '#07070f' }}>
      {/* Ambient orbs */}
      <div style={{
        position: 'fixed', width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,.08) 0%, transparent 70%)',
        top: '50%', left: '60%', transform: 'translate(-50%,-50%)',
        pointerEvents: 'none',
      }} />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}
      >
        <div style={{
          width: 80, height: 80, borderRadius: 24,
          background: 'linear-gradient(135deg, rgba(124,58,237,.15), rgba(37,99,235,.1))',
          border: '1px solid rgba(124,58,237,.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 40px rgba(124,58,237,.15)',
        }}>
          <LightyLogo size={40} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>
            Welcome to <span className="text-gradient">Lighty</span>
          </h2>
          <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, maxWidth: 260 }}>
            Select a conversation or start a new one to begin messaging
          </p>
        </div>
        <div style={{
          display: 'flex', gap: 10, marginTop: 8,
        }}>
          {['End-to-end encrypted', 'Ghost chats', 'NFT profiles'].map(f => (
            <div key={f} style={{
              padding: '6px 12px',
              background: 'rgba(255,255,255,.03)',
              border: '1px solid rgba(255,255,255,.07)',
              borderRadius: 20,
              fontSize: 12,
              color: '#94a3b8',
              fontWeight: 500,
            }}>{f}</div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ── Chat view pane ───────────────────────────────────────────
function ChatPane({ chatId }: { chatId: string }) {
  const { chats } = useChatStore();
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const chat = chats.find(c => c.id === chatId);
  const { setSidebarOpen } = useUIStore();

  if (!chat) return null;

  return (
    <motion.div
      key={chatId}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#07070f',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ambient background */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse 60% 40% at 50% 100%, rgba(124,58,237,.04) 0%, transparent 80%)',
      }} />

      <ChatHeader chat={chat} onBack={() => setSidebarOpen(true)} />

      <MessageList chatId={chatId} replyTo={replyTo} setReplyTo={setReplyTo} />

      <MessageInput
        chatId={chatId}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
      />
    </motion.div>
  );
}

// ── Main page ────────────────────────────────────────────────
export default function ChatsPage() {
  const { profile } = useAuthStore();
  const { activeChatId, loadChats } = useChatStore();
  const { sidebarOpen, setSidebarOpen, profileSheetOpen } = useUIStore();

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  useEffect(() => {
    if (profile?.id) loadChats(profile.id);
  }, [profile?.id]);

  // On mobile: show sidebar OR chat, not both
  const showSidebar = isMobile ? sidebarOpen || !activeChatId : true;
  const showChat    = isMobile ? !sidebarOpen && !!activeChatId : true;

  return (
    <div style={{
      display: 'flex',
      height: '100%',
      background: '#07070f',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Sidebar */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            key="sidebar"
            initial={isMobile ? { x: -320 } : false}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            style={{
              width: isMobile ? '100%' : 320,
              flexShrink: 0,
              height: '100%',
              zIndex: isMobile ? 20 : 1,
              position: isMobile ? 'absolute' : 'relative',
              left: 0, top: 0,
            }}
          >
            <Sidebar onChatSelect={() => isMobile && setSidebarOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', height: '100%', overflow: 'hidden' }}>
        <AnimatePresence mode="wait">
          {activeChatId && showChat ? (
            <ChatPane key={activeChatId} chatId={activeChatId} />
          ) : !isMobile ? (
            <WelcomePane key="welcome" />
          ) : null}
        </AnimatePresence>
      </div>

      {/* Profile sheet overlay */}
      <AnimatePresence>
        {profileSheetOpen && <ProfileSheet key="profile-sheet" />}
      </AnimatePresence>
    </div>
  );
}
