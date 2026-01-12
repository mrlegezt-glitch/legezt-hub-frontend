import { useState, useEffect } from 'react';
import { Bell, Check, X, Info, AlertTriangle, FileText, ExternalLink } from 'lucide-react';
import { api } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

// Types (should actally be in a types file)
interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'INFO' | 'ALERT' | 'DOCUMENT' | 'ASSIGNMENT';
    priority: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
    link?: string;
    isRead: boolean;
    createdAt: string;
}

export default function NotificationPanel() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications'); // Assumes axios interceptor adds /api base
            setNotifications(res.data.notifications);
            setUnreadCount(res.data.unreadCount);
        } catch (error) {
            console.error('Failed to fetch notifications');
        }
    };

    const markAsRead = async (id: string) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark as read');
        }
    };

    const markAllRead = async () => {
        try {
            await api.patch('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all read');
        }
    };

    useEffect(() => {
        // Poll every 30 seconds
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    // Helper for Icon based on type
    const getIcon = (type: string) => {
        switch (type) {
            case 'ALERT': return <AlertTriangle size={18} className="text-orange-500" />;
            case 'DOCUMENT': return <FileText size={18} className="text-blue-500" />;
            case 'ASSIGNMENT': return <FileText size={18} className="text-purple-500" />;
            default: return <Info size={18} className="text-primary" />;
        }
    };

    return (
        <div className="relative">
            {/* Bell Trigger */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-dark-bg shadow-sm animate-pulse" />
                )}
            </button>

            {/* Dropdown Panel */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40 bg-transparent"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 top-full mt-2 w-96 max-h-[600px] bg-dark-card border border-dark-border rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col"
                        >
                            {/* Header */}
                            <div className="p-4 border-b border-dark-border flex items-center justify-between bg-dark-card/95 backdrop-blur-sm sticky top-0 z-10">
                                <h3 className="font-semibold text-white flex items-center gap-2">
                                    Notifications
                                    {unreadCount > 0 && (
                                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
                                            {unreadCount} new
                                        </span>
                                    )}
                                </h3>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={markAllRead}
                                        className="text-xs text-primary hover:text-primary-hover font-medium px-2 py-1 rounded-lg hover:bg-primary/5 transition-colors"
                                    >
                                        Mark all read
                                    </button>
                                </div>
                            </div>

                            {/* List */}
                            <div className="overflow-y-auto custom-scrollbar flex-1 relative">
                                {notifications.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                                        <div className="w-12 h-12 rounded-full bg-dark-bg flex items-center justify-center mb-3">
                                            <Bell className="text-gray-600" size={20} />
                                        </div>
                                        <p className="text-gray-400 font-medium">No notifications yet</p>
                                        <p className="text-xs text-gray-600 mt-1">We'll let you know when something arrives.</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-dark-border/50">
                                        {notifications.map((notification) => (
                                            <div
                                                key={notification.id}
                                                className={`p-4 hover:bg-white/[0.02] transition-colors relative group ${!notification.isRead ? 'bg-primary/[0.02]' : ''}`}
                                            >
                                                <div className="flex gap-4">
                                                    <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${!notification.isRead ? 'bg-dark-bg ring-1 ring-primary/20' : 'bg-dark-bg'
                                                        }`}>
                                                        {getIcon(notification.type)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-2 mb-1">
                                                            <p className={`text-sm font-medium leading-tight ${!notification.isRead ? 'text-white' : 'text-gray-300'}`}>
                                                                {notification.title}
                                                            </p>
                                                            {!notification.isRead && (
                                                                <button
                                                                    onClick={() => markAsRead(notification.id)}
                                                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-primary hover:bg-primary/10 rounded"
                                                                    title="Mark as read"
                                                                >
                                                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                                                </button>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-gray-500 line-clamp-2 mb-2 leading-relaxed">
                                                            {notification.message}
                                                        </p>

                                                        {/* Actions Footer */}
                                                        <div className="flex items-center justify-between mt-2">
                                                            <span className="text-[10px] text-gray-600">
                                                                {new Date(notification.createdAt).toLocaleDateString()}
                                                            </span>
                                                            {notification.link && (
                                                                <a
                                                                    href={notification.link}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                                                                >
                                                                    View Details
                                                                    <ExternalLink size={10} />
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Critical Indicator */}
                                                {notification.priority === 'CRITICAL' && !notification.isRead && (
                                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
