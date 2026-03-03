'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import AdminSidebar from '../components/AdminSidebar';
import { Menu, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import InstallPrompt from '../components/InstallPrompt';

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
    const { user, isAuthenticated } = useAuthStore();
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Initial Auth Check
    useEffect(() => {
        if (!isAuthenticated || user?.role !== 'SUPER_ADMIN') {
            router.push('/');
        }
    }, [isAuthenticated, user, router]);

    if (!user) return null;

    return (
        <div className="min-h-screen bg-dark-android flex relative overflow-hidden text-white selection:bg-silver-metallic/30">
            {/* Sidebar (Desktop) */}
            <AdminSidebar />

            {/* Content Area */}
            <div className="flex-1 flex flex-col min-h-screen relative">
                {/* Mobile Header */}
                <header className="md:hidden h-16 border-b border-silver-dark/10 flex items-center justify-between px-4 bg-dark-android/90 backdrop-blur-xl sticky top-0 z-30 shadow-silver-glow">
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 text-silver-400 hover:text-white hover:bg-dark-surface rounded-xl shadow-inner-metallic border border-transparent hover:border-silver-dark/20 transition-all"
                        aria-label="Toggle admin menu"
                    >
                        <Menu size={24} />
                    </button>
                    <span className="font-display font-bold text-lg tracking-tight drop-shadow-md">Admin Console</span>
                    <div className="w-8" /> {/* Spacer for centering */}
                </header>

                {/* Mobile Menu Overlay */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            {/* Mobile Menu Overlay */}
                            <motion.div
                                initial={{ x: '-100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '-100%' }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                className="w-80 h-full bg-dark-android/95 backdrop-blur-2xl border-r border-silver-dark/20 shadow-2xl relative overflow-hidden flex flex-col pt-4"
                                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                            >
                                {/* Using identical AdminSidebar inside overlay */}
                                <AdminSidebar isMobile onItemClick={() => setIsMobileMenuOpen(false)} />
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main Page Content */}
                <main className="flex-1 overflow-x-hidden relative z-10">
                    {children}
                </main>
                <InstallPrompt />
            </div>
        </div>
    );
}
