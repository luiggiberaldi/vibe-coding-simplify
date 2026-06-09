import { create } from 'zustand';
import { RatesData } from '../utils/exchangeRates';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export interface ConfirmState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  confirmVariant: 'primary' | 'danger';
  onConfirm: () => void;
}

interface UIState {
  theme: 'dark' | 'light';
  isSidebarOpen: boolean;
  searchOpen: boolean;
  projectsViewMode: 'list' | 'kanban';
  toasts: ToastMessage[];
  confirm: ConfirmState;
  rates: RatesData | null;
  ratesLoading: boolean;
  lastExportedAt: string | null;
  
  toggleTheme: () => void;
  toggleSidebar: () => void;
  setSearchOpen: (open: boolean) => void;
  setProjectsViewMode: (mode: 'list' | 'kanban') => void;
  addToast: (message: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
  showConfirm: (options: Omit<ConfirmState, 'isOpen'>) => void;
  closeConfirm: () => void;
  setRates: (rates: RatesData) => void;
  setRatesLoading: (loading: boolean) => void;
  setLastExportedAt: (date: string) => void;
}

const getInitialTheme = (): 'dark' | 'light' => {
  if (typeof window === 'undefined') return 'dark';
  const saved = localStorage.getItem('pf-theme');
  return saved === 'light' ? 'light' : 'dark';
};

const getInitialProjectsViewMode = (): 'list' | 'kanban' => {
  if (typeof window === 'undefined') return 'list';
  const saved = localStorage.getItem('pf-projects-view');
  return saved === 'kanban' ? 'kanban' : 'list';
}

const getInitialLastExportedAt = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('pf-last-exported');
};

export const useUIStore = create<UIState>((set) => ({
  theme: getInitialTheme(),
  isSidebarOpen: false,
  searchOpen: false,
  projectsViewMode: getInitialProjectsViewMode(),
  toasts: [],
  rates: null,
  ratesLoading: false,
  lastExportedAt: getInitialLastExportedAt(),
  confirm: {
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: 'Confirmar',
    cancelLabel: 'Cancelar',
    confirmVariant: 'primary',
    onConfirm: () => {}
  },

  toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'dark' ? 'light' : 'dark';
    if (typeof window !== 'undefined') {
      localStorage.setItem('pf-theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
    }
    return { theme: newTheme };
  }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSearchOpen: (open) => set({ searchOpen: open }),
  setProjectsViewMode: (mode) => {
    set({ projectsViewMode: mode });
    if (typeof window !== 'undefined') {
      localStorage.setItem('pf-projects-view', mode);
    }
  },

  addToast: (message, type = 'info') => set((state) => {
    const id = crypto.randomUUID();
    return { toasts: [...state.toasts, { id, message, type }] };
  }),
  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter(t => t.id !== id)
  })),

  showConfirm: (options) => set({ confirm: { ...options, isOpen: true } }),
  closeConfirm: () => set((state) => ({ confirm: { ...state.confirm, isOpen: false } })),
  
  setRates: (rates) => set({ rates }),
  setRatesLoading: (loading) => set({ ratesLoading: loading }),
  setLastExportedAt: (date) => {
    set({ lastExportedAt: date });
    if (typeof window !== 'undefined') {
      localStorage.setItem('pf-last-exported', date);
    }
  },
}));