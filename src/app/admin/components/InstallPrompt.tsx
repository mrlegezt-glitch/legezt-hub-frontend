'use client';

import { useState, useEffect } from 'react';
import { Download, X, Share } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // Check if iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(isIosDevice);

        // Listen for install prompt
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // If iOS and not standalone, show prompt
        if (isIosDevice && !(window.navigator as any).standalone) {
            // Only show once per session or check local storage
            const hasSeenPrompt = sessionStorage.getItem('iosPwaPromptSeen');
            if (!hasSeenPrompt) {
                setShowPrompt(true);
            }
        }

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
        if (isIOS) {
            sessionStorage.setItem('iosPwaPromptSeen', 'true');
        }
    };

    return (
        <AnimatePresence>
            {showPrompt && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:w-96 z-50"
                >
                    <div className="bg-dark-200/90 backdrop-blur-xl border border-primary-500/20 p-4 rounded-2xl shadow-2xl flex items-start gap-4 ring-1 ring-white/10">
                        <div className="p-3 bg-primary-600/20 rounded-xl text-primary-400">
                            <Download size={24} />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-white mb-1">Install Admin App</h3>
                            <p className="text-sm text-gray-400 mb-3">
                                {isIOS
                                    ? 'Install this app on your iPhone for a better experience.'
                                    : 'Install the Admin Console for quick access and better performance.'}
                            </p>

                            {isIOS ? (
                                <div className="text-xs text-gray-500 bg-white/5 p-2 rounded-lg">
                                    Tap <Share size={12} className="inline mx-1" /> then "Add to Home Screen"
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleInstall}
                                        className="btn-primary py-1.5 px-4 text-sm flex-1"
                                    >
                                        Install Now
                                    </button>
                                    <button
                                        onClick={handleDismiss}
                                        className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
                                    >
                                        Later
                                    </button>
                                </div>
                            )}
                        </div>
                        {isIOS && (
                            <button onClick={handleDismiss} className="text-gray-500 hover:text-white">
                                <X size={20} />
                            </button>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
