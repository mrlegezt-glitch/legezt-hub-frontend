import React from 'react';
import MediaHero from '@/components/media/MediaHero';
import MediaRow from '@/components/media/MediaRow';
import { tmdb } from '@/lib/tmdb';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Movies | LeGeZt Hub',
    description: 'Watch the latest and greatest movies.',
};

export default async function MoviesPage() {
    // Fetch data concurrently on the server
    const [
        trendingRes,
        popularRes,
        actionRes,
        comedyRes,
        horrorRes
    ] = await Promise.all([
        tmdb.getTrending('movie', 'week'),
        tmdb.getPopularMovies(),
        tmdb.getMoviesByGenre(28), // Action
        tmdb.getMoviesByGenre(35), // Comedy
        tmdb.getMoviesByGenre(27)  // Horror
    ]);

    const featuredItem = trendingRes.results[Math.floor(Math.random() * Math.min(5, trendingRes.results.length))];

    return (
        <div className="min-h-screen bg-dark-100 overflow-x-hidden">
            <MediaHero featured={featuredItem} />

            <div className="pb-20 -mt-24 md:-mt-32 relative z-20">
                <MediaRow title="Trending Movies" items={trendingRes.results} isLargeRow={true} />
                <MediaRow title="Popular on LeGeZt" items={popularRes.results} />
                <MediaRow title="Action Thrillers" items={actionRes.results} />
                <MediaRow title="Comedies" items={comedyRes.results} />
                <MediaRow title="Horror Films" items={horrorRes.results} />
            </div>
        </div>
    );
}
