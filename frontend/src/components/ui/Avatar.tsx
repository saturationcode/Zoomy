import React from 'react';
import type { Profile } from '../../types';

interface AvatarProps {
  profile?: Profile | null;
  /** Fallback display name when profile is unavailable */
  name?: string;
  /** Override avatar background color */
  color?: string;
  /** Width and height in pixels (default 40) */
  size?: number;
  /** Show online/away/dnd/offline status dot bottom-right */
  showStatus?: boolean;
  className?: string;
  onClick?: () => void;
}

const STATUS_COLORS: Record<string, { bg: string; glow?: string }> = {
  online:  { bg: '#22c55e', glow: 'rgba(34,197,94,.65)' },
  away:    { bg: '#f59e0b' },
  dnd:     { bg: '#ef4444' },
  offline: { bg: '#475569' },
};

/**
 * Avatar — shows profile photo or coloured initials.
 *
 * If `profile.avatar_url` is set, it renders an <img>.
 * Otherwise renders the first 1–2 uppercase letters of the display name
 * on a background matching `profile.avatar_color` or the `color` prop.
 *
 * A status dot is optionally rendered bottom-right when `showStatus` is true.
 */
export default function Avatar({
  profile,
  name,
  color,
  size = 40,
  showStatus = false,
  className = '',
  onClick,
}: AvatarProps) {
  const displayName = profile?.display_name || profile?.username || name || '?';
  const bg = color || profile?.avatar_color || '#7c3aed';

  // Up to 2 initials
  const words = displayName.trim().split(/\s+/);
  const initials =
    words.length >= 2
      ? (words[0][0] + words[1][0]).toUpperCase()
      : displayName.slice(0, 2).toUpperCase();

  const status = profile?.status ?? 'offline';
  const statusStyle = STATUS_COLORS[status] ?? STATUS_COLORS.offline;

  const pipSize    = Math.max(8, Math.round(size * 0.275));
  const pipBorder  = Math.max(2, Math.round(pipSize * 0.28));
  const fontSize   = Math.round(size * (initials.length > 1 ? 0.36 : 0.42));

  return (
    <div
      className={`relative flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={displayName}
    >
      {/* Ambient colour glow */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: -Math.round(size * 0.1),
          borderRadius: '50%',
          background: bg,
          opacity: 0.2,
          filter: `blur(${Math.round(size * 0.3)}px)`,
          pointerEvents: 'none',
        }}
      />

      {profile?.avatar_url ? (
        <img
          src={profile.avatar_url}
          alt={displayName}
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            objectFit: 'cover',
            display: 'block',
            border: `1.5px solid rgba(255,255,255,0.1)`,
            boxShadow: `0 0 0 1.5px ${bg}44`,
            position: 'relative',
          }}
          onError={(e) => {
            // Hide broken image so the initials fallback below can show
            (e.currentTarget as HTMLImageElement).style.display = 'none';
          }}
        />
      ) : (
        <div
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            background: bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize,
            fontWeight: 700,
            color: '#fff',
            letterSpacing: '-0.01em',
            userSelect: 'none',
            border: `1.5px solid rgba(255,255,255,0.12)`,
            boxShadow: `0 0 0 1.5px ${bg}44`,
            position: 'relative',
          }}
        >
          {initials}
        </div>
      )}

      {showStatus && (
        <span
          aria-label={`Status: ${status}`}
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: pipSize,
            height: pipSize,
            borderRadius: '50%',
            background: statusStyle.bg,
            border: `${pipBorder}px solid #07070f`,
            boxShadow: statusStyle.glow
              ? `0 0 8px ${statusStyle.glow}`
              : undefined,
          }}
        />
      )}
    </div>
  );
}
