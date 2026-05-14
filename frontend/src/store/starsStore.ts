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

const PROMO_CODES: Record<string, number> = {
  'LIGHTY2025': 500,
  'LAUNCH100':  100,
  'SEX999':     9999,
};

// LocalStorage keys — DB is secondary, local is primary
const LS_BALANCE = 'lighty_stars_balance';
const LS_TX      = 'lighty_stars_tx';
const LS_PROMO   = 'lighty_promos_used';

function lsGetBalance(): number {
  try { return Math.max(0, parseInt(localStorage.getItem(LS_BALANCE) ?? '0', 10) || 0); }
  catch { return 0; }
}
function lsSaveBalance(n: number) {
  try { localStorage.setItem(LS_BALANCE, String(n)); } catch {}
}
function lsGetTx(): StarsTransaction[] {
  try { return JSON.parse(localStorage.getItem(LS_TX) ?? '[]'); }
  catch { return []; }
}
function lsSaveTx(txs: StarsTransaction[]) {
  try { localStorage.setItem(LS_TX, JSON.stringify(txs.slice(0, 100))); } catch {}
}
function lsGetPromos(): string[] {
  try { return JSON.parse(localStorage.getItem(LS_PROMO) ?? '[]'); }
  catch { return []; }
}
function lsSavePromos(p: string[]) {
  try { localStorage.setItem(LS_PROMO, JSON.stringify(p)); } catch {}
}

function makeTx(
  userId: string,
  amount: number,
  type: StarsTransaction['type'],
  description: string,
  refId?: string,
): StarsTransaction {
  return {
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    user_id: userId,
    amount,
    type,
    reference_id: refId ?? null,
    description,
    created_at: new Date().toISOString(),
  };
}

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
  // Admin only
  adminGiveStars:   (targetUsername: string, amount: number, adminId: string) => Promise<{ ok: boolean; message: string }>;
}

export const useStarsStore = create<StarsState>((set, get) => ({
  balance: lsGetBalance(),
  transactions: lsGetTx(),
  loadingBalance: false,
  loadingTx: false,

  loadBalance: async (userId) => {
    // Use localStorage immediately for instant UI
    const localBal = lsGetBalance();
    set({ balance: localBal });

    // Try to sync with DB in background
    try {
      const { data } = await supabase
        .from('profiles')
        .select('stars_balance')
        .eq('id', userId)
        .single();
      if (data?.stars_balance !== undefined && data.stars_balance !== null) {
        const dbBal = data.stars_balance as number;
        // Use the higher value to prevent loss
        const final = Math.max(localBal, dbBal);
        lsSaveBalance(final);
        set({ balance: final });
      }
    } catch { /* DB not available, use local */ }
  },

  loadTransactions: async (userId) => {
    // Show local transactions instantly
    set({ transactions: lsGetTx() });

    // Sync with DB
    try {
      const { data } = await supabase
        .from('stars_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);
      if (data && data.length > 0) {
        set({ transactions: data as StarsTransaction[] });
        lsSaveTx(data as StarsTransaction[]);
      }
    } catch { /* use local */ }
  },

  addStars: async (userId, amount, type, description, refId) => {
    // Optimistic local update — instant
    const newBal = get().balance + amount;
    const tx = makeTx(userId, amount, type, description, refId);
    const newTxs = [tx, ...get().transactions];
    lsSaveBalance(newBal);
    lsSaveTx(newTxs);
    set({ balance: newBal, transactions: newTxs });

    // Best-effort DB sync
    try {
      await Promise.all([
        supabase.from('profiles').update({ stars_balance: newBal }).eq('id', userId),
        supabase.from('stars_transactions').insert({
          user_id: userId, amount, type, description, reference_id: refId ?? null,
        }),
      ]);
    } catch { /* local is source of truth */ }
    return true;
  },

  spendStars: async (userId, amount, type, description, refId) => {
    const { balance } = get();
    if (balance < amount) return false;
    const newBal = balance - amount;
    const tx = makeTx(userId, -amount, type, description, refId);
    const newTxs = [tx, ...get().transactions];
    lsSaveBalance(newBal);
    lsSaveTx(newTxs);
    set({ balance: newBal, transactions: newTxs });

    try {
      await Promise.all([
        supabase.from('profiles').update({ stars_balance: newBal }).eq('id', userId),
        supabase.from('stars_transactions').insert({
          user_id: userId, amount: -amount, type, description, reference_id: refId ?? null,
        }),
      ]);
    } catch {}
    return true;
  },

  applyPromo: async (userId, code) => {
    const upper = code.trim().toUpperCase();
    const bonus = PROMO_CODES[upper];
    if (!bonus) return { ok: false, message: 'Неверный промокод' };

    const used = lsGetPromos();
    if (used.includes(upper)) return { ok: false, message: 'Промокод уже использован' };

    lsSavePromos([...used, upper]);
    await get().addStars(userId, bonus, 'promo', `Промокод: ${upper}`);
    return { ok: true, message: `+${bonus} Stars добавлено!` };
  },

  adminGiveStars: async (targetUsername, amount, adminId) => {
    try {
      const { data: target } = await supabase
        .from('profiles')
        .select('id, stars_balance')
        .eq('username', targetUsername.replace('@', ''))
        .single();
      if (!target) return { ok: false, message: 'Пользователь не найден' };

      const newBal = (target.stars_balance ?? 0) + amount;
      await supabase.from('profiles').update({ stars_balance: newBal }).eq('id', target.id);
      return { ok: true, message: `Выдано ${amount}★ пользователю @${targetUsername}` };
    } catch (e: any) {
      return { ok: false, message: e.message ?? 'Ошибка' };
    }
  },
}));
