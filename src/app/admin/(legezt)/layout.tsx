'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import LeGeZtAdminSidebar from './components/LeGeZtAdminSidebar';

export default function LeGeZtAdminLayout({ children }: { children: React.ReactNode }) {
    const { user, isAuthenticated, isLoading } = useAuthStore();
    const router = useRouter();
    const [hydrated, setHydrated] = useState(false);
    const { isLeGeZtAdminSidebarCollapsed: isCollapsed } = useUIStore();

    useEffect(() => {
        setHydrated(true);
    }, []);

    // Initial Auth Check
    useEffect(() => {
        if (!hydrated || isLoading) return; // Wait for hydration

        if (!isAuthenticated || user?.role !== 'SUPER_ADMIN') {
            router.push('/');
        }
    }, [isAuthenticated, user, router, hydrated, isLoading]);

    if (!hydrated || isLoading) {
        return <div className="flex h-screen items-center justify-center bg-white"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
            {/* Sidebar (Dedicated for LeGeZt Admin) */}
            <LeGeZtAdminSidebar />

            {/* Content Area */}
            <div className={`flex-1 flex flex-col min-h-screen relative transition-all duration-300 ease-in-out ${isCollapsed ? 'ml-20' : 'ml-64'}`}>

                {/* Admin Header */}
                <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-30 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <span className="text-primary-500">LeGeZt</span> Tantra Admin
                    </h2>

                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <div className="text-sm font-semibold text-slate-900">{user.name}</div>
                            <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Super Admin</div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-primary-600/20 flex items-center justify-center text-primary-400 font-bold border border-primary-500/30">
                            {user.name?.[0].toUpperCase()}
                        </div>
                    </div>
                </header>

                {/* Main Page Content */}
                <main className="flex-1 p-8 overflow-x-hidden">
                    {children}
                </main>
            </div>
        </div>
    );
}
