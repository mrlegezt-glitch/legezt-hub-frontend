import React, { useRef, useState } from 'react';
import Cropper, { ReactCropperElement } from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { FilterType, applyFilter } from './imageProcessor';
import { RotateCw, Check, X, Wand2, Image as ImageIcon } from 'lucide-react';

interface ImageEditorProps {
    imageUrl: string;
    onSave: (newUrl: string, filter: FilterType) => void;
    onCancel: () => void;
}

export const ImageEditor: React.FC<ImageEditorProps> = ({ imageUrl, onSave, onCancel }) => {
    const cropperRef = useRef<ReactCropperElement>(null);
    const [currentFilter, setCurrentFilter] = useState<FilterType>('original');
    const [previewUrl, setPreviewUrl] = useState(imageUrl);
    const [processing, setProcessing] = useState(false);

    const handleApplyFilter = async (filter: FilterType) => {
        if (filter === currentFilter) return;
        setProcessing(true);
        try {
            // Apply filter to the ORIGINAL image for preview
            // NOTE: In a real app, we might want to apply filter to the cropped result,
            // but for this UI, we treat filter as a global setting for the image.
            // Simplified: Just applying to the source for now.
            // Ideally: Crop first, then filter. Or Filter then crop.
            // cropper.js keeps the original.
            // Let's just track state and apply on save.
            setCurrentFilter(filter);

            // To update preview immediately we'd need to process the whole image.
            // For performance, let's just update the state and trust the 'Save' logic.
            // Or better: Let user filter -> then crop.
        } finally {
            setProcessing(false);
        }
    };

    const handleRotate = () => {
        const cropper = cropperRef.current?.cropper;
        if (cropper) {
            cropper.rotate(90);
        }
    };

    const handleSave = async () => {
        setProcessing(true);
        const cropper = cropperRef.current?.cropper;
        if (cropper) {
            // 1. Get cropped canvas
            const canvas = cropper.getCroppedCanvas();
            if (!canvas) return;

            // 2. Export base64
            let finalUrl = canvas.toDataURL('image/jpeg', 0.9);

            // 3. Apply filter if needed
            if (currentFilter !== 'original') {
                finalUrl = await applyFilter(finalUrl, currentFilter);
            }

            onSave(finalUrl, currentFilter);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-4 bg-dark-300 border-b border-dark-border">
                <h3 className="text-white font-medium">Edit Image</h3>
                <div className="flex gap-2">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={processing}
                        className="flex items-center gap-2 px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                        {processing ? 'Processing...' : <><Check size={18} /> Done</>}
                    </button>
                </div>
            </div>

            {/* Main Area */}
            <div className="flex-1 relative bg-black flex items-center justify-center p-4">
                <Cropper
                    src={imageUrl}
                    style={{ height: '100%', width: '100%' }}
                    initialAspectRatio={NaN} // Free crop
                    guides={true}
                    ref={cropperRef}
                    viewMode={1}
                    autoCropArea={0.9}
                    background={false}
                />
            </div>

            {/* Footer Tools */}
            <div className="p-4 bg-dark-300 border-t border-dark-border flex items-center justify-center gap-6">
                {/* Filters */}
                <div className="flex gap-2 mr-8 border-r border-gray-700 pr-8">
                    <button
                        onClick={() => handleApplyFilter('original')}
                        className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${currentFilter === 'original' ? 'bg-primary-600/20 text-primary-400' : 'text-gray-400 hover:text-white'}`}
                    >
                        <ImageIcon size={20} />
                        <span className="text-xs">Original</span>
                    </button>
                    <button
                        onClick={() => handleApplyFilter('magic')}
                        className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${currentFilter === 'magic' ? 'bg-primary-600/20 text-primary-400' : 'text-gray-400 hover:text-white'}`}
                    >
                        <Wand2 size={20} />
                        <span className="text-xs">Magic</span>
                    </button>
                    <button
                        onClick={() => handleApplyFilter('bw')}
                        className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${currentFilter === 'bw' ? 'bg-primary-600/20 text-primary-400' : 'text-gray-400 hover:text-white'}`}
                    >
                        <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-black to-white border border-gray-500" />
                        <span className="text-xs">B&W</span>
                    </button>
                </div>

                {/* Rotate */}
                <button
                    onClick={handleRotate}
                    className="flex flex-col items-center gap-1 p-2 text-gray-400 hover:text-white transition-colors"
                >
                    <RotateCw size={20} />
                    <span className="text-xs">Rotate</span>
                </button>
            </div>
        </div>
    );
};
