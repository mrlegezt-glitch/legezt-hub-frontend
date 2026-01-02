// ==================================
// Auth Store (Zustand)
// ==================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    id: string;
    email: string;
    name: string;
    avatar: string | null;
    role: string;
    collegeId?: string;
    collegeName?: string;
    collegeLogo?: string;
    branchId?: string;
    branchName?: string;
    yearId?: string;
    yearName?: string;
    semesterId?: string;
    semesterName?: string;
    isOnboardingComplete?: boolean;
}

interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    // Actions
    setAuth: (user: User, accessToken: string | null, refreshToken: string | null) => void;
    setTokens: (accessToken: string, refreshToken: string) => void;
    logout: () => void;
    setLoading: (loading: boolean) => void;
    updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: true,

            setAuth: (user, accessToken, refreshToken) =>
                set({
                    user,
                    accessToken,
                    refreshToken,
                    isAuthenticated: true,
                    isLoading: false,
                }),

            setTokens: (accessToken, refreshToken) =>
                set({ accessToken, refreshToken }),

            logout: () =>
                set({
                    user: null,
                    accessToken: null,
                    refreshToken: null,
                    isAuthenticated: false,
                    isLoading: false,
                }),

            setLoading: (loading) =>
                set({ isLoading: loading }),

            updateUser: (user) =>
                set({ user }),
        }),
        {
            name: 'legezt-auth',
            partialize: (state) => ({
                user: state.user,
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
                isAuthenticated: state.isAuthenticated,
            }),
            onRehydrateStorage: () => (state) => {
                state?.setLoading(false);

                // Check for fallback cookie (from Google Login)
                if (typeof document !== 'undefined') {
                    const match = document.cookie.match(new RegExp('(^| )rt_fallback=([^;]+)'));
                    if (match && match[2]) {
                        // Seed store with fallback token
                        state?.setTokens(state.accessToken || '', match[2]);
                        // Clear cookie
                        document.cookie = 'rt_fallback=; Max-Age=0; path=/;';
                    }
                }
            },
        }
    )
);
