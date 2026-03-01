'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { api } from '@/lib/api';

export default function AuthInitializer() {
    const { isAuthenticated, accessToken, setAuth, logout } = useAuthStore();

    useEffect(() => {
        const validateSession = async () => {
            // Case 1: State thinks we are authenticated
            if (isAuthenticated) {
                try {
                    // Validate token / Get fresh user data
                    const res = await api.get('/auth/me');
                    useAuthStore.getState().updateUser(res.data.data);

                    // Acknowledge Ping-Back successfully
                    api.post('/auth/ping-ack').catch(() => { });
                } catch (error: any) {
                    console.error('Session validation failed:', error);
                    // If 401, mostly token expired. Try silent refresh before giving up.
                    if (error.response?.status === 401) {
                        await attemptRefresh();
                    }
                }
                return;
            }

            // Case 2: State thinks we are NOT authenticated (e.g. Refresh)
            // We blindly try to refresh using the HttpOnly cookie.
            if (!isAuthenticated) {
                await attemptRefresh();
            }
        };

        const attemptRefresh = async () => {
            try {
                // Call refresh endpoint - strictly relies on HttpOnly cookie
                const res = await api.post('/auth/refresh');
                const { user, accessToken, refreshToken } = res.data.data;

                // Update store (Re-login the user)
                setAuth(user, accessToken, refreshToken);

                // Acknowledge Ping-Back successfully
                api.post('/auth/ping-ack').catch(() => { });
            } catch (error) {
                // Fail silently - user is truly logged out

            }
        };

        validateSession();
    }, [isAuthenticated, accessToken, setAuth]);

    // Cross-tab synchronization
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'legezt-auth' && e.newValue) {
                try {
                    const newState = JSON.parse(e.newValue);
                    const isNowAuth = newState.state?.isAuthenticated;
                    const wasAuth = useAuthStore.getState().isAuthenticated;

                    // If another tab logged out, log this tab out too
                    if (!isNowAuth && wasAuth) {
                        useAuthStore.getState().logout();

                        // Optionally redirect to login or show notice
                        if (window.location.pathname !== '/login') {
                            window.location.href = '/login?error=session_expired';
                        }
                    }
                } catch (err) {
                    console.error('Error parsing sync state', err);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    return null; // This component doesn't render anything
}
