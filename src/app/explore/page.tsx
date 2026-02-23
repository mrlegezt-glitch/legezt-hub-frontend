import React from 'react';
import MediaHero from '@/components/media/MediaHero';
import MediaRow from '@/components/media/MediaRow';
import { tmdb } from '@/lib/tmdb';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Explore Movies & Series | LeGeZt Hub',
    description: 'Discover the latest movies and TV series curated just for you.',
};

export default async function ExplorePage() {
    // Fetch data concurrently on the server
    const [
        trendingRes,
        topMoviesRes,
        actionMoviesRes,
        topTVRes,
        scifiTVRes
    ] = await Promise.all([
        tmdb.getTrending('all', 'week'),
        tmdb.getTopRatedMovies(),
        tmdb.getMoviesByGenre(28), // 28 is Action
        tmdb.getTrendingTV(),
        tmdb.getTVByGenre(10765) // 10765 is Sci-Fi & Fantasy
    ]);

    // Optional: pick a random item from trending to feature
    const featuredItem = trendingRes.results[Math.floor(Math.random() * Math.min(5, trendingRes.results.length))];

    return (
        <div className="min-h-screen bg-dark-100 overflow-x-hidden">
            <MediaHero featured={featuredItem} />

            <div className="pb-20 -mt-24 md:-mt-32 relative z-20">
                <MediaRow title="Trending Now" items={trendingRes.results} isLargeRow={true} />
                <MediaRow title="Top Rated Movies" items={topMoviesRes.results} />
                <MediaRow title="Action Blockbusters" items={actionMoviesRes.results} />
                <MediaRow title="Trending Series" items={topTVRes.results} />
                <MediaRow title="Sci-Fi & Fantasy" items={scifiTVRes.results} />
            </div>
        </div>
    );
}
