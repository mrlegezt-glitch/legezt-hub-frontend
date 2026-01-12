'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, MapPin } from 'lucide-react';

interface ScheduleItem {
    id: string;
    dayOfWeek: number;
    startTime: string;
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

const DAYS = [
    { id: 1, label: 'Mon' },
    { id: 2, label: 'Tue' },
    { id: 3, label: 'Wed' },
    { id: 4, label: 'Thu' },
    { id: 5, label: 'Fri' },
    { id: 6, label: 'Sat' },
];

export default function WeeklyTimetable({ schedule }: { schedule: ScheduleItem[] }) {
    const today = new Date().getDay(); // 0=Sun, 1=Mon...
    const [selectedDay, setSelectedDay] = useState(today === 0 ? 1 : today);

    // Group schedule by day
    const getClassesForDay = (dayId: number) => {
        return schedule
            .filter(s => s.dayOfWeek === dayId)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));
    };

    const classes = getClassesForDay(selectedDay);

    return (
        <div className="bg-dark-200/50 rounded-3xl border border-white/5 overflow-hidden">
            {/* Day Selector Tabs */}
            <div className="flex overflow-x-auto p-2 gap-2 scrollbar-hide border-b border-white/5">
                {DAYS.map((day) => (
                    <button
                        key={day.id}
                        onClick={() => setSelectedDay(day.id)}
                        className={`relative px-4 py-2 rounded-xl text-sm font-bold transition-all shrink-0 ${selectedDay === day.id ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                            }`}
                    >
                        {selectedDay === day.id && (
                            <motion.div
                                layoutId="activeDayTab"
                                className="absolute inset-0 bg-primary-600 rounded-xl shadow-lg shadow-primary-600/20"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <span className="relative z-10">{day.label}</span>
                    </button>
                ))}
            </div>

            {/* Timetable Content */}
            <div className="p-4 min-h-[300px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={selectedDay}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-3"
                    >
                        {classes.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                                <Clock size={40} className="mb-3 opacity-20" />
                                <p>No classes scheduled.</p>
                                <span className="text-xs text-gray-600">Enjoy your free time!</span>
                            </div>
                        ) : (
                            classes.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex gap-4 p-3 rounded-2xl bg-dark-100 hover:bg-white/5 transition-colors border border-transparent hover:border-white/5 group"
                                >
                                    {/* Time Column */}
                                    <div className="flex flex-col items-center justify-center w-16 shrink-0 border-r border-white/5 pr-4">
                                        <span className="text-sm font-bold text-white">{item.startTime}</span>
                                        <div className="h-4 w-px bg-white/10 my-1" />
                                        <span className="text-xs text-gray-500">{item.endTime}</span>
                                    </div>

                                    {/* Details Column */}
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-white text-lg leading-tight group-hover:text-primary-400 transition-colors">
                                                {item.subject.name}
                                            </h4>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.type === 'LAB'
                                                    ? 'bg-purple-500/20 text-purple-400'
                                                    : 'bg-blue-500/20 text-blue-400'
                                                }`}>
                                                {item.type}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
                                            {item.room && (
                                                <span className="flex items-center gap-1">
                                                    <MapPin size={12} /> {item.room}
                                                </span>
                                            )}
                                            {item.subject.faculty?.name && (
                                                <span className="text-xs bg-white/5 px-2 py-0.5 rounded-md">
                                                    {item.subject.faculty.name}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
