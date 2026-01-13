'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2, Save, Calendar } from 'lucide-react';

export default function SchedulePage() {
    const [loading, setLoading] = useState(false);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [semesters, setSemesters] = useState<any[]>([]);

    // Fetch lists on mount
    useEffect(() => {
        const fetchLists = async () => {
            try {
                const [subRes, branchRes, semRes] = await Promise.all([
                    api.get('/academic/subjects'),
                    api.get('/academic/branches'),
                    api.get('/academic/semesters')
                ]);
                setSubjects(subRes.data);
                setBranches(branchRes.data);
                setSemesters(semRes.data);
            } catch (err) {
                toast.error('Failed to load dropdown lists');
            }
        };
        fetchLists();
    }, []);

    const [formData, setFormData] = useState({
        dayOfWeek: 1, // Monday
        startTime: '09:00',
        endTime: '10:00',
        subjectId: '',
        type: 'LECTURE', // LECTURE, LAB
        room: '',
        semesterId: '',
        branchId: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/academic/schedule', {
                ...formData,
                dayOfWeek: parseInt(formData.dayOfWeek as any)
            });
            toast.success('Schedule slot added');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to add schedule');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-4xl">
            <h1 className="text-3xl font-bold text-white mb-6">Schedule Builder</h1>

            <div className="bg-dark-200 p-6 rounded-2xl border border-dark-border">
                <h2 className="text-xl font-bold text-white mb-4">Add Class Slot</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <select
                            className="w-full bg-dark-100 border border-dark-border rounded-xl p-3 text-white"
                            value={formData.dayOfWeek}
                            onChange={e => setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) })}
                        >
                            <option value={1}>Monday</option>
                            <option value={2}>Tuesday</option>
                            <option value={3}>Wednesday</option>
                            <option value={4}>Thursday</option>
                            <option value={5}>Friday</option>
                            <option value={6}>Saturday</option>
                            <option value={0}>Sunday</option>
                        </select>
                        <select
                            className="w-full bg-dark-100 border border-dark-border rounded-xl p-3 text-white"
                            value={formData.type}
                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                        >
                            <option value="LECTURE">Lecture</option>
                            <option value="LAB">Lab</option>
                            <option value="BREAK">Break</option>
                        </select>

                        <div className="flex gap-2">
                            <input
                                type="time"
                                className="w-full bg-dark-100 border border-dark-border rounded-xl p-3 text-white"
                                value={formData.startTime}
                                onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                                required
                            />
                            <input
                                type="time"
                                className="w-full bg-dark-100 border border-dark-border rounded-xl p-3 text-white"
                                value={formData.endTime}
                                onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                                required
                            />
                        </div>

                        {/* Subject Select */}
                        <select
                            className="w-full bg-dark-100 border border-dark-border rounded-xl p-3 text-white"
                            value={formData.subjectId}
                            onChange={e => setFormData({ ...formData, subjectId: e.target.value })}
                            required
                        >
                            <option value="">Select Subject</option>
                            {subjects.map(sub => (
                                <option key={sub.id} value={sub.id}>{sub.name} ({sub.code})</option>
                            ))}
                        </select>

                        {/* Semester Select */}
                        <select
                            className="w-full bg-dark-100 border border-dark-border rounded-xl p-3 text-white"
                            value={formData.semesterId}
                            onChange={e => setFormData({ ...formData, semesterId: e.target.value })}
                            required
                        >
                            <option value="">Select Semester</option>
                            {semesters.map(sem => (
                                <option key={sem.id} value={sem.id}>{sem.displayName}</option>
                            ))}
                        </select>

                        {/* Branch Select */}
                        <select
                            className="w-full bg-dark-100 border border-dark-border rounded-xl p-3 text-white"
                            value={formData.branchId}
                            onChange={e => setFormData({ ...formData, branchId: e.target.value })}
                            required
                        >
                            <option value="">Select Branch</option>
                            {branches.map(br => (
                                <option key={br.id} value={br.id}>{br.name}</option>
                            ))}
                        </select>

                        <input
                            type="text"
                            placeholder="Room Number (e.g. 304)"
                            className="w-full bg-dark-100 border border-dark-border rounded-xl p-3 text-white"
                            value={formData.room}
                            onChange={e => setFormData({ ...formData, room: e.target.value })}
                        />
                    </div>
                    <button
                        disabled={loading}
                        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                        Save Slot
                    </button>
                </form>
            </div>
        </div>
    );
}
