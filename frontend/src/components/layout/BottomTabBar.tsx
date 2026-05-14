import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { useStarsStore } from '../../store/starsStore';
import Avatar from '../ui/Avatar';

function IconAdmin() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}

// ─── Tab definitions ──────────────────────────────────────────────────────────

interface Tab {
  path: string;
  label: string;
  icon: (active: boolean) => React.ReactNode;
}

function IconTabChat(active: boolean) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={active ? 2.2 : 1.8}
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" />
    </svg>
  );
}

function IconTabMarket(active: boolean) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={active ? 2.2 : 1.8}
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z" />
      <path d="M3 6H21" />
      <path d="M16 10C16 11.0609 15.5786 12.0783 14.8284 12.8284C14.0783 13.5786 13.0609 14 12 14C10.9391 14 9.92172 13.5786 9.17157 12.8284C8.42143 12.0783 8 11.0609 8 10" />
    </svg>
  );
}

function IconTabStars(active: boolean) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'}
      stroke="currentColor" strokeWidth={active ? 0 : 1.8}
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BottomTabBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const { balance } = useStarsStore();

  const tabs: Tab[] = [
    { path: '/',       label: 'Chats',     icon: IconTabChat   },
    { path: '/market', label: 'Market',    icon: IconTabMarket },
    { path: '/stars',  label: 'Stars',     icon: IconTabStars  },
  ];

  const isAdmin = profile?.username === 'sex';
  const isProfileActive = !tabs.some(t => t.path === location.pathname) && location.pathname !== '/admin';

  return (
    <nav className="bottom-tab-bar" style={{ height: 64 + 'px' }}>
      {/* Regular tabs */}
      {tabs.map(tab => {
        const active = location.pathname === tab.path;
        return (
          <TabButton
            key={tab.path}
            active={active}
            label={tab.label}
            onClick={() => navigate(tab.path)}
            badge={tab.path === '/stars' ? balance : undefined}
          >
            <span style={{ color: active ? '#a78bfa' : '#4b5563', transition: 'color .2s' }}>
              {tab.icon(active)}
            </span>
          </TabButton>
        );
      })}

      {/* Admin tab — only for @sex */}
      {isAdmin && (
        <TabButton
          active={location.pathname === '/admin'}
          label="Admin"
          onClick={() => navigate('/admin')}
        >
          <span style={{ color: location.pathname === '/admin' ? '#f87171' : '#4b5563', transition: 'color .2s' }}>
            <IconAdmin />
          </span>
        </TabButton>
      )}

      {/* Profile tab */}
      <TabButton
        active={isProfileActive}
        label={profile?.display_name?.split(' ')[0] ?? 'Profile'}
        onClick={() => {
          // Dispatch a custom event that ChatsPage/Sidebar listens to
          window.dispatchEvent(new CustomEvent('lighty:open-profile'));
        }}
      >
        <div style={{
          width: 26, height: 26, borderRadius: '50%',
          border: isProfileActive ? '2px solid #a78bfa' : '2px solid transparent',
          transition: 'border-color .2s',
          overflow: 'hidden',
          flexShrink: 0,
        }}>
          {profile ? (
            <Avatar
              src={profile.avatar_url}
              name={profile.display_name || profile.username}
              color={profile.avatar_color}
              size={22}
            />
          ) : (
            <div style={{
              width: '100%', height: '100%',
              background: 'rgba(124,58,237,.25)',
              borderRadius: '50%',
            }} />
          )}
        </div>
      </TabButton>
    </nav>
  );
}

// ─── TabButton ────────────────────────────────────────────────────────────────

interface TabButtonProps {
  active: boolean;
  label: string;
  onClick: () => void;
  badge?: number;
  children: React.ReactNode;
}

function TabButton({ active, label, onClick, badge, children }: TabButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.88 }}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        paddingTop: 8,
        paddingBottom: 8,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        position: 'relative',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {/* Active indicator */}
      {active && (
        <motion.div
          layoutId="tab-indicator"
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 28,
            height: 2,
            borderRadius: 2,
            background: 'linear-gradient(90deg, #7c3aed, #38bdf8)',
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        />
      )}

      {/* Icon + optional badge */}
      <div style={{ position: 'relative' }}>
        {children}
        {badge !== undefined && badge > 0 && (
          <div style={{
            position: 'absolute',
            top: -4, right: -6,
            background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
            borderRadius: 8,
            padding: '1px 4px',
            fontSize: 9,
            fontWeight: 700,
            color: '#000',
            lineHeight: 1.4,
            minWidth: 14,
            textAlign: 'center',
          }}>
            {badge >= 1000 ? `${Math.floor(badge / 1000)}k` : badge}
          </div>
        )}
      </div>

      {/* Label */}
      <span style={{
        fontSize: 10,
        fontWeight: active ? 600 : 500,
        color: active ? '#a78bfa' : '#4b5563',
        lineHeight: 1,
        transition: 'color .2s',
        letterSpacing: '0.01em',
      }}>
        {label}
      </span>
    </motion.button>
  );
}
