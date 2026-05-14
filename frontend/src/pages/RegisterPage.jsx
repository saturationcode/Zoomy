import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Пароли не совпадают'); return; }
    setLoading(true);
    try {
      await register(form.username.trim(), form.password);
      navigate('/onboarding');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="18" cy="18" r="16" fill="url(#lg2)" />
            <path d="M18 10v16M10 18h16" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
            <defs>
              <linearGradient id="lg2" x1="2" y1="2" x2="34" y2="34" gradientUnits="userSpaceOnUse">
                <stop stopColor="#4a7cf7"/>
                <stop offset="1" stopColor="#7b5cf0"/>
              </linearGradient>
            </defs>
          </svg>
        </div>

        <h1>Zoomy</h1>
        <p className="subtitle">Создайте новый аккаунт</p>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={submit}>
          <div className="form-group">
            <label htmlFor="username">Имя пользователя</label>
            <input
              id="username"
              name="username"
              value={form.username}
              onChange={handle}
              placeholder="username (4–32 символа)"
              autoComplete="username"
              autoFocus
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handle}
              placeholder="Минимум 6 символов"
              autoComplete="new-password"
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirm">Повторите пароль</label>
            <input
              id="confirm"
              name="confirm"
              type="password"
              value={form.confirm}
              onChange={handle}
              placeholder="••••••"
              autoComplete="new-password"
            />
          </div>
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Создаём...' : 'Зарегистрироваться'}
          </button>
        </form>

        <div className="auth-footer">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </div>
      </div>
    </div>
  );
}
