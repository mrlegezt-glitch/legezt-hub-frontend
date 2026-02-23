'use client';

import React from 'react';
import Link from 'next/link';
import { Play, Info, Volume2, VolumeX } from 'lucide-react';
import { MediaItem } from '@/types/media';
import { tmdb } from '@/lib/tmdb';

interface MediaHeroProps {
    featured: MediaItem;
}

export default function MediaHero({ featured }: MediaHeroProps) {
    if (!featured) {
        return (
            <div className="w-full h-[60vh] md:h-[80vh] bg-dark-200 animate-pulse flex items-center justify-center">
                <div className="text-gray-600 text-lg">Loading...</div>
            </div>
        );
    }

    const title = featured.title || featured.name || 'Featured';
    const isTV = featured.media_type === 'tv' || (!featured.title && featured.name !== undefined) || !!featured.first_air_date;
    const watchLink = isTV
        ? `/watch/tv/${featured.id}/1/1`
        : `/watch/movie/${featured.id}`;

    const backdropUrl = tmdb.getImageUrl(featured.backdrop_path || featured.poster_path, 'original');
    const year = featured.release_date?.split('-')[0] || featured.first_air_date?.split('-')[0] || '';

    return (
        <div className="relative w-full h-[65vh] md:h-[85vh] text-white overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0">
                <img
                    src={backdropUrl}
                    alt={title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                    }}
                />
            </div>

            {/* Multi-layer gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-dark-100 via-dark-100/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-dark-100/80 via-dark-100/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-dark-100 to-transparent" />

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 md:pb-36 z-10">
                <div className="max-w-2xl animate-fade-in-up">
                    {/* Badge */}
                    <div className="flex items-center gap-2 mb-3">
                        {isTV ? (
                            <span className="bg-primary-600 text-white px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary-600/30">
                                TV Series
                            </span>
                        ) : (
                            <span className="bg-red-600 text-white px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-600/30">
                                Movie
                            </span>
                        )}
                        <span className="text-gray-400 text-xs font-semibold">{year}</span>
                        {featured.vote_average > 0 && (
                            <span className="text-green-400 text-xs font-bold">
                                ⭐ {featured.vote_average.toFixed(1)}
                            </span>
                        )}
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl sm:text-4xl md:text-6xl font-black mb-3 drop-shadow-2xl line-clamp-2 leading-tight tracking-tight">
                        {title}
                    </h1>

                    {/* Overview */}
                    <p className="text-sm md:text-base text-gray-300 mb-6 max-w-lg line-clamp-3 leading-relaxed font-medium drop-shadow-lg">
                        {featured.overview}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                        <Link
                            href={watchLink}
                            className="flex items-center gap-2 px-6 py-2.5 md:px-8 md:py-3 bg-white text-black rounded-lg font-bold text-sm md:text-base hover:bg-gray-200 transition-all hover:scale-105 shadow-xl shadow-white/10 active:scale-95"
                        >
                            <Play size={20} fill="currentColor" />
                            <span>Play Now</span>
                        </Link>

                        <button className="flex items-center gap-2 px-5 py-2.5 md:px-7 md:py-3 bg-white/10 text-white rounded-lg font-bold text-sm md:text-base hover:bg-white/20 transition-all hover:scale-105 backdrop-blur-md border border-white/10 active:scale-95">
                            <Info size={20} />
                            <span>More Info</span>
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </div>
    );
}
