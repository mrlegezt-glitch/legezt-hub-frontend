import { useState } from 'react';
import { X, Send, Users, Filter, AlertTriangle, Info, FileText, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api'; // Assuming you have an api wrapper
import { toast } from 'sonner';

interface SendNotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    preSelectedUser?: { id: string; name: string } | null;
}

type Priority = 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
type ContentType = 'INFO' | 'ALERT' | 'DOCUMENT' | 'ASSIGNMENT';

export default function SendNotificationModal({ isOpen, onClose, preSelectedUser }: SendNotificationModalProps) {
    const [loading, setLoading] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [priority, setPriority] = useState<Priority>('NORMAL');
    const [type, setType] = useState<ContentType>('INFO');
    const [link, setLink] = useState('');

    // Target State
    const [targetType, setTargetType] = useState<'INDIVIDUAL' | 'ALL' | 'FILTER'>(preSelectedUser ? 'INDIVIDUAL' : 'INDIVIDUAL');
    const [targetFilter, setTargetFilter] = useState({
        collegeId: '',
        branchId: '',
        yearId: ''
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/admin/notifications/send', {
                title,
                message,
                priority,
                type,
                link,
                targetType,
                targetFilter: targetType === 'FILTER' ? targetFilter : undefined,
                userIds: targetType === 'INDIVIDUAL' && preSelectedUser ? [preSelectedUser.id] : undefined
            });
            toast.success('Notification Sent Successfully');
            onClose();
        } catch (error) {
            toast.error('Failed to send notification');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-2xl shadow-xl flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-dark-border flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Send size={20} className="text-primary" />
                        Send Notification
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar">
                    <form id="notification-form" onSubmit={handleSubmit} className="space-y-6">
                        {/* Target Selection */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">Target Audience</label>

                            {preSelectedUser ? (
                                <div className="bg-primary/10 border border-primary/20 p-3 rounded-xl flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                        <Users size={16} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">Sending to specific user</p>
                                        <p className="text-xs text-primary">{preSelectedUser.name}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setTargetType('INDIVIDUAL')}
                                        className={`p-3 rounded-xl border text-sm font-medium transition-all ${targetType === 'INDIVIDUAL'
                                            ? 'bg-primary/10 border-primary text-primary'
                                            : 'bg-dark-bg border-dark-border text-gray-400 hover:border-primary/50'}`}
                                    >
                                        Individual
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setTargetType('ALL')}
                                        className={`p-3 rounded-xl border text-sm font-medium transition-all ${targetType === 'ALL'
                                            ? 'bg-primary/10 border-primary text-primary'
                                            : 'bg-dark-bg border-dark-border text-gray-400 hover:border-primary/50'}`}
                                    >
                                        All Users (Broadcast)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setTargetType('FILTER')}
                                        className={`p-3 rounded-xl border text-sm font-medium transition-all ${targetType === 'FILTER'
                                            ? 'bg-primary/10 border-primary text-primary'
                                            : 'bg-dark-bg border-dark-border text-gray-400 hover:border-primary/50'}`}
                                    >
                                        Group Filter
                                    </button>
                                </div>
                            )}

                            {targetType === 'FILTER' && (
                                <div className="p-4 bg-dark-bg/50 rounded-xl border border-dark-border space-y-3">
                                    {/* Placeholder for Select inputs - Assuming you have components for these or use native select */}
                                    <select
                                        className="w-full bg-dark-card border border-dark-border rounded-lg p-2 text-white"
                                        onChange={(e) => setTargetFilter({ ...targetFilter, collegeId: e.target.value })}
                                    >
                                        <option value="">Select College</option>
                                        {/* Populate dynamically */}
                                    </select>
                                    {/* Additional filters */}
                                </div>
                            )}
                        </div>

                        {/* Message Details */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Priority Level</label>
                                    <div className="flex gap-2">
                                        {(['LOW', 'NORMAL', 'HIGH', 'CRITICAL'] as Priority[]).map((p) => (
                                            <button
                                                key={p}
                                                type="button"
                                                onClick={() => setPriority(p)}
                                                className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${priority === p
                                                        ? p === 'CRITICAL' ? 'bg-red-500/20 border-red-500 text-red-500' :
                                                            p === 'HIGH' ? 'bg-orange-500/20 border-orange-500 text-orange-500' :
                                                                'bg-primary/20 border-primary text-primary'
                                                        : 'border-dark-border text-gray-500 hover:bg-white/5'
                                                    }`}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Message Type</label>
                                    <select
                                        value={type}
                                        onChange={(e) => setType(e.target.value as ContentType)}
                                        className="w-full bg-dark-bg border border-dark-border rounded-lg p-2 text-white focus:border-primary outline-none"
                                    >
                                        <option value="INFO">Information</option>
                                        <option value="ALERT">Alert</option>
                                        <option value="DOCUMENT">Document</option>
                                        <option value="ASSIGNMENT">Assignment</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm text-gray-400">Title</label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-dark-bg border border-dark-border rounded-lg p-3 text-white focus:border-primary outline-none transition-colors"
                                    placeholder="e.g. Exam Schedule Update"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm text-gray-400">Message Body</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="w-full bg-dark-bg border border-dark-border rounded-lg p-3 text-white focus:border-primary outline-none transition-colors resize-none"
                                    placeholder="Write your message here..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm text-gray-400 flex items-center gap-2">
                                    Action Link <span className="text-xs text-gray-600">(Optional)</span>
                                </label>
                                <input
                                    type="url"
                                    value={link}
                                    onChange={(e) => setLink(e.target.value)}
                                    className="w-full bg-dark-bg border border-dark-border rounded-lg p-3 text-white focus:border-primary outline-none transition-colors"
                                    placeholder="https://..."
                                />
                            </div>
                        </div>
                    </form>
                </div>

                <div className="p-6 border-t border-dark-border flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        form="notification-form"
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2.5 rounded-xl text-sm font-bold text-black bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                    >
                        {loading ? 'Sending...' : (
                            <>
                                <Send size={16} />
                                Send Notification
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
