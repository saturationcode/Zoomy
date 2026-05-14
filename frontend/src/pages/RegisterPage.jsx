import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate     = useNavigate();
  const [form, setForm]     = useState({ username:'', password:'', confirm:'' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault(); setError('');
    if (form.password !== form.confirm) { setError('Пароли не совпадают'); return; }
    setLoading(true);
    try { await register(form.username.trim(), form.password); navigate('/onboarding'); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />
      <div className="auth-card">
        <div className="auth-logo">
          <svg viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="18" fill="url(#g2)"/>
            <path d="M20 11v18M11 20h18" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
            <defs>
              <linearGradient id="g2" x1="2" y1="2" x2="38" y2="38" gradientUnits="userSpaceOnUse">
                <stop stopColor="#4a7cf7"/><stop offset="1" stopColor="#7b5cf0"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <h1>Zoomy</h1>
        <p className="subtitle">Создайте аккаунт</p>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={submit}>
          <div className="form-group">
            <label>Имя пользователя</label>
            <input name="username" value={form.username} onChange={handle}
              placeholder="username (4–32 символа)" autoComplete="username" autoFocus />
          </div>
          <div className="form-group">
            <label>Пароль</label>
            <input name="password" type="password" value={form.password} onChange={handle}
              placeholder="Минимум 6 символов" autoComplete="new-password" />
          </div>
          <div className="form-group">
            <label>Повторите пароль</label>
            <input name="confirm" type="password" value={form.confirm} onChange={handle}
              placeholder="••••••" autoComplete="new-password" />
          </div>
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Создаём…' : 'Зарегистрироваться'}
          </button>
        </form>

        <div className="auth-footer">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </div>
      </div>
    </div>
  );
}
