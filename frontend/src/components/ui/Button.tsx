import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  /** Shows a spinning SVG and disables the button while true */
  loading?: boolean;
  /** Icon rendered before children */
  icon?: ReactNode;
  /** Stretch button to full container width */
  fullWidth?: boolean;
}

// ─── Spinner ──────────────────────────────────────────────────────────────────

const Spinner = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    style={{ animation: 'lighty-spin 0.75s linear infinite', flexShrink: 0 }}
    xmlns="http://www.w3.org/2000/svg"
  >
    <style>{`@keyframes lighty-spin { to { transform: rotate(360deg); } }`}</style>
    <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,.25)" strokeWidth="2" />
    <path d="M8 2A6 6 0 0 1 14 8" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// ─── Style maps ───────────────────────────────────────────────────────────────

const VARIANT_STYLES: Record<string, React.CSSProperties> = {
  primary: {
    background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
    color: '#fff',
    boxShadow: '0 4px 20px rgba(124,58,237,.4)',
    border: 'none',
  },
  secondary: {
    background: 'rgba(255,255,255,.05)',
    border: '1px solid rgba(255,255,255,.1)',
    color: '#f1f5f9',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
  },
  ghost: {
    background: 'transparent',
    border: '1px solid transparent',
    color: '#94a3b8',
  },
  danger: {
    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
    color: '#fff',
    boxShadow: '0 4px 16px rgba(239,68,68,.35)',
    border: 'none',
  },
  icon: {
    background: 'transparent',
    border: 'none',
    color: '#94a3b8',
    padding: '8px',
    borderRadius: '10px',
  },
} as const;

const SIZE_STYLES = {
  sm: { padding: '8px 14px',  fontSize: '13px', borderRadius: '10px', fontWeight: 600 },
  md: { padding: '11px 20px', fontSize: '14px', borderRadius: '12px', fontWeight: 600 },
  lg: { padding: '14px 24px', fontSize: '15px', borderRadius: '14px', fontWeight: 700 },
} as const;

// Hover box-shadows for variants that support it
const HOVER_SHADOWS: Partial<Record<string, string>> = {
  primary: '0 8px 32px rgba(124,58,237,.55)',
  danger:  '0 8px 24px rgba(239,68,68,.5)',
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function Button({
  variant = 'ghost',
  size = 'md',
  loading = false,
  icon,
  fullWidth = false,
  children,
  disabled,
  style,
  onMouseEnter,
  onMouseLeave,
  ...props
}: ButtonProps) {
  const [hovered, setHovered] = React.useState(false);

  const variantStyle = VARIANT_STYLES[variant];
  const sizeStyle    = variant === 'icon' ? {} : SIZE_STYLES[size];

  const isDisabled = disabled || loading;

  const hoverStyle: React.CSSProperties = hovered && !isDisabled
    ? {
        boxShadow: HOVER_SHADOWS[variant] ?? variantStyle.boxShadow,
        ...(variant === 'ghost' && { background: 'rgba(255,255,255,.06)', color: '#f1f5f9' }),
        ...(variant === 'secondary' && { background: 'rgba(255,255,255,.08)', borderColor: 'rgba(255,255,255,.15)' }),
        ...(variant === 'icon' && { background: 'rgba(255,255,255,.06)', color: '#f1f5f9' }),
      }
    : {};

  return (
    <motion.button
      whileHover={!isDisabled ? { scale: 1.02, y: variant === 'icon' ? 0 : -1 } : {}}
      whileTap={!isDisabled   ? { scale: 0.97 } : {}}
      transition={{ type: 'spring', stiffness: 420, damping: 26 }}
      disabled={isDisabled}
      onMouseEnter={(e) => {
        setHovered(true);
        onMouseEnter?.(e as React.MouseEvent<HTMLButtonElement>);
      }}
      onMouseLeave={(e) => {
        setHovered(false);
        onMouseLeave?.(e as React.MouseEvent<HTMLButtonElement>);
      }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.5 : 1,
        width: fullWidth ? '100%' : 'auto',
        transition: 'background 0.15s, box-shadow 0.18s, color 0.15s, border-color 0.15s',
        whiteSpace: 'nowrap',
        lineHeight: '1.2',
        ...variantStyle,
        ...sizeStyle,
        ...hoverStyle,
        ...style,
      }}
      {...(props as any)}
    >
      {loading ? <Spinner /> : icon}
      {children}
    </motion.button>
  );
}
