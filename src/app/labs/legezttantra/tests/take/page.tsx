'use client';

import { useState } from 'react';
import { Search, FileText, CheckSquare, Calendar } from 'lucide-react';
import LeGeZtHeader from '@/components/labs/LeGeZtHeader';

export default function TakeTestPage() {
    const [activeTab, setActiveTab] = useState('upcoming');
    const [dateRange, setDateRange] = useState('January 1, 2026 to January 8, 2026');

    return (
        <div className="min-h-screen bg-white text-slate-800 font-sans flex flex-col">
            <LeGeZtHeader />

            <div className="flex flex-1 pt-16 h-full">
                {/* ================= SIDEBAR ================= */}
                <aside className="w-64 bg-white border-r border-slate-200 hidden md:block shrink-0 h-[calc(100vh-64px)] fixed left-0 top-16 overflow-y-auto pt-8 px-4">
                    <nav className="space-y-2">
                        <button
                            onClick={() => setActiveTab('upcoming')}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors ${activeTab === 'upcoming'
                                    ? 'bg-[#0f172a] text-white shadow-md'
                                    : 'text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            <FileText size={18} />
                            Ongoing & Upcoming
                        </button>

                        <button
                            onClick={() => setActiveTab('completed')}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors ${activeTab === 'completed'
                                    ? 'bg-[#0f172a] text-white shadow-md'
                                    : 'text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            <CheckSquare size={18} />
                            Completed
                        </button>
                    </nav>
                </aside>

                {/* ================= MAIN CONTENT ================= */}
                <main className="flex-1 md:ml-64 p-6 md:p-10 bg-white">

                    {/* Ongoing Assessments Section */}
                    <div className="mb-10">
                        <h2 className="text-[#1e3a8a] text-lg font-bold mb-4">Ongoing assessments</h2>
                        <div className="bg-[#eff6ff] text-[#1e40af] px-6 py-4 rounded-md text-sm border border-blue-100 flex items-center">
                            No ongoing assessments at this moment
                        </div>
                    </div>

                    {/* Upcoming Assessments Section */}
                    <div>
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                            <h2 className="text-[#1e3a8a] text-lg font-bold">Upcoming assessments</h2>

                            {/* Date Picker & Search */}
                            <div className="flex items-center gap-0 bg-white border border-slate-300 rounded-md overflow-hidden max-w-sm w-full shadow-sm">
                                <div className="flex-1 px-4 py-2 text-sm text-slate-600 flex items-center gap-2 cursor-pointer hover:bg-slate-50">
                                    <span className="truncate">{dateRange}</span>
                                </div>
                                <button className="bg-[#1e40af] text-white p-2.5 hover:bg-[#1e3a8a] transition-colors">
                                    <Search size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="bg-[#eff6ff] text-[#1e40af] px-6 py-8 rounded-md text-sm border border-blue-100 flex items-center justify-center md:justify-start">
                            No upcoming assessments between 1 & 8
                        </div>
                    </div>

                </main>
            </div>
        </div>
    );
}
