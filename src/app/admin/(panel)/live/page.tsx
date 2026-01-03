'use client';

import { useEffect, useState } from 'react';
import { useSocket } from '@/lib/socket-context';
import { Activity, Mail, Clock, ShieldAlert } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActiveUser {
    userId: string;
    name: string;
    email: string;
    activityType: string;
    activityDetails?: any;
    lastActive: string;
}

export default function LiveUsersPage() {
    const { socket, isConnected } = useSocket();
    const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);

    useEffect(() => {
        if (!socket || !isConnected) return;

        // Join admin room
        socket.emit('admin_subscribe');

        // Listen for updates
        socket.on('active_users_update', (users: ActiveUser[]) => {
            setActiveUsers(users);
        });

        return () => {
            socket.off('active_users_update');
        };
    }, [socket, isConnected]);

    const getActivityBadgeColor = (type: string) => {
        switch (type) {
            case 'VIEW_PDF': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'VIEW_COURSE': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
            case 'IDLE': return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
            default: return 'bg-green-500/10 text-green-400 border-green-500/20';
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        Live Traffic
                    </h1>
                    <p className="text-gray-400 mt-2 flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        {activeUsers.length} users active right now
                    </p>
                </div>
            </div>

            <div className="grid gap-4">
                {activeUsers.length === 0 ? (
                    <div className="text-center py-20 bg-dark-200/50 rounded-2xl border border-dashed border-dark-border">
                        <Activity className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-400">No active users</h3>
                        <p className="text-gray-600">Waiting for connections...</p>
                    </div>
                ) : (
                    activeUsers.map((user) => (
                        <div
                            key={user.userId}
                            className="bg-dark-200/40 backdrop-blur-md rounded-2xl p-6 border border-dark-border flex items-center justify-between hover:border-primary-500/30 transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-white text-lg">{user.name}</h4>
                                    <div className="flex items-center gap-2 text-sm text-gray-400">
                                        <Mail size={14} />
                                        {user.email}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className={`px-4 py-1.5 rounded-full border text-xs font-semibold uppercase tracking-wider ${getActivityBadgeColor(user.activityType)}`}>
                                    {user.activityType.replace('VIEW_', '')}
                                </div>

                                {user.activityDetails?.path && (
                                    <div className="text-sm text-gray-400 max-w-[200px] truncate" title={user.activityDetails.path}>
                                        {user.activityDetails.path}
                                    </div>
                                )}

                                <div className="flex items-center gap-2 text-sm text-gray-500 w-32 justify-end">
                                    <Clock size={14} />
                                    <span>{formatDistanceToNow(new Date(user.lastActive))} ago</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
