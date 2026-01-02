'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Eye, Download, History, Loader2 } from 'lucide-react';
import Link from 'next/link';
import BottomNav from '@/components/navigation/BottomNav';
import { userApi } from '@/lib/api';

interface Activity {
    id: string;
    action: string;
    resource?: string;
    resourceId?: string;
    metadata: any;
    createdAt: string;
}

export default function ActivityPage() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActivity = async () => {
            try {
                const res = await userApi.getActivity();
                setActivities(res.data.data);
            } catch (error) {
                console.error('Failed to fetch activity', error);
            } finally {
                setLoading(false);
            }
        };

        fetchActivity();
    }, []);

    const getIcon = (action: string) => {
        if (action.includes('download')) return <Download className="text-green-500" size={18} />;
        if (action.includes('view')) return <Eye className="text-blue-500" size={18} />;
        return <Clock className="text-gray-500" size={18} />;
    };

    const getActionText = (activity: Activity) => {
        const title = activity.metadata?.title || activity.resourceId || 'Item';
        if (activity.action === 'pdf_download') return `Downloaded "${title}"`;
        if (activity.action === 'pdf_view') return `Viewed "${title}"`;
        if (activity.action === 'login') return `Logged into the system`;
        return activity.action.replace('_', ' ');
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <main className="min-h-screen pb-24">
            <header className="sticky top-0 z-40 glass px-5 py-4">
                <div className="flex items-center gap-4 max-w-lg mx-auto">
                    <Link href="/profile" className="p-2 -ml-2 rounded-full hover:bg-dark-100">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-lg font-semibold">Your Activity</h1>
                </div>
            </header>

            <div className="max-w-lg mx-auto px-5 py-6">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="animate-spin text-primary-500" size={32} />
                    </div>
                ) : activities.length === 0 ? (
                    <div className="text-center py-20 bg-dark-100/30 rounded-3xl border border-dashed border-dark-border">
                        <History size={48} className="mx-auto text-dark-border mb-4" />
                        <p className="text-gray-400">No recent activity found</p>
                    </div>
                ) : (
                    <div className="relative">
                        {/* Vertical Line */}
                        <div className="absolute left-6 top-0 bottom-0 w-px bg-dark-border" />

                        <div className="space-y-8">
                            {activities.map((activity) => (
                                <div key={activity.id} className="relative pl-14">
                                    {/* Icon Circle */}
                                    <div className="absolute left-0 top-0 w-12 h-12 rounded-full bg-dark-200 border border-dark-border flex items-center justify-center z-10">
                                        {getIcon(activity.action)}
                                    </div>

                                    <div>
                                        <p className="text-white font-medium leading-tight">
                                            {getActionText(activity)}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1 uppercase">
                                            {formatDate(activity.createdAt)}
                                        </p>

                                        {activity.resourceId && activity.resource === 'pdf' && (
                                            <Link
                                                href={`/pdfs/${activity.resourceId}`}
                                                className="inline-block mt-2 text-xs text-primary-400 font-medium hover:underline"
                                            >
                                                Open Again →
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <BottomNav />
        </main>
    );
}
