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
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
                    <p className="text-gray-400">Monitor activity and manage system access</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => openNotificationModal()}
                        className="flex items-center gap-2 px-4 py-2.5 bg-primary/10 text-primary rounded-xl font-medium hover:bg-primary/20 transition-colors"
                    >
                        <Send size={18} />
                        Broadcast
                    </button>

                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search name or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-dark-200 border border-dark-border rounded-xl py-2.5 pl-10 pr-4 text-sm focus:border-primary-500 outline-none transition-all"
                        />
                    </div>
                </div>
            </div>

            <div className="card overflow-hidden border-dark-border">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-dark-100/50 border-b border-dark-border">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Joined</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-border">
                            {loading && users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <Loader2 className="animate-spin text-primary-500 mx-auto" size={32} />
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        No users found
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={user.avatar || '/default-avatar.png'}
                                                    alt={user.name}
                                                    className="w-10 h-10 rounded-full border border-dark-border"
                                                />
                                                <div>
                                                    <div className="font-medium text-white">{user.name}</div>
                                                    <div className="text-xs text-gray-500 flex items-center gap-1">
                                                        <Mail size={12} /> {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleChangeRole(user.id, e.target.value)}
                                                className="bg-dark-200 text-xs font-medium px-2 py-1 rounded border border-dark-border focus:border-primary-500 outline-none"
                                            >
                                                <option value="USER">User</option>
                                                <option value="ADMIN">Admin</option>
                                                <option value="SUPER_ADMIN">Super Admin</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${user.isActive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                                                {user.isActive ? 'Active' : 'Banned'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-400">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar size={14} />
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleToggleStatus(user)}
                                                    className={`p-2 rounded-lg transition-colors ${user.isActive ? 'hover:bg-red-500/10 text-gray-400 hover:text-red-500' : 'hover:bg-green-500/10 text-gray-400 hover:text-green-500'
                                                        }`}
                                                    title={user.isActive ? 'Deactivate' : 'Activate'}
                                                >
                                                    {user.isActive ? <UserX size={18} /> : <UserCheck size={18} />}
                                                </button>
                                                <button className="p-2 rounded-lg hover:bg-dark-100 text-gray-400">
                                                    <MoreHorizontal size={18} />
                                                </button>
                                                <button
                                                    onClick={() => openNotificationModal(user)}
                                                    className="p-2 rounded-lg hover:bg-primary/10 text-gray-400 hover:text-primary transition-colors"
                                                    title="Send Notification"
                                                >
                                                    <Send size={18} />
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
                <div className="px-6 py-4 bg-dark-100/30 border-t border-dark-border flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                        Page {page} of {totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 text-sm bg-dark-200 border border-dark-border rounded-lg disabled:opacity-50 hover:bg-dark-100 transition-colors"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-4 py-2 text-sm bg-dark-200 border border-dark-border rounded-lg disabled:opacity-50 hover:bg-dark-100 transition-colors"
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
