'use client';

import React, { useRef, useState, useEffect } from 'react';
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
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    if (!items || items.length === 0) return null;

    const checkScroll = () => {
        if (!rowRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
        setCanScrollLeft(scrollLeft > 10);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    };

    const handleScroll = (direction: 'left' | 'right') => {
        if (rowRef.current) {
            const scrollAmount = rowRef.current.clientWidth * 0.75;
            const newPos = direction === 'left'
                ? rowRef.current.scrollLeft - scrollAmount
                : rowRef.current.scrollLeft + scrollAmount;
            rowRef.current.scrollTo({ left: newPos, behavior: 'smooth' });
        }
    };

    return (
        <div className="relative group/row py-4 md:py-6">
            {/* Title */}
            <h2 className="text-white font-bold text-base md:text-xl pl-4 md:pl-12 mb-3 md:mb-4 flex items-center gap-3">
                <span className="bg-primary-600 w-1 h-5 rounded-full inline-block" />
                {title}
            </h2>

            <div className="relative">
                {/* Left Arrow */}
                {canScrollLeft && (
                    <button
                        className="absolute top-0 bottom-0 left-0 w-10 md:w-14 z-30 bg-gradient-to-r from-dark-100/95 to-transparent flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-all duration-300 hover:from-dark-100"
                        onClick={() => handleScroll('left')}
                        aria-label="Scroll left"
                    >
                        <ChevronLeft size={28} className="text-white drop-shadow-lg" />
                    </button>
                )}

                {/* Scrollable Container */}
                <div
                    ref={rowRef}
                    className="flex overflow-x-auto scrollbar-hide pl-4 md:pl-12 pr-4 md:pr-12 gap-3 md:gap-4 scroll-smooth"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    onScroll={checkScroll}
                >
                    {items.map(item => (
                        <MediaCard key={item.id} item={item} isLarge={isLargeRow} />
                    ))}
                </div>

                {/* Right Arrow */}
                {canScrollRight && (
                    <button
                        className="absolute top-0 bottom-0 right-0 w-10 md:w-14 z-30 bg-gradient-to-l from-dark-100/95 to-transparent flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-all duration-300 hover:from-dark-100"
                        onClick={() => handleScroll('right')}
                        aria-label="Scroll right"
                    >
                        <ChevronRight size={28} className="text-white drop-shadow-lg" />
                    </button>
                )}
            </div>
        </div>
    );
}
