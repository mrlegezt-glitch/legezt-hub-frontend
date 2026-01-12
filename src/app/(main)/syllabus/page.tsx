'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import SmartSchedule from '@/components/academic/SmartSchedule';
import WeeklyTimetable from '@/components/academic/WeeklyTimetable';
import AttendanceCard from '@/components/academic/AttendanceCard';
import { Loader2, LayoutGrid, List } from 'lucide-react';

export default function SyllabusPage() {
    const [schedule, setSchedule] = useState([]);
    const [syllabus, setSyllabus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'today' | 'week'>('today');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [schedRes, syllRes] = await Promise.all([
                    api.get('/academic/schedule'),
                    api.get('/academic/syllabus')
                ]);
                setSchedule(schedRes.data);
                setSyllabus(syllRes.data);
            } catch (error) {
                console.error('Failed to fetch academic data', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="animate-spin text-primary-500" size={32} />
            </div>
        );
    }

    return (
        <div className="pb-24 md:pb-8 pt-24 px-4 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white">My Academics</h1>
                <p className="text-gray-400">Track your schedule, attendance, and syllabus.</p>
            </div>

            {/* Smart Schedule Section */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white">
                        {viewMode === 'today' ? "Today's Schedule" : "Weekly Timetable"}
                    </h2>

                    <div className="flex bg-dark-200 p-1 rounded-xl border border-dark-border">
                        <button
                            onClick={() => setViewMode('today')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'today' ? 'bg-primary-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                            title="Today View"
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('week')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'week' ? 'bg-primary-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                            title="Weekly View"
                        >
                            <List size={18} />
                        </button>
                    </div>
                </div>

                {viewMode === 'today' ? (
                    <SmartSchedule schedule={schedule} />
                ) : (
                    <WeeklyTimetable schedule={schedule} />
                )}
            </section>

            {/* Subjects & Attendance Grid */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white">Subjects & Attendance</h2>
                </div>

                {syllabus.length === 0 ? (
                    <div className="text-center py-12 bg-dark-200/50 rounded-2xl border border-white/5">
                        <p className="text-gray-500">No subjects assigned yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {syllabus.map((item: any) => (
                            <AttendanceCard
                                key={item.id}
                                subject={item}
                                attendance={item.attendance}
                            />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
