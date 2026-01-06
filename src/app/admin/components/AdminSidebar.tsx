'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, GraduationCap, Building2, FileText, Settings, LogOut, Megaphone, Podcast, BookOpen, FlaskConical, School, Mic, Layout, Activity } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
    { icon: School, label: 'Colleges & Branches', href: '/admin/colleges' },
    { icon: FileText, label: 'PDF Management', href: '/admin/pdfs' },
    { icon: Mic, label: 'LeGeZtCast', href: '/admin/podcasts' },
    { icon: BookOpen, label: 'Courses', href: '/admin/courses' },
    { icon: Users, label: 'User Monitoring', href: '/admin/users' },
    { icon: Activity, label: 'Live Users', href: '/admin/live' },
    { icon: FileText, label: 'Assignments & Tests', href: '/admin/assessments' },
    { icon: Layout, label: 'Ads Configuration', href: '/admin/ads' },
    { icon: FlaskConical, label: 'LeGeZt Tantra', href: '/admin/legezttantra' },
];


interface AdminSidebarProps {
    isMobile?: boolean;
    onItemClick?: () => void;
}

export default function AdminSidebar({ isMobile, onItemClick }: AdminSidebarProps) {
    const pathname = usePathname();
    const { logout } = useAuthStore();

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
                            <span className="text-sm font-semibold text-white">{useAuthStore.getState().user?.name || 'Admin'}</span>
                            <span className="text-[10px] text-gray-500 truncate max-w-[100px]">{useAuthStore.getState().user?.email}</span>
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
