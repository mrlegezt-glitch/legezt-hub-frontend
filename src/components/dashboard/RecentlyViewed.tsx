'use client';

import { useQuery } from '@tanstack/react-query';
import { userApi } from '@/lib/api';
import PdfCard from '@/components/pdf/PdfCard';
import { History } from 'lucide-react';
import Skeleton from '@/components/ui/Skeleton';
import Link from 'next/link';

export default function RecentlyViewed() {
    const { data: pdfs, isLoading } = useQuery({
        queryKey: ['recent-pdfs'],
        queryFn: async () => {
            const res = await userApi.getRecentPdfs();
            return res.data.data;
        },
        retry: false,
    });

    if (isLoading) {
        return (
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-4 px-1">
                    <Skeleton className="w-6 h-6 rounded-full" />
                    <Skeleton className="w-32 h-6 rounded-md" />
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="min-w-[280px] h-24 rounded-2xl" />
                    ))}
                </div>
            </div>
        );
    }

    if (!pdfs || pdfs.length === 0) {
        return null;
    }

    return (
        <section className="mb-8">
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2 text-gray-200">
                    <History size={20} className="text-primary-500" />
                    <h2 className="text-lg font-bold">Jump Back In</h2>
                </div>
                <Link href="/pdfs" className="text-xs text-primary-400 hover:text-primary-300 font-medium">
                    View Library
                </Link>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 -mx-5 px-5 md:mx-0 md:px-0 no-scrollbar snap-x">
                {pdfs.map((pdf: any) => (
                    <div key={pdf.id} className="min-w-[280px] md:min-w-[320px] snap-start">
                        <div className="bg-dark-100/50 p-2 rounded-2xl border border-white/5 hover:border-primary-500/20 transition-all">
                            <PdfCard {...pdf} />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
