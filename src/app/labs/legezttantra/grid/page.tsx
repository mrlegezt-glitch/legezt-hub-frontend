'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import LeGeZtHeader from '@/components/labs/LeGeZtHeader';

// Mock Data for Labs (to match screenshot style)
const initialLabs = [
    {
        id: 'U24IT3L1',
        title: 'DATABASE MANAGEMENT SYSTEMS LAB - U24IT3L1',
        subtitle: 'DATABASE MANAGEMENT SYSTEMS LAB - U24IT3L1',
        link: '/labs/legezttantra/grid/U24IT3L1'
    },
    {
        id: 'U24CS3L1',
        title: 'Data Structures using C Lab - U24CS3L1',
        subtitle: 'Data Structures using C Lab - U24CS3L1',
        link: '/labs/legezttantra/grid/U24CS3L1'
    },
    {
        id: 'U24CS1L2',
        title: 'Python Programming Laboratory - U24CS1L2',
        subtitle: 'Python Programming Laboratory - U24CS1L2',
        link: '/labs/legezttantra/grid/U24CS1L2'
    },
    {
        id: 'U24CS1L1',
        title: 'Programming for Problem Solving Lab - U24CS1L1',
        subtitle: 'Programming for Problem Solving Lab - U24CS1L1',
        link: '/labs/legezttantra/grid/U24CS1L1'
    }
];

export default function LabsListPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [labs, setLabs] = useState(initialLabs);

    const filteredLabs = labs.filter(lab =>
        lab.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lab.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
            <LeGeZtHeader />

            <main className="flex-1 pt-24 px-4 md:px-8 pb-10 max-w-7xl mx-auto w-full">

                {/* Header Section */}
                <div className="bg-[#343a40] text-white px-4 py-3 text-lg font-medium rounded-t-sm shadow-sm mb-0">
                    Labs
                </div>

                {/* Search Bar */}
                <div className="bg-white p-4 border border-slate-200 border-t-0 shadow-sm mb-6 rounded-b-sm">
                    <input
                        type="text"
                        placeholder="Search Labs...."
                        className="w-full border border-slate-300 rounded px-4 py-2 text-sm text-slate-700 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors placeholder:text-slate-400"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Labs List */}
                <div className="space-y-4">
                    {filteredLabs.map((lab) => (
                        <Link
                            href={lab.link}
                            key={lab.id}
                            className="block bg-white border border-slate-200 shadow-sm rounded-sm hover:shadow-md transition-shadow overflow-hidden group"
                        >
                            <div className="flex">
                                {/* Blue Accent Bar */}
                                <div className="w-1.5 bg-[#00bcd4] h-auto shrink-0 self-stretch"></div>

                                <div className="p-4 flex flex-col gap-1 w-full">
                                    <h3 className="text-[#0091ea] text-lg font-medium group-hover:underline">
                                        {lab.title}
                                    </h3>
                                    <p className="text-slate-500 text-sm">
                                        {lab.subtitle}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}

                    {filteredLabs.length === 0 && (
                        <div className="text-center py-10 text-slate-500 bg-white border border-slate-200 rounded-sm">
                            No labs found matching your search.
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
}
