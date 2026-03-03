'use client';

import { useState, useEffect } from 'react';
import {
    Users,
    Search,
    Shield,
    UserCheck,
    UserX,
    MoreHorizontal,
    Loader2,
    Calendar,
    Mail,
    Send
} from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import SendNotificationModal from '@/components/admin/SendNotificationModal';

interface User {
    id: string;
    email: string;
    name: string;
    avatar: string;
    role: string;
    isActive: boolean;
    lastLoginAt: string | null;
    createdAt: string;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Notification Modal State
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [selectedUserForNotification, setSelectedUserForNotification] = useState<{ id: string, name: string } | null>(null);

    const openNotificationModal = (user?: User) => {
        if (user) {
            setSelectedUserForNotification({ id: user.id, name: user.name });
        } else {
            setSelectedUserForNotification(null);
        }
        setIsNotificationOpen(true);
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/users', {
                params: {
                    page,
                    search,
                    limit: 10
                }
            });
            setUsers(res.data.data);
            setTotalPages(Math.ceil(res.data.meta.total / res.data.meta.limit));
        } catch (error) {
            console.error('Failed to fetch users', error);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers();
        }, 500);
        return () => clearTimeout(timer);
    }, [search, page]);

    const handleToggleStatus = async (user: User) => {
        try {
            await api.patch(`/users/${user.id}`, {
                isActive: !user.isActive
            });
            toast.success(`User ${user.isActive ? 'deactivated' : 'activated'}`);
            setUsers(users.map(u => u.id === user.id ? { ...u, isActive: !u.isActive } : u));
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleChangeRole = async (userId: string, newRole: string) => {
        try {
            await api.patch(`/users/${userId}/role`, {
                role: newRole
            });
            toast.success(`Role updated to ${newRole}`);
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        } catch (error) {
            toast.error('Failed to update role');
        }
    };

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto pb-24 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-dark-android border border-silver-dark/20 shadow-inner flex items-center justify-center text-silver-400 group">
                        <Users size={28} className="drop-shadow-md group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-display font-bold text-white drop-shadow-md">User Management</h1>
                        <p className="text-[10px] font-bold text-silver-500 uppercase tracking-widest mt-1">Monitor activity & access</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => openNotificationModal()}
                        className="bg-silver-gradient text-dark-android px-6 py-3.5 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all flex items-center gap-3 shadow-3d hover:shadow-3d-hover hover:-translate-y-0.5 border border-silver-light shrink-0"
                    >
                        <Send size={18} />
                        Broadcast
                    </button>

                    <div className="relative w-full md:w-80 hidden md:block">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-silver-500 drop-shadow-md" size={18} />
                        <input
                            type="text"
                            placeholder="SEARCH NAME OR EMAIL..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-dark-android shadow-inner-metallic border border-silver-800 rounded-xl py-3.5 pl-12 pr-6 text-[10px] font-bold text-white uppercase tracking-widest outline-none focus:border-silver-500 transition-all placeholder-silver-600"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-dark-surface shadow-android-card border border-silver-dark/10 rounded-3xl overflow-hidden relative">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-silver-metallic to-transparent opacity-20 z-20" />
                <div className="overflow-x-auto relative z-10">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-dark-android border-b border-silver-dark/20">
                            <tr className="text-[10px] font-bold text-silver-500 uppercase tracking-widest">
                                <th className="px-8 py-5">User Identity</th>
                                <th className="px-8 py-5">Role</th>
                                <th className="px-8 py-5">Status</th>
                                <th className="px-8 py-5">Joined</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-silver-dark/5">
                            {loading && users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <Loader2 className="animate-spin text-silver-500 mx-auto drop-shadow-md" size={40} />
                                        <p className="text-[10px] font-bold text-silver-500 uppercase tracking-widest mt-4">Scanning Records...</p>
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center opacity-40">
                                        <UserX className="text-silver-600 mx-auto drop-shadow-md mb-4" size={60} />
                                        <p className="text-sm font-bold text-silver-500">No users found.</p>
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="hover:bg-dark-android transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-dark-android shadow-inner-metallic border border-silver-dark/20 p-0.5 shrink-0">
                                                    <div className="w-full h-full rounded-xl overflow-hidden relative shadow-inner">
                                                        <img
                                                            src={user.avatar || '/default-avatar.png'}
                                                            alt={user.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white group-hover:text-silver-300 transition-colors drop-shadow-md tracking-tight text-sm">{user.name}</div>
                                                    <div className="text-[10px] bg-dark-android px-2 py-1 rounded-lg border border-silver-800 shadow-inner-metallic text-silver-500 font-bold uppercase tracking-widest flex items-center gap-1.5 mt-1">
                                                        <Mail size={10} className="shrink-0 opacity-50" /> <span className="truncate">{user.email}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="relative w-fit">
                                                <select
                                                    value={user.role}
                                                    onChange={(e) => handleChangeRole(user.id, e.target.value)}
                                                    className="bg-dark-android text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2 pr-8 rounded-xl border border-silver-800 focus:border-silver-500 outline-none shadow-inner-metallic cursor-pointer appearance-none transition-all"
                                                >
                                                    <option value="USER" className="font-bold">User</option>
                                                    <option value="ADMIN" className="font-bold">Admin</option>
                                                    <option value="SUPER_ADMIN" className="font-bold">Super Admin</option>
                                                </select>
                                                <div className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none text-silver-500"><svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 12l-5-5 1.5-1.5L10 9l3.5-3.5L15 7l-5 5z" clipRule="evenodd" /></svg></div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-inner border ${user.isActive ? 'bg-dark-android text-green-400 border-green-500/20' : 'bg-red-500/5 text-red-500 border-red-500/20'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full shadow-glow ${user.isActive ? 'bg-green-400' : 'bg-red-500'}`} />
                                                {user.isActive ? 'Active' : 'Banned'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-silver-500 uppercase tracking-widest font-mono">
                                                <Calendar size={12} className="opacity-50 shrink-0" />
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleToggleStatus(user)}
                                                    className={`p-3 rounded-xl transition-all shadow-inner border border-transparent active:scale-95 ${user.isActive ? 'hover:bg-red-500/10 hover:border-red-500/30 text-silver-500 hover:text-red-400 bg-dark-android' : 'hover:bg-green-500/10 hover:border-green-500/30 text-silver-500 hover:text-green-400 bg-dark-android'
                                                        }`}
                                                    title={user.isActive ? 'Deactivate' : 'Activate'}
                                                >
                                                    {user.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                                                </button>
                                                <button
                                                    onClick={() => openNotificationModal(user)}
                                                    className="p-3 rounded-xl bg-dark-android hover:bg-silver-gradient border border-transparent hover:border-silver-metallic/30 text-silver-500 hover:text-dark-android shadow-inner-metallic hover:shadow-glow transition-all active:scale-95"
                                                    title="Send Notification"
                                                >
                                                    <Send size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-8 py-5 border-t border-silver-dark/10 bg-dark-android flex items-center justify-between relative z-10">
                    <p className="text-[10px] font-bold text-silver-500 uppercase tracking-widest">
                        Page <span className="text-white mx-1">{page}</span> of <span className="text-white mx-1">{totalPages}</span>
                    </p>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest bg-dark-surface shadow-android-card border border-silver-dark/20 hover:border-silver-500 text-silver-300 rounded-xl disabled:opacity-50 disabled:pointer-events-none hover:bg-dark-android transition-all active:scale-95"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest bg-dark-surface shadow-android-card border border-silver-dark/20 hover:border-silver-500 text-silver-300 rounded-xl disabled:opacity-50 disabled:pointer-events-none hover:bg-dark-android transition-all active:scale-95"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            <SendNotificationModal
                isOpen={isNotificationOpen}
                onClose={() => setIsNotificationOpen(false)}
                preSelectedUser={selectedUserForNotification}
            />
        </div>
    );
}
