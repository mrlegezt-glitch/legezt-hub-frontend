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
    const [audioTrack, setAudioTrack] = useState('vyse');
    const [isAudioMenuOpen, setIsAudioMenuOpen] = useState(false);

    // Advanced top-tier Server options - utilizing the best embed providers for Multi-Audio/Hindi
    type ServerOption = { id: string; name: string; lang: string; code: string; type: string };
    const servers: ServerOption[] = [
        { id: 'vyse', name: 'Vyse', lang: 'Premium (Best for Multi-Audio)', code: 'US', type: 'embedsu' },
        { id: 'killjoy', name: 'Killjoy', lang: 'Dual Audio / Hindi (HQ)', code: 'IN', type: 'vidsrcnet' },
        { id: 'harbor', name: 'Harbor', lang: 'Global Server (Multi-Sub)', code: 'UK', type: 'vidsrccc' },
        { id: 'chamber', name: 'Chamber', lang: 'Regional & Bollywood', code: 'IN', type: 'autoembed' },
        { id: 'fade', name: 'Fade', lang: 'Backup Server', code: 'IN', type: 'vidking' }
    ];

    const activeServer = servers.find(s => s.id === audioTrack) || servers[0];

    // Generate dynamic embed URL based on the selected "Server"
    const getEmbedUrl = (serverType: string) => {
        const isMovie = type === 'movie';
        switch (serverType) {
            case 'embedsu': // Extremely reliable, often has multi-audio tracks built-in
                return isMovie ? `https://embed.su/embed/movie/${tmdbId}` : `https://embed.su/embed/tv/${tmdbId}/${season}/${episode}`;
            case 'vidsrcnet': // Often has high quality dual-audio
                return isMovie ? `https://vidsrc.net/embed/movie/${tmdbId}` : `https://vidsrc.net/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}`;
            case 'vidsrccc': // Great global alternative
                return isMovie ? `https://vidsrc.cc/v2/embed/movie/${tmdbId}` : `https://vidsrc.cc/v2/embed/tv/${tmdbId}/${season}/${episode}`;
            case 'autoembed': // Good for regional content
                return isMovie ? `https://tom.autoembed.cc/movie/${tmdbId}` : `https://tom.autoembed.cc/tv/${tmdbId}/${season}/${episode}`;
            case 'vidking':
            default:
                return isMovie
                    ? `https://www.vidking.net/embed/movie/${tmdbId}?color=e50914&autoPlay=true`
                    : `https://www.vidking.net/embed/tv/${tmdbId}/${season}/${episode}?color=e50914&autoPlay=true&nextEpisode=true&episodeSelector=true`;
        }
    };

    const embedUrl = getEmbedUrl(activeServer.type);

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

            {/* Server & Audio UI Overlay */}
            {!isLoading && !hasError && (
                <div className="absolute top-2 md:top-4 right-2 md:right-4 z-50">
                    <button
                        onClick={() => setIsAudioMenuOpen(!isAudioMenuOpen)}
                        className="flex items-center gap-2 bg-black/80 hover:bg-black/90 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg backdrop-blur-md border border-white/10 transition-all shadow-xl active:scale-95 group"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
                        <span className="text-xs md:text-sm font-semibold tracking-wide">Servers</span>
                    </button>

                    {isAudioMenuOpen && (
                        <div className="absolute right-0 mt-2 w-[280px] bg-[#1a1c19] border border-white/5 rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
                            <div className="px-4 py-4 border-b border-white/5 flex items-center justify-between bg-[#1f211c]">
                                <div>
                                    <h3 className="text-white font-bold text-sm tracking-wide flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
                                        Servers
                                    </h3>
                                    <p className="text-gray-400 text-xs mt-0.5">Choose your preferred server</p>
                                </div>
                                <button onClick={() => setIsAudioMenuOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                            </div>

                            <div className="flex flex-col p-2 max-h-[350px] overflow-y-auto">
                                {servers.map((server) => (
                                    <button
                                        key={server.id}
                                        onClick={() => {
                                            if (audioTrack === server.id) return;
                                            setAudioTrack(server.id);
                                            setIsAudioMenuOpen(false);
                                            setIsLoading(true); // Retrigger loading for new iframe src
                                        }}
                                        className={`flex items-center gap-4 px-3 py-3 rounded-xl transition-colors text-left ${audioTrack === server.id ? 'bg-white/10' : 'hover:bg-white/5'}`}
                                    >
                                        <div className="w-8 h-6 rounded overflow-hidden shrink-0 border border-white/10 shadow-sm relative">
                                            {/* Flag simulation using standard image services (placeholder for flags) */}
                                            <img src={`https://flagsapi.com/${server.code}/flat/64.png`} alt={server.code} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-bold text-white mb-0.5">{server.name}</div>
                                            <div className="text-xs text-gray-400 truncate">{server.lang}</div>
                                        </div>
                                        <div className="shrink-0 text-gray-500">
                                            {audioTrack === server.id ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="currentColor"></path></svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="hover:text-white transition-colors"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                                            )}
                                        </div>
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
