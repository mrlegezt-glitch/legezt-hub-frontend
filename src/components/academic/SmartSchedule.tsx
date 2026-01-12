'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface ScheduleItem {
    id: string;
    dayOfWeek: number;
    startTime: string; // "09:00"
    endTime: string;
    subject: {
        id: string;
        name: string;
        code: string;
        faculty?: { name: string };
    };
    type: string;
    room?: string;
}

export default function SmartSchedule({ schedule }: { schedule: ScheduleItem[] }) {
    const [currentClass, setCurrentClass] = useState<ScheduleItem | null>(null);
    const [nextClass, setNextClass] = useState<ScheduleItem | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Find current and next class based on time
        if (!schedule.length) return;

        const now = new Date();
        const currentDay = now.getDay(); // 0-6
        const currentTime = now.getHours() * 60 + now.getMinutes();

        const todaysClasses = schedule.filter(s => s.dayOfWeek === currentDay);

        let foundCurrent = null;
        let foundNext = null;

        for (const item of todaysClasses) {
            const [startH, startM] = item.startTime.split(':').map(Number);
            const [endH, endM] = item.endTime.split(':').map(Number);
            const startMinutes = startH * 60 + startM;
            const endMinutes = endH * 60 + endM;

            if (currentTime >= startMinutes && currentTime < endMinutes) {
                foundCurrent = item;
            } else if (currentTime < startMinutes) {
                if (!foundNext || startMinutes < (parseInt(foundNext.startTime.split(':')[0]) * 60 + parseInt(foundNext.startTime.split(':')[1]))) {
                    foundNext = item;
                }
            }
        }

        // If no more classes today, find first of next day (optional, for now just today)

        setCurrentClass(foundCurrent);
        setNextClass(foundNext);
    }, [schedule]);

    const handleAttendance = async (status: 'PRESENT' | 'ABSENT') => {
        if (!currentClass) return;
        setLoading(true);
        try {
            await api.post(`/academic/attendance/${currentClass.subject.id}`, { action: status });
            toast.success(`Marked as ${status}`);
        } catch (error) {
            toast.error('Failed to mark attendance');
        } finally {
            setLoading(false);
        }
    };

    if (!currentClass && !nextClass) {
        return (
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                <Clock className="mx-auto mb-2 text-gray-500" size={24} />
                <p className="text-gray-400 text-sm">No classes scheduled for now.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {currentClass && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 to-purple-700 p-5 shadow-xl"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-white border border-white/10 mb-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                Live Now
                            </span>
                            <h3 className="text-xl font-bold text-white mb-0.5">{currentClass.subject.name}</h3>
                            <p className="text-white/80 text-sm flex items-center gap-1">
                                <MapPin size={12} /> {currentClass.room || 'Room TBA'}
                                <span className="mx-1">•</span>
                                {currentClass.startTime} - {currentClass.endTime}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2 mt-2">
                        <button
                            onClick={() => handleAttendance('PRESENT')}
                            disabled={loading}
                            className="flex-1 bg-white text-primary-600 py-2 rounded-xl text-sm font-bold shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
                        >
                            <CheckCircle size={16} /> I'm Here
                        </button>
                        <button
                            onClick={() => handleAttendance('ABSENT')}
                            disabled={loading}
                            className="flex-1 bg-black/20 text-white/90 hover:bg-black/30 py-2 rounded-xl text-sm font-medium active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            <XCircle size={16} /> Missed
                        </button>
                    </div>
                </motion.div>
            )}

            {nextClass && (
                <div className="flex items-center gap-4 p-4 rounded-xl bg-dark-200 border border-dark-border">
                    <div className="w-12 h-12 rounded-lg bg-dark-100 flex items-center justify-center text-primary-400 font-bold text-sm border border-dark-border shrink-0">
                        {nextClass.startTime}
                    </div>
                    <div>
                        <p className="text-xs text-primary-400 font-medium uppercase tracking-wide mb-0.5">Up Next</p>
                        <h4 className="font-semibold text-white">{nextClass.subject.name}</h4>
                        <p className="text-xs text-gray-500">{nextClass.room || 'Room TBA'}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
