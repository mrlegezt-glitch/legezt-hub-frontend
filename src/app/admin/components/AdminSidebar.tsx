'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, GraduationCap, Building2, FileText, Settings, LogOut, Megaphone, Podcast, BookOpen, FlaskConical, School, Mic, Layout, Activity, ShieldAlert, BadgeCheck } from 'lucide-react';
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
        <aside className={`${isMobile ? 'flex w-full' : 'hidden md:flex w-72'} bg-dark-card border-r border-dark-border/50 h-full flex-col z-20`}>
            {/* Logo Area */}
            <div className="p-8 pb-4 flex items-center gap-3">
                <img src="/logo.png" alt="Admin Logo" className="w-8 h-8 object-contain" />
                <span className="font-bold text-lg tracking-tight text-white">Admin Console</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-4 space-y-1.5 py-4">
                <div className="px-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
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
                            className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all duration-200 group ${isActive
                                ? 'bg-primary/10 text-primary'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <item.icon
                                size={20}
                                className={`transition-colors ${isActive ? 'text-primary' : 'text-gray-500 group-hover:text-white'}`}
                            />
                            {item.label}
                        </Link>
                    );
                })}

                <div className="mt-8 px-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    System
                </div>
                <Link
                    href="/admin/settings"
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all duration-200 group ${pathname === '/admin/settings'
                        ? 'bg-primary/10 text-primary'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                >
                    <Settings size={20} className="text-gray-500 group-hover:text-white" />
                    Settings
                </Link>
            </nav>

            {/* Footer / User Profile */}
            <div className="p-4 mx-4 mb-4 rounded-2xl bg-dark-bg border border-dark-border/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img
                            src={useAuthStore.getState().user?.avatar || '/default-avatar.png'}
                            alt="Profile"
                            referrerPolicy="no-referrer"
                            className="w-9 h-9 rounded-full object-cover"
                        />
                        <div className="flex flex-col">
                            <div className="flex items-center gap-1">
                                <span className="text-sm font-semibold text-white">{user?.name || 'Admin'}</span>
                                {user?.badges?.includes('VERIFIED_ADMIN') && (
                                    <BadgeCheck className="w-4 h-4 text-blue-400" fill="currentColor" size={12} />
                                )}
                            </div>
                            <span className="text-[10px] text-gray-500 truncate max-w-[100px]">{user?.email}</span>
                        </div>
                    </div>
                    <button
                        onClick={() => logout()}
                        className="text-gray-400 hover:text-accent transition-colors p-2 hover:bg-white/5 rounded-full"
                        title="Logout"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </aside>
    );
}
