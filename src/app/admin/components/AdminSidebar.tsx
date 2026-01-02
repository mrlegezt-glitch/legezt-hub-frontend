'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, GraduationCap, Building2, FileText, Settings, LogOut, Megaphone, Podcast, BookOpen, FlaskConical, School, Mic, Layout } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
    { icon: School, label: 'Colleges & Branches', href: '/admin/colleges' },
    { icon: FileText, label: 'PDF Management', href: '/admin/pdfs' },
    { icon: Mic, label: 'LeGeZtCast', href: '/admin/podcasts' },
    { icon: BookOpen, label: 'Courses', href: '/admin/courses' },
    { icon: Users, label: 'User Monitoring', href: '/admin/users' },
    { icon: FileText, label: 'Assignments & Tests', href: '/admin/assessments' },
    { icon: Layout, label: 'Ads Configuration', href: '/admin/ads' },
];


interface AdminSidebarProps {
    isMobile?: boolean;
    onItemClick?: () => void;
}

export default function AdminSidebar({ isMobile, onItemClick }: AdminSidebarProps) {
    const pathname = usePathname();
    const { logout } = useAuthStore();

    return (
        <aside className={`${isMobile ? 'flex' : 'hidden md:flex'} w-64 bg-dark-200 border-r border-dark-border h-full flex flex-col`}>
            {/* Logo Area */}
            <div className="p-6 border-b border-dark-border flex items-center gap-3">
                <img src="/logo.png" alt="Admin Logo" className="w-8 h-8 object-contain animate-heartbeat" />
                <span className="font-bold text-lg tracking-tight">Admin Console</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                <div className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Main Menu
                </div>
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onItemClick}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${isActive
                                ? 'bg-primary-600/10 text-primary-400'
                                : 'text-gray-400 hover:text-white hover:bg-dark-100'
                                }`}
                        >
                            <item.icon
                                size={18}
                                className={`transition-colors ${isActive ? 'text-primary-400' : 'text-gray-500 group-hover:text-white'}`}
                            />
                            {item.label}
                        </Link>
                    );
                })}

                <div className="mt-8 px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    System
                </div>
                <Link
                    href="/admin/settings"
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${pathname === '/admin/settings'
                        ? 'bg-primary-600/10 text-primary-400'
                        : 'text-gray-400 hover:text-white hover:bg-dark-100'
                        }`}
                >
                    <Settings size={18} className="text-gray-500 group-hover:text-white" />
                    Settings
                </Link>
            </nav>

            {/* Footer / User Profile */}
            <div className="p-4 border-t border-dark-border bg-dark-200/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img
                            src={useAuthStore.getState().user?.avatar || '/default-avatar.png'}
                            alt="Profile"
                            referrerPolicy="no-referrer"
                            className="w-8 h-8 rounded-full border border-dark-border object-cover"
                        />
                        <div className="flex flex-col">
                            <span className="text-xs font-medium text-white">{useAuthStore.getState().user?.name || 'Admin'}</span>
                            <span className="text-[10px] text-gray-500 truncate max-w-[100px]">{useAuthStore.getState().user?.email}</span>
                        </div>
                    </div>
                    <button
                        onClick={() => logout()}
                        className="text-gray-500 hover:text-red-400 transition-colors p-1.5 hover:bg-red-500/10 rounded-md"
                        title="Logout"
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            </div>
        </aside>
    );
}
