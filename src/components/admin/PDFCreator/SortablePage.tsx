import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { X, Edit2, GripVertical, RefreshCw } from 'lucide-react';

interface SortablePageProps {
    id: string;
    imageUrl: string;
    pageNumber: number;
    onRemove: (id: string) => void;
    onEdit: (id: string) => void;
    onReplace: (id: string) => void;
}

export const SortablePage: React.FC<SortablePageProps> = ({
    id,
    imageUrl,
    pageNumber,
    onRemove,
    onEdit,
    onReplace,
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="group relative aspect-[3/4] bg-dark-200 rounded-lg overflow-hidden border border-dark-border hover:border-primary-500 transition-colors"
        >
            {/* Image */}
            <img
                src={imageUrl}
                alt={`Page ${pageNumber}`}
                className="w-full h-full object-cover"
            />

            {/* Overlay Actions */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between">
                <span className="text-xs font-bold bg-dark-300/80 px-2 py-1 rounded text-white">
                    {pageNumber}
                </span>

                <div className="flex gap-2">
                    <button
                        onClick={() => onReplace(id)}
                        className="p-1.5 bg-gray-600 hover:bg-gray-700 rounded-full text-white shadow-lg transition-transform hover:scale-110"
                        title="Replace Page"
                    >
                        <RefreshCw size={14} />
                    </button>
                    <button
                        onClick={() => onEdit(id)}
                        className="p-1.5 bg-blue-600 hover:bg-blue-700 rounded-full text-white shadow-lg transition-transform hover:scale-110"
                        title="Edit Page"
                    >
                        <Edit2 size={14} />
                    </button>
                    <button
                        onClick={() => onRemove(id)}
                        className="p-1.5 bg-red-600 hover:bg-red-700 rounded-full text-white shadow-lg transition-transform hover:scale-110"
                        title="Remove Page"
                    >
                        <X size={14} />
                    </button>
                </div>
            </div>

            {/* Drag Handle */}
            <div
                {...attributes}
                {...listeners}
                className="absolute top-2 right-2 p-1.5 bg-black/40 hover:bg-black/60 backdrop-blur rounded cursor-grab active:cursor-grabbing text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <GripVertical size={16} />
            </div>
        </div>
    );
};
