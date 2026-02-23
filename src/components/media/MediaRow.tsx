'use client';

import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MediaItem } from '@/types/media';
import MediaCard from './MediaCard';

interface MediaRowProps {
    title: string;
    items: MediaItem[];
    isLargeRow?: boolean;
}

export default function MediaRow({ title, items, isLargeRow = false }: MediaRowProps) {
    const rowRef = useRef<HTMLDivElement>(null);
    const [isMoved, setIsMoved] = useState(false);

    if (!items || items.length === 0) return null;

    const handleScroll = (direction: 'left' | 'right') => {
        setIsMoved(true);
        if (rowRef.current) {
            const { scrollLeft, clientWidth } = rowRef.current;
            const scrollTo = direction === 'left' ? scrollLeft - clientWidth + 50 : scrollLeft + clientWidth - 50;

            rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    return (
        <div className="space-y-2 md:space-y-4 my-6 md:my-10 relative group">
            <h2 className="text-white font-bold text-lg md:text-2xl pl-4 md:pl-12 absolute -top-8 z-20">
                {title}
            </h2>

            <div className="relative">
                {/* Left Fade & Arrow */}
                {isMoved && (
                    <div
                        className="absolute top-0 bottom-0 left-0 w-12 z-30 bg-gradient-to-r from-dark-100 to-transparent flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition duration-200"
                        onClick={() => handleScroll('left')}
                    >
                        <ChevronLeft size={40} className="text-white hover:scale-125 transition" />
                    </div>
                )}

                {/* Scrollable Container */}
                <div
                    ref={rowRef}
                    className="flex overflow-x-scroll scrollbar-hide py-4 pl-4 md:pl-12 space-x-3 md:space-x-4 h-full"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {items.map(item => (
                        <MediaCard key={item.id} item={item} isLarge={isLargeRow} />
                    ))}
                    <div className="pr-4 md:pr-12"></div> {/* Right padding to prevent cutoff */}
                </div>

                {/* Right Fade & Arrow */}
                <div
                    className="absolute top-0 bottom-0 right-0 w-12 md:w-20 z-30 bg-gradient-to-l from-dark-100 to-transparent flex items-center justify-end md:justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition duration-200 pr-2 md:pr-0"
                    onClick={() => handleScroll('right')}
                >
                    <ChevronRight size={40} className="text-white hover:scale-125 transition" />
                </div>
            </div>
        </div>
    );
}
