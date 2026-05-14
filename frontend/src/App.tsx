import { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import AuthPage from './pages/AuthPage';
import ChatsPage from './pages/ChatsPage';
import Toast from './components/ui/Toast';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { profile, loading, initialized } = useAuthStore();
  if (!initialized || loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100%', background: '#07070f',
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 14,
          background: 'linear-gradient(135deg, rgba(124,58,237,.15), rgba(37,99,235,.1))',
          border: '1px solid rgba(124,58,237,.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'pulse 1.5s ease-in-out infinite',
        }}>
          <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
            <path d="M8 8L24 8L8 24L24 24" stroke="url(#lg)" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round"/>
            <defs>
              <linearGradient id="lg" x1="8" y1="8" x2="24" y2="24">
                <stop stopColor="#a78bfa"/><stop offset="1" stopColor="#38bdf8"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <style>{`@keyframes pulse{0%,100%{opacity:.6}50%{opacity:1}}`}</style>
      </div>
    );
  }
  return profile ? <>{children}</> : <Navigate to="/auth" replace />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { profile, loading, initialized } = useAuthStore();
  if (!initialized || loading) return null;
  return profile ? <Navigate to="/" replace /> : <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<PublicRoute><AuthPage /></PublicRoute>} />
      <Route path="/"     element={<PrivateRoute><ChatsPage /></PrivateRoute>} />
      <Route path="*"     element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  const { initialize } = useAuthStore();

  useEffect(() => { initialize(); }, []);

  return (
    <HashRouter>
      <AppRoutes />
      <Toast />
    </HashRouter>
  );
}
