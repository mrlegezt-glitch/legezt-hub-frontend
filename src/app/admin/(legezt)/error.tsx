'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw, Database, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Admin Console Error:', error);
    }, [error]);

    return (
        <div className="flex-1 min-h-[80vh] flex flex-col items-center justify-center p-8 bg-dark-bg animate-in fade-in duration-700">
            <div className="relative group">
                <motion.div
                    animate={{
                        boxShadow: ["0 0 20px rgba(239, 68, 68, 0.2)", "0 0 50px rgba(239, 68, 68, 0.4)", "0 0 20px rgba(239, 68, 68, 0.2)"]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-24 h-24 bg-red-500/10 border border-red-500/30 rounded-[2rem] flex items-center justify-center mb-10 rotate-12 group-hover:rotate-0 transition-transform duration-500"
                >
                    <AlertCircle className="text-red-500" size={48} />
                </motion.div>
            </div>

            <div className="text-center max-w-lg">
                <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic mb-4">
                    ADMIN CONSOLE <span className="text-red-500 italic">CRASHED</span>
                </h1>
                <p className="text-gray-500 font-bold text-sm uppercase tracking-widest leading-relaxed mb-12">
                    The core engine encountered a critical exception. System operations have been halted to prevent data corruption.
                </p>

                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                    <button
                        onClick={() => reset()}
                        className="bg-primary-600 hover:bg-primary-500 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all flex items-center gap-3 shadow-2xl shadow-primary-500/20 active:scale-95"
                    >
                        <RefreshCw size={18} />
                        Reboot Module
                    </button>

                    <button
                        onClick={() => window.location.href = '/admin'}
                        className="bg-dark-300 border border-white/5 text-gray-400 hover:text-white px-10 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all active:scale-95"
                    >
                        <Database size={18} />
                        Emergency Exit
                    </button>
                </div>

                {/* Console-style error info */}
                <div className="mt-16 bg-black border border-white/5 rounded-3xl p-8 text-left group">
                    <div className="flex items-center gap-2 mb-4">
                        <Terminal size={14} className="text-emerald-500" />
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Diagnostic Terminal</span>
                    </div>
                    <div className="space-y-2">
                        <p className="text-[11px] font-mono text-gray-400 opacity-60">System Version: PRO_LEGEZT_V2</p>
                        <p className="text-[11px] font-mono text-red-400 break-all leading-relaxed">
                            ERROR_LOG: {error.message || "An unknown fatal error occurred in the administrative layer."}
                        </p>
                        {error.digest && (
                            <p className="text-[11px] font-mono text-indigo-400 opacity-80">
                                STACK_DIGEST: {error.digest}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
