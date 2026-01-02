'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, ArrowLeft, Folder, Code, ChevronDown, Play, FileText, CheckCircle2, Clock, Lock } from 'lucide-react';
import { labApi } from '@/lib/api';
import LeGeZtHeader from '@/components/labs/LeGeZtHeader';

export default function StudentCourseContentPage({ params }: { params: { courseId: string } }) {
    const courseId = params.courseId;
    const router = useRouter();

    const [course, setCourse] = useState<any>(null);
    const [units, setUnits] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>({});
    const [activeUnitId, setActiveUnitId] = useState<string | null>(null);

    useEffect(() => {
        if (!courseId) return;
        loadData();
    }, [courseId]);

    useEffect(() => {
        if (units.length > 0 && !activeUnitId) {
            setActiveUnitId(units[0].id);
        }
    }, [units, activeUnitId]);

    const activeUnit = units.find(u => u.id === activeUnitId) || units[0];

    const loadData = async () => {
        try {
            setLoading(true);
            const [cRes, uRes] = await Promise.all([
                labApi.getCourse(courseId),
                labApi.getCourseContent(courseId)
            ]);
            setCourse(cRes.data);
            setUnits(uRes.data);

            // Auto-expand all units by default for better visibility
            const expanded: Record<string, boolean> = {};
            uRes.data.forEach((u: any) => expanded[u.id] = true);
            setExpandedUnits(expanded);

        } catch (error) {
            console.error('Failed to load course content', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleUnit = (unitId: string) => {
        setExpandedUnits(prev => ({
            ...prev,
            [unitId]: !prev[unitId]
        }));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
                <LeGeZtHeader />
                <div className="flex-1 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                        <p className="text-slate-500 font-medium animate-pulse">Loading course content...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
                <LeGeZtHeader />
                <div className="flex-1 flex items-center justify-center p-8">
                    <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md">
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Folder size={32} />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 mb-2">Course Not Found</h2>
                        <p className="text-slate-500 mb-6">The course you are looking for does not exist or you do not have permission to view it.</p>
                        <Link href="/labs/legezttantra/courses">
                            <button className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-6 py-2.5 rounded-lg font-medium transition-colors">
                                Back to Courses
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#f8fafc] font-sans overflow-hidden">
            {/* LEFT SIDEBAR - COURSE TREE */}
            <aside className="w-[320px] bg-white border-r border-slate-200 flex flex-col shrink-0 z-20">
                {/* Sidebar Header */}
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <div className="font-bold text-slate-700 truncate" title={course?.title}>
                        {course?.title || 'Loading...'}
                    </div>
                    <Link href="/labs/legezttantra/courses" className="text-slate-400 hover:text-slate-600">
                        <ArrowLeft size={18} />
                    </Link>
                </div>

                {/* Search & Stats */}
                <div className="p-3">
                    <div className="relative mb-3">
                        <input
                            type="text"
                            placeholder="Search course..."
                            className="w-full text-xs bg-slate-100 border-none rounded-md py-2 pl-8 pr-3 focus:ring-1 focus:ring-indigo-500 text-slate-700"
                        />
                        <div className="absolute left-2.5 top-2 text-slate-400">
                            <span className="text-xs">🔍</span>
                        </div>
                    </div>
                </div>

                {/* Tree Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="p-4 text-center text-xs text-slate-400">Loading structure...</div>
                    ) : (
                        <div className="space-y-1">
                            {units.map((unit, index) => {
                                const isActive = activeUnitId === unit.id;
                                return (
                                    <div key={unit.id}>
                                        {/* Unit Header in Sidebar */}
                                        <button
                                            onClick={() => setActiveUnitId(unit.id)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-l-4 ${isActive
                                                    ? 'bg-indigo-50 border-indigo-600 text-indigo-700'
                                                    : 'bg-transparent border-transparent text-slate-600 hover:bg-slate-50'
                                                }`}
                                        >
                                            <div className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded ${isActive ? 'bg-indigo-200/50' : 'bg-slate-200'}`}>
                                                {index + 1}
                                            </div>
                                            <span className="text-xs font-semibold line-clamp-2 leading-snug">
                                                {unit.title}
                                            </span>
                                            {isActive && <ChevronDown size={14} className="ml-auto shrink-0" />}
                                        </button>

                                        {/* Nested Experiments (Only visible if active for now, or always? Screenshot implies accordion) */}
                                        {isActive && (
                                            <div className="bg-slate-50/50 py-1">
                                                {unit.experiments?.map((exp: any, i: number) => (
                                                    <Link
                                                        key={exp.id}
                                                        href={`/labs/legezttantra/grid/${exp.id}`}
                                                        className="flex items-center gap-3 px-4 py-2 pl-12 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/30 text-xs transition-colors"
                                                    >
                                                        <Code size={12} />
                                                        <span className="truncate">{i + 1}. {exp.title}</span>
                                                    </Link>
                                                ))}
                                                {(!unit.experiments || unit.experiments.length === 0) && (
                                                    <div className="pl-12 py-2 text-[10px] text-slate-400 italic">No experiments</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* User Profile / Bottom Bar */}
                <div className="p-3 border-t border-slate-100 bg-slate-50 text-xs text-slate-500 flex justify-between items-center">
                    <span>{units.reduce((acc, u) => acc + (u.experiments?.length || 0), 0)} Experiments</span>
                    <span className="font-semibold text-indigo-600">0% Done</span>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 overflow-y-auto bg-[#f8fafc] w-full">
                <LeGeZtHeader />

                {!activeUnit ? (
                    <div className="p-10 text-center text-slate-400 mt-20">
                        <p>Select a unit from the sidebar to view details.</p>
                    </div>
                ) : (
                    <div className="max-w-5xl mx-auto p-6 md:p-10">
                        {/* Hero Section for Unit */}
                        <div className="bg-indigo-600 text-white p-8 rounded-2xl shadow-lg shadow-indigo-200 mb-10 relative overflow-hidden">
                            <div className="relative z-10">
                                <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold mb-3 backdrop-blur-sm border border-white/10">
                                    Current Unit
                                </span>
                                <h1 className="text-3xl font-bold mb-2">{activeUnit.title}</h1>
                                <p className="text-indigo-100/80 text-sm max-w-2xl">
                                    Manage your learning progress for this module. Complete all experiments to unlock the next unit.
                                </p>
                            </div>
                            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-10 translate-y-10">
                                <Folder size={200} />
                            </div>
                        </div>

                        {/* About This Unit */}
                        <div className="mb-8">
                            <h2 className="text-lg font-bold text-slate-800 mb-2">About this unit</h2>
                            <p className="text-sm text-slate-500 leading-relaxed">
                                {activeUnit.title} focuses on core concepts. (Description placeholder)
                            </p>
                        </div>

                        {/* Content List */}
                        <div className="space-y-4">
                            {activeUnit.experiments?.map((exp: any, index: number) => (
                                <Link key={exp.id} href={`/labs/legezttantra/grid/${exp.id}`}>
                                    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-md transition-all group cursor-pointer flex items-center gap-5">
                                        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 flex items-center justify-center transition-colors">
                                            <Code size={20} />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">
                                                {exp.title}
                                            </h3>
                                            <p className="text-xs text-slate-500 mt-1">
                                                Programming Lab • {index + 1}
                                            </p>
                                        </div>
                                        <div className="px-4 py-2 rounded-lg bg-slate-50 text-slate-500 text-xs font-semibold group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                            Start
                                        </div>
                                    </div>
                                </Link>
                            ))}
                            {(!activeUnit.experiments || activeUnit.experiments.length === 0) && (
                                <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
                                    No experiments added to this unit yet.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
