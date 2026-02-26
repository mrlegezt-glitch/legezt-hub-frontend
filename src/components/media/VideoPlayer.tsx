'use client';

import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface VideoPlayerProps {
    tmdbId: string | number;
    type: 'movie' | 'tv';
    season?: string | number;
    episode?: string | number;
}

export default function VideoPlayer({ tmdbId, type, season, episode }: VideoPlayerProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [audioTrack, setAudioTrack] = useState('en');
    const [isAudioMenuOpen, setIsAudioMenuOpen] = useState(false);

    // Audio tracks available for the UI
    const audioOptions = [
        { code: 'en', label: 'English (Original)' },
        { code: 'hi', label: 'Hindi (Dubbed)' },
        { code: 'ta', label: 'Tamil' },
        { code: 'te', label: 'Telugu' }
    ];

    // Use vidking.net — robust, customizable, reliable with Netflix Red theme
    const embedUrl = type === 'movie'
        ? `https://www.vidking.net/embed/movie/${tmdbId}?color=e50914&autoPlay=true`
        : `https://www.vidking.net/embed/tv/${tmdbId}/${season}/${episode}?color=e50914&autoPlay=true&nextEpisode=true&episodeSelector=true`;

    return (
        <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50">
            {/* Loading Skeleton */}
            {isLoading && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-dark-300/90 backdrop-blur-sm">
                    <Loader2 size={48} className="animate-spin text-primary-500 mb-4" />
                    <p className="text-gray-400 text-sm font-medium animate-pulse">Loading player...</p>
                </div>
            )}

            {/* Error State */}
            {hasError && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-dark-300">
                    <div className="text-6xl mb-4">🎬</div>
                    <p className="text-white font-bold text-lg mb-2">Playback Unavailable</p>
                    <p className="text-gray-400 text-sm max-w-md text-center">
                        This content is not available right now. Try refreshing the page or come back later.
                    </p>
                </div>
            )}

            <iframe
                src={embedUrl}
                className="w-full h-full absolute inset-0 md:rounded-xl"
                allowFullScreen
                allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                referrerPolicy="origin"
                sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"
                style={{ border: 'none' }}
                onLoad={() => setIsLoading(false)}
                onError={() => { setIsLoading(false); setHasError(true); }}
            />

            {/* Simulated Multi-Audio UI Overlay */}
            {!isLoading && !hasError && (
                <div className="absolute top-2 md:top-4 right-2 md:right-4 z-50">
                    <button
                        onClick={() => setIsAudioMenuOpen(!isAudioMenuOpen)}
                        className="flex items-center gap-2 bg-black/70 hover:bg-black/90 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg backdrop-blur-md border border-white/20 transition-all shadow-lg active:scale-95"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-80"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.48 0-4.5-2.02-4.5-4.5S9.52 7.5 12 7.5s4.5 2.02 4.5 4.5-2.02 4.5-4.5 4.5z" /></svg>
                        <span className="text-xs md:text-sm font-semibold uppercase tracking-wider">{audioTrack}</span>
                    </button>

                    {isAudioMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-dark-200/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-fade-in-up">
                            <div className="px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-white/5">
                                Audio Tracks
                            </div>
                            <div className="flex flex-col py-1">
                                {audioOptions.map((opt) => (
                                    <button
                                        key={opt.code}
                                        onClick={() => {
                                            setAudioTrack(opt.code);
                                            setIsAudioMenuOpen(false);
                                            // Brief loading state simulation when switching audio tracks
                                            setIsLoading(true);
                                            setTimeout(() => setIsLoading(false), 800);
                                        }}
                                        className={`flex items-center justify-between px-4 py-2.5 text-xs md:text-sm font-medium transition-colors hover:bg-white/5 ${audioTrack === opt.code ? 'text-primary-400 bg-primary-500/10' : 'text-gray-300'}`}
                                    >
                                        {opt.label}
                                        {audioTrack === opt.code && (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
