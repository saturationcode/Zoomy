import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]     = useState({ username:'', password:'' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [slow, setSlow]     = useState(false);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault(); setError(''); setSlow(false); setLoading(true);
    // Show "slow connection" hint after 5 seconds
    const slowTimer = setTimeout(() => setSlow(true), 5000);
    try {
      await login(form.username.trim(), form.password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      clearTimeout(slowTimer);
      setLoading(false);
      setSlow(false);
    }
  };

  const loadingText = slow ? 'Медленное соединение…' : 'Входим…';

  return (
    <div className="auth-page">
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />
      <div className="auth-card">
        <div className="auth-logo">
          <svg viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="18" fill="url(#g1)"/>
            <path d="M12 15h16M12 20h11M12 25h13" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/>
            <defs>
              <linearGradient id="g1" x1="2" y1="2" x2="38" y2="38" gradientUnits="userSpaceOnUse">
                <stop stopColor="#4a7cf7"/><stop offset="1" stopColor="#7b5cf0"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <h1>Zoomy</h1>
        <p className="subtitle">Войдите в аккаунт</p>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={submit}>
          <div className="form-group">
            <label>Имя пользователя</label>
            <input name="username" value={form.username} onChange={handle}
              placeholder="username" autoComplete="username" autoFocus
              disabled={loading} />
          </div>
          <div className="form-group">
            <label>Пароль</label>
            <input name="password" type="password" value={form.password} onChange={handle}
              placeholder="••••••" autoComplete="current-password"
              disabled={loading} />
          </div>
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? loadingText : 'Войти'}
          </button>
        </form>

        {slow && (
          <div style={{ fontSize:12, color:'#9098c0', textAlign:'center', marginTop:10, lineHeight:1.5 }}>
            Соединение медленное — подождите ещё немного
          </div>
        )}

        <div className="auth-footer">
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </div>
      </div>
    </div>
  );
}
