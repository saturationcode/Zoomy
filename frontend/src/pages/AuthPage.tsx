import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { LightyLogo } from '../components/icons';

// ─── helpers ────────────────────────────────────────────────────────────────

const USERNAME_RE = /^[a-z0-9._]+$/;

function validateUsername(v: string): string | null {
  if (v.length < 3) return 'Minimum 3 characters';
  if (!USERNAME_RE.test(v)) return 'Only a–z, 0–9, . and _ allowed';
  return null;
}

// ─── Spinner ────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg
      className="animate-spin"
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

// ─── ErrorPill ───────────────────────────────────────────────────────────────

function ErrorPill({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      style={{
        background: 'rgba(239,68,68,0.12)',
        border: '1px solid rgba(239,68,68,0.28)',
        borderRadius: 12,
        padding: '10px 14px',
        fontSize: 13,
        color: '#fca5a5',
        lineHeight: 1.5,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <span style={{ fontSize: 15 }}>⚠</span>
      {message}
    </motion.div>
  );
}

// ─── Login form ──────────────────────────────────────────────────────────────

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const { login, loading } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(username.trim(), password);
      onSuccess();
    } catch (err: any) {
      setError(err.message ?? 'Login failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label
          htmlFor="login-username"
          style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase' }}
        >
          lolin ID
        </label>
        <input
          id="login-username"
          className="l-input"
          type="text"
          autoComplete="username"
          autoFocus
          placeholder="your_username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          disabled={loading}
          required
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label
          htmlFor="login-password"
          style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase' }}
        >
          Password
        </label>
        <input
          id="login-password"
          className="l-input"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={e => setPassword(e.target.value)}
          disabled={loading}
          required
        />
      </div>

      <AnimatePresence>
        {error && <ErrorPill key="err" message={error} />}
      </AnimatePresence>

      <button
        className="btn-primary"
        type="submit"
        disabled={loading || !username.trim() || !password}
        style={{
          marginTop: 4,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          transition: 'opacity .25s ease, transform .15s ease, box-shadow .25s ease',
        }}
      >
        {loading ? <><Spinner /><span>Signing in…</span></> : 'Continue'}
      </button>
    </form>
  );
}

// ─── Register form ───────────────────────────────────────────────────────────

function RegisterForm({ onSuccess }: { onSuccess: () => void }) {
  const { register, loading } = useAuthStore();

  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [usernameError, setUsernameError] = useState('');

  // live username validation
  useEffect(() => {
    if (!username) { setUsernameError(''); return; }
    const err = validateUsername(username.toLowerCase());
    setUsernameError(err ?? '');
  }, [username]);

  const passwordStrength = (() => {
    if (password.length === 0) return null;
    if (password.length < 8) return 'weak';
    if (password.length < 12) return 'ok';
    return 'strong';
  })();

  const strengthColor: Record<string, string> = {
    weak: '#ef4444',
    ok: '#f59e0b',
    strong: '#22c55e',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const userErr = validateUsername(username.toLowerCase());
    if (userErr) { setError(userErr); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (password !== confirm) { setError('Passwords do not match'); return; }
    try {
      await register(username.toLowerCase(), password, displayName.trim() || undefined);
      onSuccess();
    } catch (err: any) {
      setError(err.message ?? 'Registration failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Username */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label
          htmlFor="reg-username"
          style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase' }}
        >
          Choose your lolin ID
        </label>
        <input
          id="reg-username"
          className="l-input"
          type="text"
          autoComplete="username"
          autoFocus
          placeholder="e.g. ghost_rider"
          value={username}
          onChange={e => setUsername(e.target.value.replace(/[^a-z0-9._]/gi, '').toLowerCase())}
          disabled={loading}
          required
          style={usernameError ? { borderColor: 'rgba(239,68,68,0.5)' } : {}}
        />
        <AnimatePresence>
          {usernameError && username.length > 0 && (
            <motion.p
              key="uname-err"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ fontSize: 11, color: '#fca5a5', margin: 0 }}
            >
              {usernameError}
            </motion.p>
          )}
          {!usernameError && username.length >= 3 && (
            <motion.p
              key="uname-ok"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ fontSize: 11, color: '#86efac', margin: 0 }}
            >
              @{username} looks good
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Display name */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label
          htmlFor="reg-display"
          style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase' }}
        >
          Display name{' '}
          <span style={{ color: '#475569', fontWeight: 400, textTransform: 'none' }}>(optional)</span>
        </label>
        <input
          id="reg-display"
          className="l-input"
          type="text"
          placeholder="How should we call you?"
          value={displayName}
          onChange={e => setDisplayName(e.target.value)}
          disabled={loading}
          maxLength={40}
        />
      </div>

      {/* Password */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label
          htmlFor="reg-password"
          style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase' }}
        >
          Password
        </label>
        <input
          id="reg-password"
          className="l-input"
          type="password"
          autoComplete="new-password"
          placeholder="Min. 8 characters"
          value={password}
          onChange={e => setPassword(e.target.value)}
          disabled={loading}
          required
        />
        {passwordStrength && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
            <div style={{ flex: 1, height: 3, borderRadius: 99, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
              <motion.div
                initial={false}
                animate={{
                  width: passwordStrength === 'weak' ? '33%' : passwordStrength === 'ok' ? '66%' : '100%',
                  background: strengthColor[passwordStrength],
                }}
                transition={{ duration: 0.3 }}
                style={{ height: '100%', borderRadius: 99 }}
              />
            </div>
            <span style={{ fontSize: 11, color: strengthColor[passwordStrength], fontWeight: 600 }}>
              {passwordStrength === 'weak' ? 'Too short' : passwordStrength === 'ok' ? 'Good' : 'Strong'}
            </span>
          </div>
        )}
      </div>

      {/* Confirm password */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label
          htmlFor="reg-confirm"
          style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase' }}
        >
          Confirm password
        </label>
        <input
          id="reg-confirm"
          className="l-input"
          type="password"
          autoComplete="new-password"
          placeholder="Repeat password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          disabled={loading}
          required
          style={confirm && confirm !== password ? { borderColor: 'rgba(239,68,68,0.5)' } : {}}
        />
      </div>

      <AnimatePresence>
        {error && <ErrorPill key="err" message={error} />}
      </AnimatePresence>

      <button
        className="btn-primary"
        type="submit"
        disabled={loading || !username || !!usernameError || password.length < 8 || password !== confirm}
        style={{
          marginTop: 4,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          transition: 'opacity .25s ease, transform .15s ease, box-shadow .25s ease',
        }}
      >
        {loading ? <><Spinner /><span>Creating account…</span></> : 'Create account'}
      </button>

      <p style={{ textAlign: 'center', fontSize: 11, color: '#475569', lineHeight: 1.6, margin: 0 }}>
        By creating an account you agree to the{' '}
        <span style={{ color: '#64748b', textDecoration: 'underline', cursor: 'pointer' }}>Terms of Service</span>
        {' '}and{' '}
        <span style={{ color: '#64748b', textDecoration: 'underline', cursor: 'pointer' }}>Privacy Policy</span>
      </p>
    </form>
  );
}

// ─── AuthPage ────────────────────────────────────────────────────────────────

type Tab = 'login' | 'register';

export default function AuthPage() {
  const navigate = useNavigate();
  const { profile, initialized } = useAuthStore();
  const [tab, setTab] = useState<Tab>('login');

  // Redirect if already logged in
  useEffect(() => {
    if (initialized && profile) navigate('/', { replace: true });
  }, [initialized, profile, navigate]);

  const handleSuccess = () => navigate('/', { replace: true });

  return (
    <div
      style={{
        minHeight: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#07070f',
        padding: '24px 16px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ambient glow orb — top-left purple */}
      <div
        style={{
          position: 'fixed',
          top: '-100px',
          left: '-100px',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: '#7c3aed',
          filter: 'blur(120px)',
          opacity: 0.12,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      {/* Ambient glow orb — bottom-right blue */}
      <div
        style={{
          position: 'fixed',
          bottom: '-100px',
          right: '-100px',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: '#2563eb',
          filter: 'blur(120px)',
          opacity: 0.12,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="glass-strong"
        style={{ width: '100%', maxWidth: 400, borderRadius: 28, padding: 40, position: 'relative', zIndex: 1 }}
      >
        {/* Logo + title */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <div
            style={{
              padding: 12,
              borderRadius: 20,
              background: 'rgba(124,58,237,.12)',
              border: '1px solid rgba(124,58,237,.2)',
            }}
          >
            <LightyLogo size={44} />
          </div>
          <h1
            className="text-gradient"
            style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1 }}
          >
            Lighty
          </h1>
          <p style={{ fontSize: 13, color: '#475569', margin: 0, letterSpacing: '0.02em' }}>
            lolin — your identity
          </p>
        </div>

        {/* Tab switcher — pill shape */}
        <div
          style={{
            display: 'flex',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 14,
            padding: 4,
            marginBottom: 28,
            gap: 4,
          }}
        >
          {(['login', 'register'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1,
                padding: '9px 0',
                borderRadius: 11,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                border: 'none',
                transition: 'all 0.2s ease',
                background: tab === t
                  ? 'linear-gradient(135deg, rgba(124,58,237,0.5), rgba(37,99,235,0.45))'
                  : 'transparent',
                color: tab === t ? '#f1f5f9' : '#64748b',
                boxShadow: tab === t ? '0 2px 12px rgba(124,58,237,0.25)' : 'none',
              }}
            >
              {t === 'login' ? 'Sign in' : 'Register'}
            </button>
          ))}
        </div>

        {/* Forms with AnimatePresence slide left/right */}
        <div style={{ overflow: 'hidden' }}>
          <AnimatePresence mode="wait" initial={false}>
            {tab === 'login' ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.22, ease: 'easeInOut' }}
              >
                <LoginForm onSuccess={handleSuccess} />
              </motion.div>
            ) : (
              <motion.div
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.22, ease: 'easeInOut' }}
              >
                <RegisterForm onSuccess={handleSuccess} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
