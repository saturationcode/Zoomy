import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { StarsTier, StarsTransaction } from '../types';

export const STARS_TIERS: StarsTier[] = [
  { stars: 100,  price_usd: 0.99,  label: '100 Stars'  },
  { stars: 500,  price_usd: 3.99,  label: '500 Stars'  },
  { stars: 1000, price_usd: 6.99,  label: '1 000 Stars', popular: true },
  { stars: 2500, price_usd: 14.99, label: '2 500 Stars', bonus: '+250 bonus' },
  { stars: 5000, price_usd: 24.99, label: '5 000 Stars', bonus: '+750 bonus' },
];

interface StarsState {
  balance: number;
  transactions: StarsTransaction[];
  loadingBalance: boolean;
  loadingTx: boolean;

  loadBalance:      (userId: string) => Promise<void>;
  loadTransactions: (userId: string) => Promise<void>;
  addStars:         (userId: string, amount: number, type: StarsTransaction['type'], description: string, refId?: string) => Promise<boolean>;
  spendStars:       (userId: string, amount: number, type: StarsTransaction['type'], description: string, refId?: string) => Promise<boolean>;
  applyPromo:       (userId: string, code: string) => Promise<{ ok: boolean; message: string }>;
}

const PROMO_CODES: Record<string, number> = {
  'LIGHTY2025': 500,
  'LAUNCH100':  100,
};

export const useStarsStore = create<StarsState>((set, get) => ({
  balance: 0,
  transactions: [],
  loadingBalance: false,
  loadingTx: false,

  loadBalance: async (userId) => {
    set({ loadingBalance: true });
    const { data } = await supabase
      .from('profiles')
      .select('stars_balance')
      .eq('id', userId)
      .single();
    set({ balance: data?.stars_balance ?? 0, loadingBalance: false });
  },

  loadTransactions: async (userId) => {
    set({ loadingTx: true });
    const { data } = await supabase
      .from('stars_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    set({ transactions: (data ?? []) as StarsTransaction[], loadingTx: false });
  },

  addStars: async (userId, amount, type, description, refId) => {
    const newBalance = get().balance + amount;
    const [r1, r2] = await Promise.all([
      supabase.from('profiles').update({ stars_balance: newBalance }).eq('id', userId),
      supabase.from('stars_transactions').insert({
        user_id: userId, amount, type, description,
        reference_id: refId ?? null,
      }),
    ]);
    if (r1.error || r2.error) return false;
    set({ balance: newBalance });
    return true;
  },

  spendStars: async (userId, amount, type, description, refId) => {
    const { balance } = get();
    if (balance < amount) return false;
    const newBalance = balance - amount;
    const [r1, r2] = await Promise.all([
      supabase.from('profiles').update({ stars_balance: newBalance }).eq('id', userId),
      supabase.from('stars_transactions').insert({
        user_id: userId, amount: -amount, type, description,
        reference_id: refId ?? null,
      }),
    ]);
    if (r1.error || r2.error) return false;
    set({ balance: newBalance });
    return true;
  },

  applyPromo: async (userId, code) => {
    const bonus = PROMO_CODES[code.trim().toUpperCase()];
    if (!bonus) return { ok: false, message: 'Invalid promo code' };
    const ok = await get().addStars(userId, bonus, 'promo', `Promo: ${code.toUpperCase()}`);
    if (!ok) return { ok: false, message: 'Error applying promo code' };
    return { ok: true, message: `+${bonus} Stars added!` };
  },
}));
