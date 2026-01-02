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
                    <h1 className="text-3xl font-bold text-white mb-2">Internal Academy</h1>
                    <p className="text-gray-400">Manage premium courses and certifications</p>
                </div>

                <button
                    onClick={() => setShowCreate(true)}
                    className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all hover:scale-105"
                >
                    <Plus size={18} />
                    New Course
                </button>
            </div>

            {showCreate && (
                <form onSubmit={handleCreate} className="card p-6 mb-8 border-primary-500/20 bg-primary-500/5 max-w-2xl">
                    <h2 className="text-lg font-bold mb-4">Launch New Course</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-semibold text-gray-400 uppercase mb-2 block">Course Title</label>
                            <input
                                required
                                value={newCourse.title}
                                onChange={e => setNewCourse({ ...newCourse, title: e.target.value })}
                                className="w-full bg-dark-200 border border-dark-border rounded-lg py-2 px-4 outline-none focus:border-primary-500"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-400 uppercase mb-2 block">Description</label>
                            <textarea
                                required
                                value={newCourse.description}
                                onChange={e => setNewCourse({ ...newCourse, description: e.target.value })}
                                className="w-full bg-dark-200 border border-dark-border rounded-lg py-2 px-4 outline-none focus:border-primary-500 min-h-[100px]"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-400 uppercase mb-2 block">Pricing</label>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setNewCourse({ ...newCourse, isPaid: false })}
                                        className={`flex-1 py-2 rounded-lg text-sm border ${!newCourse.isPaid ? 'bg-primary-500/10 border-primary-500 text-primary-400' : 'bg-dark-200 border-dark-border text-gray-500'}`}
                                    >
                                        Free
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setNewCourse({ ...newCourse, isPaid: true })}
                                        className={`flex-1 py-2 rounded-lg text-sm border ${newCourse.isPaid ? 'bg-primary-500/10 border-primary-500 text-primary-400' : 'bg-dark-200 border-dark-border text-gray-500'}`}
                                    >
                                        Paid
                                    </button>
                                </div>
                            </div>
                            {newCourse.isPaid && (
                                <div>
                                    <label className="text-xs font-semibold text-gray-400 uppercase mb-2 block">Price (INR)</label>
                                    <input
                                        type="number"
                                        value={newCourse.price}
                                        onChange={e => setNewCourse({ ...newCourse, price: parseInt(e.target.value) })}
                                        className="w-full bg-dark-200 border border-dark-border rounded-lg py-2 px-4 outline-none focus:border-primary-500"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-8">
                        <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
                        <button type="submit" className="btn-primary px-6 py-2 rounded-lg text-sm font-bold">Launch Course</button>
                    </div>
                </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    Array(3).fill(0).map((_, i) => <div key={i} className="skeleton h-48 rounded-2xl" />)
                ) : courses.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-gray-500 card border-dashed">
                        No courses launched yet
                    </div>
                ) : (
                    courses.map((course) => (
                        <div key={course.id} className="card overflow-hidden group hover:border-primary-500/30 transition-all flex flex-col">
                            <div className="aspect-video bg-gradient-to-br from-indigo-500 to-purple-600 relative">
                                {course.thumbnailUrl ? (
                                    <img src={course.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <GraduationCap size={48} className="text-white/20" />
                                    </div>
                                )}
                                <div className={`absolute top-3 right-3 px-2 py-1 rounded-md text-[10px] font-bold uppercase ${course.isPaid ? 'bg-yellow-500 text-black' : 'bg-green-500 text-white'}`}>
                                    {course.isPaid ? `₹${course.price}` : 'FREE'}
                                </div>
                            </div>
                            <div className="p-5 flex-1 flex flex-col">
                                <h3 className="font-bold text-white mb-2">{course.title}</h3>
                                <p className="text-xs text-gray-500 line-clamp-2 mb-4">{course.description}</p>

                                <div className="mt-auto flex items-center justify-between">
                                    <div className="flex items-center gap-4 text-xs text-gray-400">
                                        <span className="flex items-center gap-1.5"><Users size={14} /> {course.enrollmentCount}</span>
                                        <span className="flex items-center gap-1.5 text-green-400"><CheckCircle2 size={14} /> Active</span>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(course.id)}
                                        className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
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
