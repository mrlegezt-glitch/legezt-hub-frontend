'use client';

// ==================================
// Theme Provider - Syncs theme with DOM
// ==================================

import { useEffect } from 'react';
import { useThemeStore } from '@/stores/themeStore';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
    const theme = useThemeStore((state) => state.theme);

    useEffect(() => {
        const root = document.documentElement;
        root.classList.remove('dark', 'light');
        root.classList.add(theme);
    }, [theme]);

    return <>{children}</>;
}
