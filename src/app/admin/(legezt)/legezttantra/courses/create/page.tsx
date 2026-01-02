'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { labApi } from '@/lib/api';

export default function CreateCoursePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        title: '',
        subjectCode: '',
        semester: 'Sem 1',
        year: '1st Year',
        description: '',
        image: ''
    });

    const handleSave = async () => {
        if (!form.title || !form.subjectCode) return alert('Title and Code are required');

        try {
            setLoading(true);
            await labApi.createCourse(form);
            router.push('/admin/legezttantra/courses');
        } catch (error) {
            console.error(error);
            alert('Failed to create course');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto pb-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                <Link href="/admin/legezttantra/courses" className="hover:text-blue-600">Courses</Link>
                <ChevronRight size={14} />
                <span className="font-semibold text-slate-800">New Course</span>
            </div>

            <h1 className="text-2xl font-bold text-slate-800 mb-8">Create New Lab Course</h1>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 space-y-6">

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Subject Code</label>
                    <input
                        type="text"
                        placeholder="e.g. CS201, U24IT3L1"
                        className="w-full border border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                        value={form.subjectCode}
                        onChange={(e) => setForm({ ...form, subjectCode: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Course Title</label>
                    <input
                        type="text"
                        placeholder="e.g. Data Structures using Python"
                        className="w-full border border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Year</label>
                        <select
                            className="w-full border border-slate-200 rounded-lg p-3 bg-white focus:outline-none"
                            value={form.year}
                            onChange={(e) => setForm({ ...form, year: e.target.value })}
                        >
                            <option>1st Year</option>
                            <option>2nd Year</option>
                            <option>3rd Year</option>
                            <option>4th Year</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Semester</label>
                        <select
                            className="w-full border border-slate-200 rounded-lg p-3 bg-white focus:outline-none"
                            value={form.semester}
                            onChange={(e) => setForm({ ...form, semester: e.target.value })}
                        >
                            <option>Sem 1</option>
                            <option>Sem 2</option>
                            <option>Sem 3</option>
                            <option>Sem 4</option>
                            <option>Sem 5</option>
                            <option>Sem 6</option>
                            <option>Sem 7</option>
                            <option>Sem 8</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Description (Optional)</label>
                    <textarea
                        className="w-full border border-slate-200 rounded-lg p-3 min-h-[100px] focus:outline-none"
                        placeholder="Brief description of the lab..."
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                    ></textarea>
                </div>

                <div className="pt-4 flex gap-3">
                    <Link href="/admin/legezttantra/courses" className="flex-1">
                        <button className="w-full py-3 bg-white border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50 transition-colors">
                            Cancel
                        </button>
                    </Link>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                        Create Course
                    </button>
                </div>
            </div>
        </div>
    );
}
