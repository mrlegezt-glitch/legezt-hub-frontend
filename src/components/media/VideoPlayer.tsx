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

    // Use vidsrc.xyz — most reliable, plays inline, no external redirects
    const embedUrl = type === 'movie'
        ? `https://vidsrc.xyz/embed/movie/${tmdbId}`
        : `https://vidsrc.xyz/embed/tv/${tmdbId}/${season}/${episode}`;

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
                className="w-full h-full absolute inset-0"
                allowFullScreen
                allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                referrerPolicy="origin"
                style={{ border: 'none' }}
                onLoad={() => setIsLoading(false)}
                onError={() => { setIsLoading(false); setHasError(true); }}
            />
        </div>
    );
}
