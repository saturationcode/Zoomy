import { create } from 'zustand';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface UIState {
  sidebarOpen: boolean;
  profileSheetOpen: boolean;
  profileSheetUserId: string | null;
  newChatOpen: boolean;
  settingsOpen: boolean;
  theme: 'dark';
  toasts: Toast[];
}

interface UIActions {
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  openProfileSheet: (userId: string) => void;
  closeProfileSheet: () => void;
  openNewChat: () => void;
  closeNewChat: () => void;
  openSettings: () => void;
  closeSettings: () => void;
  addToast: (message: string, type: ToastType) => void;
  removeToast: (id: string) => void;
  showToast: (message: string, type?: ToastType) => void;
}

type UIStore = UIState & UIActions;

const isDesktop = () =>
  typeof window !== 'undefined' && window.innerWidth >= 768;

export const useUIStore = create<UIStore>((set, get) => ({
  sidebarOpen: isDesktop(),
  profileSheetOpen: false,
  profileSheetUserId: null,
  newChatOpen: false,
  settingsOpen: false,
  theme: 'dark',
  toasts: [],

  toggleSidebar: () =>
    set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  openProfileSheet: (userId) =>
    set({ profileSheetOpen: true, profileSheetUserId: userId }),

  closeProfileSheet: () =>
    set({ profileSheetOpen: false, profileSheetUserId: null }),

  openNewChat: () => set({ newChatOpen: true }),

  closeNewChat: () => set({ newChatOpen: false }),

  openSettings: () => set({ settingsOpen: true }),

  closeSettings: () => set({ settingsOpen: false }),

  addToast: (message, type) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  showToast: (message, type = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));
    setTimeout(() => {
      get().removeToast(id);
    }, 3000);
  },
}));

// Alias for backwards compat (some files import useUiStore)
export const useUiStore = useUIStore;
