import React, { useState } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy
} from '@dnd-kit/sortable';
import { X, Upload, Plus, FileDown, Scan, Sparkles } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { SortablePage } from './SortablePage';
import { ImageEditor } from './ImageEditor';
import { generatePDFFromImages } from './pdfGenerator';
import { FilterType } from './imageProcessor';
import { toast } from 'sonner';

interface PDFPage {
    id: string;
    originalUrl: string; // Keep original for re-editing
    displayUrl: string;  // Current version (cropped/filtered)
    filter: FilterType;
}

interface PDFCreatorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: (file: File) => void;
}

export const PDFCreatorModal: React.FC<PDFCreatorModalProps> = ({
    isOpen,
    onClose,
    onComplete
}) => {
    const [pages, setPages] = useState<PDFPage[]>([]);
    const [editingPageId, setEditingPageId] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newPages: PDFPage[] = Array.from(e.target.files).map(file => {
                const url = URL.createObjectURL(file);
                return {
                    id: uuidv4(),
                    originalUrl: url,
                    displayUrl: url,
                    filter: 'original'
                };
            });
            setPages(prev => [...prev, ...newPages]);

            // Open editor for the first new image automatically if it's the first upload
            if (pages.length === 0 && newPages.length > 0) {
                setEditingPageId(newPages[0].id);
            }
        }
        // Reset input
        e.target.value = '';
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setPages((items) => {
                const oldIndex = items.findIndex(i => i.id === active.id);
                const newIndex = items.findIndex(i => i.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleSaveEdit = (newUrl: string, filter: FilterType) => {
        if (editingPageId) {
            setPages(prev => prev.map(p =>
                p.id === editingPageId
                    ? { ...p, displayUrl: newUrl, filter }
                    : p
            ));
            setEditingPageId(null);
        }
    };

    const handleRemovePage = (id: string) => {
        setPages(prev => prev.filter(p => p.id !== id));
    };

    const handleFinish = async () => {
        if (pages.length === 0) return;
        setIsGenerating(true);
        try {
            const images = pages.map(p => p.displayUrl);
            const pdfFile = await generatePDFFromImages(images, `scanned_doc_${Date.now()}.pdf`);
            onComplete(pdfFile);
            onClose();
            toast.success('PDF Generated Successfully!');
        } catch (error) {
            console.error(error);
            toast.error('Failed to generate PDF');
        } finally {
            setIsGenerating(false);
        }
    };

    if (!isOpen) return null;

    // EDITOR VIEW
    if (editingPageId) {
        const page = pages.find(p => p.id === editingPageId);
        if (page) {
            return (
                <ImageEditor
                    imageUrl={page.originalUrl} // Always edit from original
                    onSave={handleSaveEdit}
                    onCancel={() => setEditingPageId(null)}
                />
            );
        }
    }

    // MAIN VIEW
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-dark-200 w-full max-w-5xl h-full md:h-[85vh] rounded-none md:rounded-2xl border-y-0 border-x-0 md:border border-dark-border shadow-2xl flex flex-col overflow-hidden">

                {/* Header */}
                <div className="px-6 py-4 border-b border-dark-border flex items-center justify-between bg-dark-300">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-500/10 rounded-lg">
                            <Scan className="text-primary-500" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">PDF Creator Studio</h2>
                            <p className="text-xs text-gray-400">Scan, Crop, Filter & Create</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 bg-dark-100">
                    {pages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center border-2 border-dashed border-dark-border rounded-xl">
                            <div className="w-20 h-20 bg-dark-300 rounded-full flex items-center justify-center mb-6 animate-pulse">
                                <Sparkles className="text-primary-500" size={32} />
                            </div>
                            <h3 className="text-xl font-medium text-white mb-2">Start Creating your PDF</h3>
                            <p className="text-gray-400 max-w-sm mb-8">
                                Upload images from your gallery or camera. You can crop, filter, and reorder them before converting.
                            </p>

                            <label className="group relative flex items-center gap-3 px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-lg cursor-pointer transition-all hover:scale-105 shadow-lg shadow-primary-600/20">
                                <Plus size={24} />
                                <span>Add Images</span>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileUpload}
                                />
                            </label>
                        </div>
                    ) : (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={pages.map(p => p.id)}
                                strategy={rectSortingStrategy}
                            >
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                    {pages.map((page, index) => (
                                        <SortablePage
                                            key={page.id}
                                            id={page.id}
                                            imageUrl={page.displayUrl}
                                            pageNumber={index + 1}
                                            onRemove={handleRemovePage}
                                            onEdit={setEditingPageId}
                                        />
                                    ))}

                                    {/* Add More Button */}
                                    <label className="aspect-[3/4] border-2 border-dashed border-dark-border hover:border-primary-500 rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-dark-200/50 hover:bg-dark-200 text-gray-400 hover:text-primary-500">
                                        <Plus size={32} />
                                        <span className="text-sm font-medium">Add Page</span>
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleFileUpload}
                                        />
                                    </label>
                                </div>
                            </SortableContext>
                        </DndContext>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-dark-border bg-dark-300 flex items-center justify-between">
                    <div className="text-sm text-gray-400">
                        {pages.length} pages selected
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-lg border border-dark-border hover:bg-white/5 text-gray-300 font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleFinish}
                            disabled={pages.length === 0 || isGenerating}
                            className="flex items-center gap-2 px-8 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg font-bold shadow-lg shadow-primary-600/20 transition-all hover:scale-105 active:scale-95"
                        >
                            {isGenerating ? 'Generating...' : <><FileDown size={20} /> Create PDF</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
