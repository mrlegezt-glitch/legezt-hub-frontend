'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Play, Plus, Star } from 'lucide-react';
import { MediaItem } from '@/types/media';
import { tmdb } from '@/lib/tmdb';

interface MediaCardProps {
    item: MediaItem;
    isLarge?: boolean;
}

export default function MediaCard({ item, isLarge = false }: MediaCardProps) {
    const title = item.title || item.name || 'Untitled';
    const isTV = item.media_type === 'tv' || (!item.title && item.name !== undefined) || !!item.first_air_date;

    const watchLink = isTV
        ? `/watch/tv/${item.id}/1/1`
        : `/watch/movie/${item.id}`;

    const imageUrl = isLarge
        ? tmdb.getImageUrl(item.poster_path, 'w500')
        : tmdb.getImageUrl(item.backdrop_path || item.poster_path, 'w500');

    const year = item.release_date?.split('-')[0] || item.first_air_date?.split('-')[0] || '';
    const rating = item.vote_average ? item.vote_average.toFixed(1) : null;

    return (
        <motion.div
            whileHover={{ scale: 1.08, zIndex: 20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className={`relative group shrink-0 ${isLarge ? 'w-[140px] md:w-[180px]' : 'w-[220px] md:w-[280px]'} rounded-xl overflow-hidden bg-dark-300 cursor-pointer`}
        >
            <Link href={watchLink} className="block w-full h-full">
                {/* Image */}
                <div className={`w-full ${isLarge ? 'aspect-[2/3]' : 'aspect-video'} bg-dark-300 relative overflow-hidden`}>
                    <img
                        src={imageUrl}
                        alt={title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder-media.png';
                        }}
                    />

                    {/* Always-visible bottom gradient with title */}
                    <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/95 via-black/50 to-transparent pointer-events-none" />

                    {/* Rating badge */}
                    {rating && (
                        <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded-md text-[10px] font-bold text-yellow-400 border border-yellow-500/20">
                            <Star size={10} fill="currentColor" />
                            {rating}
                        </div>
                    )}

                    {/* Media type badge */}
                    {isTV && (
                        <div className="absolute top-2 left-2 bg-primary-600/90 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider">
                            Series
                        </div>
                    )}

                    {/* Title & Meta — always visible */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
                        <h3 className="text-white font-bold text-xs md:text-sm line-clamp-1 drop-shadow-lg mb-0.5">
                            {title}
                        </h3>
                        <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium">
                            {year && <span>{year}</span>}
                            {item.vote_average > 0 && (
                                <span className="text-green-400">{(item.vote_average * 10).toFixed(0)}%</span>
                            )}
                        </div>
                    </div>

                    {/* Hover overlay with actions */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3">
                        <div className="bg-white text-black p-3 rounded-full shadow-xl shadow-white/20 hover:scale-110 transition-transform">
                            <Play size={20} fill="currentColor" className="ml-0.5" />
                        </div>
                        <div className="bg-white/10 text-white p-2.5 rounded-full border border-white/30 hover:border-white hover:bg-white/20 transition-all">
                            <Plus size={18} />
                        </div>
                    </div>

                    {/* Hover border glow */}
                    <div className="absolute inset-0 rounded-xl ring-0 group-hover:ring-2 ring-primary-500/60 transition-all duration-300 pointer-events-none" />
                </div>
            </Link>
        </motion.div>
    );
}
