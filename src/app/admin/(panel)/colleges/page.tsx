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
                    <h1 className="text-3xl font-bold text-white mb-2">College Management</h1>
                    <p className="text-gray-400">Manage colleges, branches, years, and semesters here.</p>
                </div>
                <Link href="/admin/colleges/create" className="btn-primary px-4 py-2 rounded-lg flex items-center gap-2">
                    <Plus size={18} /> Add New College
                </Link>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 size={32} className="animate-spin text-primary-500" />
                </div>
            ) : colleges.length === 0 ? (
                <div className="text-gray-500 italic p-12 text-center border-2 border-dashed border-dark-border rounded-xl">
                    No colleges found. Click &quot;Add New College&quot; to create one.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {colleges.map((college) => (
                        <Link
                            key={college.id}
                            href={`/admin/colleges/${college.id}`}
                            className="bg-dark-200 border border-dark-border rounded-xl p-6 flex items-center justify-between hover:border-primary-500/30 transition-colors group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-dark-300 rounded-lg flex items-center justify-center text-2xl">
                                    {college.logo ? <div className="relative w-full h-full"><Image src={college.logo} alt="" fill className="object-cover rounded-lg" /></div> : '🏛️'}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-white group-hover:text-primary-400 transition-colors">
                                        {college.name}
                                    </h3>
                                    <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                                        <span className="font-mono bg-dark-300 px-2 py-0.5 rounded text-xs">
                                            {college.code}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Layers size={14} /> {college._count?.branches || 0} Branches
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Users size={14} /> {college._count?.users || 0} Users
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={(e) => handleDelete(e, college.id, college.name)}
                                    className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                    title="Delete College"
                                >
                                    <Trash2 size={20} />
                                </button>
                                <button className="p-2 text-gray-500 group-hover:text-white hover:bg-white/10 rounded-lg transition-colors">
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

