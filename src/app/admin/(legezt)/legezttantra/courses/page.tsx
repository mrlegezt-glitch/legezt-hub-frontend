'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, MoreVertical, Edit, Trash2, FileText, Code, Loader2 } from 'lucide-react';
import { labApi } from '@/lib/api';

export default function CourseManagerPage() {
    const router = useRouter();
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const res = await labApi.getCourses();
            setCourses(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this course?')) return;
        try {
            await labApi.deleteCourse(id);
            fetchCourses(); // Refresh
        } catch (error) {
            alert('Failed to delete course');
        }
    };

    const filteredCourses = courses.filter(c =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.subjectCode.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-end gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">Course Repository</h1>
                    <p className="text-gray-500 text-sm font-medium">Manage and organize laboratory curricula and experiments.</p>
                </div>
                <Link href="/admin/legezttantra/courses/create">
                    <button className="btn-primary flex items-center gap-2 shadow-xl shadow-primary-500/20 active:scale-95">
                        <Plus size={20} />
                        CREATE NEW LAB
                    </button>
                </Link>
            </div>

            {/* Filters & Search */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-8 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary-400 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search courses by title or subject code..."
                        className="w-full pl-12 pr-4 py-3.5 bg-dark-200 border border-dark-border rounded-2xl focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all text-white placeholder:text-gray-600"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="md:col-span-2">
                    <select className="w-full px-4 py-3.5 bg-dark-200 border border-dark-border rounded-2xl text-gray-400 focus:outline-none focus:border-primary-500 transition-all cursor-pointer">
                        <option>Departments</option>
                        <option>CSE / IT</option>
                        <option>ECE / EE</option>
                    </select>
                </div>
                <div className="md:col-span-2">
                    <select className="w-full px-4 py-3.5 bg-dark-200 border border-dark-border rounded-2xl text-gray-400 focus:outline-none focus:border-primary-500 transition-all cursor-pointer">
                        <option>Regulations</option>
                        <option>R23 / R20</option>
                        <option>R19 / R16</option>
                    </select>
                </div>
            </div>

            {/* Courses Table */}
            <div className="bg-dark-200 border border-dark-border rounded-3xl overflow-hidden shadow-2xl relative">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-dark-300/50 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] border-b border-dark-border">
                            <th className="px-8 py-5">Laboratory Course</th>
                            <th className="px-8 py-5">Code</th>
                            <th className="px-8 py-5">Phase</th>
                            <th className="px-8 py-5">Assets</th>
                            <th className="px-8 py-5 text-right font-bold text-primary-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-border/50">
                        {loading ? (
                            <tr><td colSpan={5} className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-primary-500" size={32} /></td></tr>
                        ) : filteredCourses.length === 0 ? (
                            <tr><td colSpan={5} className="py-20 text-center text-gray-600 font-medium">No records found matching your criteria.</td></tr>
                        ) : (
                            filteredCourses.map((course) => (
                                <tr
                                    key={course.id}
                                    onClick={() => router.push(`/admin/legezttantra/courses/${course.id}`)}
                                    className="hover:bg-primary-500/[0.02] transition-colors group cursor-pointer"
                                >
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 rounded-2xl bg-primary-600/10 border border-primary-500/20 text-primary-400 flex items-center justify-center shadow-inner">
                                                <Code size={24} />
                                            </div>
                                            <div className="space-y-0.5">
                                                <div className="font-bold text-gray-100 group-hover:text-primary-400 transition-colors uppercase tracking-tight">{course.title}</div>
                                                <div className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">{course.regulation} • ACADEMIC YEAR {course.year}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-sm font-mono text-gray-500 group-hover:text-gray-300 transition-colors">{course.subjectCode}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="px-3 py-1 bg-dark-300 border border-dark-border text-gray-400 rounded-full text-[10px] font-bold uppercase tracking-widest">
                                            {course.semester || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2 text-gray-500 font-bold text-sm">
                                            <FileText size={16} className="text-primary-600" />
                                            {course._count?.experiments || 0} Labs
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                            <Link href={`/admin/legezttantra/courses/${course.id}`} onClick={(e) => e.stopPropagation()}>
                                                <button className="p-2.5 text-gray-500 hover:text-primary-400 hover:bg-primary-500/10 rounded-xl transition-all" title="Manage Content">
                                                    <Edit size={20} />
                                                </button>
                                            </Link>
                                            <button
                                                onClick={(e) => handleDelete(course.id, e)}
                                                className="p-2.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                                                title="Delete Course"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
