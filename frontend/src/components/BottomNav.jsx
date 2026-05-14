import { useLocation, useNavigate } from 'react-router-dom';

const tabs = [
  {
    path: '/',
    label: 'Чаты',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={active ? '#4a7cf7' : '#8890b8'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
  {
    path: '/market',
    label: 'Маркет',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={active ? '#4a7cf7' : '#8890b8'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
  },
  {
    path: '/shop',
    label: 'Магазин',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={active ? '#4a7cf7' : '#8890b8'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
      </svg>
    ),
  },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const current  = location.pathname;

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      height: 68,
      background: 'rgba(255,255,255,.92)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderTop: '1px solid rgba(90,120,220,.1)',
      display: 'flex', alignItems: 'center',
      boxShadow: '0 -4px 24px rgba(74,124,247,.08)',
      zIndex: 50,
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {tabs.map(tab => {
        const active = current === tab.path;
        return (
          <button key={tab.path} onClick={() => navigate(tab.path)} style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 4,
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '8px 0',
            transition: 'transform .18s cubic-bezier(.34,1.56,.64,1)',
            transform: active ? 'scale(1.08)' : 'scale(1)',
          }}>
            <div style={{
              width: 44, height: 32, borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: active ? 'rgba(74,124,247,.12)' : 'transparent',
              transition: 'background .18s',
            }}>
              {tab.icon(active)}
            </div>
            <span style={{
              fontSize: 11, fontWeight: active ? 700 : 500,
              color: active ? '#4a7cf7' : '#8890b8',
              letterSpacing: '.01em',
              transition: 'color .18s',
            }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
