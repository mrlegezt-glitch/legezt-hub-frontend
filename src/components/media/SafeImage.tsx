'use client';

import React from 'react';

interface SafeImageProps {
    src: string;
    alt: string;
    className?: string;
    fallbackSrc?: string;
}

export default function SafeImage({ src, alt, className = '', fallbackSrc = '/placeholder-media.png' }: SafeImageProps) {
    return (
        <img
            src={src}
            alt={alt}
            className={className}
            onError={(e) => {
                (e.target as HTMLImageElement).src = fallbackSrc;
            }}
        />
    );
}
