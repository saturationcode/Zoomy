import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import LoginPage       from './pages/LoginPage.jsx';
import RegisterPage    from './pages/RegisterPage.jsx';
import ChatPage        from './pages/ChatPage.jsx';
import OnboardingPage  from './pages/OnboardingPage.jsx';
import MarketplacePage from './pages/MarketplacePage.jsx';
import ShopPage        from './pages/ShopPage.jsx';
import BottomNav       from './components/BottomNav.jsx';

function PrivateRoute({ children }) {
  const { auth, loading } = useAuth();
  if (loading) return <div className="auth-page"><div className="spinner" /></div>;
  return auth ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { auth, loading } = useAuth();
  if (loading) return <div className="auth-page"><div className="spinner" /></div>;
  return auth ? <Navigate to="/" replace /> : children;
}

function MainLayout({ children }) {
  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column' }}>
      <div style={{ flex:1, overflow:'hidden' }}>{children}</div>
      <BottomNav />
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login"      element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register"   element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/onboarding" element={<PrivateRoute><OnboardingPage /></PrivateRoute>} />
      <Route path="/"      element={<PrivateRoute><MainLayout><ChatPage /></MainLayout></PrivateRoute>} />
      <Route path="/market"element={<PrivateRoute><MainLayout><MarketplacePage /></MainLayout></PrivateRoute>} />
      <Route path="/shop"  element={<PrivateRoute><MainLayout><ShopPage /></MainLayout></PrivateRoute>} />
      <Route path="*"      element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </HashRouter>
  );
}
