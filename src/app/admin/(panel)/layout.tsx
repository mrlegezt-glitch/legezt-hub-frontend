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
        <div className="min-h-screen bg-slate-50 flex relative overflow-hidden text-slate-900">
            {/* Sidebar (Desktop) */}
            <AdminSidebar />

            {/* Content Area */}
            <div className="flex-1 flex flex-col min-h-screen relative">
                {/* Mobile Header */}
                <header className="md:hidden h-16 border-b border-slate-200 flex items-center justify-between px-4 bg-white/95 backdrop-blur-xl sticky top-0 z-30">
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                        aria-label="Toggle admin menu"
                    >
                        <Menu size={24} />
                    </button>
                    <span className="font-bold">Admin Console</span>
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
                            <motion.div
                                initial={{ x: '-100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '-100%' }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                className="w-80 h-full bg-white/95 backdrop-blur-2xl border-r border-slate-200 shadow-2xl relative overflow-hidden"
                                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                            >
                                <div className="flex flex-col h-full">
                                    <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <img src="/logo.png" alt="Admin" className="w-8 h-8 object-contain animate-heartbeat" />
                                            <span className="font-bold text-lg">Admin</span>
                                        </div>
                                        <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-500 hover:text-slate-900" aria-label="Close admin menu">
                                            <Menu size={20} className="rotate-90" />
                                        </button>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-4">
                                        <AdminSidebar isMobile onItemClick={() => setIsMobileMenuOpen(false)} />
                                    </div>

                                    <div className="p-4 border-t border-slate-200 bg-slate-50">
                                        <div className="flex items-center gap-3 px-2">
                                            <div className="w-10 h-10 rounded-full bg-primary-600/20 flex items-center justify-center text-primary-400 font-bold border border-primary-500/30">
                                                {user.name?.[0].toUpperCase()}
                                            </div>
                                            <div className="flex flex-col overflow-hidden">
                                                <span className="text-sm font-semibold text-slate-900 truncate">{user.name}</span>
                                                <span className="text-[10px] text-slate-500 truncate">{user.email}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
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
