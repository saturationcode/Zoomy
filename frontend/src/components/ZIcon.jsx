// Custom Z-Coin SVG icon — no emoji, original design
export default function ZIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <defs>
        <radialGradient id="zc-rg" cx="38%" cy="30%" r="72%" gradientUnits="objectBoundingBox">
          <stop offset="0%"   stopColor="#fde68a"/>
          <stop offset="40%"  stopColor="#f59e0b"/>
          <stop offset="100%" stopColor="#92400e"/>
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="50" fill="#f59e0b" fillOpacity="0.18"/>
      <circle cx="50" cy="50" r="44" fill="url(#zc-rg)"/>
      <circle cx="50" cy="50" r="44" fill="none" stroke="#92400e" strokeWidth="1.5" strokeOpacity="0.2"/>
      <ellipse cx="36" cy="28" rx="12" ry="6" fill="white" fillOpacity="0.22" transform="rotate(-25 36 28)"/>
      <path d="M24 29 L76 29 L24 71 L76 71" stroke="white" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
