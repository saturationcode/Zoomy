import React, { ReactNode, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconClose } from '../icons';

interface ModalProps {
  /** Controls whether the modal is visible */
  open: boolean;
  /** Called when the user dismisses the modal (backdrop click or close button) */
  onClose: () => void;
  /** Optional heading shown at the top with gradient text */
  title?: string;
  children: ReactNode;
  /** Max-width of the card in pixels (default 480) */
  width?: number;
}

/**
 * Modal — centred overlay with glass-strong card, AnimatePresence
 * entry/exit, Escape-key dismissal, and gradient title.
 */
export default function Modal({ open, onClose, title, children, width = 480 }: ModalProps) {
  // Dismiss on Escape
  const handleKey = useCallback(
    (e: KeyboardEvent) => { if (e.key === 'Escape' && open) onClose(); },
    [open, onClose],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  // Prevent body scroll while open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* ── Backdrop ── */}
          <motion.div
            key="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 60,
              background: 'rgba(0,0,0,.72)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
            }}
            aria-hidden
          />

          {/* ── Card ── */}
          <motion.div
            key="modal-card"
            role="dialog"
            aria-modal
            aria-label={title}
            initial={{ opacity: 0, scale: 0.92, translateY: 'calc(-50% + 18px)' }}
            animate={{ opacity: 1, scale: 1,    translateY: '-50%'              }}
            exit={{   opacity: 0, scale: 0.92,  translateY: 'calc(-50% + 18px)' }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              translateX: '-50%',
              zIndex: 61,
              width: '92%',
              maxWidth: width,
              maxHeight: '88vh',
              overflowY: 'auto',
              /* glass-strong style */
              background: 'rgba(13,13,26,.92)',
              backdropFilter: 'blur(48px)',
              WebkitBackdropFilter: 'blur(48px)',
              border: '1px solid rgba(255,255,255,.1)',
              borderRadius: '20px',
              boxShadow: '0 32px 80px rgba(0,0,0,.7), inset 0 1px 0 rgba(255,255,255,.07)',
              padding: '28px',
            }}
          >
            {/* ── Header row ── */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: title ? 'space-between' : 'flex-end',
                marginBottom: title ? '24px' : '0',
              }}
            >
              {title && (
                <h2
                  style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    margin: 0,
                    background: 'linear-gradient(135deg, #a78bfa, #38bdf8)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {title}
                </h2>
              )}

              {/* Close button */}
              <CloseButton onClick={onClose} />
            </div>

            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Close Button ─────────────────────────────────────────────────────────────

function CloseButton({ onClick }: { onClick: () => void }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <button
      onClick={onClick}
      aria-label="Close"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flexShrink: 0,
        width: '32px',
        height: '32px',
        borderRadius: '10px',
        background: hovered ? 'rgba(255,255,255,.1)' : 'rgba(255,255,255,.06)',
        border: '1px solid rgba(255,255,255,.07)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: hovered ? '#f1f5f9' : '#94a3b8',
        cursor: 'pointer',
        transition: 'background 0.14s, color 0.14s',
      }}
    >
      <IconClose size={14} />
    </button>
  );
}
