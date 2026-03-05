'use client';

// ==================================
// Login Page
// ==================================

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sparkles, Mail, Lock, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/lib/api';
import { toast } from 'sonner';
import Link from 'next/link';

const API_URL = process.env.NODE_ENV === 'development'
    ? 'http://localhost:5000'
    : (process.env.NEXT_PUBLIC_API_URL || 'https://legezt-hub-api-prod.azurewebsites.net');

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { isAuthenticated, setTokens } = useAuthStore();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            router.push('/');
        }
    }, [isAuthenticated, router]);

    const handleGoogleLogin = () => {
        const redirect = searchParams.get('redirect');
        if (redirect) {
            localStorage.setItem('auth_redirect', redirect);
        }
        window.location.href = `${API_URL}/api/auth/google`;
    };

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error('Please fill in all fields');
            return;
        }

        setIsLoading(true);
        try {
            const res = await authApi.loginWithEmail({ email, password });
            const { tokens } = res.data.data;
            setTokens(tokens.accessToken, tokens.refreshToken);

            const redirect = searchParams.get('redirect');
            if (redirect) {
                router.push(redirect);
            } else {
                router.push('/');
            }
            toast.success('Welcome back!');
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to login';
            if (message === 'ACCOUNT_BANNED') {
                router.replace(`/login?error=banned&email=${email}`);
            } else {
                toast.error(message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-hidden bg-slate-50">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-br from-primary-900 via-slate-900 to-purple-900 rounded-b-[40px] sm:rounded-b-[80px] -z-10 overflow-hidden">
                <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary-500/30 blur-[100px] rounded-full"></div>
                <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500/30 blur-[80px] rounded-full"></div>
            </div>

            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="mb-8 text-center pt-8">
                    <Link href="/" className="inline-block relative group">
                        <div className="absolute -inset-2 bg-white/20 rounded-2xl blur-lg group-hover:bg-white/30 transition-all"></div>
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-white shadow-xl flex items-center justify-center relative ring-1 ring-white/50">
                            <Sparkles size={32} className="text-primary-600" />
                        </div>
                    </Link>
                    <h1 className="text-3xl font-bold text-white mt-6 tracking-tight">Welcome Back</h1>
                    <p className="text-blue-100/80 mt-2 font-medium">Log in to your LeGeZt account</p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl shadow-slate-200/50 border border-slate-100 mhw-full relative z-10">

                    <form onSubmit={handleEmailLogin} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700 ml-1">Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail size={18} className="text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium placeholder:font-normal placeholder:text-slate-400"
                                    placeholder="your@email.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5 pt-2">
                            <div className="flex items-center justify-between ml-1">
                                <label className="text-sm font-semibold text-slate-700">Password</label>
                                <Link href="/forgot-password" className="text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock size={18} className="text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium placeholder:font-normal placeholder:text-slate-400"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full mt-6 py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-lg shadow-primary-600/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2"
                        >
                            {isLoading ? <Loader2 size={20} className="animate-spin" /> : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-8 relative flex items-center justify-center">
                        <div className="absolute inset-x-0 h-px bg-slate-200"></div>
                        <span className="relative bg-white px-4 text-xs font-medium text-slate-400 uppercase tracking-widest">Or continue with</span>
                    </div>

                    <button
                        onClick={handleGoogleLogin}
                        className="w-full mt-6 flex items-center justify-center gap-3 bg-white border border-slate-200 text-slate-700 font-semibold py-3 px-4 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98] shadow-sm"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Google
                    </button>

                    <p className="text-center text-sm text-slate-500 mt-8 font-medium">
                        Don&apos;t have an account?{' '}
                        <Link href="/signup" className="text-primary-600 hover:text-primary-700 font-bold hover:underline transition-all">
                            Create one
                        </Link>
                    </p>
                </div>

                {/* Footer */}
                <p className="text-sm text-center text-slate-400 font-medium mt-10">
                    By signing in, you agree to our <Link href="/privacy" className="hover:text-slate-600 underline decoration-slate-300 underline-offset-2 transition-colors">Privacy Policy</Link>
                </p>
                <BannedModal />
            </div>
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
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative border border-slate-100">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner ring-1 ring-red-100">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>

                    <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">Account Suspended</h2>
                    <p className="text-slate-500 text-center mb-8 font-medium">
                        Sorry, you do not have permission to access this account. Contact the administrator if you believe this is a mistake.
                    </p>

                    {sent ? (
                        <div className="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-2xl p-6 text-center shadow-inner">
                            <p className="font-bold mb-1">Feedback Sent!</p>
                            <p className="text-sm opacity-90">Our team will review your message soon.</p>
                            <button onClick={() => setShow(false)} className="mt-6 font-semibold bg-emerald-100 hover:bg-emerald-200 py-2.5 px-6 rounded-xl transition-colors">Dismiss</button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <textarea
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                placeholder="Explain why you should be unbanned..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-800 placeholder-slate-400 mb-6 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all min-h-[120px] font-medium resize-none shadow-inner"
                                required
                            />
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => { setShow(false); router.replace('/login'); }}
                                    className="flex-1 py-3.5 rounded-xl bg-white border border-slate-200 shadow-sm text-slate-600 hover:bg-slate-50 font-bold transition-all active:scale-[0.98]"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 py-3.5 rounded-xl bg-red-600 shadow-lg shadow-red-600/20 hover:bg-red-700 text-white font-bold transition-all disabled:opacity-70 active:scale-[0.98] disabled:active:scale-100 flex items-center justify-center"
                                >
                                    {loading ? <Loader2 size={20} className="animate-spin" /> : 'Contact Admin'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        );
    }
}
