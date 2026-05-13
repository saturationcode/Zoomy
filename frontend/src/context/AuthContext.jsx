import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase.js';

const AuthContext = createContext(null);

function sanitize(username) {
  return username.replace(/[^a-zA-Z0-9._-]/g, '');
}

async function fetchProfile(userId) {
  const { data } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', userId)
    .single();
  return data;
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        const profile = await fetchProfile(session.user.id);
        setAuth({ user: { id: session.user.id, username: profile?.username } });
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        const profile = await fetchProfile(session.user.id);
        setAuth({ user: { id: session.user.id, username: profile?.username } });
      } else {
        setAuth(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const register = useCallback(async (username, password) => {
    const clean = sanitize(username);
    if (clean.length < 3) throw new Error('Имя пользователя должно содержать минимум 3 буквы/цифры');
    const email = `${clean}@zoomy.app`;
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw new Error(error.message);

    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({ id: data.user.id, username: clean });
      if (profileError) throw new Error(profileError.message);
    }
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
