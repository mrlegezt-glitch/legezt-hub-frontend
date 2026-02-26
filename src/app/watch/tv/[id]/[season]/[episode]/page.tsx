import React from 'react';
import { tmdb } from '@/lib/tmdb';
import MediaRow from '@/components/media/MediaRow';
import VideoPlayer from '@/components/media/VideoPlayer';
import SafeImage from '@/components/media/SafeImage';
import SeasonEpisodeSelector from '@/components/media/SeasonEpisodeSelector';
import { ChevronLeft, Star, Calendar } from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';

interface TVWatchPageProps {
    params: {
        id: string;
        season: string;
        episode: string;
    };
}

export async function generateMetadata({ params }: TVWatchPageProps): Promise<Metadata> {
    const { id, season, episode } = await params;
    const details = await tmdb.getTVDetails(id);
    return {
        title: `${details?.name || 'Watch'} S${season}:E${episode} | LeGeZt Hub`,
        description: details?.overview || 'Watch TV series on LeGeZt Hub',
    };
}

export default async function TVWatchPage({ params }: TVWatchPageProps) {
    const { id, season, episode } = await params;

    const [details, similarRes] = await Promise.all([
        tmdb.getTVDetails(id),
        tmdb.getTrendingTV()
    ]);

    const title = details?.name || 'Unknown Series';
    const posterUrl = tmdb.getImageUrl(details?.poster_path, 'w500');
    const backdropUrl = tmdb.getImageUrl(details?.backdrop_path || details?.poster_path, 'w500');
    const totalSeasons = details?.number_of_seasons || 1;
    const totalEpisodes = details?.number_of_episodes || 10;
    const episodesPerSeason = Math.max(Math.ceil(totalEpisodes / totalSeasons), 8);

    return (
        <div className="min-h-screen bg-dark-100 text-white">
            {/* Sticky Header */}
            <div className="sticky top-0 z-40 px-3 py-2 md:px-8 md:py-3 flex items-center justify-between bg-black/80 backdrop-blur-xl border-b border-white/5">
                <Link href="/series" className="text-gray-400 hover:text-white flex items-center gap-2 group transition-colors text-xs md:text-sm">
                    <ChevronLeft size={16} className="md:w-[18px] md:h-[18px] group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium hidden md:inline">Back to Series</span>
                    <span className="font-medium md:hidden">Back</span>
                </Link>
                <div className="text-right">
                    <div className="text-xs md:text-sm font-bold text-white truncate max-w-[150px] md:max-w-none">{title}</div>
                    <div className="text-[9px] md:text-[10px] text-gray-500 font-medium">Session {season} • Episode {episode}</div>
                </div>
            </div>

            {/* Player */}
            <div className="w-full max-w-6xl mx-auto px-2 md:px-8 pt-2 md:pt-6">
                <VideoPlayer
                    tmdbId={id}
                    type="tv"
                    season={season}
                    episode={episode}
                />
            </div>

            {/* Show Details */}
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Poster */}
                    <div className="hidden md:block w-40 shrink-0">
                        <SafeImage
                            src={posterUrl}
                            alt={title}
                            className="w-full rounded-xl shadow-2xl shadow-black/50 border border-white/10"
                        />
                    </div>

                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl md:text-3xl font-black mb-1 leading-tight">
                            {title}
                            <span className="text-gray-500 font-medium text-base md:text-xl ml-2 md:ml-3">S{season}:E{episode}</span>
                        </h1>

                        <div className="flex flex-wrap items-center gap-2 mb-4 mt-2">
                            {details?.vote_average && details.vote_average > 0 && (
                                <span className="flex items-center gap-1 bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-xs font-bold border border-green-500/20">
                                    <Star size={12} fill="currentColor" />
                                    {details.vote_average.toFixed(1)}
                                </span>
                            )}
                            {details?.first_air_date && (
                                <span className="flex items-center gap-1 bg-white/5 text-gray-300 px-3 py-1 rounded-full text-xs font-medium border border-white/10">
                                    <Calendar size={12} />
                                    {details.first_air_date.split('-')[0]}
                                </span>
                            )}
                            <span className="bg-primary-600/10 text-primary-400 px-3 py-1 rounded-full text-xs font-bold border border-primary-500/20">
                                {totalSeasons} Season{totalSeasons > 1 ? 's' : ''}
                            </span>
                        </div>

                        {details?.genres && details.genres.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                                {details.genres.map(g => (
                                    <span key={g.id} className="bg-white/5 text-gray-400 px-2.5 py-0.5 rounded-full text-[11px] font-medium border border-white/5">
                                        {g.name}
                                    </span>
                                ))}
                            </div>
                        )}

                        <p className="text-gray-400 leading-relaxed text-sm max-w-2xl line-clamp-3">
                            {details?.overview}
                        </p>
                    </div>
                </div>
            </div>

            {/* Season & Episode Selector */}
            <div className="max-w-6xl mx-auto px-4 md:px-8">
                <SeasonEpisodeSelector
                    showId={id}
                    currentSeason={parseInt(season)}
                    currentEpisode={parseInt(episode)}
                    totalSeasons={totalSeasons}
                    totalEpisodes={episodesPerSeason}
                    backdropUrl={backdropUrl}
                />
            </div>

            {/* Divider */}
            <div className="max-w-6xl mx-auto px-4 md:px-8 mt-6">
                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>

            {/* Similar */}
            <div className="pb-20 pt-4">
                <MediaRow title="More Like This" items={similarRes.results} />
            </div>
        </div>
    );
}
