import React from 'react';
import { tmdb } from '@/lib/tmdb';
import MediaRow from '@/components/media/MediaRow';
import { ChevronLeft, ListVideo, Play } from 'lucide-react';
import Link from 'next/link';

interface TVWatchPageProps {
    params: {
        id: string;
        season: string;
        episode: string;
    };
}

export default async function TVWatchPage({ params }: TVWatchPageProps) {
    const { id, season, episode } = await params;

    // Fetch details and similar shows
    const [details, similarRes] = await Promise.all([
        tmdb.getTVDetails(id),
        tmdb.getTrendingTV() // Fallback similar for mock
    ]);

    const embedUrl = `https://vidsrc.me/embed/tv?tmdb=${id}&season=${season}&ep=${episode}`;

    return (
        <div className="min-h-screen bg-black text-white pt-20 flex flex-col">
            {/* Header / Back button */}
            <div className="px-4 py-4 md:px-12 flex items-center justify-between z-10 border-b border-white/5 bg-black/50 backdrop-blur-md">
                <Link href="/series" className="text-gray-400 hover:text-white flex items-center gap-2 group transition-colors">
                    <ChevronLeft className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium">Back to Series</span>
                </Link>
                <div className="text-sm font-semibold text-primary-400 flex flex-col items-end">
                    <span>{details?.name || 'Unknown Series'}</span>
                    <span className="text-gray-500 text-xs text-right">Season {season} • Episode {episode}</span>
                </div>
            </div>

            <div className="w-full flex flex-col xl:flex-row max-w-[1600px] mx-auto">
                {/* Video Player Container (Main Content) */}
                <div className="w-full xl:w-3/4 flex flex-col">
                    <div className="w-full aspect-video bg-dark-300 relative shadow-2xl xl:rounded-br-xl overflow-hidden">
                        <iframe
                            src={embedUrl}
                            className="w-full h-full absolute top-0 left-0"
                            allowFullScreen
                            frameBorder="0"
                        ></iframe>
                    </div>

                    {/* Series Details metadata */}
                    <div className="w-full p-6 md:p-8">
                        <h1 className="text-3xl md:text-4xl font-black mb-2">
                            {details?.name} <span className="text-gray-500 font-medium text-2xl ml-2">S{season}:E{episode}</span>
                        </h1>
                        <div className="flex items-center gap-4 text-sm text-gray-400 mb-6 font-medium">
                            <span className="text-green-400">{(details?.vote_average * 10).toFixed(0)}% Match</span>
                            <span>{details?.first_air_date?.split('-')[0]}</span>
                            {details?.genres && (
                                <span className="flex gap-2 hidden md:flex">
                                    {details.genres.slice(0, 3).map(g => (
                                        <span key={g.id} className="border border-white/20 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider">
                                            {g.name}
                                        </span>
                                    ))}
                                </span>
                            )}
                        </div>
                        <p className="text-gray-300 max-w-3xl leading-relaxed">
                            {details?.overview}
                        </p>
                    </div>
                </div>

                {/* Episode Selector Sidebar */}
                <div className="w-full xl:w-1/4 bg-dark-200 border-l border-white/5 flex flex-col max-h-[800px] overflow-hidden">
                    <div className="p-4 border-b border-white/5 flex items-center gap-2 bg-dark-300/50">
                        <ListVideo size={20} className="text-primary-400" />
                        <h3 className="font-bold text-lg">Episodes</h3>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {/* Mocking a list of 10 episodes for the current season */}
                        {Array.from({ length: 10 }).map((_, i) => {
                            const epNum = i + 1;
                            const isActive = epNum.toString() === episode;

                            return (
                                <Link
                                    key={epNum}
                                    href={`/watch/tv/${id}/${season}/${epNum}`}
                                    className={`flex gap-4 p-3 rounded-xl transition-all ${isActive ? 'bg-primary-600/20 border border-primary-500/30' : 'hover:bg-white/5 border border-transparent'}`}
                                >
                                    <div className={`w-32 aspect-video bg-dark-300 rounded overflow-hidden relative shrink-0 ${isActive ? 'ring-2 ring-primary-500' : ''}`}>
                                        <img
                                            src={tmdb.getImageUrl(details?.backdrop_path || details?.poster_path, 'w500')}
                                            alt="Episode thumbnail"
                                            className="w-full h-full object-cover opacity-70"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Play size={24} className={isActive ? 'text-primary-400' : 'text-white/50'} fill="currentColor" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <span className={`font-bold text-sm ${isActive ? 'text-primary-400' : 'text-white'}`}>
                                            Episode {epNum}
                                        </span>
                                        <span className="text-xs text-gray-500 mt-1 line-clamp-2">
                                            The story continues as secrets unfold in the latest installment...
                                        </span>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Similar Series Row */}
            <div className="w-full bg-black mt-auto pb-12 pt-8">
                <div className="max-w-[1600px] mx-auto">
                    <MediaRow title="More Like This" items={similarRes.results} />
                </div>
            </div>
        </div>
    );
}
