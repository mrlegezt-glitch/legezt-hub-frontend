'use client';

// ==================================
// Desktop Navigation Component
// ==================================

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, FileText, Headphones, Gift, User, Sparkles, LogOut, BookOpen, Menu, FlaskConical, Calendar } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import GlobalSearch from './GlobalSearch';
import NotificationPanel from '@/components/common/NotificationPanel';


const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/syllabus', icon: Calendar, label: 'Syllabus' },
    { href: '/subjects', icon: BookOpen, label: 'Subjects' },
    { href: '/labs', icon: FlaskConical, label: 'Labs' },
    { href: '/podcasts', icon: Headphones, label: 'LeGeZtCast' },
    { href: '/offers', icon: Gift, label: 'Courses' },
];

export default function DesktopNav() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, isAuthenticated, logout } = useAuthStore();
    const { openSideMenu } = useUIStore();

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    if (pathname?.startsWith('/admin') || pathname?.startsWith('/pdfs/') || pathname?.startsWith('/labs/legezttantra')) return null;

    return (
        <header className="hidden md:flex fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl items-center justify-between rounded-2xl border border-white/10 bg-dark-200/60 px-6 py-3 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:bg-dark-200/80" role="banner">
            {/* Logo Section */}
            <Link href="/" className="flex items-center gap-3 group shrink-0" aria-label="LeGeZt home">
                <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-purple-600 rounded-full opacity-0 group-hover:opacity-50 blur transition-opacity duration-500" aria-hidden="true"></div>
                    <img src="/logo.png" alt="" className="relative w-10 h-10 object-contain animate-heartbeat" aria-hidden="true" />
                </div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 group-hover:from-white group-hover:to-white transition-all">LeGeZt</span>
            </Link>

            {/* Navigation Links - Centered relative to the flex container */}
            <nav className="hidden xl:flex items-center gap-1 bg-white/5 p-1.5 rounded-full border border-white/5" role="navigation" aria-label="Primary navigation">
                {navItems.map(({ href, icon: Icon, label }) => {
                    const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));

                    return (
                        <Link
                            key={href}
                            href={href}
                            className={clsx(
                                'flex items-center gap-2 px-5 py-2 rounded-full transition-all duration-300 relative overflow-hidden group',
                                isActive
                                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25'
                                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                            )}
                            aria-label={label}
                            aria-current={isActive ? 'page' : undefined}
                        >
                            <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className={clsx("transition-transform duration-300", isActive ? "scale-110" : "group-hover:scale-110")} aria-hidden="true" />
                            <span className="font-medium text-sm">{label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-3 shrink-0">
                {/* God Mode Badge */}
                {user?.email === 'mrlegezt@gmail.com' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="hidden lg:flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full"
                        role="status"
                        aria-label="System administrator mode active"
                    >
                        <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse shadow-[0_0_8px_rgba(234,179,8,0.8)]" aria-hidden="true"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-yellow-500">God Mode</span>
                    </motion.div>
                )}

                {/* Search */}
                <div className="bg-white/5 rounded-full p-1 border border-white/5 hover:border-white/20 transition-colors">
                    <GlobalSearch />
                </div>

                {/* Notifications */}
                {isAuthenticated && <NotificationPanel />}

                {isAuthenticated && user ? (
                    <>
                        {/* God Mode Quick Actions */}
                        {user?.email === 'mrlegezt@gmail.com' && (
                            <div className="hidden lg:flex items-center gap-1 mr-2 px-1 py-1 bg-white/5 rounded-full border border-white/5" role="group" aria-label="Quick admin actions">
                                <Link
                                    href="/admin/users"
                                    className="p-1.5 text-gray-400 hover:text-primary-400 transition-colors"
                                    aria-label="Manage users"
                                >
                                    <User size={16} aria-hidden="true" />
                                </Link>
                                <Link
                                    href="/admin/pdfs"
                                    className="p-1.5 text-gray-400 hover:text-primary-400 transition-colors"
                                    aria-label="Manage PDFs"
                                >
                                    <FileText size={16} aria-hidden="true" />
                                </Link>
                                <Link
                                    href="/admin/dashboard"
                                    className="p-1.5 text-gray-400 hover:text-primary-400 transition-colors"
                                    aria-label="Open system center"
                                >
                                    <Sparkles size={16} aria-hidden="true" />
                                </Link>
                            </div>
                        )}

                        <div className="h-8 w-px bg-white/10 mx-1 hidden lg:block" role="separator" aria-hidden="true"></div>

                        {/* User Info */}
                        <div className="text-right hidden 2xl:block mr-2">
                            <p className="text-xs font-bold text-white leading-tight">{user.name}</p>
                            <p className="text-[10px] text-gray-400 truncate max-w-[100px] leading-tight mt-0.5">{user.email}</p>
                        </div>

                        {/* Admin Link */}
                        {(user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') && user.email !== 'mrlegezt@gmail.com' && (
                            <Link
                                href="/admin"
                                className="p-2 text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-full transition-all"
                                aria-label="Admin settings"
                            >
                                <Sparkles size={20} aria-hidden="true" />
                            </Link>
                        )}

                        {/* Profile Link */}
                        <Link href="/profile" className="relative group" aria-label={`View profile: ${user.name}`}>
                            <div className={`absolute -inset-0.5 bg-gradient-to-br ${user?.email === 'mrlegezt@gmail.com' ? 'from-yellow-500 to-orange-600' : 'from-primary-500 to-purple-600'} rounded-full opacity-0 group-hover:opacity-100 transition-opacity blur-sm`} aria-hidden="true"></div>
                            <img
                                src={user.avatar || '/default-avatar.png'}
                                alt={`${user.name}'s avatar`}
                                referrerPolicy="no-referrer"
                                className={`relative w-10 h-10 rounded-full border-2 ${user?.email === 'mrlegezt@gmail.com' ? 'border-yellow-500/50' : 'border-dark-100'} object-cover shadow-lg`}
                            />
                        </Link>

                        {/* Logout */}
                        <button
                            onClick={handleLogout}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-all ml-1"
                            aria-label="Logout from your account"
                        >
                            <LogOut size={20} aria-hidden="true" />
                        </button>
                    </>
                ) : (
                    <Link
                        href="/login"
                        className="btn-primary py-2 px-6 rounded-full text-sm hover:shadow-lg hover:shadow-primary-500/20"
                        aria-label="Login to your account"
                    >
                        Login
                    </Link>
                )}

                {/* Side Menu Trigger */}
                <button
                    onClick={openSideMenu}
                    className="p-2.5 ml-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all active:scale-95"
                    aria-label="Open side menu"
                >
                    <Menu size={24} aria-hidden="true" />
                </button>
            </div>
        </header>
    );
}
