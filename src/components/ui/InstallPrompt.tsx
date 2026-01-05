'use client';

import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        // Prevent default install prompt
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            // Check if user has already dismissed it recently
            const hasDismissed = localStorage.getItem('pwa_dismissed');
            if (!hasDismissed) {
                setShowPrompt(true);
            }
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setDeferredPrompt(null);
            setShowPrompt(false);
        }
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        // Don't show again for 24 hours (or just set a flag)
        localStorage.setItem('pwa_dismissed', 'true');
    };

    return (
        <AnimatePresence>
            {showPrompt && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-20 left-4 right-4 md:left-auto md:right-8 md:bottom-8 md:w-96 bg-dark-200/90 backdrop-blur-xl border border-primary-500/30 rounded-2xl p-4 shadow-2xl z-50 flex items-center gap-4"
                >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary-500/20">
                        <img src="/icons/icon-192x192.png" alt="App Icon" className="w-full h-full object-cover rounded-xl" />
                    </div>

                    <div className="flex-1">
                        <h4 className="font-bold text-sm">Install LeGeZt Hub</h4>
                        <p className="text-xs text-gray-400">Get better performance and full screen experience.</p>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={handleDismiss}
                            className="p-2 text-gray-400 hover:text-white transition-colors"
                        >
                            <X size={18} />
                        </button>
                        <button
                            onClick={handleInstall}
                            className="bg-primary-500 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors shadow-lg shadow-primary-500/20"
                        >
                            Install
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
