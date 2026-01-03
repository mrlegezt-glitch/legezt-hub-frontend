'use client';

// ==================================
// PDF Card Component
// ==================================

import Link from 'next/link';
import { FileText, Download, Eye } from 'lucide-react';

interface PdfCardProps {
    id: string;
    title: string;
    description?: string;
    sizeFormatted: string;
    downloadCount: number;
    viewCount: number;
    thumbnailUrl?: string | null;
    folder?: any; // Contains hierarchy info
}

export default function PdfCard({
    id,
    title,
    description,
    sizeFormatted,
    downloadCount,
    viewCount,
    thumbnailUrl,
    folder,
}: PdfCardProps) {
    return (
        <Link href={`/pdfs/${id}`} className="pdf-card group relative overflow-hidden">
            {/* PDF Thumbnail/Icon */}
            <div className="relative w-16 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-dark-200 border border-dark-border group-hover:border-primary-500/50 transition-colors">
                {thumbnailUrl ? (
                    <img src={thumbnailUrl} alt={title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                        <FileText size={24} className="text-white" />
                    </div>
                )}

                {/* View Count Overlay Badge */}
                <div className="absolute top-1 right-1 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-bold text-white flex items-center gap-1 shadow-sm">
                    <Eye size={10} className="text-white" /> {viewCount}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 py-1">
                <h3 className="font-medium truncate group-hover:text-primary-400 transition-colors text-sm md:text-base">
                    {title}
                </h3>
                {description && (
                    <p className="text-xs text-gray-400 truncate mb-1">{description}</p>
                )}
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    {/* Hierarchy Info (Backlog Context) */}
                    {(folder as any)?.subject?.semester && (
                        <span className="hidden md:inline-flex items-center text-primary-400 font-medium bg-primary-500/10 px-1.5 py-0.5 rounded">
                            {(folder as any).subject.semester.year?.displayName} • {(folder as any).subject.semester.displayName}
                        </span>
                    )}

                    <span>{sizeFormatted}</span>
                    <span className="flex items-center gap-1">
                        <Download size={12} /> {downloadCount}
                    </span>
                </div>
            </div>
        </Link>
    );
}
