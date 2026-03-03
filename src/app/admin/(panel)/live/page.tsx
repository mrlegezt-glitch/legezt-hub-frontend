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
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 pb-24">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-dark-android border border-silver-dark/20 shadow-inner flex items-center justify-center text-silver-400 group">
                    <Activity size={28} className="drop-shadow-md group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div>
                    <h1 className="text-3xl font-display font-bold text-white drop-shadow-md">Live Traffic</h1>
                    <p className="text-[10px] font-bold text-silver-500 uppercase tracking-widest mt-1 flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        {activeUsers.length} Devices Online
                    </p>
                </div>
            </div>

            <div className="grid gap-6">
                {activeUsers.length === 0 ? (
                    <div className="text-center py-20 bg-dark-surface shadow-android-card border border-silver-dark/10 rounded-3xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-silver-metallic to-transparent opacity-20" />
                        <Activity className="w-16 h-16 text-silver-600 mx-auto mb-4 drop-shadow-md opacity-50" />
                        <h3 className="text-xl font-display font-bold text-white drop-shadow-md">No Active Streams</h3>
                        <p className="text-[10px] font-bold text-silver-500 uppercase tracking-widest mt-2">Awaiting socket connections...</p>
                    </div>
                ) : (
                    activeUsers.map((user) => (
                        <div
                            key={user.userId}
                            className="bg-dark-surface shadow-android-card border border-silver-dark/10 rounded-3xl p-6 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 hover:-translate-y-1 transition-transform duration-300 group"
                        >
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-silver-metallic to-transparent opacity-20 z-20 group-hover:opacity-40 transition-opacity" />

                            <div className="flex items-center gap-4 relative z-10 w-full md:w-auto">
                                <div className="h-14 w-14 rounded-2xl bg-dark-android shadow-inner-metallic border border-silver-dark/20 flex items-center justify-center text-white font-display font-bold text-xl drop-shadow-md group-hover:shadow-glow transition-shadow">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-white text-lg drop-shadow-md truncate">{user.name}</h4>
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-silver-500 uppercase tracking-widest truncate">
                                        <Mail size={12} className="shrink-0" />
                                        <span className="truncate">{user.email}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 relative z-10 w-full md:w-auto pl-18 md:pl-0">
                                <div className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-inner whitespace-nowrap text-center sm:text-left ${getActivityBadgeColor(user.activityType)}`}>
                                    {user.activityType.replace('VIEW_', '')}
                                </div>

                                {user.activityDetails?.path && (
                                    <div className="text-[10px] font-bold text-silver-400 bg-dark-android px-4 py-2 rounded-xl shadow-inner-metallic border border-silver-800 uppercase tracking-widest truncate max-w-[200px]" title={user.activityDetails.path}>
                                        <span className="opacity-50 inline-block mr-2">Path</span>
                                        {user.activityDetails.path}
                                    </div>
                                )}

                                <div className="flex items-center gap-2 text-[10px] font-bold text-silver-500 uppercase tracking-widest justify-start sm:justify-end min-w-[120px]">
                                    <Clock size={12} className="opacity-50" />
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
