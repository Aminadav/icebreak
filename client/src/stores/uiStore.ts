import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { UIState } from '../types';

interface UIStore extends UIState {
  setLanguage: (language: 'he' | 'en') => void;
  toggleLanguage: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      language: 'he',
      isRTL: true,
      theme: 'light',
      sidebarOpen: false,

      setLanguage: (language) => {
        const isRTL = language === 'he';
        set({ language, isRTL });
        
        // Update document direction
        document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
        document.documentElement.lang = language;
      },

      toggleLanguage: () => {
        const { language } = get();
        const newLanguage = language === 'he' ? 'en' : 'he';
        get().setLanguage(newLanguage);
      },

      setTheme: (theme) => {
        set({ theme });
        
        // Update document class for theme
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },

      toggleTheme: () => {
        const { theme } = get();
        get().setTheme(theme === 'light' ? 'dark' : 'light');
      },

      setSidebarOpen: (open) => {
        set({ sidebarOpen: open });
      },

      toggleSidebar: () => {
        const { sidebarOpen } = get();
        set({ sidebarOpen: !sidebarOpen });
      }
    }),
    {
      name: 'ui-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Apply persisted settings to document
          document.documentElement.dir = state.isRTL ? 'rtl' : 'ltr';
          document.documentElement.lang = state.language;
          
          if (state.theme === 'dark') {
            document.documentElement.classList.add('dark');
          }
        }
      }
    }
  )
);
