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
        <div className="p-6 md:p-8 max-w-4xl mx-auto pb-24">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-dark-android border border-silver-dark/20 shadow-inner flex items-center justify-center text-silver-400">
                    <Calendar size={24} className="drop-shadow-md" />
                </div>
                <h1 className="text-3xl font-display font-bold text-white drop-shadow-md">Schedule Builder</h1>
            </div>

            <div className="bg-dark-surface shadow-android-card border border-silver-dark/10 p-8 rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-silver-metallic to-transparent opacity-30 z-20" />
                <h2 className="text-2xl font-display font-bold text-white mb-8 drop-shadow-md relative z-10">Add Class Slot</h2>
                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[10px] font-bold text-silver-600 uppercase tracking-widest mb-2 ml-2">Day of Week</label>
                            <div className="relative">
                                <select
                                    className="w-full bg-dark-android shadow-inner-metallic border border-silver-800 rounded-xl px-4 py-3.5 text-white font-bold appearance-none outline-none focus:border-silver-500 transition-all"
                                    value={formData.dayOfWeek}
                                    onChange={e => setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) })}
                                >
                                    <option value={1} className="bg-dark-surface font-bold text-white">Monday</option>
                                    <option value={2} className="bg-dark-surface font-bold text-white">Tuesday</option>
                                    <option value={3} className="bg-dark-surface font-bold text-white">Wednesday</option>
                                    <option value={4} className="bg-dark-surface font-bold text-white">Thursday</option>
                                    <option value={5} className="bg-dark-surface font-bold text-white">Friday</option>
                                    <option value={6} className="bg-dark-surface font-bold text-white">Saturday</option>
                                    <option value={0} className="bg-dark-surface font-bold text-white">Sunday</option>
                                </select>
                                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-silver-500">
                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 12l-5-5 1.5-1.5L10 9l3.5-3.5L15 7l-5 5z" clipRule="evenodd" /></svg>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-silver-600 uppercase tracking-widest mb-2 ml-2">Class Type</label>
                            <div className="relative">
                                <select
                                    className="w-full bg-dark-android shadow-inner-metallic border border-silver-800 rounded-xl px-4 py-3.5 text-white font-bold appearance-none outline-none focus:border-silver-500 transition-all uppercase tracking-wider text-sm"
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option value="LECTURE" className="bg-dark-surface font-bold text-white">Lecture</option>
                                    <option value="LAB" className="bg-dark-surface font-bold text-white">Lab</option>
                                    <option value="BREAK" className="bg-dark-surface font-bold text-white">Break</option>
                                </select>
                                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-silver-500">
                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 12l-5-5 1.5-1.5L10 9l3.5-3.5L15 7l-5 5z" clipRule="evenodd" /></svg>
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-[10px] font-bold text-silver-600 uppercase tracking-widest mb-2 ml-2">Time Slot</label>
                            <div className="flex gap-4 items-center">
                                <input
                                    type="time"
                                    className="flex-1 bg-dark-android shadow-inner-metallic border border-silver-800 rounded-xl px-4 py-3.5 text-white font-bold font-mono outline-none focus:border-silver-500 transition-all"
                                    value={formData.startTime}
                                    onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                                    required
                                />
                                <span className="text-silver-500 font-bold uppercase tracking-widest text-[10px]">TO</span>
                                <input
                                    type="time"
                                    className="flex-1 bg-dark-android shadow-inner-metallic border border-silver-800 rounded-xl px-4 py-3.5 text-white font-bold font-mono outline-none focus:border-silver-500 transition-all"
                                    value={formData.endTime}
                                    onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        {/* Subject Select */}
                        <div>
                            <label className="block text-[10px] font-bold text-silver-600 uppercase tracking-widest mb-2 ml-2">Subject</label>
                            <div className="relative">
                                <select
                                    className="w-full bg-dark-android shadow-inner-metallic border border-silver-800 rounded-xl px-4 py-3.5 text-white font-bold appearance-none outline-none focus:border-silver-500 transition-all"
                                    value={formData.subjectId}
                                    onChange={e => setFormData({ ...formData, subjectId: e.target.value })}
                                    required
                                >
                                    <option value="" className="text-silver-600">Select Subject</option>
                                    {subjects.map(sub => (
                                        <option key={sub.id} value={sub.id} className="text-white bg-dark-surface font-bold">{sub.name} ({sub.code})</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-silver-500">
                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 12l-5-5 1.5-1.5L10 9l3.5-3.5L15 7l-5 5z" clipRule="evenodd" /></svg>
                                </div>
                            </div>
                        </div>

                        {/* Semester Select */}
                        <div>
                            <label className="block text-[10px] font-bold text-silver-600 uppercase tracking-widest mb-2 ml-2">Semester</label>
                            <div className="relative">
                                <select
                                    className="w-full bg-dark-android shadow-inner-metallic border border-silver-800 rounded-xl px-4 py-3.5 text-white font-bold appearance-none outline-none focus:border-silver-500 transition-all uppercase tracking-wider text-sm"
                                    value={formData.semesterId}
                                    onChange={e => setFormData({ ...formData, semesterId: e.target.value })}
                                    required
                                >
                                    <option value="" className="text-silver-600">Select Semester</option>
                                    {semesters.map(sem => (
                                        <option key={sem.id} value={sem.id} className="text-white bg-dark-surface font-bold">{sem.displayName}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-silver-500">
                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 12l-5-5 1.5-1.5L10 9l3.5-3.5L15 7l-5 5z" clipRule="evenodd" /></svg>
                                </div>
                            </div>
                        </div>

                        {/* Branch Select */}
                        <div>
                            <label className="block text-[10px] font-bold text-silver-600 uppercase tracking-widest mb-2 ml-2">Branch</label>
                            <div className="relative">
                                <select
                                    className="w-full bg-dark-android shadow-inner-metallic border border-silver-800 rounded-xl px-4 py-3.5 text-white font-bold appearance-none outline-none focus:border-silver-500 transition-all uppercase tracking-wider text-sm"
                                    value={formData.branchId}
                                    onChange={e => setFormData({ ...formData, branchId: e.target.value })}
                                    required
                                >
                                    <option value="" className="text-silver-600">Select Branch</option>
                                    {branches.map(br => (
                                        <option key={br.id} value={br.id} className="text-white bg-dark-surface font-bold">{br.name}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-silver-500">
                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 12l-5-5 1.5-1.5L10 9l3.5-3.5L15 7l-5 5z" clipRule="evenodd" /></svg>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-silver-600 uppercase tracking-widest mb-2 ml-2">Room Number</label>
                            <input
                                type="text"
                                placeholder="e.g. 304"
                                className="w-full bg-dark-android shadow-inner-metallic border border-silver-800 rounded-xl px-4 py-3.5 text-white font-bold font-mono tracking-wider placeholder-silver-600 outline-none focus:border-silver-500 transition-all"
                                value={formData.room}
                                onChange={e => setFormData({ ...formData, room: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="pt-4 border-t border-silver-dark/10">
                        <button
                            disabled={loading}
                            className="w-full md:w-auto md:ml-auto bg-silver-gradient text-dark-android font-bold px-8 py-4 rounded-xl shadow-3d hover:shadow-3d-hover hover:-translate-y-0.5 border border-silver-light transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale disabled:pointer-events-none"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                            <span className="uppercase tracking-widest">Save Slot</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
