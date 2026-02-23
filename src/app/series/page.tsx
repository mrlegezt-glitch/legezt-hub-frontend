import React from 'react';
import MediaHero from '@/components/media/MediaHero';
import MediaRow from '@/components/media/MediaRow';
import { tmdb } from '@/lib/tmdb';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'TV Series | LeGeZt Hub',
    description: 'Binge-watch top TV shows and series.',
};

export default async function SeriesPage() {
    const [
        trendingRes,
        popularRes,
        actionRes,
        comedyRes,
        dramaRes
    ] = await Promise.all([
        tmdb.getTrendingTV(),
        tmdb.getPopularTV(),
        tmdb.getTVByGenre(10759),
        tmdb.getTVByGenre(35),
        tmdb.getTVByGenre(18)
    ]);

    const featuredItem = trendingRes.results[Math.floor(Math.random() * Math.min(5, trendingRes.results.length))];

    return (
        <div className="min-h-screen bg-dark-100 overflow-x-hidden">
            <MediaHero featured={featuredItem} />

            {/* Category Tabs */}
            <div className="sticky top-[72px] z-30 bg-dark-100/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 md:px-12 flex items-center gap-1 py-2 overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
                    <Link href="/explore" className="px-4 py-2 rounded-full text-sm font-medium text-gray-400 hover:text-white hover:bg-white/10 transition-all shrink-0">
                        All
                    </Link>
                    <Link href="/movies" className="px-4 py-2 rounded-full text-sm font-medium text-gray-400 hover:text-white hover:bg-white/10 transition-all shrink-0">
                        Movies
                    </Link>
                    <Link href="/series" className="px-4 py-2 rounded-full text-sm font-bold bg-white text-black transition-all shrink-0">
                        TV Series
                    </Link>
                </div>
            </div>

            <div className="pb-20 pt-2 relative z-20">
                <MediaRow title="📺 Trending Series" items={trendingRes.results} isLargeRow={true} />
                <MediaRow title="🔥 Popular Shows" items={popularRes.results} />
                <MediaRow title="⚔️ Action & Adventure" items={actionRes.results} />
                <MediaRow title="😂 Sitcoms & Comedy" items={comedyRes.results} />
                <MediaRow title="🎭 TV Dramas" items={dramaRes.results} />
            </div>
        </div>
    );
}
