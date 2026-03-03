'use client';

import { useState, useEffect } from 'react';
import {
    GraduationCap,
    Plus,
    Search,
    Users,
    Trash2,
    Loader2,
    DollarSign,
    CheckCircle2
} from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface Course {
    id: string;
    title: string;
    description: string;
    thumbnailUrl: string;
    price: number;
    isPaid: boolean;
    enrollmentCount: number;
    createdAt: string;
}

export default function AdminCoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showCreate, setShowCreate] = useState(false);
    const [newCourse, setNewCourse] = useState({
        title: '',
        description: '',
        price: 0,
        isPaid: false,
        thumbnailUrl: ''
    });

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const res = await api.get('/courses', { params: { search } });
            setCourses(res.data.data);
        } catch (error) {
            toast.error('Failed to load courses');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, [search]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/courses', newCourse);
            toast.success('Course created successfully');
            setShowCreate(false);
            setNewCourse({ title: '', description: '', price: 0, isPaid: false, thumbnailUrl: '' });
            fetchCourses();
        } catch (error) {
            toast.error('Failed to create course');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this course?')) return;
        try {
            await api.delete(`/courses/${id}`);
            toast.success('Course deleted');
            setCourses(courses.filter(c => c.id !== id));
        } catch (error) {
            toast.error('Failed to delete course');
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-display font-bold text-white mb-2 drop-shadow-md">Internal Academy</h1>
                    <p className="text-silver-400">Manage premium courses and certifications</p>
                </div>

                <button
                    onClick={() => setShowCreate(true)}
                    className="bg-silver-gradient text-dark-android font-bold flex items-center gap-2 px-5 py-2.5 rounded-xl shadow-3d hover:shadow-3d-hover hover:-translate-y-0.5 border border-silver-light transition-all overflow-hidden relative group"
                >
                    <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/10 rounded-t-xl" />
                    <Plus size={18} className="relative z-10" />
                    <span className="relative z-10">New Course</span>
                </button>
            </div>

            {showCreate && (
                <form onSubmit={handleCreate} className="w-full max-w-2xl p-8 rounded-3xl bg-dark-surface shadow-android-card border border-silver-dark/20 relative overflow-hidden mb-8">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-silver-metallic to-transparent opacity-30" />
                    <h2 className="text-xl font-display font-bold text-white mb-6 drop-shadow-md relative z-10">Launch New Course</h2>
                    <div className="space-y-6 relative z-10">
                        <div>
                            <label className="text-[10px] font-bold text-silver-600 uppercase tracking-widest mb-2 block ml-2">Course Title</label>
                            <input
                                required
                                value={newCourse.title}
                                onChange={e => setNewCourse({ ...newCourse, title: e.target.value })}
                                className="w-full bg-dark-android border border-silver-800 rounded-xl py-3 px-4 outline-none focus:border-silver-500 text-white font-bold shadow-inner-metallic placeholder-silver-600 transition-all"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-silver-600 uppercase tracking-widest mb-2 block ml-2">Description</label>
                            <textarea
                                required
                                value={newCourse.description}
                                onChange={e => setNewCourse({ ...newCourse, description: e.target.value })}
                                className="w-full bg-dark-android border border-silver-800 rounded-xl py-3 px-4 outline-none focus:border-silver-500 text-white shadow-inner-metallic placeholder-silver-600 min-h-[100px] transition-all resize-y"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="text-[10px] font-bold text-silver-600 uppercase tracking-widest mb-2 block ml-2">Pricing</label>
                                <div className="flex items-center gap-2 p-1 bg-dark-android rounded-xl border border-silver-dark/20 shadow-inner">
                                    <button
                                        type="button"
                                        onClick={() => setNewCourse({ ...newCourse, isPaid: false })}
                                        className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all shadow-inner ${!newCourse.isPaid ? 'bg-dark-surface border border-silver-dark/30 text-white shadow-android-card' : 'text-silver-500 hover:text-silver-300'}`}
                                    >
                                        Free
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setNewCourse({ ...newCourse, isPaid: true })}
                                        className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all shadow-inner ${newCourse.isPaid ? 'bg-dark-surface border border-silver-dark/30 text-white shadow-android-card' : 'text-silver-500 hover:text-silver-300'}`}
                                    >
                                        Paid
                                    </button>
                                </div>
                            </div>
                            {newCourse.isPaid && (
                                <div>
                                    <label className="text-[10px] font-bold text-silver-600 uppercase tracking-widest mb-2 block ml-2">Price (INR)</label>
                                    <input
                                        type="number"
                                        value={newCourse.price}
                                        onChange={e => setNewCourse({ ...newCourse, price: parseInt(e.target.value) })}
                                        className="w-full bg-dark-android border border-silver-800 rounded-xl py-3 px-4 outline-none focus:border-silver-500 text-white font-bold shadow-inner-metallic transition-all"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-8 relative z-10">
                        <button type="button" onClick={() => setShowCreate(false)} className="px-6 py-2.5 text-sm font-bold text-silver-400 hover:text-white transition-colors">Cancel</button>
                        <button type="submit" className="px-6 py-2.5 bg-silver-gradient text-dark-android rounded-xl font-bold shadow-3d hover:shadow-3d-hover hover:-translate-y-0.5 border border-silver-light transition-all">Launch Course</button>
                    </div>
                </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    Array(3).fill(0).map((_, i) => <div key={i} className="animate-pulse bg-dark-surface border border-silver-dark/10 shadow-android-card h-48 rounded-3xl" />)
                ) : courses.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-silver-500 border border-dashed border-silver-dark/20 rounded-3xl bg-dark-android shadow-inner-metallic font-bold">
                        No courses launched yet
                    </div>
                ) : (
                    courses.map((course) => (
                        <div key={course.id} className="rounded-3xl bg-dark-surface shadow-android-card border border-silver-dark/10 overflow-hidden group hover:border-silver-metallic/40 transition-all flex flex-col relative">
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-silver-metallic to-transparent opacity-30 z-20" />
                            <div className="aspect-video bg-dark-android relative overflow-hidden border-b border-white/5">
                                <div className="absolute inset-0 bg-silver-gradient opacity-10 group-hover:opacity-20 transition-opacity z-10" />
                                {course.thumbnailUrl ? (
                                    <img src={course.thumbnailUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <GraduationCap size={48} className="text-silver-600 drop-shadow-md" />
                                    </div>
                                )}
                                <div className={`absolute top-3 right-3 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest z-20 shadow-md backdrop-blur-md ${course.isPaid ? 'bg-yellow-500/90 text-black border border-yellow-400' : 'bg-green-500/90 text-white border border-green-400'}`}>
                                    {course.isPaid ? `₹${course.price}` : 'FREE'}
                                </div>
                            </div>
                            <div className="p-6 flex-1 flex flex-col relative z-10">
                                <h3 className="font-display font-bold text-white mb-2 text-lg drop-shadow-md group-hover:text-silver-300 transition-colors">{course.title}</h3>
                                <p className="text-sm text-silver-400 line-clamp-2 mb-6 font-medium">{course.description}</p>

                                <div className="mt-auto flex items-center justify-between pt-4 border-t border-silver-dark/10">
                                    <div className="flex items-center gap-4 text-xs font-bold text-silver-500">
                                        <span className="flex items-center gap-1.5 bg-dark-android px-2 py-1 rounded-md border border-silver-dark/20 shadow-inner"><Users size={14} className="text-silver-400" /> {course.enrollmentCount}</span>
                                        <span className="flex items-center gap-1.5 text-green-400 bg-green-500/10 px-2 py-1 rounded-md border border-green-500/20"><CheckCircle2 size={14} /> Active</span>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(course.id)}
                                        className="p-2 text-silver-500 hover:text-red-400 bg-dark-android hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-xl shadow-inner transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
