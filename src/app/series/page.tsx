import React from 'react';
import MediaHero from '@/components/media/MediaHero';
import MediaRow from '@/components/media/MediaRow';
import { tmdb } from '@/lib/tmdb';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'TV Series | LeGeZt Hub',
    description: 'Binge-watch top TV shows and series.',
};

export default async function SeriesPage() {
    // Fetch data concurrently on the server
    const [
        trendingRes,
        popularRes,
        actionRes,
        comedyRes,
        dramaRes
    ] = await Promise.all([
        tmdb.getTrendingTV(),
        tmdb.getPopularTV(),
        tmdb.getTVByGenre(10759), // Action & Adventure (TV)
        tmdb.getTVByGenre(35),    // Comedy
        tmdb.getTVByGenre(18)     // Drama
    ]);

    const featuredItem = trendingRes.results[Math.floor(Math.random() * Math.min(5, trendingRes.results.length))];

    return (
        <div className="min-h-screen bg-dark-100 overflow-x-hidden">
            <MediaHero featured={featuredItem} />

            <div className="pb-20 -mt-24 md:-mt-32 relative z-20">
                <MediaRow title="Trending Series" items={trendingRes.results} isLargeRow={true} />
                <MediaRow title="Popular Shows" items={popularRes.results} />
                <MediaRow title="Action & Adventure" items={actionRes.results} />
                <MediaRow title="Sitcoms & Comedy" items={comedyRes.results} />
                <MediaRow title="TV Dramas" items={dramaRes.results} />
            </div>
        </div>
    );
}
