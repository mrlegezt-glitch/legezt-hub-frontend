'use client';

import React from 'react';
import Link from 'next/link';
import { Play, Info } from 'lucide-react';
import { MediaItem } from '@/types/media';
import { tmdb } from '@/lib/tmdb';

interface MediaHeroProps {
    featured: MediaItem;
}

export default function MediaHero({ featured }: MediaHeroProps) {
    if (!featured) {
        return <div className="w-full h-[60vh] md:h-[80vh] bg-dark-200 animate-pulse"></div>;
    }

    const title = featured.title || featured.name;
    const isMovie = featured.media_type === 'movie' || featured.title !== undefined;
    const watchLink = isMovie
        ? `/watch/movie/${featured.id}`
        : `/watch/tv/${featured.id}/1/1`;

    // Fallbacks
    const backdropUrl = tmdb.getImageUrl(featured.backdrop_path || featured.poster_path, 'original');

    return (
        <div className="relative w-full h-[70vh] md:h-[85vh] text-white">
            {/* Background Image */}
            <div className="absolute top-0 left-0 w-full h-full">
                <img
                    src={backdropUrl}
                    alt={title}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Fades */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-dark-100 via-dark-100/40 to-transparent" />
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-dark-100/90 via-dark-100/20 to-transparent" />

            {/* Content Container */}
            <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 md:pb-32 flex flex-col justify-end z-10">
                <div className="w-full md:max-w-2xl animate-fade-in-up">
                    {featured.media_type === 'tv' && (
                        <div className="flex items-center gap-2 mb-2 text-primary-400 font-bold tracking-widest text-xs md:text-sm drop-shadow-md">
                            <span className="bg-primary-600 text-white px-2 py-0.5 rounded mr-2 uppercase">Series</span>
                        </div>
                    )}
                    {featured.media_type === 'movie' && (
                        <div className="flex items-center gap-2 mb-2 text-primary-400 font-bold tracking-widest text-xs md:text-sm drop-shadow-md">
                            <span className="bg-primary-600 text-white px-2 py-0.5 rounded mr-2 uppercase">Movie</span>
                        </div>
                    )}

                    <h1 className="text-4xl md:text-6xl font-black mb-4 drop-shadow-2xl line-clamp-2">
                        {title}
                    </h1>

                    <div className="flex items-center gap-4 text-sm font-semibold mb-6 text-gray-300 drop-shadow-lg">
                        {featured.vote_average ? <span className="text-green-400">{(featured.vote_average * 10).toFixed(0)}% Match</span> : null}
                        {featured.release_date && <span>{featured.release_date.split('-')[0]}</span>}
                        {featured.first_air_date && <span>{featured.first_air_date.split('-')[0]}</span>}
                    </div>

                    <p className="text-sm md:text-lg text-gray-200 mb-8 max-w-lg line-clamp-3 md:line-clamp-4 drop-shadow-xl font-medium">
                        {featured.overview}
                    </p>

                    <div className="flex flex-wrap items-center gap-4">
                        <Link
                            href={watchLink}
                            className="flex items-center gap-2 px-6 py-2 md:px-8 md:py-3 bg-white text-black rounded-lg font-bold hover:bg-white/80 transition-all hover:scale-105"
                        >
                            <Play size={24} fill="currentColor" />
                            <span>Play</span>
                        </Link>

                        <button className="flex items-center gap-2 px-6 py-2 md:px-8 md:py-3 bg-gray-500/50 text-white rounded-lg font-bold hover:bg-gray-500/70 transition-all hover:scale-105 backdrop-blur-md">
                            <Info size={24} />
                            <span>More Info</span>
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </div>
    );
}
