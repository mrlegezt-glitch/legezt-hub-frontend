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
        <main className="min-h-screen pt-24 pb-12 flex items-center justify-center relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-dark-900" />
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-600/10 rounded-full blur-[100px]" />

            <div className="w-full max-w-md relative z-10 px-6">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-dark-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl border border-dark-border group">
                        <Shield className="w-10 h-10 text-primary-500 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Admin Access</h1>
                    <p className="text-gray-400">
                        {mode === 'verify'
                            ? 'Enter your security PIN to continue'
                            : 'Create a new 4-digit Security PIN'}
                    </p>
                </div>

                <div className="card p-8 backdrop-blur-xl bg-dark-200/50 border-dark-border">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Security PIN
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                                <input
                                    type="password"
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value)}
                                    className="input-field pl-10 text-center tracking-[0.5em] text-2xl font-bold"
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
                            className="btn-primary w-full py-3 flex items-center justify-center gap-2 group"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" />
                            ) : (
                                <>
                                    <span>{mode === 'verify' ? 'Unlock Dashboard' : 'Set PIN'}</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
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
