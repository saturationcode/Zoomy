import React from 'react';

// ─── Shared Props ─────────────────────────────────────────────────────────────

interface IconProps {
  size?: number;
  className?: string;
}

// ─── App Logo ─────────────────────────────────────────────────────────────────

/**
 * LightyLogo — stylised "L" with lightning bolt integrated.
 * Uses gradient fill: purple → blue.
 */
export function LightyLogo({ size = 32, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="lighty-logo-grad" x1="2" y1="2" x2="38" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor="#a78bfa" />
          <stop offset="1" stopColor="#38bdf8" />
        </linearGradient>
      </defs>
      {/* Soft ambient glow ring */}
      <circle cx="20" cy="20" r="18" fill="url(#lighty-logo-grad)" fillOpacity="0.12" />
      {/* "L" — vertical stem + horizontal base */}
      <path
        d="M12 9 L12 28 L27 28"
        stroke="url(#lighty-logo-grad)"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Lightning bolt positioned at the inner corner of the "L" */}
      <path
        d="M21 17.5 L17 24 L20.5 24 L16.5 31"
        stroke="url(#lighty-logo-grad)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── UI Icons ─────────────────────────────────────────────────────────────────

export function IconSend({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 2L11 13" />
      <path d="M22 2L15 22L11 13L2 9L22 2Z" />
    </svg>
  );
}

export function IconSearch({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21L16.65 16.65" />
    </svg>
  );
}

export function IconPlus({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8V16" />
      <path d="M8 12H16" />
    </svg>
  );
}

export function IconClose({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L6 18" />
      <path d="M6 6L18 18" />
    </svg>
  );
}

export function IconBack({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18L9 12L15 6" />
    </svg>
  );
}

/** Two-slider settings icon (horizontal sliders) */
export function IconSettings({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {/* Top track */}
      <path d="M3 7H21" />
      {/* Top handle */}
      <circle cx="8" cy="7" r="2.5" />
      {/* Bottom track */}
      <path d="M3 17H21" />
      {/* Bottom handle */}
      <circle cx="16" cy="17" r="2.5" />
    </svg>
  );
}

export function IconUser({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20C4 16.6863 7.58172 14 12 14C16.4183 14 20 16.6863 20 20" />
    </svg>
  );
}

export function IconGroup({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2 20C2 16.968 5.13401 14.5 9 14.5" />
      <circle cx="17" cy="9" r="3" />
      <path d="M14.5 20C14.5 17.5 15.7 15.5 17 15C18.3 14.5 19.6 14.6 20.5 15.2C21.5 15.9 22 17.3 22 20" />
    </svg>
  );
}

/** Broadcast antenna — for channels */
export function IconChannel({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 12V20" />
      <path d="M9 20H15" />
      <path d="M8.5 15.5C7.5 14.5 7 13.3 7 12C7 10.7 7.5 9.5 8.5 8.5" />
      <path d="M15.5 15.5C16.5 14.5 17 13.3 17 12C17 10.7 16.5 9.5 15.5 8.5" />
      <path d="M5.5 18C3.9 16.4 3 14.3 3 12C3 9.7 3.9 7.6 5.5 6" />
      <path d="M18.5 18C20.1 16.4 21 14.3 21 12C21 9.7 20.1 7.6 18.5 6" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconCheck({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12L10 17L19 7" />
    </svg>
  );
}

/** Two overlapping checkmarks — for message read receipts */
export function IconCheckDouble({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12L7 17L16 7" />
      <path d="M8 12L13 17L22 7" />
    </svg>
  );
}

export function IconLock({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="11" width="14" height="10" rx="2.5" />
      <path d="M8 11V7.5C8 5.567 9.79086 4 12 4C14.2091 4 16 5.567 16 7.5V11" />
      <circle cx="12" cy="16" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconPin({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10C21 16 12 22 12 22C12 22 3 16 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export function IconReply({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 10L4 15L9 20" />
      <path d="M4 15H14C17.3137 15 20 12.3137 20 9V7" />
    </svg>
  );
}

export function IconDelete({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6H21" />
      <path d="M8 6V4H16V6" />
      <path d="M19 6L18.1 19.1C18 20.2 17.1 21 16 21H8C6.9 21 6 20.2 5.9 19.1L5 6" />
      <path d="M10 11V17" />
      <path d="M14 11V17" />
    </svg>
  );
}

export function IconEdit({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4C3.44772 4 3 4.44772 3 5V20C3 20.5523 3.44772 21 4 21H19C19.5523 21 20 20.5523 20 20V13" />
      <path d="M18.5 2.5C19.3284 1.67157 20.6716 1.67157 21.5 2.5C22.3284 3.32843 22.3284 4.67157 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" />
    </svg>
  );
}

/** Three horizontal dots */
export function IconMore({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="5" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
    </svg>
  );
}

/** Diamond / gem shape — for NFT messages */
export function IconNFT({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3L21 9L12 21L3 9L12 3Z" />
      <path d="M3 9H21" />
      <path d="M8.5 3L6 9L12 21" />
      <path d="M15.5 3L18 9L12 21" />
    </svg>
  );
}

export function IconWallet({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 7H5C3.89543 7 3 7.89543 3 9V18C3 19.1046 3.89543 20 5 20H20C21.1046 20 22 19.1046 22 18V9C22 7.89543 21.1046 7 20 7Z" />
      <path d="M16 7V5C16 4.44772 15.5523 4 15 4H6C4.89543 4 4 4.89543 4 6" />
      <path d="M16 13.5C16 12.6716 16.6716 12 17.5 12H22V15H17.5C16.6716 15 16 14.3284 16 13.5Z" />
      <circle cx="17.75" cy="13.5" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconAttach({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.44 11.05L12.25 20.24C10.74 21.75 8.3 21.75 6.79 20.24C5.28 18.73 5.28 16.29 6.79 14.78L15.98 5.59C16.96 4.61 18.55 4.61 19.53 5.59C20.51 6.57 20.51 8.16 19.53 9.14L10.34 18.33C9.85 18.82 9.06 18.82 8.57 18.33C8.08 17.84 8.08 17.05 8.57 16.56L16.76 8.37" />
    </svg>
  );
}

export function IconMic({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="2" width="6" height="11" rx="3" />
      <path d="M5 10C5 13.866 8.13401 17 12 17C15.866 17 19 13.866 19 10" />
      <path d="M12 17V21" />
      <path d="M9 21H15" />
    </svg>
  );
}

export function IconImage({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2.5" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15L16 10L9 17" />
      <path d="M14 17L11.5 14.5" />
    </svg>
  );
}

/** Document with corner fold */
export function IconFile({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" />
      <path d="M14 2V8H20" />
      <path d="M8 13H16" />
      <path d="M8 17H13" />
    </svg>
  );
}

/** Ghost shape — for ghost/anonymous chats */
export function IconGhost({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12C5 7.58172 8.13401 4 12 4C15.866 4 19 7.58172 19 12V20L16.5 18L14 20L11.5 18L9 20L6.5 18L5 19.5V12Z" />
      <circle cx="9.5" cy="11" r="1" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="11" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconBell({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" />
      <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6981 21.5547 10.4458 21.3031 10.27 21" />
    </svg>
  );
}

export function IconStar({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
    </svg>
  );
}

export function IconShield({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3L4 6.5V12C4 16.4183 7.58172 20.4 12 21C16.4183 20.4 20 16.4183 20 12V6.5L12 3Z" />
    </svg>
  );
}

/** Circle with "i" */
export function IconInfo({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="8.5" r="0.8" fill="currentColor" stroke="none" />
      <path d="M12 11.5V16" />
    </svg>
  );
}

export function IconChevronRight({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18L15 12L9 6" />
    </svg>
  );
}

export function IconChevronDown({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9L12 15L18 9" />
    </svg>
  );
}

export function IconPhone({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92V19.92C22.0011 20.4853 21.7605 21.0238 21.3353 21.4001C20.9101 21.7764 20.3474 21.9565 19.78 21.9C16.5552 21.5517 13.4574 20.4013 10.77 18.56C8.27078 16.8836 6.15447 14.7673 4.48 12.27C2.6325 9.57063 1.48179 6.45987 1.14 3.22C1.08355 2.65452 1.2625 2.09319 1.63677 1.66855C2.01104 1.24391 2.54693 1.00297 3.11 1H6.11C7.10519 0.990206 7.95287 1.68546 8.11 2.67C8.23662 3.58 8.47145 4.47273 8.81 5.33C9.07413 6.01886 8.90477 6.79617 8.38 7.31L7.09 8.6C8.61448 11.1856 10.7144 13.2855 13.3 14.81L14.59 13.52C15.1138 12.9952 15.8911 12.8259 16.58 13.09C17.4373 13.4286 18.33 13.6634 19.24 13.79C20.2395 13.9487 20.9381 14.8136 20.91 15.82L22 16.92Z" />
    </svg>
  );
}

export function IconCamera({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

/** Simple smiley face — for the reactions panel trigger */
export function IconSmile({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 14.5C9.2 16 10.5 17 12 17C13.5 17 14.8 16 15.5 14.5" />
      <circle cx="9.5" cy="10.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="10.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconMoon({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79C20.2 17.03 16.36 20.16 11.85 19.99C7.34 19.82 3.74 16.41 3.27 11.93C2.8 7.45 5.56 3.26 9.89 2C7.57 4.69 7.21 8.6 9.01 11.68C10.81 14.76 14.37 16.37 17.86 15.76C19.34 15.5 20.64 14.77 21.63 13.74" />
    </svg>
  );
}

/** Play triangle — kept for audio messages */
export function IconPlay({ size = 18, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className={className}>
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}

/** Pause bars — kept for audio messages */
export function IconPause({ size = 18, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="6" y="4" width="4" height="16" rx="1" />
      <rect x="14" y="4" width="4" height="16" rx="1" />
    </svg>
  );
}

/** Sign-out arrow */
export function IconLogout({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

// ─── Reaction Icons (filled, colorful) ───────────────────────────────────────

/** Flame — orange/amber fire */
export function ReactionFire({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Outer flame body */}
      <path
        d="M12 2C12 2 9 6 9 9.5C9 11 9.5 12 10 12.5C9.5 11.5 10 10 11 9C11 11 13 13 13 15.5C13 17.5 11.5 19 10 19.5C10.5 18.5 10.5 17.5 10 16.5C9 18 8 19 8 20.5C8 21.4 8.8 22 10 22C14 22 17 19.5 17 15.5C17 12 15 9 14 7C15 8 15.5 9.5 15.5 11C15.5 11 17 9 17 6.5C17 4 15 2.5 14 2C14 3.5 13 5 12 5C12.5 4 12 2.5 12 2Z"
        fill="#f97316"
      />
      {/* Inner bright highlight */}
      <path
        d="M10 19.5C11.5 19 13 17.5 13 15.5C13 14 12 12.5 11.5 12C12 13 11.5 14.5 10.5 15.5C10 16 9.5 16.5 10 16.5C10.5 17.5 10.5 18.5 10 19.5Z"
        fill="#fbbf24"
      />
    </svg>
  );
}

/** Heart — rose red */
export function ReactionHeart({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M20.84 4.61C20.3292 4.09931 19.7228 3.69531 19.0554 3.42263C18.3879 3.14994 17.6725 3.01356 16.95 3.01356C16.2275 3.01356 15.5121 3.14994 14.8446 3.42263C14.1772 3.69531 13.5708 4.09931 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.5783 8.50903 2.99874 7.05 2.99874C5.59096 2.99874 4.19169 3.5783 3.16 4.61C2.1283 5.6417 1.54874 7.04097 1.54874 8.5C1.54874 9.95904 2.1283 11.3583 3.16 12.39L12 21.23L20.84 12.39C21.3507 11.8792 21.7547 11.2728 22.0274 10.6054C22.3001 9.93789 22.4365 9.22249 22.4365 8.5C22.4365 7.77751 22.3001 7.06211 22.0274 6.39464C21.7547 5.72716 21.3507 5.12075 20.84 4.61Z"
        fill="#f43f5e"
      />
      {/* Subtle highlight sheen */}
      <path d="M7.5 6C8.2 5.2 9.4 4.8 10.5 5.3" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

/** Thumbs up — blue */
export function ReactionLike({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M7 22H4C3.46957 22 2.96086 21.7893 2.58579 21.4142C2.21071 21.0391 2 20.5304 2 20V13C2 12.4696 2.21071 11.9609 2.58579 11.5858C2.96086 11.2107 3.46957 11 4 11H7M14 9V5C14 4.20435 13.6839 3.44129 13.1213 2.87868C12.5587 2.31607 11.7956 2 11 2L7 11V22H18.28C18.7623 22.0055 19.2304 21.8364 19.5979 21.524C19.9654 21.2116 20.2077 20.7769 20.28 20.3L21.66 11.3C21.7035 11.0134 21.6842 10.7207 21.6033 10.4423C21.5225 10.1638 21.3821 9.90629 21.1919 9.68751C21.0016 9.46873 20.7661 9.29393 20.5016 9.17522C20.2371 9.0565 19.9499 8.99672 19.66 9H14Z"
        fill="#3b82f6"
        stroke="#2563eb"
        strokeWidth="0.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Exploding head — yellow with burst rays */
export function ReactionMindblown({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Face */}
      <circle cx="12" cy="13" r="8" fill="#fbbf24" />
      {/* Wide eyes — whites */}
      <circle cx="9" cy="12" r="1.8" fill="white" />
      <circle cx="15" cy="12" r="1.8" fill="white" />
      {/* Pupils */}
      <circle cx="9.5" cy="12.4" r="0.9" fill="#1e1e2e" />
      <circle cx="15.5" cy="12.4" r="0.9" fill="#1e1e2e" />
      {/* Open O mouth */}
      <ellipse cx="12" cy="17" rx="2" ry="1.4" fill="#1e1e2e" />
      {/* Explosion burst rays */}
      <path d="M12 2.5V4.5" stroke="#f59e0b" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M19.5 5L18.1 6.4" stroke="#f59e0b" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M22 12H20" stroke="#f59e0b" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M4.5 5L5.9 6.4" stroke="#f59e0b" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M2 12H4" stroke="#f59e0b" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/** Laughing face with tears of joy */
export function ReactionLaugh({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Face */}
      <circle cx="12" cy="12" r="10" fill="#fbbf24" />
      {/* Squint laugh eyes */}
      <path d="M7 9.5C7.5 9 8.5 8.5 9.5 9" stroke="#92400e" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M14.5 9C15.5 8.5 16.5 9 17 9.5" stroke="#92400e" strokeWidth="1.6" strokeLinecap="round" />
      {/* Wide open laughing mouth */}
      <path d="M6.5 14C7.5 18.5 16.5 18.5 17.5 14H6.5Z" fill="#92400e" />
      {/* Teeth line */}
      <path d="M9 14H15" stroke="white" strokeWidth="1.2" />
      {/* Tears of joy */}
      <path d="M6 9.5C5.3 10.5 5.3 11.5 6 12" stroke="#38bdf8" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M18 9.5C18.7 10.5 18.7 11.5 18 12" stroke="#38bdf8" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

/** Ghost — filled purple, slightly different from IconGhost outline style */
export function ReactionGhost({ size = 20, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Body */}
      <path
        d="M5 12C5 7.58172 8.13401 4 12 4C15.866 4 19 7.58172 19 12V20L16.5 18L14 20L11.5 18L9 20L6.5 18L5 19.5V12Z"
        fill="rgba(167,139,250,0.9)"
      />
      {/* Highlight */}
      <path
        d="M9 5.8C8 7 7 8.8 7 12V18L9 20V12C9 9.2 9.5 7.2 11 6"
        fill="rgba(255,255,255,0.12)"
      />
      {/* Eyes — whites */}
      <circle cx="9.5" cy="11" r="1.5" fill="white" />
      <circle cx="14.5" cy="11" r="1.5" fill="white" />
      {/* Pupils */}
      <circle cx="10" cy="11.5" r="0.75" fill="#1e1e2e" />
      <circle cx="15" cy="11.5" r="0.75" fill="#1e1e2e" />
    </svg>
  );
}
