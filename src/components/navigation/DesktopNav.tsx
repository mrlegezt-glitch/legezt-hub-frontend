'use client';

// ==================================
// Desktop Navigation Component - Premium Redesign
// ==================================

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, FileText, Headphones, Gift, User, Sparkles, LogOut, BookOpen, Menu, FlaskConical, Calendar, PlayCircle, Bell } from 'lucide-react';
import { clsx } from 'clsx';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import GlobalSearch from './GlobalSearch';
import NotificationPanel from '@/components/common/NotificationPanel';
import { useState, useEffect } from 'react';


const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/syllabus', icon: Calendar, label: 'Syllabus' },
    { href: '/subjects', icon: BookOpen, label: 'Subjects' },
    { href: '/labs', icon: FlaskConical, label: 'Labs' },
    { href: '/explore', icon: PlayCircle, label: 'Watch' },
    { href: '/podcasts', icon: Headphones, label: 'Podcast' },
    { href: '/offers', icon: Gift, label: 'Courses' },
];

export default function DesktopNav() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, isAuthenticated, logout } = useAuthStore();
    const { openSideMenu } = useUIStore();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    if (pathname?.startsWith('/admin') || pathname?.startsWith('/pdfs/') || pathname?.startsWith('/labs/legezttantra')) return null;

    return (
        <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className={clsx(
                'hidden md:flex fixed top-0 left-0 right-0 z-50 w-full items-center justify-between px-6 lg:px-10 transition-all duration-300',
                scrolled
                    ? 'py-2 bg-white/95 backdrop-blur-xl border-b border-slate-200/80 shadow-sm shadow-slate-900/5'
                    : 'py-4 bg-white/80 backdrop-blur-md border-b border-transparent'
            )}
            role="banner"
        >
            {/* Logo Section */}
            <Link href="/" className="flex items-center gap-3 group shrink-0" aria-label="LeGeZt home">
                <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-purple-600 rounded-full opacity-0 group-hover:opacity-40 blur transition-opacity duration-500" aria-hidden="true"></div>
                    <img src="/logo.png" alt="" className="relative w-9 h-9 object-contain animate-levitate" aria-hidden="true" />
                </div>
                <span className="text-lg font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-primary-700 to-slate-700">LeGeZt</span>
            </Link>

            {/* Navigation Links - Center */}
            <nav className="hidden lg:flex items-center gap-0.5" role="navigation" aria-label="Primary navigation">
                {navItems.map(({ href, icon: Icon, label }) => {
                    const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));

                    return (
                        <Link
                            key={href}
                            href={href}
                            className={clsx(
                                'relative flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
                                isActive
                                    ? 'text-primary-600'
                                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                            )}
                            aria-current={isActive ? 'page' : undefined}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="desktop-nav-pill"
                                    className="absolute inset-0 bg-primary-50 border border-primary-100 rounded-full"
                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                />
                            )}
                            <Icon size={16} strokeWidth={isActive ? 2.5 : 2} className="relative z-10 shrink-0" aria-hidden="true" />
                            <span className="relative z-10">{label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2 shrink-0">
                {/* God Mode Badge */}
                {user?.email === 'mrlegezt@gmail.com' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full"
                        role="status"
                    >
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" aria-hidden="true"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">God Mode</span>
                    </motion.div>
                )}

                {/* Search */}
                <GlobalSearch />

                {/* Notifications */}
                {isAuthenticated && <NotificationPanel />}

                {isAuthenticated && user ? (
                    <>
                        {/* God Mode Quick Actions */}
                        {user?.email === 'mrlegezt@gmail.com' && (
                            <div className="hidden lg:flex items-center bg-slate-100 rounded-full px-1 py-1 gap-0.5 border border-slate-200" role="group" aria-label="Admin quick actions">
                                <Link href="/admin/users" className="p-1.5 rounded-full text-slate-500 hover:text-primary-500 hover:bg-white transition-all" aria-label="Users">
                                    <User size={15} />
                                </Link>
                                <Link href="/admin/pdfs" className="p-1.5 rounded-full text-slate-500 hover:text-primary-500 hover:bg-white transition-all" aria-label="PDFs">
                                    <FileText size={15} />
                                </Link>
                                <Link href="/admin/dashboard" className="p-1.5 rounded-full text-slate-500 hover:text-amber-500 hover:bg-white transition-all" aria-label="Dashboard">
                                    <Sparkles size={15} />
                                </Link>
                            </div>
                        )}

                        <div className="h-6 w-px bg-slate-200 mx-1 hidden lg:block" role="separator" aria-hidden="true"></div>

                        {/* Admin Link for regular admins */}
                        {(user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') && user.email !== 'mrlegezt@gmail.com' && (
                            <Link href="/admin" className="p-2 text-amber-500 hover:text-amber-400 hover:bg-amber-50 rounded-full transition-all" aria-label="Admin settings">
                                <Sparkles size={18} />
                            </Link>
                        )}

                        {/* Profile Avatar */}
                        <Link href="/profile" className="relative group" aria-label={`View profile: ${user.name}`}>
                            <div className={`absolute -inset-0.5 bg-gradient-to-br ${user?.email === 'mrlegezt@gmail.com' ? 'from-amber-400 to-orange-500' : 'from-primary-500 to-purple-600'} rounded-full opacity-0 group-hover:opacity-100 transition-opacity blur-sm`} aria-hidden="true"></div>
                            <img
                                src={user.avatar || '/default-avatar.png'}
                                alt={`${user.name}'s avatar`}
                                referrerPolicy="no-referrer"
                                className={`relative w-9 h-9 rounded-full border-2 ${user?.email === 'mrlegezt@gmail.com' ? 'border-amber-400/60' : 'border-slate-200'} object-cover shadow-md`}
                            />
                        </Link>

                        {/* Logout */}
                        <button
                            onClick={handleLogout}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                            aria-label="Logout"
                        >
                            <LogOut size={18} />
                        </button>
                    </>
                ) : (
                    <Link
                        href="/login"
                        className="btn-primary py-2 px-5 rounded-full text-sm font-semibold hover:shadow-lg hover:shadow-primary-500/20 transition-all"
                        aria-label="Login to your account"
                    >
                        Login
                    </Link>
                )}

                {/* Side Menu Trigger (mobile/md fallback) */}
                <button
                    onClick={openSideMenu}
                    className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all active:scale-95 lg:hidden"
                    aria-label="Open side menu"
                >
                    <Menu size={22} />
                </button>
            </div>
        </motion.header>
    );
}
