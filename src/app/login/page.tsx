'use client';

// ==================================
// Login Page
// ==================================

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://legezt-hub-api-prod.azurewebsites.net';

export default function LoginPage() {
    const router = useRouter();
    const { isAuthenticated } = useAuthStore();

    useEffect(() => {
        if (isAuthenticated) {
            router.push('/');
        }
    }, [isAuthenticated, router]);

    const searchParams = useSearchParams();

    const handleGoogleLogin = () => {
        // Store return URL if present
        const redirect = searchParams.get('redirect');
        if (redirect) {
            localStorage.setItem('auth_redirect', redirect);
        }

        // Use relative path to trigger Next.js rewrite, or fallback to absolute Azure URL
        window.location.href = `${API_URL}/api/auth/google`;
    };

    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-6">
            {/* Logo */}
            <div className="mb-8 text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 flex items-center justify-center">
                    <Sparkles size={40} className="text-white" />
                </div>
                <h1 className="text-3xl font-bold gradient-text">LeGeZt</h1>
                <p className="text-gray-400 mt-2">Your Study Hub</p>
            </div>

            {/* Login Card */}
            <div className="card w-full max-w-sm p-6">
                <h2 className="text-xl font-semibold text-center mb-6">Welcome Back</h2>

                <button
                    onClick={handleGoogleLogin}
                    className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-medium py-3 px-4 rounded-xl hover:bg-gray-100 transition-colors"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                            fill="currentColor"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                    </svg>
                    Continue with Google
                </button>

                <p className="text-center text-sm text-gray-400 mt-6">
                    By continuing, you agree to our{' '}
                    <a href="/privacy" className="text-primary-400 hover:underline">
                        Privacy Policy
                    </a>
                </p>
            </div>

            {/* Footer */}
            <p className="text-sm text-gray-500 mt-8">
                Founded by Mohd Jibraan
            </p>

            <BannedModal />
        </main>
    );

    function BannedModal() {
        const error = searchParams.get('error');
        const [feedback, setFeedback] = useState('');
        const [show, setShow] = useState(false);
        const [loading, setLoading] = useState(false);
        const [sent, setSent] = useState(false);

        useEffect(() => {
            if (error === 'banned' || error === 'ACCOUNT_BANNED') {
                setShow(true);
            }
        }, [error]);

        const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            setLoading(true);
            try {
                // We might need email here. For now asking user to input or just sending message
                // The backend endpoint expects { email, message }. 
                // Since we don't have the email from the redirect securely, let's ask user or rely on cookies if setup
                // But safer to ask user or just send "Unknown" if not provided? 
                // Let's modify the form to ask for email if not present in query
                await fetch(`${API_URL}/api/auth/banned-feedback`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: searchParams.get('email') || 'User from Login Page',
                        message: feedback
                    })
                });
                setSent(true);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (!show) return null;

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <div className="bg-dark-200 border border-red-500/30 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>

                    <h2 className="text-2xl font-bold text-center text-white mb-2">Access Denied</h2>
                    <p className="text-gray-400 text-center mb-6">
                        Sorry, you do not have permission to access this account. Contact the administrator if you believe this is a mistake.
                    </p>

                    {sent ? (
                        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
                            <p className="text-green-400 font-medium">Feedback sent successfully!</p>
                            <button onClick={() => setShow(false)} className="mt-4 text-sm text-gray-400 hover:text-white underline">Close</button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <textarea
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                placeholder="Explain why you should be unbanned..."
                                className="w-full bg-dark-100 border border-dark-border rounded-xl p-3 text-white placeholder-gray-500 mb-4 focus:outline-none focus:border-red-500/50 min-h-[100px]"
                                required
                            />
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => { setShow(false); router.replace('/login'); }}
                                    className="flex-1 py-3 rounded-xl bg-dark-100 text-gray-400 hover:bg-dark-50 font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Sending...' : 'Contact Admin'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        );
    }
}
