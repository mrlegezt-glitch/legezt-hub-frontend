'use client';

import Link from 'next/link';
import LeGeZtHeader from '@/components/labs/LeGeZtHeader';

export default function ToolsPage() {
    const tools = [
        {
            id: 'env',
            title: 'Environment Check',
            image: '/assets/legezttantra/tools/tool_env.png',
            description: 'Click here to check your environment.',
            link: '/labs/legezttantra/tools/environment',
            buttonText: 'Environment Check'
        },
        {
            id: 'calc',
            title: 'Calculator',
            image: '/assets/legezttantra/tools/tool_calc.png',
            description: 'Click here to use calculator.',
            link: '/labs/legezttantra/tools/calculator',
            buttonText: 'Calculator'
        },
        {
            id: 'qr',
            title: 'QR Scanner',
            image: '/assets/legezttantra/tools/tool_qr.png',
            description: 'Click here to scan the QR',
            link: '/labs/legezttantra/tools/qr-scanner',
            buttonText: 'QR Scanner'
        }
    ];

    return (
        <div className="min-h-screen bg-white text-slate-800 font-sans flex flex-col">
            <LeGeZtHeader />

            <main className="flex-1 pt-32 px-6 flex justify-center">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl w-full items-start">
                    {tools.map((tool) => (
                        <div
                            key={tool.id}
                            className="bg-white rounded-lg shadow-[0_2px_15px_rgba(0,0,0,0.08)] border border-slate-100 overflow-hidden flex flex-col items-center hover:shadow-xl transition-shadow duration-300"
                        >
                            {/* Image Area */}
                            <div className="p-8 w-full flex justify-center bg-white aspect-[4/3] items-center">
                                <img
                                    src={tool.image}
                                    alt={tool.title}
                                    className="object-contain max-h-56"
                                />
                            </div>

                            <div className="text-sm text-slate-600 mb-6 text-center px-4">
                                {tool.description}
                            </div>

                            {/* Button */}
                            <Link href={tool.link} className="w-full">
                                <button className="w-full py-4 bg-[#2c3e50] text-white font-medium text-sm hover:bg-[#34495e] transition-colors border-t border-slate-100 uppercase tracking-wide">
                                    {tool.buttonText}
                                </button>
                            </Link>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
