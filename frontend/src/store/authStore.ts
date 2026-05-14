import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types';

const AVATAR_COLORS = [
  '#7c3aed',
  '#2563eb',
  '#06b6d4',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#ec4899',
  '#8b5cf6',
];

function randomColor(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

function sanitizeUsername(raw: string): string {
  return raw.replace(/[^a-z0-9._]/gi, '').toLowerCase();
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
  fetchProfile: (userId: string) => Promise<void>;
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
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await get().fetchProfile(session.user.id);
      }

      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await get().fetchProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          set({ profile: null });
        }
      });
    } finally {
      set({ loading: false, initialized: true });
    }
  },

  login: async (username, password) => {
    set({ loading: true });
    try {
      const email = `${username.trim().toLowerCase()}@lighty.app`;
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.user) {
        throw new Error('Неверный логин или пароль');
      }
      await get().fetchProfile(data.user.id);
    } finally {
      set({ loading: false });
    }
  },

  register: async (username, password, displayName) => {
    set({ loading: true });
    try {
      const clean = sanitizeUsername(username);
      if (clean.length < 3) {
        throw new Error('Имя пользователя должно содержать минимум 3 символа');
      }

      const email = `${clean}@lighty.app`;
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error || !data.user) {
        throw new Error(error?.message ?? 'Ошибка регистрации');
      }

      const newProfile: Partial<Profile> = {
        id: data.user.id,
        username: clean,
        display_name: displayName?.trim() || clean,
        avatar_color: randomColor(),
      };

      const { error: insertError } = await supabase.from('profiles').insert(newProfile);
      if (insertError) {
        throw new Error(insertError.message);
      }

      set({
        profile: {
          id: data.user.id,
          username: clean,
          display_name: displayName?.trim() || clean,
          bio: null,
          avatar_url: null,
          avatar_color: newProfile.avatar_color!,
          status: 'online',
          last_seen: null,
          wallet_address: null,
          is_anonymous: false,
          created_at: new Date().toISOString(),
        },
      });
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
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', profile.id);

      if (error) throw new Error(error.message);

      set({ profile: { ...profile, ...data } });
    } finally {
      set({ loading: false });
    }
  },

  fetchProfile: async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) return;
    set({ profile: data as Profile });
  },
}));
