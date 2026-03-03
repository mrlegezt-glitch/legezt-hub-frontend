import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';
import { Database, Trash2, RefreshCw, HardDrive, CheckCircle, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

interface StorageStat {
    name: string;
    totalSize: number;
    fileCount: number;
}

export default function StorageStats() {
    const [stats, setStats] = useState<StorageStat[]>([]);
    const [loading, setLoading] = useState(true);
    const [cleaning, setCleaning] = useState(false);
    const [clearingCache, setClearingCache] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const res = await adminApi.getStorageStats();
            setStats(res.data.data);
        } catch (error) {
            console.error('Failed to load storage stats', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleCleanup = async () => {
        if (!confirm('Are you sure? This will delete orphaned files from Azure Storage.')) return;

        try {
            setCleaning(true);
            setMessage(null);
            const res = await adminApi.cleanupStorage();
            // Format result for message
            const results = res.data.data;
            const details = Object.entries(results).map(([key, val]: any) =>
                `${key}: -${val.deleted} files`
            ).join(', ');

            setMessage({ type: 'success', text: `Cleanup Complete. ${details}` });
            fetchStats(); // Refresh stats
        } catch (error) {
            setMessage({ type: 'error', text: 'Cleanup failed' });
        } finally {
            setCleaning(false);
        }
    };

    const handleClearCache = async () => {
        try {
            setClearingCache(true);
            setMessage(null);
            await adminApi.clearCache();
            setMessage({ type: 'success', text: 'Server cache cleared successfully' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to clear cache' });
        } finally {
            setClearingCache(false);
        }
    };

    return (
        <div className="p-6 rounded-3xl bg-dark-surface shadow-android-card border border-silver-dark/10 relative overflow-hidden flex flex-col h-full">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-silver-metallic to-transparent opacity-30" />
            <h2 className="text-xl font-display font-bold text-white mb-6 flex items-center gap-2 drop-shadow-md relative z-10">
                <Database className="text-silver-400" size={24} />
                Storage & Maintenance
            </h2>

            {/* Stats List */}
            <div className="space-y-4 mb-8">
                {loading ? (
                    <div className="flex justify-center p-4">
                        <RefreshCw className="animate-spin text-silver-600" />
                    </div>
                ) : (
                    stats.map((stat) => (
                        <div key={stat.name} className="flex items-center justify-between p-3 flex-1">
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-dark-android border border-silver-dark/20 shadow-inner w-full group overflow-hidden relative">
                                <div className="absolute inset-0 bg-silver-gradient opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
                                <div className="flex items-center gap-3 relative z-10">
                                    <div className="p-2 bg-dark-surface rounded-xl shadow-android-card border border-silver-dark/10">
                                        <HardDrive size={18} className="text-silver-400 group-hover:text-silver-200 transition-colors" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-silver-200 capitalize tracking-wide">{stat.name}</p>
                                        <p className="text-xs text-silver-500 font-medium">{stat.fileCount} files</p>
                                    </div>
                                </div>
                                <span className="text-sm font-display font-bold text-silver-300 relative z-10 bg-dark-surface px-3 py-1.5 rounded-lg border border-silver-dark/20 shadow-inner">
                                    {formatBytes(stat.totalSize)}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Actions */}
            <div className="space-y-3 relative z-10 mt-auto">
                <button
                    onClick={handleCleanup}
                    disabled={cleaning || loading}
                    className="w-full bg-dark-android hover:bg-silver-dark/10 text-silver-300 text-sm p-4 rounded-2xl border border-silver-dark/20 shadow-inner flex items-center justify-between group disabled:opacity-50 transition-all font-semibold overflow-hidden relative"
                >
                    <span className="flex items-center gap-2 relative z-10 group-hover:text-white transition-colors">
                        <Trash2 size={18} className={`group-hover:text-red-400 transition-colors ${cleaning ? 'animate-bounce text-red-400' : ''}`} />
                        Cleanup Orphans
                    </span>
                    {cleaning && <span className="text-xs text-silver-400 relative z-10">Processing...</span>}
                </button>

                <button
                    onClick={handleClearCache}
                    disabled={clearingCache}
                    className="w-full bg-dark-android hover:bg-silver-dark/10 text-silver-300 text-sm p-4 rounded-2xl border border-silver-dark/20 shadow-inner flex items-center justify-between group disabled:opacity-50 transition-all font-semibold overflow-hidden relative"
                >
                    <span className="flex items-center gap-2 relative z-10 group-hover:text-white transition-colors">
                        <RefreshCw size={18} className={`group-hover:text-blue-400 transition-colors ${clearingCache ? 'animate-spin text-blue-400' : ''}`} />
                        Clear Server Cache
                    </span>
                </button>
            </div>

            {/* Status Message */}
            {message && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-4 p-3 rounded-lg text-sm flex items-start gap-2 ${message.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                        }`}
                >
                    {message.type === 'success' ? <CheckCircle size={16} className="mt-0.5" /> : <AlertTriangle size={16} className="mt-0.5" />}
                    <p>{message.text}</p>
                </motion.div>
            )}
        </div>
    );
}
