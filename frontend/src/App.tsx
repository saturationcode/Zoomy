import { useEffect, lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { useAuthStore } from './store/authStore';
import AuthPage from './pages/AuthPage';
import ChatsPage from './pages/ChatsPage';
import Toast from './components/ui/Toast';
import BottomTabBar from './components/layout/BottomTabBar';

const MarketplacePage = lazy(() => import('./pages/MarketplacePage'));
const StarsPage       = lazy(() => import('./pages/StarsPage'));
const AdminPage       = lazy(() => import('./pages/AdminPage'));

// Global Framer Motion config — smooth spring physics everywhere
const MOTION_CONFIG = {
  transition: {
    type: 'spring' as const,
    stiffness: 320,
    damping: 28,
    mass: 1,
  },
};

function LoadingScreen() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100%', background: '#07070f', flexDirection: 'column', gap: 16,
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: 16,
        background: 'linear-gradient(135deg, rgba(124,58,237,.15), rgba(37,99,235,.1))',
        border: '1px solid rgba(124,58,237,.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'lighty-pulse 1.6s ease-in-out infinite',
      }}>
        <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
          <path d="M8 8L24 8L8 24L24 24" stroke="url(#lg)" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round" />
          <defs>
            <linearGradient id="lg" x1="8" y1="8" x2="24" y2="24">
              <stop stopColor="#a78bfa" /><stop offset="1" stopColor="#38bdf8" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <style>{`@keyframes lighty-pulse{0%,100%{opacity:.5;transform:scale(.97)}50%{opacity:1;transform:scale(1)}}`}</style>
    </div>
  );
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { profile, loading, initialized } = useAuthStore();
  if (!initialized || loading) return <LoadingScreen />;
  return profile ? <>{children}</> : <Navigate to="/auth" replace />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { profile, loading, initialized } = useAuthStore();
  if (!initialized || loading) return <LoadingScreen />;
  return profile ? <Navigate to="/" replace /> : <>{children}</>;
}

// Main app shell — adds bottom tab bar on mobile
function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflow: 'hidden', minHeight: 0, position: 'relative' }}>
        {children}
      </div>
      <BottomTabBar />
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth"   element={<PublicRoute><AuthPage /></PublicRoute>} />
      <Route path="/"       element={<PrivateRoute><AppShell><ChatsPage /></AppShell></PrivateRoute>} />
      <Route path="/market" element={<PrivateRoute><AppShell><Suspense fallback={<LoadingScreen />}><MarketplacePage /></Suspense></AppShell></PrivateRoute>} />
      <Route path="/stars"  element={<PrivateRoute><AppShell><Suspense fallback={<LoadingScreen />}><StarsPage /></Suspense></AppShell></PrivateRoute>} />
      <Route path="/admin"  element={<PrivateRoute><AppShell><Suspense fallback={<LoadingScreen />}><AdminPage /></Suspense></AppShell></PrivateRoute>} />
      <Route path="*"       element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  const { initialize } = useAuthStore();

  useEffect(() => { initialize(); }, []);

  return (
    <MotionConfig {...MOTION_CONFIG}>
      <HashRouter>
        <AppRoutes />
        <Toast />
      </HashRouter>
    </MotionConfig>
  );
}
