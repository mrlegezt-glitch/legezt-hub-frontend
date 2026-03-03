'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Plus, School, Users, Layers, ChevronRight, Loader2, Trash2 } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { api, contentApi } from '@/lib/api';
import { toast } from 'sonner';

export default function CollegesPage() {
    const [colleges, setColleges] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchColleges = useCallback(async () => {
        try {
            const res = await api.get('/admin/colleges');
            setColleges(res.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchColleges();
    }, [fetchColleges]);


    const handleDelete = async (e: React.MouseEvent, id: string, name: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (!confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
            return;
        }

        try {
            await contentApi.deleteCollege(id);
            toast.success('College deleted successfully');
            fetchColleges();
        } catch (error) {
            console.error('Failed to delete college:', error);
            toast.error('Failed to delete college');
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-display font-bold text-white mb-2 drop-shadow-md">College Management</h1>
                    <p className="text-silver-400">Manage colleges, branches, years, and semesters here.</p>
                </div>
                <Link href="/admin/colleges/create" className="bg-silver-gradient text-dark-android font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-3d hover:shadow-3d-hover hover:-translate-y-0.5 border border-silver-light transition-all overflow-hidden relative group">
                    <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/10 rounded-t-xl" />
                    <Plus size={18} className="relative z-10" /> <span className="relative z-10">Add New College</span>
                </Link>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 size={32} className="animate-spin text-silver-400" />
                </div>
            ) : colleges.length === 0 ? (
                <div className="text-silver-500 font-bold p-12 text-center border border-dashed border-silver-dark/20 rounded-3xl bg-dark-android shadow-inner-metallic">
                    No colleges found. Click &quot;Add New College&quot; to create one.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {colleges.map((college) => (
                        <Link
                            key={college.id}
                            href={`/admin/colleges/${college.id}`}
                            className="bg-dark-surface shadow-android-card border border-silver-dark/10 rounded-3xl p-6 flex items-center justify-between hover:border-silver-metallic/40 transition-all group relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-silver-metallic to-transparent opacity-30 z-20" />
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="w-14 h-14 bg-dark-android rounded-xl border border-silver-dark/20 shadow-inner flex items-center justify-center text-3xl group-hover:shadow-glow transition-all">
                                    {college.logo ? <div className="relative w-full h-full"><Image src={college.logo} alt="" fill className="object-cover rounded-xl" /></div> : <School size={28} className="text-silver-500 drop-shadow-md" />}
                                </div>
                                <div>
                                    <h3 className="font-display font-bold text-xl text-white group-hover:text-silver-300 drop-shadow-md transition-colors">
                                        {college.name}
                                    </h3>
                                    <div className="flex items-center gap-4 text-[11px] font-bold text-silver-500 mt-2 tracking-wide uppercase">
                                        <span className="font-mono bg-dark-android border border-silver-dark/20 shadow-inner px-2 py-1 rounded-md text-silver-300 tracking-wider">
                                            {college.code}
                                        </span>
                                        <span className="flex items-center gap-1.5 bg-dark-android border border-silver-dark/20 shadow-inner px-2 py-1 rounded-md">
                                            <Layers size={14} className="text-silver-400" /> {college._count?.branches || 0} Branches
                                        </span>
                                        <span className="flex items-center gap-1.5 bg-dark-android border border-silver-dark/20 shadow-inner px-2 py-1 rounded-md">
                                            <Users size={14} className="text-silver-400" /> {college._count?.users || 0} Users
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 relative z-10">
                                <button
                                    onClick={(e) => handleDelete(e, college.id, college.name)}
                                    className="p-2 text-silver-500 hover:text-red-400 bg-dark-android hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-xl shadow-inner transition-all"
                                    title="Delete College"
                                >
                                    <Trash2 size={20} />
                                </button>
                                <button className="p-2 text-silver-400 bg-dark-android border border-transparent group-hover:border-silver-dark/20 group-hover:text-white rounded-xl shadow-inner transition-all">
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

