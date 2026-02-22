'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, ArrowLeft, Folder, Code, ChevronDown, Play, FileText, CheckCircle2, Clock, Lock, Share2 } from 'lucide-react';
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

    const [showMobileSidebar, setShowMobileSidebar] = useState(false);

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

    const handleShareCourse = () => {
        if (!course) return;
        const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/labs/legezttantra/courses/${courseId}` : '';
        const message = `Check out this course on LeGeZt Hub: ${course.title}. Learn more at: ${shareUrl}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
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
                    <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md w-full">
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Folder size={32} />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 mb-2">Course Not Found</h2>
                        <p className="text-slate-500 mb-6 text-sm">The course you are looking for does not exist or you do not have permission to view it.</p>
                        <Link href="/labs/legezttantra/courses">
                            <button className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-6 py-2.5 rounded-lg font-medium transition-colors w-full">
                                Back to Courses
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col md:flex-row h-screen bg-[#f8fafc] font-sans overflow-hidden">
            {/* LEFT SIDEBAR - COURSE TREE */}
            <aside className={`w-full md:w-[320px] bg-white border-r border-slate-200 flex-col shrink-0 z-20 ${showMobileSidebar ? 'flex h-full fixed md:relative' : 'hidden md:flex'}`}>
                {/* Sidebar Header */}
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <div className="font-bold text-slate-700 truncate" title={course?.title}>
                        {course?.title || 'Loading...'}
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={() => setShowMobileSidebar(false)} className="md:hidden text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg">
                            Close
                        </button>
                        <button onClick={handleShareCourse} className="text-slate-400 hover:text-green-500 transition-colors" title="Share Course">
                            <Share2 size={16} />
                        </button>
                        <Link href="/labs/legezttantra/courses" className="text-slate-400 hover:text-slate-600 hidden md:block" title="Back to Courses">
                            <ArrowLeft size={18} />
                        </Link>
                    </div>
                </div>

                {/* Search & Stats */}
                <div className="p-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search course..."
                            className="w-full text-sm bg-slate-100 border-none rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-indigo-500/50 text-slate-700 outline-none transition-all"
                        />
                        <div className="absolute left-3.5 top-3.5 text-slate-400">
                            <span className="text-sm">🔍</span>
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
                                            onClick={() => { setActiveUnitId(unit.id); setShowMobileSidebar(false); }}
                                            className={`w-full flex items-center gap-3 px-5 py-3.5 text-left transition-colors border-l-4 ${isActive
                                                ? 'bg-indigo-50 border-indigo-600 text-indigo-700'
                                                : 'bg-transparent border-transparent text-slate-600 hover:bg-slate-50'
                                                }`}
                                        >
                                            <div className={`shrink-0 text-[10px] font-bold px-2 py-1 rounded-md ${isActive ? 'bg-indigo-200/50 text-indigo-800' : 'bg-slate-200 text-slate-600'}`}>
                                                {index + 1}
                                            </div>
                                            <span className="text-sm font-semibold line-clamp-2 leading-snug">
                                                {unit.title}
                                            </span>
                                            {isActive && <ChevronDown size={14} className="ml-auto shrink-0" />}
                                        </button>

                                        {/* Nested Experiments */}
                                        {isActive && (
                                            <div className="bg-slate-50/50 py-2">
                                                {unit.experiments?.map((exp: any, i: number) => (
                                                    <Link
                                                        key={exp.id}
                                                        href={`/labs/legezttantra/grid/${exp.id}`}
                                                        className="flex items-center gap-3 px-5 py-2.5 pl-14 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50 text-xs font-medium transition-colors"
                                                    >
                                                        <Code size={14} className="opacity-50" />
                                                        <span className="truncate">{i + 1}. {exp.title}</span>
                                                    </Link>
                                                ))}
                                                {(!unit.experiments || unit.experiments.length === 0) && (
                                                    <div className="pl-14 py-3 text-[11px] text-slate-400 italic">No experiments</div>
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
                <div className="p-4 border-t border-slate-100 bg-slate-50 text-xs text-slate-500 flex justify-between items-center rounded-b-2xl md:rounded-b-none">
                    <span className="font-medium">{units.reduce((acc, u) => acc + (u.experiments?.length || 0), 0)} Experiments</span>
                    <span className="font-bold text-indigo-600">0% Done</span>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className={`flex-1 overflow-y-auto bg-[#f8fafc] w-full ${showMobileSidebar ? 'hidden md:block' : 'block'}`}>
                <LeGeZtHeader />

                {/* Mobile Toggle Bar */}
                <div className="md:hidden bg-white px-5 py-4 border-b border-slate-200 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                    <div className="flex items-center gap-3">
                        <Link href="/labs/legezttantra/courses" className="p-2 -ml-2 text-slate-400 hover:text-slate-800 bg-slate-50 rounded-lg">
                            <ArrowLeft size={16} />
                        </Link>
                        <span className="font-extrabold text-slate-800 text-sm truncate max-w-[180px]">{course?.title}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={handleShareCourse} className="p-1.5 text-slate-400 hover:text-green-500 bg-slate-50 rounded-lg border border-slate-100 shadow-sm" title="Share Course">
                            <Share2 size={16} />
                        </button>
                        <button onClick={() => setShowMobileSidebar(true)} className="text-indigo-600 font-bold text-xs bg-indigo-50 px-4 py-2 rounded-lg shadow-sm border border-indigo-100">
                            Syllabus
                        </button>
                    </div>
                </div>

                {!activeUnit ? (
                    <div className="p-10 text-center text-slate-400 mt-20">
                        <p>Select a unit from the sidebar to view details.</p>
                    </div>
                ) : (
                    <div className="max-w-5xl mx-auto p-5 md:p-10 pb-20">
                        {/* Hero Section for Unit */}
                        <div className="bg-indigo-600 text-white p-6 md:p-10 rounded-3xl shadow-xl shadow-indigo-600/20 mb-8 md:mb-12 relative overflow-hidden">
                            <div className="relative z-10">
                                <span className="inline-block px-4 py-1.5 bg-white/20 rounded-full text-[10px] uppercase tracking-widest font-black mb-4 backdrop-blur-md border border-white/10 shadow-inner">
                                    Current Module
                                </span>
                                <h1 className="text-2xl md:text-4xl font-black mb-3 md:mb-4 tracking-tight leading-tight">{activeUnit.title}</h1>
                                <p className="text-indigo-100/90 text-sm md:text-base max-w-2xl leading-relaxed font-medium">
                                    Manage your learning progress for this module. Complete all experiments to unlock the next unit in the curriculum.
                                </p>
                            </div>
                            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-10 translate-y-10">
                                <Folder size={240} strokeWidth={1.5} />
                            </div>
                        </div>

                        {/* Content List */}
                        <div className="space-y-4">
                            {activeUnit.experiments?.map((exp: any, index: number) => (
                                <Link key={exp.id} href={`/labs/legezttantra/grid/${exp.id}`} className="block">
                                    <div className="bg-white border text-left border-slate-200 rounded-2xl p-4 md:p-6 hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-50/50 transition-all duration-300 group flex items-start md:items-center gap-4 md:gap-6">
                                        <div className="w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 flex items-center justify-center transition-colors border border-slate-100 group-hover:border-indigo-100">
                                            <Code size={24} strokeWidth={2} />
                                        </div>
                                        <div className="flex-1 min-w-0 pt-1 md:pt-0">
                                            <h3 className="text-base md:text-lg font-bold text-slate-800 group-hover:text-indigo-700 transition-colors truncate mb-1">
                                                {exp.title}
                                            </h3>
                                            <p className="text-[11px] md:text-sm text-slate-500 font-medium">
                                                Programming Lab • Task {index + 1}
                                            </p>
                                        </div>
                                        <div className="hidden md:flex px-6 py-2.5 rounded-xl bg-slate-50 text-slate-600 text-sm font-bold group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                                            Start Session
                                        </div>
                                        <div className="md:hidden mt-2 shrink-0">
                                            <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center transition-colors shadow-sm">
                                                <ChevronRight size={16} />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                            {(!activeUnit.experiments || activeUnit.experiments.length === 0) && (
                                <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-200 shadow-sm">
                                        <Folder size={24} className="text-slate-400" />
                                    </div>
                                    <h3 className="text-sm font-bold text-slate-700 mb-1">No Experiments Yet</h3>
                                    <p className="text-xs text-slate-500">The curriculum architect hasn't added content to this module.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
