
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, Phone, Mail, FileText, Monitor, Wrench, HelpCircle, ArrowLeft } from 'lucide-react';
import LeGeZtHeader from '@/components/labs/LeGeZtHeader';

export default function LeGeZtTantraPage() {
    const router = useRouter();

    const dashboardCards = [
        {
            id: 'courses',
            title: 'Courses',
            image: '/assets/legezttantra/card_courses_real.png',
            description: 'Click here to view all your courses/subjects',
            icon: <FileText size={18} />,
            link: '/labs/legezttantra/courses'
        },
        {
            id: 'tests',
            title: 'Tests',
            image: '/assets/legezttantra/card_tests_real.png',
            description: 'Click here to view all your scheduled and completed tests',
            icon: <FileText size={18} />,
            link: '/labs/legezttantra/tests'
        },
        {
            id: 'labs',
            title: 'Programming Labs',
            image: '/assets/legezttantra/card_labs_real.png',
            description: 'Click here to view all your programming labs',
            icon: <Monitor size={18} />,
            link: '/labs/legezttantra/grid'
        },
        {
            id: 'tools',
            title: 'Tools',
            image: '/assets/legezttantra/card_tools_real.png',
            description: 'Click here to access tools.',
            icon: <Wrench size={18} />,
            link: '/labs/legezttantra/tools'
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
            {/* Common Header */}
            <LeGeZtHeader />

            {/* ================= MAIN CONTENT ================= */}
            <main className="pt-28 pb-12 px-6 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {dashboardCards.map((card) => (
                        <Link
                            href={card.link}
                            key={card.id}
                            className="group flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
                        >
                            {/* Card Image Area */}
                            <div className="h-48 p-4 flex items-center justify-center bg-white border-b border-slate-100">
                                {card.image ? (
                                    <img
                                        src={card.image}
                                        alt={card.title}
                                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="text-slate-200">
                                        {/* Fallback Icon */}
                                        <Monitor size={64} strokeWidth={1} />
                                    </div>
                                )}
                            </div>

                            {/* Card Text Content (Optional secondary info) */}
                            <div className="p-4 flex-1">
                                <p className="text-xs text-slate-500 text-center line-clamp-2">
                                    {card.description}
                                </p>
                            </div>

                            {/* Card Footer Button - SOLID DARK BG with WHITE TEXT */}
                            <div
                                className="py-4 text-center font-bold text-sm tracking-wider group-hover:bg-indigo-950 transition-colors uppercase"
                                style={{ backgroundColor: '#1e293b', color: 'white' }}
                            >
                                {card.title}
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Footer / Copyright */}
                <div className="mt-20 text-center text-[10px] font-bold text-slate-400 border-t border-slate-200 pt-10 uppercase tracking-widest">
                    © 2025 Copyright LeGeZt Hub
                </div>
            </main>
        </div>
    );
}
