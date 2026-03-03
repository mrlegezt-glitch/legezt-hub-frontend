'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, GraduationCap, Building2, FileText, Settings, LogOut, Megaphone, Podcast, BookOpen, FlaskConical, School, Mic, Layout, Activity, ShieldAlert, BadgeCheck, Calendar } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard', roles: ['ADMIN', 'SUPER_ADMIN'] },
    { icon: ShieldAlert, label: 'Admin Requests', href: '/admin/requests', roles: ['SUPER_ADMIN'] },
    { icon: School, label: 'Colleges & Branches', href: '/admin/colleges', roles: ['ADMIN', 'SUPER_ADMIN'] },
    { icon: FileText, label: 'PDF Management', href: '/admin/pdfs', roles: ['ADMIN', 'SUPER_ADMIN'] },
    { icon: Mic, label: 'LeGeZtCast', href: '/admin/podcasts', roles: ['ADMIN', 'SUPER_ADMIN'] },
    { icon: BookOpen, label: 'Courses', href: '/admin/courses', roles: ['ADMIN', 'SUPER_ADMIN'] },
    { icon: Users, label: 'User Monitoring', href: '/admin/users', roles: ['SUPER_ADMIN'] },
    { icon: Activity, label: 'Live Users', href: '/admin/live', roles: ['SUPER_ADMIN'] },
    { icon: FileText, label: 'Assignments & Tests', href: '/admin/assessments', roles: ['ADMIN', 'SUPER_ADMIN'] },
    { icon: Layout, label: 'Ads Configuration', href: '/admin/ads', roles: ['SUPER_ADMIN'] },
    { icon: Users, label: 'Faculty', href: '/admin/academic/faculty', roles: ['ADMIN', 'SUPER_ADMIN'] },
    { icon: Calendar, label: 'Schedule', href: '/admin/academic/schedule', roles: ['ADMIN', 'SUPER_ADMIN'] },
    { icon: FlaskConical, label: 'LeGeZt Tantra', href: '/admin/legezttantra', roles: ['ADMIN', 'SUPER_ADMIN'] },
];

interface AdminSidebarProps {
    isMobile?: boolean;
    onItemClick?: () => void;
}

export default function AdminSidebar({ isMobile, onItemClick }: AdminSidebarProps) {
    const pathname = usePathname();
    const { logout, user } = useAuthStore();

    return (
        <aside className={`${isMobile ? 'flex w-full' : 'hidden md:flex w-72'} bg-dark-android h-full flex-col z-20 border-r border-silver-dark/10 shadow-silver-glow`}>
            {/* Logo Area */}
            <div className="p-8 pb-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-dark-surface rounded-xl flex items-center justify-center shadow-android-card border border-silver-dark/20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-silver-gradient opacity-10" />
                    <img src="/logo.png" alt="Admin Logo" className="w-6 h-6 object-contain relative z-10" />
                </div>
                <span className="font-display font-bold text-lg tracking-tight text-white drop-shadow-md">Admin Console</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-4 space-y-2 py-4 scrollbar-hide">
                <div className="px-4 mb-3 text-[10px] font-bold text-silver-600 uppercase tracking-widest">
                    Main Menu
                </div>
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    // Filter based on role
                    if (user && item.roles && !item.roles.includes(user.role)) return null;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onItemClick}
                            className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all duration-300 group relative overflow-hidden ${isActive
                                ? 'bg-dark-surface text-white shadow-inner-metallic border border-silver-dark/20'
                                : 'text-silver-400 hover:text-white hover:bg-dark-surface hover:shadow-android-card border border-transparent hover:border-silver-dark/10'
                                }`}
                        >
                            {isActive && (
                                <div className="absolute inset-0 bg-silver-gradient opacity-5" />
                            )}
                            <item.icon
                                size={20}
                                className={`transition-all duration-300 relative z-10 ${isActive ? 'text-silver-light drop-shadow-md scale-110' : 'text-silver-500 group-hover:text-silver-300 group-hover:scale-110'}`}
                            />
                            <span className="relative z-10">{item.label}</span>
                        </Link>
                    );
                })}

                <div className="mt-8 px-4 mb-3 text-[10px] font-bold text-silver-600 uppercase tracking-widest">
                    System
                </div>
                <Link
                    href="/admin/settings"
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all duration-300 group relative overflow-hidden ${pathname === '/admin/settings'
                        ? 'bg-dark-surface text-white shadow-inner-metallic border border-silver-dark/20'
                        : 'text-silver-400 hover:text-white hover:bg-dark-surface hover:shadow-android-card border border-transparent hover:border-silver-dark/10'
                        }`}
                >
                    <Settings size={20} className="text-silver-500 group-hover:text-silver-300 relative z-10" />
                    <span className="relative z-10">Settings</span>
                </Link>
            </nav>

            {/* Footer / User Profile */}
            <div className="p-4 mx-4 mb-4 rounded-2xl bg-dark-surface border border-silver-dark/10 shadow-android-card relative overflow-hidden group">
                <div className="absolute inset-0 bg-silver-gradient opacity-0 group-hover:opacity-5 transition-opacity" />
                <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-3">
                        <img
                            src={useAuthStore.getState().user?.avatar || '/default-avatar.png'}
                            alt="Profile"
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-full object-cover border border-silver-dark/30 shadow-inner"
                        />
                        <div className="flex flex-col">
                            <div className="flex items-center gap-1">
                                <span className="text-sm font-semibold text-white">{user?.name || 'Admin'}</span>
                                {user?.badges?.includes('VERIFIED_ADMIN') && (
                                    <BadgeCheck className="w-4 h-4 text-silver-metallic" fill="currentColor" size={12} />
                                )}
                            </div>
                            <span className="text-[10px] text-silver-500 truncate max-w-[100px]">{user?.email}</span>
                        </div>
                    </div>
                    <button
                        onClick={() => logout()}
                        className="text-silver-500 hover:text-accent transition-colors p-2 hover:bg-dark-android rounded-full border border-transparent hover:border-silver-dark/20"
                        title="Logout"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </aside>
    );
}
