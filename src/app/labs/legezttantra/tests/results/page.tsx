'use client';

import { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Hourglass } from 'lucide-react';
import LeGeZtHeader from '@/components/labs/LeGeZtHeader';

export default function SeeResultsPage() {
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

    // Calendar Helpers
    const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    const currentMonth = 'January 2026';
    const calendarDays = Array.from({ length: 35 }, (_, i) => {
        const d = i - 3; // Offset to start month correctly for Jan 2026 (approx for visual)
        return d > 0 && d <= 31 ? d : null;
    });

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
            <LeGeZtHeader />

            <div className="flex flex-1 pt-16 h-full">
                {/* ================= SIDEBAR (Search By Date) ================= */}
                <aside className="w-72 bg-white border-r border-slate-200 hidden md:flex flex-col shrink-0 h-[calc(100vh-64px)] fixed left-0 top-16">
                    <div className="bg-[#2c3e50] text-white p-4 font-medium text-lg">
                        Search By Date
                    </div>

                    <div className="p-4">
                        <div className="mb-4 flex items-center justify-between text-sm font-bold text-slate-700">
                            <button className="p-1 hover:bg-slate-100 rounded"><ChevronLeft size={16} /></button>
                            <span>{currentMonth}</span>
                            <button className="p-1 hover:bg-slate-100 rounded"><ChevronRight size={16} /></button>
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 text-center mb-2">
                            {days.map(d => <div key={d} className="text-xs font-bold text-slate-500 py-1">{d}</div>)}
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-center">
                            {calendarDays.map((d, i) => (
                                <div key={i} className="aspect-square flex items-center justify-center text-sm">
                                    {d ? (
                                        <button
                                            onClick={() => setSelectedDate(d ? new Date(2026, 0, d) : null)}
                                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors
                                                ${d === 1 ? 'bg-[#1e40af] text-white font-bold' : 'text-slate-600 hover:bg-slate-100'}
                                            `}
                                        >
                                            {d}
                                        </button>
                                    ) : (
                                        <span className="text-slate-200 text-xs">{i < 5 ? 28 + i : i - 34}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* ================= MAIN CONTENT ================= */}
                <main className="flex-1 md:ml-72 p-6 md:p-8">

                    {/* Page Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-200 pb-4 mb-6 gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">Recent Tests (01 Nov - 01 Jan)</h1>
                        </div>
                        <div className="text-xs text-slate-500 font-medium">
                            01 Jan 2026 02:00:22 India Standard Time
                        </div>
                    </div>

                    <div className="mb-6 text-sm text-cyan-500 text-center">
                        You can see older tests by selecting the date corresponding to their start time in the calendar
                    </div>

                    {/* Results Grid - EMPTY STATE as requested */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {/* 
                            User requested NO DUMMY DETAILS. 
                            Keeping the structure ready for real data mapping.
                         */}

                        {/* Empty State Message */}
                        <div className="col-span-1 xl:col-span-2 flex flex-col items-center justify-center py-20 bg-white border border-dashed border-slate-300 rounded-lg">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                <Clock className="text-slate-300" size={32} />
                            </div>
                            <h3 className="text-slate-600 font-medium">No test results found</h3>
                            <p className="text-slate-400 text-sm mt-1">Select a different date from the calendar to view past results.</p>
                        </div>
                    </div>

                </main>
            </div>
        </div>
    );
}
