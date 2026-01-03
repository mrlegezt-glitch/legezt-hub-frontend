'use client';

import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BarChart3, Users, FileText, Database, Loader2, Sparkles, TrendingUp } from 'lucide-react';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';

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
        <div className="p-8 max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
                    <p className="text-gray-400">Welcome back, {user.name}</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-gray-500 bg-dark-200 px-3 py-1 rounded-full border border-dark-border">
                        v1.2.0-beta
                    </span>
                    <button className="btn-primary text-sm px-4 py-2 flex items-center gap-2">
                        <Sparkles size={16} />
                        What's New
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                    { label: 'Total Users', value: stats?.users || 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                    { label: 'Total PDFs', value: stats?.pdfs || 0, icon: FileText, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                    { label: 'Total Downloads', value: stats?.downloads || 0, icon: BarChart3, color: 'text-green-400', bg: 'bg-green-500/10' },
                    { label: 'Colleges', value: stats?.colleges || 0, icon: Database, color: 'text-orange-400', bg: 'bg-orange-500/10' },
                ].map((stat, i) => (
                    <div key={i} className="card p-6 border-white/10 bg-dark-200/40 backdrop-blur-md hover:border-primary-500/30 transition-all duration-300 hover:-translate-y-1">
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-lg ${stat.bg}`}>
                                {loading ? (
                                    <Loader2 className={`animate-spin ${stat.color}`} size={24} />
                                ) : (
                                    <stat.icon size={24} className={stat.color} />
                                )}
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-1">
                            {loading ? '...' : stat.value}
                        </h3>
                        <p className="text-sm text-gray-400">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Advanced Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 card p-6 border-white/10 bg-dark-200/40 backdrop-blur-md min-h-[400px] flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-bold text-white">Top Viewed PDFs</h2>
                            <p className="text-sm text-gray-500">Highest performing content</p>
                        </div>
                        <div className="flex items-center gap-2 text-primary-400 text-sm font-medium bg-primary-400/10 px-3 py-1 rounded-full">
                            <TrendingUp size={14} />
                            Trending Content
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
                                        <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-dark-100 border border-dark-border px-3 py-1 rounded text-xs text-white whitespace-nowrap z-10 pointer-events-none">
                                            {pdf.viewCount} Views
                                        </div>

                                        <div className="w-full relative bg-dark-200 rounded-t-lg overflow-hidden h-48 flex items-end justify-center">
                                            {/* Bar */}
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: `${Math.max(height, 5)}%` }} // Min 5% height
                                                transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                                                className="w-full bg-gradient-to-t from-red-600 to-red-400 group-hover:from-red-500 group-hover:to-red-300 transition-all cursor-pointer rounded-t-lg mx-1"
                                            />
                                        </div>
                                        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter truncate max-w-[60px] md:max-w-[100px]" title={pdf.title}>
                                            {pdf.title}
                                        </span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                <div className="card p-6 border-white/10 bg-dark-200/40 backdrop-blur-md h-fit">
                    <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
                    <div className="space-y-3">
                        <button onClick={() => router.push('/admin/colleges')} className="w-full p-4 text-left hover:bg-white/5 rounded-xl transition-all border border-dark-border flex items-center justify-between group">
                            <span className="text-gray-300 font-medium">Add New College</span>
                            <span className="w-8 h-8 rounded-full bg-dark-100 flex items-center justify-center text-gray-500 group-hover:text-white group-hover:bg-primary-600 transition-all">+</span>
                        </button>
                        <button onClick={() => router.push('/admin/pdfs')} className="w-full p-4 text-left hover:bg-white/5 rounded-xl transition-all border border-dark-border flex items-center justify-between group">
                            <span className="text-gray-300 font-medium">Upload Bulk PDFs</span>
                            <span className="w-8 h-8 rounded-full bg-dark-100 flex items-center justify-center text-gray-500 group-hover:text-white group-hover:bg-primary-600 transition-all">↑</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
