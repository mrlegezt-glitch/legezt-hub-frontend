'use client';

import { Loader2, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminLoading() {
    return (
        <div className="flex-1 min-h-[80vh] flex flex-col items-center justify-center p-8 bg-dark-bg">
            <div className="relative">
                {/* Neon Portal Effect */}
                <motion.div
                    animate={{
                        rotate: 360,
                        scale: [1, 1.1, 1],
                        borderColor: ['rgba(59, 130, 246, 0.2)', 'rgba(59, 130, 246, 0.5)', 'rgba(59, 130, 246, 0.2)']
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="w-32 h-32 border-2 border-dashed border-primary-500/30 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.1)]"
                />

                {/* Core Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            filter: ["drop-shadow(0 0 5px rgba(59,130,246,0.5))", "drop-shadow(0 0 15px rgba(59,130,246,0.8))", "drop-shadow(0 0 5px rgba(59,130,246,0.5))"]
                        }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-16 h-16 bg-dark-200 border border-white/5 rounded-2xl flex items-center justify-center shadow-2xl"
                    >
                        <Zap className="text-primary-500" size={32} />
                    </motion.div>
                </div>

                {/* Orbiting Particles */}
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2 + i, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 pointer-events-none"
                    >
                        <motion.div
                            animate={{ scale: [1, 1.5, 1] }}
                            transition={{ duration: 1, repeat: Infinity, delay: i * 0.3 }}
                            className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary-400 rounded-full shadow-[0_0_10px_rgba(96,165,250,0.8)]"
                        />
                    </motion.div>
                ))}
            </div>

            <div className="mt-12 text-center space-y-3">
                <h2 className="text-2xl font-black text-white tracking-widest uppercase italic">
                    INITIALIZING <span className="text-primary-500">ADMIN_CORE</span>
                </h2>
                <div className="flex flex-col items-center gap-2">
                    <div className="w-48 h-1 bg-dark-300 rounded-full overflow-hidden border border-white/5">
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: '100%' }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                            className="w-full h-full bg-gradient-to-r from-transparent via-primary-500 to-transparent"
                        />
                    </div>
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.4em] animate-pulse">
                        Accessing Encrypted Repository
                    </p>
                </div>
            </div>
        </div>
    );
}
