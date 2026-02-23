import React from 'react';
import { tmdb } from '@/lib/tmdb';
import MediaRow from '@/components/media/MediaRow';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

interface MovieWatchPageProps {
    params: {
        id: string;
    };
}

export default async function MovieWatchPage({ params }: MovieWatchPageProps) {
    const { id } = await params;

    // Fetch details and similar movies concurrently
    const [details, similarRes] = await Promise.all([
        tmdb.getMovieDetails(id),
        tmdb.getMoviesByGenre(28) // Using an action block as "similar" fallback for the mock
    ]);

    const embedUrl = `https://vidsrc.me/embed/movie?tmdb=${id}`;

    return (
        <div className="min-h-screen bg-black text-white pt-20 flex flex-col">
            {/* Header / Back button */}
            <div className="px-4 py-4 md:px-12 flex items-center justify-between z-10">
                <Link href="/movies" className="text-gray-400 hover:text-white flex items-center gap-2 group transition-colors">
                    <ChevronLeft className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium">Back to Movies</span>
                </Link>
                <div className="text-sm font-semibold text-primary-400">
                    {details?.title || 'Unknown Title'}
                </div>
            </div>

            {/* Video Player Container */}
            <div className="w-full flex-1 max-w-7xl mx-auto flex flex-col items-center">
                <div className="w-full aspect-video bg-dark-300 relative shadow-2xl rounded-xl overflow-hidden border border-white/5">
                    <iframe
                        src={embedUrl}
                        className="w-full h-full absolute top-0 left-0"
                        allowFullScreen
                        frameBorder="0"
                    ></iframe>
                </div>

                {/* Movie Details metadata */}
                <div className="w-full mt-6 px-4 md:px-0 mb-12">
                    <h1 className="text-3xl md:text-5xl font-black mb-2">{details?.title}</h1>
                    <div className="flex items-center gap-4 text-sm text-gray-400 mb-6 font-medium">
                        <span className="text-green-400">{(details?.vote_average * 10).toFixed(0)}% Match</span>
                        <span>{details?.release_date?.split('-')[0]}</span>
                        {details?.runtime && <span>{Math.floor(details.runtime / 60)}h {details.runtime % 60}m</span>}
                        {details?.genres && (
                            <span className="flex gap-2">
                                {details.genres.slice(0, 3).map(g => (
                                    <span key={g.id} className="border border-white/20 px-2 py-0.5 rounded-full text-xs">
                                        {g.name}
                                    </span>
                                ))}
                            </span>
                        )}
                    </div>
                    <p className="text-gray-300 max-w-3xl leading-relaxed text-lg">
                        {details?.overview}
                    </p>
                </div>
            </div>

            {/* Similar Movies Row */}
            <div className="w-full bg-dark-200 mt-auto pb-12 pt-6">
                <div className="max-w-7xl mx-auto">
                    <MediaRow title="More Like This" items={similarRes.results} />
                </div>
            </div>
        </div>
    );
}
