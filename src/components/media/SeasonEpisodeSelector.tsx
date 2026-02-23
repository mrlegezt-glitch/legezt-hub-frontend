'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Play, ChevronDown } from 'lucide-react';

interface SeasonEpisodeSelectorProps {
    showId: string | number;
    currentSeason: number;
    currentEpisode: number;
    totalSeasons: number;
    totalEpisodes: number;
    backdropUrl: string;
}

export default function SeasonEpisodeSelector({
    showId,
    currentSeason,
    currentEpisode,
    totalSeasons,
    totalEpisodes,
    backdropUrl
}: SeasonEpisodeSelectorProps) {
    const [selectedSeason, setSelectedSeason] = useState(currentSeason);
    const [isSeasonDropdownOpen, setIsSeasonDropdownOpen] = useState(false);

    const seasons = Array.from({ length: Math.max(totalSeasons, 1) }, (_, i) => i + 1);
    const episodes = Array.from({ length: Math.max(totalEpisodes, 8) }, (_, i) => i + 1);

    return (
        <div className="w-full bg-dark-200/50 border-t border-white/5">
            {/* Season Selector */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                    <span className="bg-primary-600 w-1 h-4 rounded-full inline-block" />
                    Episodes
                </h3>

                {/* Season Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setIsSeasonDropdownOpen(!isSeasonDropdownOpen)}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-semibold text-white hover:bg-white/10 transition-colors"
                    >
                        Season {selectedSeason}
                        <ChevronDown size={14} className={`transition-transform ${isSeasonDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isSeasonDropdownOpen && (
                        <div className="absolute right-0 top-full mt-2 bg-dark-300 border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50 min-w-[160px]">
                            {seasons.map(s => (
                                <Link
                                    key={s}
                                    href={`/watch/tv/${showId}/${s}/1`}
                                    onClick={() => { setSelectedSeason(s); setIsSeasonDropdownOpen(false); }}
                                    className={`block px-4 py-2.5 text-sm font-medium hover:bg-white/5 transition-colors ${s === currentSeason
                                            ? 'text-primary-400 bg-primary-600/10 border-l-2 border-primary-500'
                                            : 'text-gray-300 border-l-2 border-transparent'
                                        }`}
                                >
                                    Season {s}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Episode Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 p-4 max-h-[500px] overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#333 transparent' }}>
                {episodes.map(epNum => {
                    const isActive = epNum === currentEpisode && selectedSeason === currentSeason;

                    return (
                        <Link
                            key={epNum}
                            href={`/watch/tv/${showId}/${selectedSeason}/${epNum}`}
                            className={`group relative rounded-xl overflow-hidden transition-all hover:scale-105 ${isActive
                                    ? 'ring-2 ring-primary-500 shadow-lg shadow-primary-500/20'
                                    : 'hover:ring-1 hover:ring-white/20'
                                }`}
                        >
                            {/* Thumbnail */}
                            <div className="aspect-video bg-dark-300 relative overflow-hidden">
                                <img
                                    src={backdropUrl}
                                    alt={`Episode ${epNum}`}
                                    className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-110 transition-all duration-300"
                                    onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-media.png'; }}
                                />

                                {/* Play icon overlay */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className={`rounded-full p-2 transition-all ${isActive
                                            ? 'bg-primary-600 text-white scale-100'
                                            : 'bg-black/50 text-white/60 scale-90 group-hover:scale-100 group-hover:text-white'
                                        }`}>
                                        <Play size={16} fill="currentColor" />
                                    </div>
                                </div>

                                {/* Episode number overlay */}
                                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent p-2">
                                    <p className={`text-xs font-bold ${isActive ? 'text-primary-400' : 'text-white'}`}>
                                        Ep {epNum}
                                    </p>
                                </div>

                                {/* Now Playing indicator */}
                                {isActive && (
                                    <div className="absolute top-1.5 right-1.5 bg-primary-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                                        Playing
                                    </div>
                                )}
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
