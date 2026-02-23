import React from 'react';
import { tmdb } from '@/lib/tmdb';
import MediaRow from '@/components/media/MediaRow';
import VideoPlayer from '@/components/media/VideoPlayer';
import { ChevronLeft, Calendar, Clock, Star } from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';

interface MovieWatchPageProps {
    params: {
        id: string;
    };
}

export async function generateMetadata({ params }: MovieWatchPageProps): Promise<Metadata> {
    const { id } = await params;
    const details = await tmdb.getMovieDetails(id);
    return {
        title: `${details?.title || 'Watch'} | LeGeZt Hub`,
        description: details?.overview || 'Watch movies on LeGeZt Hub',
    };
}

export default async function MovieWatchPage({ params }: MovieWatchPageProps) {
    const { id } = await params;

    const [details, similarRes] = await Promise.all([
        tmdb.getMovieDetails(id),
        tmdb.getPopularMovies()
    ]);

    const title = details?.title || 'Unknown Title';
    const backdropUrl = tmdb.getImageUrl(details?.backdrop_path || details?.poster_path, 'w1280');
    const posterUrl = tmdb.getImageUrl(details?.poster_path, 'w500');

    return (
        <div className="min-h-screen bg-dark-100 text-white">
            {/* Subtle backdrop blur behind the header */}
            <div className="fixed top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/80 to-transparent z-30 pointer-events-none" />

            {/* Back Header */}
            <div className="sticky top-0 z-40 px-4 py-3 md:px-8 flex items-center justify-between bg-black/60 backdrop-blur-xl border-b border-white/5">
                <Link href="/movies" className="text-gray-400 hover:text-white flex items-center gap-2 group transition-colors text-sm">
                    <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium hidden md:inline">Back to Movies</span>
                    <span className="font-medium md:hidden">Back</span>
                </Link>
                <div className="text-sm font-bold text-white truncate max-w-[200px] md:max-w-none">
                    {title}
                </div>
            </div>

            {/* Player Section */}
            <div className="w-full max-w-6xl mx-auto px-4 md:px-8 pt-4 md:pt-6">
                <VideoPlayer tmdbId={id} type="movie" />
            </div>

            {/* Details Section */}
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-8">
                <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                    {/* Poster - hidden on mobile */}
                    <div className="hidden md:block w-48 shrink-0">
                        <img
                            src={posterUrl}
                            alt={title}
                            className="w-full rounded-xl shadow-2xl shadow-black/50 border border-white/10"
                            onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-media.png'; }}
                        />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <h1 className="text-2xl md:text-4xl font-black mb-3 leading-tight">{title}</h1>

                        {/* Meta badges */}
                        <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-4">
                            {details?.vote_average > 0 && (
                                <span className="flex items-center gap-1 bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-xs font-bold border border-green-500/20">
                                    <Star size={12} fill="currentColor" />
                                    {details.vote_average.toFixed(1)}
                                </span>
                            )}
                            {details?.release_date && (
                                <span className="flex items-center gap-1 bg-white/5 text-gray-300 px-3 py-1 rounded-full text-xs font-medium border border-white/10">
                                    <Calendar size={12} />
                                    {details.release_date.split('-')[0]}
                                </span>
                            )}
                            {details?.runtime > 0 && (
                                <span className="flex items-center gap-1 bg-white/5 text-gray-300 px-3 py-1 rounded-full text-xs font-medium border border-white/10">
                                    <Clock size={12} />
                                    {Math.floor(details.runtime / 60)}h {details.runtime % 60}m
                                </span>
                            )}
                        </div>

                        {/* Genre pills */}
                        {details?.genres && details.genres.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                                {details.genres.map(g => (
                                    <span key={g.id} className="bg-primary-600/10 text-primary-400 px-3 py-1 rounded-full text-[11px] font-bold border border-primary-500/20">
                                        {g.name}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Overview */}
                        <p className="text-gray-300 leading-relaxed text-sm md:text-base max-w-2xl">
                            {details?.overview}
                        </p>

                        {details?.tagline && (
                            <p className="text-gray-500 italic mt-3 text-sm">&quot;{details.tagline}&quot;</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Divider */}
            <div className="max-w-6xl mx-auto px-4 md:px-8">
                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>

            {/* Similar Movies */}
            <div className="pb-20 pt-4">
                <MediaRow title="More Like This" items={similarRes.results} />
            </div>
        </div>
    );
}
