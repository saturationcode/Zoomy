import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase.js';

const AuthContext = createContext(null);

function sanitize(username) {
  return username.replace(/[^a-zA-Z0-9._-]/g, '');
}

function withTimeout(p, ms = 25_000, msg = 'Сервер не отвечает. Проверьте интернет.') {
  return Promise.race([
    Promise.resolve(p),
    new Promise((_, reject) => setTimeout(() => reject(new Error(msg)), ms)),
  ]);
}

async function fetchProfile(userId) {
  const { data } = await supabase
    .from('profiles')
    .select('username, nickname, phone, avatar_color, avatar_url')
    .eq('id', userId)
    .single();
  return data;
}

export function AuthProvider({ children }) {
  const [auth,    setAuth]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let settled = false;
    const done = () => { if (!settled) { settled = true; setLoading(false); } };
    const timer = setTimeout(done, 28_000);

    supabase.auth.getSession()
      .then(async ({ data: { session } }) => {
        if (session) {
          try {
            const profile = await withTimeout(fetchProfile(session.user.id));
            if (profile?.username) {
              setAuth({ user: { id: session.user.id, ...profile } });
            } else {
              await supabase.auth.signOut().catch(() => {});
            }
          } catch (_) {
            await supabase.auth.signOut().catch(() => {});
          }
        }
      })
      .catch(() => {})
      .finally(() => { clearTimeout(timer); done(); });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_UP') return;
      if (session) {
        // Set minimal auth immediately so PrivateRoute passes right away
        const usernameFromEmail = session.user.email?.replace('@zoomy.app', '') ?? '';
        setAuth(prev => prev ?? { user: { id: session.user.id, username: usernameFromEmail } });
        // Then enrich with full profile in the background
        const profile = await fetchProfile(session.user.id).catch(() => null);
        if (profile?.username) {
          setAuth({ user: { id: session.user.id, ...profile } });
        }
      } else {
        setAuth(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const register = useCallback(async (username, password) => {
    const clean = sanitize(username);
    if (clean.length < 4) throw new Error('Минимум 4 символа в имени пользователя');
    const email = `${clean}@zoomy.app`;

    const { data, error } = await withTimeout(
      supabase.auth.signUp({ email, password }),
      15_000, 'Сервер не отвечает. Проверьте интернет.'
    );
    if (error) throw new Error(error.message);
    if (!data.user) throw new Error('Не удалось создать аккаунт');

    const { error: profileError } = await withTimeout(
      supabase.from('profiles').insert({ id: data.user.id, username: clean }),
      10_000, 'Ошибка создания профиля.'
    );
    if (profileError) throw new Error(profileError.message);

    // Set auth immediately so PrivateRoute doesn't redirect away
    setAuth({ user: { id: data.user.id, username: clean } });
  }, []);

  const login = useCallback(async (username, password) => {
    const clean = sanitize(username);
    const email = `${clean}@zoomy.app`;

    const { data, error } = await withTimeout(
      supabase.auth.signInWithPassword({ email, password }),
      15_000, 'Сервер не отвечает. Проверьте интернет.'
    );
    if (error) throw new Error('Неверное имя пользователя или пароль');

    // Fetch profile and set auth immediately so navigate('/') lands correctly
    if (data?.user) {
      try {
        const profile = await withTimeout(fetchProfile(data.user.id), 10_000);
        if (profile?.username) {
          setAuth({ user: { id: data.user.id, ...profile } });
          return;
        }
      } catch (_) {}
      // Fallback: set minimal auth so the user at least gets past PrivateRoute
      setAuth({ user: { id: data.user.id, username: clean } });
    }
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut().catch(() => {});
    setAuth(null);
  }, []);

  return (
    <AuthContext.Provider value={{ auth, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
