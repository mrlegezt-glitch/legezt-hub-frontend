'use client';

import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BarChart3, Users, FileText, Database, Loader2, Sparkles, TrendingUp } from 'lucide-react';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';
import StorageStats from '@/components/admin/StorageStats';

export default function AdminDashboardPage() {
    const { user, isAuthenticated } = useAuthStore();
    const router = useRouter();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Double check auth, although layout handles it too
        if (!isAuthenticated || user?.role !== 'SUPER_ADMIN') {
            router.push('/');
            return;
        }

        const fetchStats = async () => {
            try {
                const res = await api.get('/admin/stats');
                setStats(res.data.data);
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [isAuthenticated, user, router]);

    if (!user) return null;

    return (
        <div className="p-8 max-w-7xl mx-auto animate-page-enter">
            {/* Page Header */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-display font-bold text-white mb-2 drop-shadow-md">Dashboard Overview</h1>
                    <p className="text-silver-400">Welcome back, {user.name}</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-silver-500 bg-dark-surface px-3 py-1 rounded-full border border-silver-dark/20 shadow-inner">
                        v1.2.0-beta
                    </span>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-silver-gradient text-dark-android font-bold rounded-xl text-sm px-4 py-2 flex items-center gap-2 shadow-3d hover:shadow-3d-hover border border-silver-light transition-all">
                        <Sparkles size={16} />
                        What&apos;s New
                    </motion.button>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                    { label: 'Total Users', value: stats?.users || 0, icon: Users, color: 'text-silver-100', bg: 'bg-silver-metallic/20', border: 'border-silver-metallic/30' },
                    { label: 'Total PDFs', value: stats?.pdfs || 0, icon: FileText, color: 'text-silver-100', bg: 'bg-silver-metallic/20', border: 'border-silver-metallic/30' },
                    { label: 'Total Downloads', value: stats?.downloads || 0, icon: BarChart3, color: 'text-silver-100', bg: 'bg-silver-metallic/20', border: 'border-silver-metallic/30' },
                    { label: 'Colleges', value: stats?.colleges || 0, icon: Database, color: 'text-silver-100', bg: 'bg-silver-metallic/20', border: 'border-silver-metallic/30' },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: 0.1 + i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        whileHover={{ y: -6, transition: { duration: 0.2 } }}
                        className="p-6 rounded-3xl bg-dark-surface shadow-android-card border border-silver-dark/10 relative overflow-hidden group">

                        {/* 3D Glossy Wrapper */}
                        <div className="absolute inset-0 bg-silver-gradient opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-silver-metallic to-transparent opacity-30" />

                        <div className="flex items-start justify-between mb-4 relative z-10">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.3 + i * 0.1, type: 'spring', stiffness: 300, damping: 15 }}
                                className={`p-4 rounded-2xl ${stat.bg} border ${stat.border} shadow-inner-metallic`}>
                                {loading ? (
                                    <Loader2 className={`animate-spin ${stat.color}`} size={24} />
                                ) : (
                                    <stat.icon size={24} className={stat.color} />
                                )}
                            </motion.div>
                        </div>
                        <motion.h3
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 + i * 0.1, duration: 0.4 }}
                            className="text-3xl font-display font-bold text-white mb-1 relative z-10 drop-shadow-md">
                            {loading ? '...' : stat.value}
                        </motion.h3>
                        <p className="text-sm text-silver-500 font-medium relative z-10">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Advanced Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 p-6 rounded-3xl bg-dark-surface shadow-android-card border border-silver-dark/10 relative overflow-hidden min-h-[400px] flex flex-col">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-silver-metallic to-transparent opacity-30" />
                    <div className="flex items-center justify-between mb-8 relative z-10">
                        <div>
                            <h2 className="text-xl font-display font-bold text-white drop-shadow-md">Top Viewed PDFs</h2>
                            <p className="text-sm text-silver-500">Highest performing content</p>
                        </div>
                        <div className="flex items-center gap-2 text-silver-200 text-sm font-medium bg-silver-dark/20 px-4 py-2 rounded-full border border-silver-dark/40 shadow-inner-metallic">
                            <TrendingUp size={16} />
                            Trending
                        </div>
                    </div>

                    <div className="flex-1 flex items-end justify-between gap-4 px-2 pb-4">
                        {(!stats?.topPdfs || stats.topPdfs.length === 0) ? (
                            <div className="w-full text-center text-gray-500">No data available</div>
                        ) : (
                            stats.topPdfs.map((pdf: any, i: number) => {
                                // Calculate normalized height (max 100%)
                                const maxViews = Math.max(...stats.topPdfs.map((p: any) => p.viewCount), 1);
                                const height = (pdf.viewCount / maxViews) * 100;

                                return (
                                    <div key={pdf.id} className="flex-1 flex flex-col items-center gap-3 group relative">
                                        {/* Tooltip */}
                                        <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-dark-android border border-silver-dark/30 px-3 py-1 rounded-lg text-xs font-bold text-white whitespace-nowrap z-10 pointer-events-none shadow-3d">
                                            {pdf.viewCount} Views
                                        </div>

                                        <div className="w-full relative bg-dark-android border border-silver-dark/5 rounded-t-2xl overflow-hidden h-48 flex items-end justify-center shadow-inner-metallic">
                                            {/* Bar */}
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: `${Math.max(height, 5)}%` }} // Min 5% height
                                                transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                                                className="w-full bg-silver-inverse opacity-80 group-hover:opacity-100 group-hover:shadow-silver-glow transition-all cursor-pointer rounded-t-lg mx-1.5"
                                            />
                                        </div>
                                        <span className="text-[10px] text-silver-400 font-medium uppercase tracking-tighter truncate w-full text-center px-1" title={pdf.title}>
                                            {pdf.title}
                                        </span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="flex flex-col gap-6 h-fit">
                    <div className="p-6 rounded-3xl bg-dark-surface shadow-android-card border border-silver-dark/10 relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-silver-metallic to-transparent opacity-30" />
                        <h2 className="text-xl font-display font-bold text-white mb-6 drop-shadow-md">Quick Actions</h2>
                        <div className="space-y-3 relative z-10">
                            <motion.button
                                whileHover={{ x: 4 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => router.push('/admin/colleges')} className="w-full p-4 text-left bg-dark-android hover:bg-silver-dark/10 rounded-2xl transition-all border border-silver-dark/20 shadow-inner flex items-center justify-between group overflow-hidden relative">
                                <span className="text-silver-300 font-medium group-hover:text-white relative z-10">Add New College</span>
                                <span className="w-8 h-8 rounded-full bg-dark-surface shadow-3d flex items-center justify-center text-silver-500 group-hover:text-dark-android group-hover:bg-silver-metallic transition-all relative z-10">+</span>
                            </motion.button>
                            <motion.button
                                whileHover={{ x: 4 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => router.push('/admin/pdfs')} className="w-full p-4 text-left bg-dark-android hover:bg-silver-dark/10 rounded-2xl transition-all border border-silver-dark/20 shadow-inner flex items-center justify-between group overflow-hidden relative">
                                <span className="text-silver-300 font-medium group-hover:text-white relative z-10">Upload Bulk PDFs</span>
                                <span className="w-8 h-8 rounded-full bg-dark-surface shadow-3d flex items-center justify-center text-silver-500 group-hover:text-dark-android group-hover:bg-silver-metallic transition-all relative z-10">↑</span>
                            </motion.button>
                        </div>
                    </div>

                    <StorageStats />
                </motion.div>
            </div>
        </div>
    );
}
