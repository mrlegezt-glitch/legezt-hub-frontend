'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Play, Info } from 'lucide-react';
import { MediaItem } from '@/types/media';
import { tmdb } from '@/lib/tmdb';

interface MediaCardProps {
    item: MediaItem;
    isLarge?: boolean;
}

export default function MediaCard({ item, isLarge = false }: MediaCardProps) {
    const title = item.title || item.name;
    const isMovie = item.media_type === 'movie' || item.title !== undefined; // best effort fallback if missing media_type

    // Fallback ID checking for TV vs Movie watch URLs
    const watchLink = isMovie
        ? `/watch/movie/${item.id}`
        : `/watch/tv/${item.id}/1/1`; // default to S1E1 for TV series

    const imageUrl = isLarge
        ? tmdb.getImageUrl(item.poster_path, 'w500')
        : tmdb.getImageUrl(item.backdrop_path || item.poster_path, 'w500');

    return (
        <motion.div
            whileHover={{ scale: 1.05, zIndex: 10 }}
            transition={{ duration: 0.2 }}
            className={`relative group shrink-0 ${isLarge ? 'w-48 md:w-56' : 'w-64 md:w-80'} rounded-lg overflow-hidden bg-dark-200 border border-white/5 cursor-pointer max-w-[80vw]`}
        >
            <Link href={watchLink} className="block w-full h-full relative aspect-video">
                {isLarge ? (
                    <div className="aspect-[2/3] w-full bg-dark-300 relative">
                        <img
                            src={imageUrl}
                            alt={title}
                            loading="lazy"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='; // transparent pixel fallback
                            }}
                        />
                    </div>
                ) : (
                    <div className="w-full aspect-video bg-dark-300 relative">
                        <img
                            src={imageUrl}
                            alt={title}
                            loading="lazy"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
                            }}
                        />
                    </div>
                )}

                {/* Netflix-style Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-dark-100 via-dark-100/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <h3 className="text-white font-bold text-sm md:text-base line-clamp-1 mb-2">{title}</h3>
                    <div className="flex items-center gap-2">
                        <button className="bg-white text-black p-1.5 rounded-full hover:bg-gray-200 transition">
                            <Play size={16} className="ml-0.5" />
                        </button>
                        <button className="bg-gray-500/50 text-white p-1.5 rounded-full hover:border-white border border-transparent transition">
                            <Info size={16} />
                        </button>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-[10px] md:text-xs font-semibold text-gray-300">
                        <span className="text-green-400">{(item.vote_average * 10).toFixed(0)}% Match</span>
                        {item.release_date && <span>{item.release_date.split('-')[0]}</span>}
                        {item.first_air_date && <span>{item.first_air_date.split('-')[0]}</span>}
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
