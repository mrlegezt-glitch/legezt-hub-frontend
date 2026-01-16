'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
                <AlertTriangle className="text-red-500" size={40} />
            </div>

            <h1 className="text-4xl font-extrabold text-slate-900 mb-2 mt-4 tracking-tight">System Interruption</h1>
            <p className="text-slate-500 max-w-md mx-auto mb-10 leading-relaxed font-medium">
                We&apos;ve encountered an unexpected error. Don&apos;t worry, your progress is likely safe. Let&apos;s try to restore the session.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs sm:max-w-md justify-center">
                <button
                    onClick={() => reset()}
                    className="flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-200"
                >
                    <RefreshCcw size={18} />
                    Reconnect Session
                </button>

                <Link
                    href="/"
                    className="flex items-center justify-center gap-2 bg-white border-2 border-slate-200 text-slate-600 px-8 py-3.5 rounded-2xl font-bold hover:bg-slate-50 transition-all active:scale-95"
                >
                    <Home size={18} />
                    Back to Safety
                </Link>
            </div>

            {process.env.NODE_ENV === 'development' && (
                <div className="mt-12 p-6 bg-slate-100 rounded-3xl text-left max-w-2xl w-full border border-slate-200 overflow-hidden">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Diagnostic Information</p>
                    <pre className="text-[10px] text-red-600 font-mono whitespace-pre-wrap break-all leading-tight">
                        {error.message}
                        {error.digest && `\nDigest: ${error.digest}`}
                    </pre>
                </div>
            )}
        </div>
    );
}
