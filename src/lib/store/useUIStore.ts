/**
 * Global UI state: modals, drawers, sound and toast notifications.
 */
import { create } from 'zustand';
import type { Toast, ToastKind } from '@/types';
import { uid } from '@/lib/utils';

export type ModalId =
  | 'login'
  | 'signup'
  | 'forgot'
  | 'deposit'
  | 'withdraw'
  | 'roblox'
  | 'fairness'
  | 'daily'
  | null;

interface UIState {
  modal: ModalId;
  chatOpen: boolean;
  mobileNavOpen: boolean;
  soundEnabled: boolean;
  toasts: Toast[];

  openModal: (id: Exclude<ModalId, null>) => void;
  closeModal: () => void;
  toggleChat: () => void;
  setChat: (open: boolean) => void;
  toggleMobileNav: () => void;
  setMobileNav: (open: boolean) => void;
  toggleSound: () => void;

  pushToast: (toast: Omit<Toast, 'id'>) => void;
  notify: (kind: ToastKind, title: string, message?: string) => void;
  dismissToast: (id: string) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  modal: null,
  chatOpen: false,
  mobileNavOpen: false,
  soundEnabled: true,
  toasts: [],

  openModal: (id) => set({ modal: id, mobileNavOpen: false }),
  closeModal: () => set({ modal: null }),
  toggleChat: () => set({ chatOpen: !get().chatOpen }),
  setChat: (open) => set({ chatOpen: open }),
  toggleMobileNav: () => set({ mobileNavOpen: !get().mobileNavOpen }),
  setMobileNav: (open) => set({ mobileNavOpen: open }),
  toggleSound: () => set({ soundEnabled: !get().soundEnabled }),

  pushToast: (toast) => {
    const id = uid('toast');
    set({ toasts: [...get().toasts, { ...toast, id }] });
    const duration = toast.duration ?? 4200;
    setTimeout(() => get().dismissToast(id), duration);
  },

  notify: (kind, title, message) => get().pushToast({ kind, title, message }),

  dismissToast: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}));
