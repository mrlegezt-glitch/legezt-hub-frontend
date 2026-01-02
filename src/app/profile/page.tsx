'use client';

// ==================================
// Profile Page
// ==================================

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, LogOut, Settings, BookOpen, History, Heart, ChevronRight, School, Sun, Moon } from 'lucide-react';
import Link from 'next/link';
import BottomNav from '@/components/navigation/BottomNav';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/lib/api';
import { useThemeStore } from '@/stores/themeStore';

// Theme Toggle Component
function ThemeToggle() {
    const { theme, toggleTheme } = useThemeStore();

    return (
        <section className="px-5 pt-6 max-w-lg mx-auto">
            <div className="card p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {theme === 'dark' ? (
                            <Moon size={20} className="text-primary-400" />
                        ) : (
                            <Sun size={20} className="text-amber-500" />
                        )}
                        <div>
                            <p className="font-medium">Theme</p>
                            <p className="text-xs text-gray-500">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</p>
                        </div>
                    </div>
                    <button
                        onClick={toggleTheme}
                        className={`relative w-14 h-8 rounded-full transition-colors ${theme === 'light' ? 'bg-amber-500' : 'bg-dark-100'
                            }`}
                    >
                        <span
                            className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform ${theme === 'light' ? 'translate-x-7' : 'translate-x-1'
                                }`}
                        />
                    </button>
                </div>
            </div>
        </section>
    );
}


export default function ProfilePage() {
    const router = useRouter();
    const { user, isAuthenticated, refreshToken, logout, updateUser } = useAuthStore();

    // Refresh user data on mount to get latest academic info
    useEffect(() => {
        const refreshProfile = async () => {
            try {
                const res = await authApi.me();
                if (res.data.data) {
                    updateUser(res.data.data);
                }
            } catch (error) {
                console.error('Failed to refresh profile', error);
            }
        };

        if (isAuthenticated) {
            refreshProfile();
        }
    }, [isAuthenticated, updateUser]);

    const handleLogout = async () => {
        try {
            if (refreshToken) {
                await authApi.logout(refreshToken);
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            logout();
            router.push('/');
        }
    };

    if (!isAuthenticated || !user) {
        return (
            <main className="min-h-screen pb-24 flex flex-col items-center justify-center p-5">
                <div className="text-center">
                    <p className="text-gray-400 mb-4">Please login to view your profile</p>
                    <Link href="/login" className="btn-primary">
                        Login
                    </Link>
                </div>
                <BottomNav />
            </main>
        );
    }

    const menuItems = [
        { icon: BookOpen, label: 'My Courses', href: '/profile/courses' },
        { icon: History, label: 'Activity Feed', href: '/profile/activity' },
        { icon: Heart, label: 'Bookmarks', href: '/profile/bookmarks' },
        { icon: Settings, label: 'Settings', href: '/profile/settings' },
    ];


    return (
        <main className="min-h-screen pb-24">
            {/* Header */}
            <header className="sticky top-0 z-40 glass px-5 py-4">
                <div className="flex items-center gap-4 max-w-lg mx-auto">
                    <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-dark-100">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-lg font-semibold">Profile</h1>
                </div>
            </header>

            {/* Profile Card */}
            <section className="px-5 py-6 max-w-lg mx-auto">
                <div className="card p-6 flex items-center gap-4">
                    <img
                        src={user.avatar || '/default-avatar.png'}
                        alt={user.name}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-full border-2 border-primary-500"
                    />
                    <div>
                        <h2 className="text-lg font-semibold">{user.name}</h2>
                        <p className="text-sm text-gray-400">{user.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-primary-500/20 text-primary-400 rounded text-xs">
                            {user.role}
                        </span>
                        {user.collegeName && (
                            <div className="mt-2 text-xs text-gray-500 space-y-1">
                                <p className="flex items-center gap-1.5">
                                    <School size={12} className="text-primary-500" />
                                    {user.collegeName}
                                </p>
                                {(user.branchName || user.semesterName || user.yearName) && (
                                    <p className="flex items-center gap-1.5 pl-0.5">
                                        <BookOpen size={11} className="text-primary-500" />
                                        <span className="opacity-80">
                                            {[user.branchName, user.yearName, user.semesterName].filter(Boolean).join(' • ')}
                                        </span>
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Menu Items */}
            <section className="px-5 max-w-lg mx-auto">
                <div className="card divide-y divide-dark-border">
                    {menuItems.map(({ icon: Icon, label, href }) => (
                        <Link
                            key={href}
                            href={href}
                            className="flex items-center justify-between p-4 hover:bg-dark-200 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <Icon size={20} className="text-gray-400" />
                                <span>{label}</span>
                            </div>
                            <ChevronRight size={18} className="text-gray-400" />
                        </Link>
                    ))}
                </div>
            </section>

            {/* Logout Button */}
            <section className="px-5 pt-6 max-w-lg mx-auto">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors"
                >
                    <LogOut size={18} />
                    Logout
                </button>
            </section>

            {/* Theme Toggle */}
            <ThemeToggle />

            <BottomNav />
        </main>
    );
}
