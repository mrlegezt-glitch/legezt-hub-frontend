'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { api } from '@/lib/api';

export default function AuthInitializer() {
    const { isAuthenticated, accessToken, setAuth, logout } = useAuthStore();

    useEffect(() => {
        const validateSession = async () => {
            if (!isAuthenticated || !accessToken) return;

            try {
                // Fetch fresh user profile (this will generate a new SAS token for the logo)
                const res = await api.get('/auth/me');
                const user = res.data.data;

                // Update store with fresh data
                // We keep the existing tokens unless the backend rotated them in this response (unlikely for /me)
                // But we can just re-set auth with existing tokens + new user
                // Note: setAuth expects (user, accessToken, refreshToken)
                // We need to access refreshToken from store, but it might not be in the destructured vars
                // Let's use setState directly or just update the user part if possible.
                // Looking at authStore, we have `updateUser`.

                useAuthStore.getState().updateUser(user);

            } catch (error: any) {
                console.error('Session validation failed:', error);

                // If 401, token is invalid/expired
                if (error.response?.status === 401) {
                    logout();
                    // Optional: Redirect to login or show toast
                }
            }
        };

        validateSession();
    }, [isAuthenticated, accessToken, logout]);

    return null; // This component doesn't render anything
}
