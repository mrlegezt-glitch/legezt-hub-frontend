'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, KeyRound, Loader2, ArrowLeft } from 'lucide-react';
import { authApi } from '@/lib/api';
import { toast } from 'sonner';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const router = useRouter();

    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleRequestOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return toast.error('Please enter your email');

        setIsLoading(true);
        try {
            await authApi.forgotPassword({ email });
            toast.success('OTP sent to your email!');
            setStep(2);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to send OTP');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length !== 6) return toast.error('OTP must be 6 digits');

        setIsLoading(true);
        try {
            await authApi.verifyOtp({ email, otp });
            toast.success('OTP verified!');
            setStep(3);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Invalid or expired OTP');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword.length < 6) return toast.error('Password must be at least 6 characters');

        setIsLoading(true);
        try {
            await authApi.resetPassword({ email, otp, newPassword });
            toast.success('Password reset successfully!');
            router.push('/login');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to reset password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-hidden bg-slate-50">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-br from-primary-900 via-slate-900 to-purple-900 flex-shrink-0 -z-10 rounded-b-[40px] sm:rounded-b-[80px] overflow-hidden">
                <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary-500/30 blur-[100px] rounded-full"></div>
                <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500/30 blur-[80px] rounded-full"></div>
            </div>

            <div className="w-full max-w-md">
                {/* Back Link */}
                <Link href="/login" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 font-medium transition-colors">
                    <ArrowLeft size={18} />
                    Back to login
                </Link>

                {/* Header */}
                <div className="mb-8 text-center bg-white rounded-3xl p-6 sm:p-8 shadow-2xl shadow-slate-200/50 border border-slate-100">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mb-6">
                        {step === 1 && <Mail size={32} />}
                        {step === 2 && <KeyRound size={32} />}
                        {step === 3 && <Lock size={32} />}
                    </div>

                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                        {step === 1 && 'Forgot Password'}
                        {step === 2 && 'Verify Email'}
                        {step === 3 && 'Create New Password'}
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium text-sm">
                        {step === 1 && 'Enter your email address and we will send you a 6-digit OTP to reset your password.'}
                        {step === 2 && 'We sent a 6-digit code to your email. Enter it below to verify your identity.'}
                        {step === 3 && 'Your new password must be different from previous used passwords.'}
                    </p>

                    {/* Forms */}
                    <div className="mt-8">
                        {step === 1 && (
                            <form onSubmit={handleRequestOtp} className="space-y-4">
                                <div className="space-y-1.5 text-left">
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
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full mt-6 py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-lg shadow-primary-600/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2"
                                >
                                    {isLoading ? <Loader2 size={20} className="animate-spin" /> : 'Send OTP'}
                                </button>
                            </form>
                        )}

                        {step === 2 && (
                            <form onSubmit={handleVerifyOtp} className="space-y-4">
                                <div className="space-y-1.5 text-left">
                                    <label className="text-sm font-semibold text-slate-700 ml-1">6-Digit Code</label>
                                    <div className="relative group flex justify-center">
                                        <input
                                            type="text"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                                            className="w-48 text-center text-2xl tracking-[0.5em] py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-bold placeholder:font-normal placeholder:text-slate-400"
                                            placeholder="------"
                                            required
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isLoading || otp.length !== 6}
                                    className="w-full mt-6 py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-lg shadow-primary-600/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2"
                                >
                                    {isLoading ? <Loader2 size={20} className="animate-spin" /> : 'Verify Code'}
                                </button>

                                <div className="pt-4 flex justify-center">
                                    <button
                                        type="button"
                                        onClick={handleRequestOtp}
                                        disabled={isLoading}
                                        className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors disabled:opacity-50"
                                    >
                                        Resend Code
                                    </button>
                                </div>
                            </form>
                        )}

                        {step === 3 && (
                            <form onSubmit={handleResetPassword} className="space-y-4 text-left">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-700 ml-1">New Password</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock size={18} className="text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                                        </div>
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium placeholder:font-normal placeholder:text-slate-400"
                                            placeholder="••••••••"
                                            minLength={6}
                                            required
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full mt-6 py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-lg shadow-primary-600/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2"
                                >
                                    {isLoading ? <Loader2 size={20} className="animate-spin" /> : 'Reset Password'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
