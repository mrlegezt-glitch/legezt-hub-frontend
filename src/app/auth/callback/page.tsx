'use client';

// ==================================
// Auth Callback Page - Handles OAuth redirect
// ==================================

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/lib/api';

export default function AuthCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { setAuth, setLoading } = useAuthStore();

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Fetch user data (cookies are sent automatically)
                const response = await authApi.me();
                const user = response.data.data;

                // Set auth state (preserve fallback tokens if they exist)
                const currentState = useAuthStore.getState();
                setAuth(user, currentState.accessToken, currentState.refreshToken);

                // Redirect based on onboarding status
                if (user.isOnboardingComplete) {
                    // Check for pending redirect
                    const redirect = localStorage.getItem('auth_redirect');
                    if (redirect) {
                        localStorage.removeItem('auth_redirect');
                        // Ensure redirect is local to prevent open redirect vulnerabilities
                        if (redirect.startsWith('/')) {
                            router.push(redirect);
                            return;
                        }
                    }
                    router.push('/');
                } else {
                    router.push('/onboarding');
                }
            } catch (error) {
                console.error('Auth callback failed:', error);
                router.push('/login?error=auth_failed');
            }
        };

        handleCallback();
    }, [router, setAuth, setLoading]);

    return (
        <main className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin w-10 h-10 border-3 border-primary-500 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-gray-400">Signing you in...</p>
            </div>
        </main>
    );
}
