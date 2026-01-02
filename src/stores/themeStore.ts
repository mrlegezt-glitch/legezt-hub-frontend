'use client';

// ==================================
// Theme Store - Manages Dark/Light Theme
// ==================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'dark' | 'light';

interface ThemeState {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set, get) => ({
            theme: 'dark',
            setTheme: (theme) => {
                set({ theme });
                applyTheme(theme);
            },
            toggleTheme: () => {
                const newTheme = get().theme === 'dark' ? 'light' : 'dark';
                set({ theme: newTheme });
                applyTheme(newTheme);
            },
        }),
        {
            name: 'legezt-theme',
        }
    )
);

// Helper to apply theme class to document
function applyTheme(theme: Theme) {
    if (typeof window !== 'undefined') {
        const root = document.documentElement;
        root.classList.remove('dark', 'light');
        root.classList.add(theme);
    }
}

