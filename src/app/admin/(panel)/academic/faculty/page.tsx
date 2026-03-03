'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2, Plus, User, Trash, Edit } from 'lucide-react';

export default function FacultyPage() {
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [designation, setDesignation] = useState('');
    const [phone, setPhone] = useState('');
    const [branchId, setBranchId] = useState('');
    const [email, setEmail] = useState('');
    const [collegeId, setCollegeId] = useState('');
    const [branches, setBranches] = useState<any[]>([]);
    const [colleges, setColleges] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [branchesRes, collegesRes] = await Promise.all([
                    api.get('/academic/branches'),
                    api.get('/admin/colleges')
                ]);
                setBranches(branchesRes.data);

                const fetchedColleges = collegesRes.data?.data || collegesRes.data || [];
                setColleges(fetchedColleges);
                if (fetchedColleges.length > 0) {
                    setCollegeId(fetchedColleges[0].id);
                }
            } catch (e) {
                toast.error('Failed to load required data');
            }
        };
        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!collegeId) {
                toast.error('College ID is missing. Cannot create faculty.');
                setLoading(false);
                return;
            }

            await api.post('/academic/faculty', {
                name,
                designation,
                phone,
                email: email || undefined,
                branchId,
                collegeId
            });
            toast.success('Faculty added successfully');
            setName('');
            setDesignation('');
            setPhone('');
            setBranchId('');
        } catch (error) {
            toast.error('Failed to add faculty');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 md:p-8 max-w-4xl mx-auto pb-24">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-dark-android border border-silver-dark/20 shadow-inner flex items-center justify-center text-silver-400">
                    <User size={24} className="drop-shadow-md" />
                </div>
                <h1 className="text-3xl font-display font-bold text-white drop-shadow-md">Faculty Management</h1>
            </div>

            <div className="bg-dark-surface shadow-android-card border border-silver-dark/10 p-8 rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-silver-metallic to-transparent opacity-30 z-20" />
                <h2 className="text-2xl font-display font-bold text-white mb-8 drop-shadow-md relative z-10">Add New Faculty</h2>
                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[10px] font-bold text-silver-600 uppercase tracking-widest mb-2 ml-2">Full Name</label>
                            <input
                                type="text"
                                placeholder="e.g. Ms. Farheen Sultana"
                                className="w-full bg-dark-android shadow-inner-metallic border border-silver-800 rounded-xl px-4 py-3.5 text-white font-bold uppercase placeholder-silver-600 outline-none focus:border-silver-500 transition-all"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-silver-600 uppercase tracking-widest mb-2 ml-2">Designation</label>
                            <input
                                type="text"
                                placeholder="e.g. Asst. Professor"
                                className="w-full bg-dark-android shadow-inner-metallic border border-silver-800 rounded-xl px-4 py-3.5 text-white font-bold uppercase placeholder-silver-600 outline-none focus:border-silver-500 transition-all"
                                value={designation}
                                onChange={e => setDesignation(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-silver-600 uppercase tracking-widest mb-2 ml-2">Mobile Number</label>
                            <input
                                type="tel"
                                placeholder="Enter phone number"
                                className="w-full bg-dark-android shadow-inner-metallic border border-silver-800 rounded-xl px-4 py-3.5 text-white font-bold placeholder-silver-600 font-mono tracking-wider outline-none focus:border-silver-500 transition-all"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-silver-600 uppercase tracking-widest mb-2 ml-2">Department</label>
                            <div className="relative">
                                <select
                                    className="w-full bg-dark-android shadow-inner-metallic border border-silver-800 rounded-xl px-4 py-3.5 text-white font-bold appearance-none outline-none focus:border-silver-500 transition-all"
                                    value={branchId}
                                    onChange={e => setBranchId(e.target.value)}
                                    required
                                >
                                    <option value="" className="text-silver-600">Select Department (Branch)</option>
                                    {branches.map(br => (
                                        <option key={br.id} value={br.id} className="text-white bg-dark-surface font-bold">{br.name}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-silver-500">
                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 12l-5-5 1.5-1.5L10 9l3.5-3.5L15 7l-5 5z" clipRule="evenodd" /></svg>
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-2 hidden">
                            {/* Hidden College ID Select - Auto picked first one to keep UI clean per user request */}
                            <select value={collegeId} onChange={e => setCollegeId(e.target.value)} className="hidden">
                                {colleges.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>

                        {/* Hidden or Optional Email */}
                        <div className="md:col-span-2">
                            <label className="block text-[10px] font-bold text-silver-600 uppercase tracking-widest mb-2 ml-2">Email Address (Optional)</label>
                            <input
                                type="email"
                                placeholder="name@college.edu"
                                className="w-full bg-dark-android shadow-inner-metallic border border-silver-800 rounded-xl px-4 py-3.5 text-white font-bold placeholder-silver-600 outline-none focus:border-silver-500 transition-all"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="pt-4 border-t border-silver-dark/10">
                        <button
                            disabled={loading}
                            className="w-full md:w-auto md:ml-auto bg-silver-gradient text-dark-android font-bold px-8 py-4 rounded-xl shadow-3d hover:shadow-3d-hover hover:-translate-y-0.5 border border-silver-light transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale disabled:pointer-events-none"
                        >
                            {loading ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
                            <span className="uppercase tracking-widest">Add Faculty</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
