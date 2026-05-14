import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../store/uiStore';
import { IconCheck, IconClose, IconInfo } from '../icons';

// ─── Per-type config ──────────────────────────────────────────────────────────

const TOAST_CONFIG = {
  success: {
    borderColor: '#22c55e',
    iconColor: '#4ade80',
    icon: <IconCheck size={15} />,
  },
  error: {
    borderColor: '#ef4444',
    iconColor: '#f87171',
    icon: <IconClose size={15} />,
  },
  info: {
    borderColor: '#38bdf8',
    iconColor: '#38bdf8',
    icon: <IconInfo size={15} />,
  },
} as const;

// ─── Dismiss button ───────────────────────────────────────────────────────────

function DismissButton({ onDismiss }: { onDismiss: () => void }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <button
      onClick={onDismiss}
      aria-label="Dismiss"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '22px',
        height: '22px',
        borderRadius: '6px',
        background: hovered ? 'rgba(255,255,255,.1)' : 'transparent',
        color: hovered ? '#f1f5f9' : '#475569',
        marginLeft: '2px',
        transition: 'background 0.13s, color 0.13s',
        cursor: 'pointer',
      }}
    >
      <IconClose size={12} />
    </button>
  );
}

// ─── Toast stack ─────────────────────────────────────────────────────────────

/**
 * Toast — reads from uiStore. Renders a bottom-centre stacked list of toasts,
 * sitting 90px above the bottom edge (clear of the mobile nav bar).
 *
 * Each toast uses glass-strong styling with a coloured left border:
 *  - success → green
 *  - error   → red
 *  - info    → sky-blue
 *
 * Animates in from below with framer-motion spring, exits by fading up.
 */
export default function Toast() {
  const { toasts, removeToast } = useUIStore();

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      style={{
        position: 'fixed',
        bottom: '90px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        pointerEvents: 'none',
        width: 'max-content',
        maxWidth: 'calc(100vw - 32px)',
      }}
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => {
          const cfg = TOAST_CONFIG[toast.type] ?? TOAST_CONFIG.info;

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 24, scale: 0.9  }}
              animate={{ opacity: 1, y: 0,  scale: 1    }}
              exit={{   opacity: 0, y: 8,   scale: 0.94 }}
              transition={{ type: 'spring', stiffness: 420, damping: 30 }}
              role="alert"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '11px 16px',
                /* glass-strong */
                background: 'rgba(13,13,26,.92)',
                backdropFilter: 'blur(48px)',
                WebkitBackdropFilter: 'blur(48px)',
                border: `1px solid rgba(255,255,255,.1)`,
                borderLeft: `3px solid ${cfg.borderColor}`,
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(0,0,0,.55)',
                pointerEvents: 'auto',
                maxWidth: '340px',
                minWidth: '220px',
              }}
            >
              {/* Type icon */}
              <span style={{ color: cfg.iconColor, display: 'flex', flexShrink: 0 }}>
                {cfg.icon}
              </span>

              {/* Message */}
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#f1f5f9',
                  lineHeight: '1.35',
                  flex: 1,
                }}
              >
                {toast.message}
              </span>

              {/* Dismiss */}
              <DismissButton onDismiss={() => removeToast(toast.id)} />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
