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
    const [bwThreshold, setBwThreshold] = useState(128); // 0-255
    const [previewUrl, setPreviewUrl] = useState(imageUrl);
    const [processing, setProcessing] = useState(false);
    const [filterApplying, setFilterApplying] = useState(false);

    // Live Preview Effect
    React.useEffect(() => {
        const updatePreview = async () => {
            if (currentFilter === 'original') {
                setPreviewUrl(imageUrl);
                return;
            }

            setFilterApplying(true);
            try {
                // Apply filter to the ORIGINAL source image
                const filtered = await applyFilter(imageUrl, currentFilter, { threshold: bwThreshold });
                setPreviewUrl(filtered);
            } catch (error) {
                console.error("Filter failed", error);
            } finally {
                setFilterApplying(false);
            }
        };

        updatePreview();
    }, [currentFilter, imageUrl, bwThreshold]);

    const handleApplyFilter = (filter: FilterType) => {
        if (filter === currentFilter) return;
        setCurrentFilter(filter);
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
            // 1. Get cropped canvas from the (potentially filtered) source
            // The source (previewUrl) already has the filter applied, so we just crop what we see.
            const canvas = cropper.getCroppedCanvas();
            if (!canvas) {
                setProcessing(false);
                return;
            }

            // 2. Export base64
            const finalUrl = canvas.toDataURL('image/jpeg', 0.9);

            // 3. No need to re-apply filter since we cropped the filtered image
            onSave(finalUrl, currentFilter);
        }
        setProcessing(false); // Just in case onSave doesn't unmount immediately
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Toolbar */}
            {/* Toolbar - Added safe area padding */}
            <div className="flex-shrink-0 flex items-center justify-between p-4 pt-12 md:pt-4 bg-dark-300 border-b border-dark-border z-10">
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
                        disabled={processing || filterApplying}
                        className="flex items-center gap-2 px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                        {processing ? 'Saving...' : <><Check size={18} /> Done</>}
                    </button>
                </div>
            </div>

            {/* Main Area - Fixed Overflow with min-h-0 */}
            <div className="flex-1 min-h-0 overflow-hidden relative bg-black flex items-center justify-center p-4">
                {filterApplying && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <div className="text-white">Applying Magic...</div>
                    </div>
                )}
                <Cropper
                    src={previewUrl}
                    style={{ height: '100%', width: '100%' }}
                    initialAspectRatio={NaN} // Free crop
                    guides={true}
                    ref={cropperRef}
                    viewMode={1}
                    autoCropArea={0.9}
                    background={false}
                    className="h-full w-full object-contain"
                />
            </div>

            {/* Footer Tools - Fixed Height */}
            <div className="flex-shrink-0 p-4 bg-dark-300 border-t border-dark-border flex items-center justify-center gap-6 z-10 overflow-x-auto">
                {/* Filters */}
                <div className="flex gap-2 mr-8 border-r border-gray-700 pr-8">
                    <button
                        onClick={() => handleApplyFilter('original')}
                        className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${currentFilter === 'original' ? 'bg-primary-600/20 text-primary-400' : 'text-gray-400 hover:text-white'}`}
                    >
                        <ImageIcon size={20} />
                        <span className="text-xs whitespace-nowrap">Original</span>
                    </button>
                    <button
                        onClick={() => handleApplyFilter('magic')}
                        className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${currentFilter === 'magic' ? 'bg-primary-600/20 text-primary-400' : 'text-gray-400 hover:text-white'}`}
                    >
                        <Wand2 size={20} />
                        <span className="text-xs whitespace-nowrap">Magic</span>
                    </button>
                    <button
                        onClick={() => handleApplyFilter('bw')}
                        className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${currentFilter === 'bw' ? 'bg-primary-600/20 text-primary-400' : 'text-gray-400 hover:text-white'}`}
                    >
                        <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-black to-white border border-gray-500" />
                        <span className="text-xs whitespace-nowrap">B&W</span>
                    </button>
                </div>

                {/* Rotate */}
                <button
                    onClick={handleRotate}
                    className="flex flex-col items-center gap-1 p-2 text-gray-400 hover:text-white transition-colors"
                >
                    <RotateCw size={20} />
                    <span className="text-xs whitespace-nowrap">Rotate</span>
                </button>

                {/* B&W Slider */}
                {currentFilter === 'bw' && (
                    <div className="flex flex-col gap-1 w-32 ml-4 border-l border-gray-700 pl-4">
                        <label className="text-xs text-gray-400">Threshold: {bwThreshold}</label>
                        <input
                            type="range"
                            min="0"
                            max="255"
                            value={bwThreshold}
                            onChange={(e) => setBwThreshold(Number(e.target.value))}
                            className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-primary-500"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
