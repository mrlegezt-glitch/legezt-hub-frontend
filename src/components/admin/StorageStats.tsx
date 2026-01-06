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
        <div className="card">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Database className="text-primary" size={24} />
                Storage & Maintenance
            </h2>

            {/* Stats List */}
            <div className="space-y-4 mb-8">
                {loading ? (
                    <div className="flex justify-center p-4">
                        <RefreshCw className="animate-spin text-gray-400" />
                    </div>
                ) : (
                    stats.map((stat) => (
                        <div key={stat.name} className="flex items-center justify-between p-3 rounded-lg bg-dark-100 border border-white/5">
                            <div className="flex items-center gap-3">
                                <HardDrive size={18} className="text-gray-400" />
                                <div>
                                    <p className="text-sm font-medium text-gray-200 capitalize">{stat.name}</p>
                                    <p className="text-xs text-gray-500">{stat.fileCount} files</p>
                                </div>
                            </div>
                            <span className="text-sm font-bold text-primary-400">
                                {formatBytes(stat.totalSize)}
                            </span>
                        </div>
                    ))
                )}
            </div>

            {/* Actions */}
            <div className="space-y-3">
                <button
                    onClick={handleCleanup}
                    disabled={cleaning || loading}
                    className="w-full btn-secondary text-sm p-3 flex items-center justify-between group disabled:opacity-50"
                >
                    <span className="flex items-center gap-2">
                        <Trash2 size={16} className={cleaning ? 'animate-bounce' : ''} />
                        Cleanup Orphans
                    </span>
                    {cleaning && <span className="text-xs">Processing...</span>}
                </button>

                <button
                    onClick={handleClearCache}
                    disabled={clearingCache}
                    className="w-full btn-secondary text-sm p-3 flex items-center justify-between group disabled:opacity-50"
                >
                    <span className="flex items-center gap-2">
                        <RefreshCw size={16} className={clearingCache ? 'animate-spin' : ''} />
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
