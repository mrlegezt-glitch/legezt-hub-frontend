'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import {
    Home, X, LogOut, User, BookOpen, Headphones, Gift,
    Settings, HelpCircle, FileText, LayoutDashboard, ShieldCheck, Mail, History, FlaskConical, Film, Tv, PlayCircle
} from 'lucide-react';

export default function SideMenu() {
    const { isSideMenuOpen, closeSideMenu } = useUIStore();
    const { user, isAuthenticated, logout } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (isSideMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isSideMenuOpen]);

    const handleLogout = () => {
        logout();
        closeSideMenu();
        router.push('/login');
    };

    const menuGroups = [
        {
            title: 'Explore',
            items: [
                { icon: Home, label: 'Home', href: '/' },
                { icon: BookOpen, label: 'Subjects & Notes', href: '/subjects' },
                { icon: FlaskConical, label: 'Labs & Practicals', href: '/labs' },
                { icon: History, label: 'Backlogs & Archives', href: '/backlogs' },
                { icon: Headphones, label: 'Podcasts', href: '/podcasts' },
                { icon: FileText, label: 'Assignments & Tests', href: '/assessments' },
                { icon: Gift, label: 'Courses & Offers', href: '/offers' },
            ]
        },
        {
            title: 'Entertainment',
            items: [
                { icon: PlayCircle, label: 'Explore Media', href: '/explore' },
                { icon: Film, label: 'Movies', href: '/movies' },
                { icon: Tv, label: 'TV Series', href: '/series' },
            ]
        },
        {
            title: 'Account',
            items: [
                ...(isAuthenticated ? [{ icon: User, label: 'Profile', href: '/profile' }] : []),
                ...(isAuthenticated && user && user.role === 'SUPER_ADMIN' ? [{ icon: LayoutDashboard, label: 'Admin Console', href: '/admin' }] : []),
                ...(isAuthenticated ? [{ icon: Settings, label: 'Settings', href: '/profile/settings' }] : []),
            ]
        },
        {
            title: 'Support',
            items: [
                { icon: Mail, label: 'Contact Support', href: '/contact' },
                { icon: ShieldCheck, label: 'Privacy Policy', href: '/privacy' },
            ]
        }
    ];

    if (!isSideMenuOpen) return null;

    return (
        <div
            id="main-menu"
            className="fixed inset-0 z-[100] flex"
            role="dialog"
            aria-modal="true"
            aria-label="Main menu"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
                onClick={closeSideMenu}
                aria-hidden="true"
            />

            {/* Sidebar */}
            <div className="relative w-80 max-w-[85vw] h-full bg-dark-200 border-r border-dark-border shadow-2xl flex flex-col animate-slide-right">
                {/* Header */}
                <div className="p-6 border-b border-dark-border flex items-center justify-between bg-dark-300/30">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="LeGeZt" className="w-8 h-8 object-contain animate-heartbeat" />
                        <span className="text-xl font-bold gradient-text">LeGeZt Hub</span>
                    </div>
                    <button
                        onClick={closeSideMenu}
                        className="p-2 text-gray-400 hover:text-white hover:bg-dark-100 rounded-lg transition-colors"
                        aria-label="Close menu"
                    >
                        <X size={24} aria-hidden="true" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
                    {menuGroups.map((group, idx) => (
                        group.items.length > 0 && (
                            <div key={idx}>
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                                    {group.title}
                                </h3>
                                <div className="space-y-1">
                                    {group.items.map((item) => {
                                        const isActive = pathname === item.href;
                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                onClick={closeSideMenu}
                                                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${isActive
                                                    ? 'bg-primary-600/10 text-primary-400 border border-primary-500/20'
                                                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                                                    }`}
                                            >
                                                <item.icon size={18} className={isActive ? 'text-primary-400' : 'text-gray-400'} />
                                                {item.label}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        )
                    ))}

                    {/* Featured Animation */}
                    <div className="mt-4 px-2">
                        <div className="relative rounded-2xl overflow-hidden border border-primary-500/20 bg-gradient-to-br from-primary-500/10 to-purple-600/10">
                            <img
                                src="/sidebar-animation.gif"
                                alt="Features"
                                className="w-full h-auto object-cover opacity-90"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-dark-200/80 to-transparent flex items-end p-3">
                                <p className="text-xs text-gray-300 font-medium">✨ New Features Coming!</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-dark-border bg-dark-300/30">
                    {isAuthenticated ? (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <img
                                    src={user?.avatar || '/default-avatar.png'}
                                    alt={user?.name}
                                    className="w-10 h-10 rounded-full border border-dark-border object-cover"
                                />
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-white truncate max-w-[120px]">{user?.name}</span>
                                    <span className="text-[10px] text-gray-500 truncate max-w-[120px]">{user?.email}</span>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                title="Logout"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            onClick={closeSideMenu}
                            className="btn-primary w-full flex items-center justify-center gap-2"
                        >
                            Sign In
                        </Link>
                    )}
                </div>
            </div>

            <style jsx>{`
                @keyframes slideRight {
                    from { transform: translateX(-100%); }
                    to { transform: translateX(0); }
                }
                .animate-slide-right {
                    animation: slideRight 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
            `}</style>
        </div>
    );
}
