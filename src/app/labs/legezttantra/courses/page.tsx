'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Grid, List, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { labApi } from '@/lib/api';

import LeGeZtHeader from '@/components/labs/LeGeZtHeader';

export default function LeGeZtCoursesPage() {
    const router = useRouter();
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const res = await labApi.getCourses();
            setCourses(res.data);
        } catch (error) {
            console.error('Failed to fetch courses', error);
        } finally {
            setLoading(false);
        }
    };

    // Calendar Generation Logic for 2026
    const getDaysInMonth = (monthIndex: number, year: number) => {
        return new Date(year, monthIndex + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (monthIndex: number, year: number) => {
        return new Date(year, monthIndex, 1).getDay();
    };

    const calendarMonths = [
        { name: 'April', index: 3 },
        { name: 'May', index: 4 },
        { name: 'June', index: 5 },
        { name: 'July', index: 6 },
        { name: 'August', index: 7 },
        { name: 'September', index: 8 },
        { name: 'October', index: 9 },
        { name: 'November', index: 10 },
        { name: 'December', index: 11 }
    ];

    const YEAR = 2026;

    return (
        <div className="min-h-screen bg-white text-slate-800 font-sans">
            <LeGeZtHeader />

            {/* ================= THEMED INFO SECTION ================= */}
            <div className="relative bg-[#0f172a] text-white overflow-hidden pb-8 pt-20">
                {/* Background Pattern (Topographic / Wave) */}
                <div className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' viewBox='0 0 1000 1000' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='a' width='50' height='50' patternUnits='userSpaceOnUse'%3E%3Cpath d='M0 0h50v50H0z' fill='%23000' fill-opacity='0'/%3E%3Cpath d='M25 0l25 25-25 25-25-25z' fill='%23ffffff' fill-opacity='0.1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23a)'/%3E%3C/svg%3E"), linear-gradient(to bottom, #0f172a, #1e293b)`
                    }}>
                </div>

                {/* Stylish Title & Calendar Container */}
                <div className="relative z-10 px-4 md:px-8 mt-4">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-8">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-200 via-white to-blue-200 drop-shadow-lg">
                            COURSES
                        </span>
                    </h1>

                    {/* Calendar Strip - Horizontal Month Grids */}
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 overflow-x-auto hide-scrollbar">
                        <div className="flex justify-between min-w-[1000px] mb-4 gap-8">
                            {calendarMonths.map((month) => {
                                const daysInMonth = getDaysInMonth(month.index, YEAR);
                                const firstDay = getFirstDayOfMonth(month.index, YEAR);
                                const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

                                return (
                                    <div key={month.name} className="flex flex-col gap-2 w-32 shrink-0">
                                        <span className="text-xs font-semibold text-slate-400 text-center uppercase tracking-wider">{month.name}</span>
                                        {/* Real Calendar Grid (7 cols for days of week) */}
                                        <div className="grid grid-cols-7 gap-1 text-[8px] text-center text-slate-500 font-mono">
                                            {/* Header Days S M T W T F S - Optional, skipping for density matching screenshot */}

                                            {/* Empty padding for start of month */}
                                            {Array.from({ length: firstDay }).map((_, i) => (
                                                <div key={`empty-${i}`} className="aspect-square"></div>
                                            ))}

                                            {/* Days */}
                                            {days.map((day) => (
                                                <div
                                                    key={day}
                                                    className={`aspect-square flex items-center justify-center rounded-[2px] cursor-pointer transition-all hover:bg-indigo-500 hover:text-white hover:scale-125 hover:shadow-lg hover:z-10 relative
                                                        ${(month.index === 7 && day === 18) || (month.index === 3 && day === 28) ? 'bg-[#6366f1] text-white shadow-[0_0_8px_rgba(99,102,241,0.6)] font-bold ring-1 ring-[#818cf8]' :
                                                            'bg-[#1e293b]/50 hover:bg-[#334155]'}`}
                                                    title={`${month.name} ${day}, ${YEAR}`}
                                                >
                                                    {day}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Calendar Footer Controls */}
                        <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-white/5 mt-2">
                            <div className="flex items-center gap-4 font-medium">
                                <button className="flex items-center gap-1 hover:text-white transition-colors"><ChevronLeft size={14} /> Prev</button>
                                <button className="flex items-center gap-1 hover:text-white transition-colors">Next <ChevronRight size={14} /></button>
                            </div>
                            <div className="flex items-center gap-3">
                                <span>Less</span>
                                <div className="flex gap-1 items-center">
                                    <div className="w-3 h-3 bg-[#1e293b]/50 rounded-[2px]"></div>
                                    <div className="w-3 h-3 bg-[#6366f1]/40 rounded-[2px]"></div>
                                    <div className="w-3 h-3 bg-[#6366f1]/70 rounded-[2px]"></div>
                                    <div className="w-3 h-3 bg-[#6366f1] rounded-[2px]"></div>
                                </div>
                                <span>More</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ================= MAIN LIST CONTENT ================= */}
            <main className="px-4 md:px-8 max-w-[1600px] mx-auto -mt-6 relative z-20">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left Sidebar / Filter */}
                    <div className="w-full lg:w-72 shrink-0">
                        <div className="sticky top-6 space-y-4">
                            <div className="bg-[#4338ca] text-white p-4 rounded-lg flex items-center justify-between shadow-xl shadow-indigo-900/20 cursor-pointer transform hover:scale-[1.02] transition-transform">
                                <span className="font-bold text-sm flex items-center gap-2">
                                    <Eye size={18} /> Enrolled Courses
                                </span>
                                <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-bold">{courses.length}</span>
                            </div>

                            {/* Search Box */}
                            <div className="relative group">
                                <input
                                    type="text"
                                    placeholder="Type course name"
                                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
                                />
                                <Search className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                            </div>
                        </div>
                    </div>

                    {/* Right Course List */}
                    <div className="flex-1 mt-2">
                        {loading ? (
                            <div className="text-center py-12 text-slate-400">Loading courses...</div>
                        ) : courses.length > 0 ? (
                            <div className="grid gap-4">
                                {courses.map((course) => (
                                    <div
                                        key={course.id}
                                        onClick={() => router.push(`/labs/legezttantra/courses/${course.id}`)}
                                        className="bg-white border border-slate-100 rounded-lg p-5 flex items-center gap-5 hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-500/5 transition-all cursor-pointer group relative overflow-hidden"
                                    >

                                        {/* Left Accent Bar */}
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                        {/* Course Icon/Image */}
                                        <div className="w-14 h-14 bg-slate-50 flex items-center justify-center rounded-lg text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                                            <List size={28} />
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">
                                                {course.title}
                                            </h3>
                                            <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                                                <span className="font-medium bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                                                    {course.subjectCode}
                                                </span>
                                                {course.year && <span>• {course.year}</span>}
                                                {/* Random Progress for visual */}
                                                <span className="text-xs text-indigo-500 font-medium">• 0% Completed</span>
                                            </div>
                                        </div>

                                        {/* Action */}
                                        <button className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:translate-x-1">
                                            <ChevronRight size={20} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-slate-200 shadow-sm">
                                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                                    <List className="text-indigo-300" size={40} />
                                </div>
                                <h3 className="text-slate-800 font-bold text-lg">No courses found</h3>
                                <p className="text-slate-500 text-sm mt-2 max-w-sm text-center">
                                    You are not enrolled in any lab courses yet. Contact your administrator or check back later.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
