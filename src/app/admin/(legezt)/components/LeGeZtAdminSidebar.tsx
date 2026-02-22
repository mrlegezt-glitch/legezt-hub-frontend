'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, FolderOpen, BookOpen, Users, Activity, Settings, LogOut, ChevronLeft, ChevronRight, ArrowLeft, FileText } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';

export default function LeGeZtAdminSidebar() {
    const pathname = usePathname();
    const { isLeGeZtAdminSidebarCollapsed: isCollapsed, toggleLeGeZtAdminSidebar: toggle } = useUIStore();

    const menuItems = [
        { label: 'Dashboard', icon: LayoutDashboard, href: '/admin/legezttantra' },
        { label: 'Record Manager', icon: FolderOpen, href: '/admin/legezttantra/records' },
        { label: 'Manual Manager', icon: FileText, href: '/admin/legezttantra/manuals' },
        { label: 'Course Manager', icon: BookOpen, href: '/admin/legezttantra/courses' },
        { label: 'Users', icon: Users, href: '/admin/legezttantra/users' },
        { label: 'Settings', icon: Settings, href: '/admin/legezttantra/settings' },
    ];

    return (
        <motion.aside
            initial={false}
            animate={{
                width: isCollapsed ? 80 : 256,
                backgroundColor: isCollapsed ? 'rgba(15, 15, 15, 0.95)' : 'rgba(20, 20, 20, 0.9)'
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="backdrop-blur-xl border-r border-white/5 h-screen fixed left-0 top-0 z-40 flex flex-col shadow-[20px_0_50px_rgba(0,0,0,0.5)] overflow-hidden"
        >
            {/* Logo Area */}
            <div className="h-20 flex items-center px-6 border-b border-white/5 shrink-0 relative bg-black/20">
                <motion.div
                    animate={{ scale: isCollapsed ? 1.1 : 1 }}
                    className="flex items-center min-w-max"
                >
                    <img
                        src="/logo.png"
                        alt="LeGeZt Tantra"
                        className="h-10 w-10 object-contain animate-heartbeat shrink-0 drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                    />
                    {!isCollapsed && (
                        <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="ml-4 font-black text-white text-lg tracking-tighter whitespace-nowrap italic"
                        >
                            LeGeZt <span className="text-primary-500">Tantra</span>
                        </motion.span>
                    )}
                </motion.div>

                {/* Toggle Button */}
                <button
                    onClick={toggle}
                    className="absolute -right-3 top-1/2 -translate-y-1/2 w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center text-white shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:scale-110 active:scale-95 transition-transform z-50 border border-white/20 group"
                >
                    {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>
            </div>

            {/* Menu */}
            <nav className="flex-1 py-10 px-4 space-y-4 overflow-y-auto custom-scrollbar overflow-x-hidden">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-4 px-4 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 group relative
                                ${isActive
                                    ? 'bg-primary-600 text-white shadow-2xl shadow-primary-600/40'
                                    : 'text-gray-500 hover:bg-white/5 hover:text-white'
                                }
                            `}
                        >
                            {/* Active Indicator */}
                            {isActive && (
                                <motion.div
                                    layoutId="active-pill"
                                    className="absolute left-0 w-1 h-6 bg-white rounded-r-full"
                                />
                            )}

                            <item.icon size={22} className={`shrink-0 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-white' : 'text-gray-600 group-hover:text-primary-400'}`} />

                            {!isCollapsed && (
                                <motion.span
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="whitespace-nowrap"
                                >
                                    {item.label}
                                </motion.span>
                            )}

                            {isCollapsed && (
                                <div className="absolute left-full ml-6 px-4 py-2 bg-dark-100 border border-white/10 text-white text-[10px] rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-4 group-hover:translate-x-0 whitespace-nowrap z-50 font-black uppercase tracking-[0.2em] shadow-2xl backdrop-blur-md">
                                    {item.label}
                                </div>
                            )}
                        </Link>
                    )
                })}
            </nav>

            {/* Footer Actions */}
            <div className={`p-6 border-t border-white/5 bg-black/40 space-y-2 ${isCollapsed ? 'items-center' : ''}`}>
                <Link href="/admin/dashboard" className={`flex items-center gap-4 px-4 py-4 text-[10px] font-black uppercase tracking-widest text-primary-400 hover:text-white hover:bg-primary-500/10 rounded-2xl transition-all group relative overflow-hidden`}>
                    <ArrowLeft size={22} className="shrink-0 transition-transform group-hover:-translate-x-1" />
                    {!isCollapsed && (
                        <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="whitespace-nowrap"
                        >
                            Main Dashboard
                        </motion.span>
                    )}
                </Link>

                <Link href="/admin" className={`flex items-center gap-4 px-4 py-4 text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-2xl transition-all group relative overflow-hidden`}>
                    <LogOut size={22} className="shrink-0 transition-transform group-hover:rotate-12" />
                    {!isCollapsed && (
                        <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="whitespace-nowrap"
                        >
                            Log Out
                        </motion.span>
                    )}
                </Link>
            </div>
        </motion.aside>
    );
}
