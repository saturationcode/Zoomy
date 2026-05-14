import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types';

const AVATAR_COLORS = [
  '#7c3aed', '#2563eb', '#06b6d4', '#10b981',
  '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6',
];

function randomColor(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

function sanitizeUsername(raw: string): string {
  return raw.replace(/[^a-z0-9._]/gi, '').toLowerCase();
}

function makeBlankProfile(userId: string, username: string, displayName?: string): Profile {
  return {
    id: userId,
    username,
    display_name: displayName || username,
    bio: null,
    avatar_url: null,
    avatar_color: randomColor(),
    status: 'online',
    last_seen: null,
    wallet_address: null,
    is_anonymous: false,
    created_at: new Date().toISOString(),
  };
}

interface AuthState {
  profile: Profile | null;
  loading: boolean;
  initialized: boolean;
}

interface AuthActions {
  initialize: () => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  fetchProfile: (userId: string) => Promise<boolean>;
  setProfile: (profile: Profile | null) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set, get) => ({
  profile: null,
  loading: false,
  initialized: false,

  setProfile: (profile) => set({ profile }),

  initialize: async () => {
    set({ loading: true });
    try {
      // Use INITIAL_SESSION event — more reliable than getSession() alone
      await new Promise<void>((resolve) => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'INITIAL_SESSION') {
            if (session?.user) {
              await get().fetchProfile(session.user.id);
            }
            set({ loading: false, initialized: true });
            resolve();
          } else if (event === 'SIGNED_IN' && session?.user) {
            await get().fetchProfile(session.user.id);
          } else if (event === 'SIGNED_OUT') {
            set({ profile: null });
          }
        });
        // Fallback: if INITIAL_SESSION never fires within 3s, mark as initialized
        setTimeout(() => {
          set((s) => s.initialized ? s : { loading: false, initialized: true });
          resolve();
        }, 3000);
      });
    } catch {
      set({ loading: false, initialized: true });
    }
  },

  login: async (username, password) => {
    set({ loading: true });
    try {
      const email = `${username.trim().toLowerCase()}@lighty.app`;
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        throw new Error('Неверный логин или пароль');
      }
      if (!data.user) {
        throw new Error('Не удалось войти. Попробуй ещё раз.');
      }
      const ok = await get().fetchProfile(data.user.id);
      if (!ok) {
        // Profile row missing — auto-create it so user can proceed
        const username_ = email.split('@')[0];
        const blank = makeBlankProfile(data.user.id, username_);
        await supabase.from('profiles').upsert(blank);
        set({ profile: blank });
      }
    } finally {
      set({ loading: false });
    }
  },

  register: async (username, password, displayName) => {
    set({ loading: true });
    try {
      const clean = sanitizeUsername(username);
      if (clean.length < 3) throw new Error('Минимум 3 символа в нике');

      const email = `${clean}@lighty.app`;
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw new Error(error.message);
      if (!data.user) throw new Error('Ошибка регистрации — попробуй снова');

      const newProfile = makeBlankProfile(data.user.id, clean, displayName?.trim());

      const { error: insertError } = await supabase.from('profiles').upsert(newProfile);
      if (insertError) {
        console.error('[register] profile upsert error:', insertError);
        // Still set profile locally so user can proceed
      }

      set({ profile: newProfile });
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      await supabase.auth.signOut();
      set({ profile: null });
    } finally {
      set({ loading: false });
    }
  },

  updateProfile: async (data) => {
    const { profile } = get();
    if (!profile) return;
    set({ loading: true });
    try {
      const { error } = await supabase.from('profiles').update(data).eq('id', profile.id);
      if (error) throw new Error(error.message);
      set({ profile: { ...profile, ...data } });
    } finally {
      set({ loading: false });
    }
  },

  fetchProfile: async (userId): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn('[fetchProfile] error:', error.code, error.message);
        return false;
      }
      if (!data) return false;
      set({ profile: data as Profile });
      return true;
    } catch (e) {
      console.error('[fetchProfile] unexpected:', e);
      return false;
    }
  },
}));
