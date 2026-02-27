'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Search } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';

export default function MobileHeader() {
    const { openSideMenu, isSideMenuOpen } = useUIStore();
    const pathname = usePathname();

    // Hide on pages that have their own specialized headers (Admin, Subjects)
    if (pathname?.startsWith('/admin') || pathname?.startsWith('/subjects') || pathname?.startsWith('/pdfs/') || pathname?.startsWith('/labs/legezttantra')) return null;

    return (
        <header className="md:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 h-16 px-4 flex items-center justify-between animate-fade-in">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
                <img src="/logo.png" alt="LeGeZt" className="w-8 h-8 object-contain animate-heartbeat" />
                <span className="font-bold text-lg gradient-text">LeGeZt</span>
            </Link>

            {/* Actions */}
            <div className="flex items-center gap-3">
                {/* Menu Trigger */}
                <button
                    onClick={openSideMenu}
                    className="p-2 -mr-2 text-slate-600 hover:text-slate-900 active:scale-95 transition-transform"
                    aria-label="Open main menu"
                >
                    <Menu size={24} aria-hidden="true" />
                </button>
            </div>
        </header>
    );
}
