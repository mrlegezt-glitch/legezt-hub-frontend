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
    folder?: any; // Contains hierarchy info
}

export default function PdfCard({
    id,
    title,
    description,
    sizeFormatted,
    downloadCount,
    viewCount,
    folder,
}: PdfCardProps) {
    return (
        <Link href={`/pdfs/${id}`} className="pdf-card group">
            {/* PDF Icon */}
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center flex-shrink-0">
                <FileText size={24} className="text-white" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate group-hover:text-primary-400 transition-colors">
                    {title}
                </h3>
                {description && (
                    <p className="text-sm text-gray-400 truncate">{description}</p>
                )}
                <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                    {/* Hierarchy Info (Backlog Context) */}
                    {(folder as any)?.subject?.semester && (
                        <span className="hidden md:inline-flex items-center text-primary-400 font-medium">
                            {(folder as any).subject.semester.year?.displayName} • {(folder as any).subject.semester.displayName}
                        </span>
                    )}

                    <span>{sizeFormatted}</span>
                    <span className="flex items-center gap-1">
                        <Eye size={12} /> {viewCount}
                    </span>
                    <span className="flex items-center gap-1">
                        <Download size={12} /> {downloadCount}
                    </span>
                </div>
            </div>
        </Link>
    );
}
