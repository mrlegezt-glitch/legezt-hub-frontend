'use client';

import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { motion } from 'framer-motion';
import { ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface Props {
    subject: any;
    attendance: {
        totalClasses: number;
        attendedClasses: number;
        percentage: number;
        safeBunk: number;
        needToAttend: number;
    };
}

export default function AttendanceCard({ subject, attendance }: Props) {
    const isSafe = attendance.percentage >= 75;
    const color = isSafe ? '#22c55e' : '#ef4444'; // Green or Red

    return (
        <Link href={`/syllabus/subject/${subject.id}`}>
            <motion.div
                whileTap={{ scale: 0.98 }}
                className="bg-dark-200 rounded-2xl p-4 border border-dark-border hover:border-primary-500/50 transition-all group"
            >
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-start gap-3">
                        <div className="w-12 h-12">
                            <CircularProgressbar
                                value={attendance.percentage}
                                text={`${Math.round(attendance.percentage)}%`}
                                styles={buildStyles({
                                    textSize: '28px',
                                    pathColor: color,
                                    textColor: '#fff',
                                    trailColor: 'rgba(255,255,255,0.1)',
                                })}
                            />
                        </div>
                        <div>
                            <h3 className="font-bold text-white group-hover:text-primary-400 transition-colors line-clamp-1">{subject.name}</h3>
                            <p className="text-xs text-gray-500">{subject.code}</p>
                        </div>
                    </div>
                    <ChevronRight className="text-gray-600 group-hover:text-white transition-colors" size={20} />
                </div>

                <div className={`text-xs px-3 py-2 rounded-lg font-medium flex items-center gap-2 ${isSafe ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                    {isSafe ? (
                        <>
                            <CheckCircle2 size={14} />
                            Safe to bunk: <b>{attendance.safeBunk}</b> classes
                        </>
                    ) : (
                        <>
                            <AlertCircle size={14} />
                            Attend next <b>{attendance.needToAttend}</b> to hit 75%
                        </>
                    )}
                </div>
            </motion.div>
        </Link>
    );
}
