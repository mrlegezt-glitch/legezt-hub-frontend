'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { api } from '@/lib/api';

export default function AdminGatePage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState<'verify' | 'create'>('verify');

    // Check if user is allowed
    useEffect(() => {
        if (!isAuthenticated || user?.role !== 'SUPER_ADMIN') {
            router.push('/');
        }
    }, [isAuthenticated, user, router]);

    // Check if PIN is needed (This requires a new endpoint or check 'user.adminPin' presence ?)
    // Since we don't expose adminPin in user object for security, we assume 'verify' mode
    // If verify fails with "PIN not set" (400), we switch to 'create'.

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (mode === 'verify') {
                try {
                    await api.post('/admin/pin/verify', { pin });
                    // On success, redirect to dashboard
                    router.push('/admin/dashboard');
                } catch (err: any) {
                    // Detect "PIN not set" to switch mode
                    if (err.response?.data?.message === 'PIN not set' || err.message?.includes('PIN not set')) {
                        setMode('create');
                        setError('No Security PIN found. Please create one.');
                        setLoading(false); // Stop loading to let user reset
                    } else {
                        throw err;
                    }
                }
            } else {
                // Create Mode
                await api.post('/admin/pin/set', { pin });
                setMode('verify');
                setError('PIN created! Please enter it again to verify.');
                setPin('');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Authentication failed');
        } finally {
            if (mode !== 'create' || error) {
                setLoading(false);
            }
        }
    };

    if (!user) return null;

    return (
        <main className="min-h-screen pt-24 pb-12 flex items-center justify-center relative overflow-hidden bg-dark-android">
            {/* 3D Background Effects */}
            <div className="absolute inset-0 bg-android-bg-gradient" />
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-silver-metallic/5 rounded-full blur-[100px]" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-silver-dark/10 rounded-full blur-[100px]" />

            <div className="w-full max-w-md relative z-10 px-6">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-dark-surface rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-android-card border border-silver-dark/20 group relative overflow-hidden">
                        <div className="absolute inset-0 bg-silver-gradient opacity-10" />
                        <Shield className="w-10 h-10 text-silver-light group-hover:scale-110 transition-transform duration-300 relative z-10" />
                    </div>
                    <h1 className="text-3xl font-display font-bold text-white mb-2 drop-shadow-md">Admin Access</h1>
                    <p className="text-silver-400">
                        {mode === 'verify'
                            ? 'Enter your security PIN to continue'
                            : 'Create a new 4-digit Security PIN'}
                    </p>
                </div>

                <div className="rounded-3xl p-8 backdrop-blur-xl bg-dark-surface shadow-android-card border border-silver-dark/10 relative overflow-hidden">
                    {/* Metallic top reflection */}
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-silver-metallic to-transparent opacity-30" />
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-silver-300 mb-2">
                                Security PIN
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-silver-500 w-5 h-5 z-10" />
                                <input
                                    type="password"
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-dark-android border border-silver-800 focus:border-silver-500 rounded-xl text-center tracking-[0.5em] text-2xl font-bold text-white shadow-inner-metallic outline-none transition-all placeholder:text-silver-700"
                                    placeholder="••••"
                                    maxLength={8}
                                    autoFocus
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || pin.length < 4}
                            className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all duration-300 ${loading || pin.length < 4
                                    ? 'bg-dark-android text-silver-600 border border-silver-800 cursor-not-allowed'
                                    : 'bg-silver-gradient text-dark-android border border-silver-light shadow-3d hover:shadow-3d-hover hover:-translate-y-0.5'
                                } group relative overflow-hidden`}
                        >
                            {/* Inner gloss reflection */}
                            <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/10 rounded-t-xl" />

                            {loading ? (
                                <Loader2 className="animate-spin relative z-10" />
                            ) : (
                                <div className="flex items-center gap-2 relative z-10">
                                    <span>{mode === 'verify' ? 'Unlock Dashboard' : 'Set PIN'}</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-xs text-gray-500">
                            Protected Area • Super Admin Only
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
