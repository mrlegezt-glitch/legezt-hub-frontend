'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, ArrowLeft } from 'lucide-react';

import LeGeZtHeader from '@/components/labs/LeGeZtHeader';

export default function TestsPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-white text-slate-800 font-sans flex flex-col">
            <LeGeZtHeader />

            {/* ================= MAIN CONTENT ================= */}
            <main className="flex-1 pt-32 px-6 flex items-start justify-center">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl w-full">

                    {/* Card 1: Take Test */}
                    <div className="bg-white rounded-lg shadow-[0_2px_15px_rgba(0,0,0,0.08)] border border-slate-100 overflow-hidden flex flex-col items-center hover:shadow-xl transition-shadow duration-300">
                        {/* Image Area */}
                        <div className="p-8 w-full flex justify-center bg-white aspect-[4/3] items-center">
                            <img
                                src="/assets/legezttantra/test_take.png"
                                alt="Take Test"
                                className="object-contain max-h-64"
                            />
                        </div>

                        <div className="text-sm text-slate-600 mb-6">
                            Click here to take a test
                        </div>

                        {/* Button */}
                        <Link href="/labs/legezttantra/tests/take" className="w-full">
                            <button className="w-full py-4 bg-[#2c3e50] text-white font-medium text-sm hover:bg-[#34495e] transition-colors border-t border-slate-100 uppercase tracking-wide">
                                Take Test
                            </button>
                        </Link>
                    </div>

                    {/* Card 2: See Results */}
                    <div className="bg-white rounded-lg shadow-[0_2px_15px_rgba(0,0,0,0.08)] border border-slate-100 overflow-hidden flex flex-col items-center hover:shadow-xl transition-shadow duration-300">
                        {/* Image Area */}
                        <div className="p-8 w-full flex justify-center bg-white aspect-[4/3] items-center">
                            <img
                                src="/assets/legezttantra/test_results.png"
                                alt="See Results"
                                className="object-contain max-h-64"
                            />
                        </div>

                        <div className="text-sm text-slate-600 mb-6">
                            Click here to see results
                        </div>

                        {/* Button */}
                        <Link href="/labs/legezttantra/tests/results" className="w-full">
                            <button className="w-full py-4 bg-[#2c3e50] text-white font-medium text-sm hover:bg-[#34495e] transition-colors border-t border-slate-100 uppercase tracking-wide">
                                See Results
                            </button>
                        </Link>
                    </div>

                </div>
            </main>
        </div>
    );
}
