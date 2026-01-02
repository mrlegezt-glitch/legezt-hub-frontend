'use client';

import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Loading() {
    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-50 to-white">
            <div className="relative flex items-center justify-center">
                {/* Pulsing Outer Ring */}
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute w-32 h-32 bg-primary-500 rounded-full"
                />

                {/* Spinning Icon */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                    <Loader2 className="text-primary-600 w-12 h-12 stroke-[2.5px]" />
                </motion.div>
            </div>

            <div className="mt-8 text-center space-y-2">
                <h2 className="text-xl font-black text-slate-800 tracking-tighter uppercase italic">
                    Powering <span className="text-primary-600">LeGeZt</span>
                </h2>
                <div className="flex items-center gap-1.5 justify-center">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                            className="w-1.5 h-1.5 bg-primary-500 rounded-full"
                        />
                    ))}
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] font-sans">
                    Synchronizing Hub Modules
                </p>
            </div>
        </div>
    );
}
