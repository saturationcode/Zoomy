import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase.js';

const AuthContext = createContext(null);

function sanitize(username) {
  return username.replace(/[^a-zA-Z0-9._-]/g, '');
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
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const done = () => setLoading(false);

    // 10-second timeout so the spinner never freezes on slow connections
    const timer = setTimeout(done, 10_000);

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      clearTimeout(timer);
      if (session) {
        const profile = await fetchProfile(session.user.id);
        if (profile?.username) {
          setAuth({ user: { id: session.user.id, ...profile } });
        } else {
          await supabase.auth.signOut();
        }
      }
      done();
    }).catch(() => { clearTimeout(timer); done(); });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_UP') return;
      if (session) {
        const profile = await fetchProfile(session.user.id);
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

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw new Error(error.message);
    if (!data.user) throw new Error('Не удалось создать аккаунт');

    const { error: profileError } = await supabase
      .from('profiles')
      .insert({ id: data.user.id, username: clean });
    if (profileError) throw new Error(profileError.message);

    setAuth({ user: { id: data.user.id, username: clean } });
  }, []);

  const login = useCallback(async (username, password) => {
    const clean = sanitize(username);
    const email = `${clean}@zoomy.app`;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error('Неверное имя пользователя или пароль');
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
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
