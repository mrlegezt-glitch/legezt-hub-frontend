import React, { useRef, useState } from 'react';
import Cropper, { ReactCropperElement } from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { FilterType, applyFilter } from './imageProcessor';
import { RotateCw, Check, X, Wand2, Image as ImageIcon, Pencil, Eraser, Type, Minus, Plus, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

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

    // Drawing State
    const [mode, setMode] = useState<'crop' | 'draw'>('crop');
    const [activeTool, setActiveTool] = useState<'pen' | 'text'>('pen');
    const [activeColor, setActiveColor] = useState('#ef4444'); // red-500
    const [lineWidth, setLineWidth] = useState(3);
    const [textElements, setTextElements] = useState<{ id: string, x: number, y: number, text: string, color: string, fontSize: number }[]>([]);

    const [isDrawing, setIsDrawing] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [drawingData, setDrawingData] = useState<string | null>(null); // To persist drawing across filter changes


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
            // 1. Get cropped base image
            const canvas = cropper.getCroppedCanvas();
            if (!canvas) {
                setProcessing(false);
                return;
            }

            // 2. If we have drawing data, merge it!
            // We need to render the drawing ON TOP of the cropped image.
            // Note: Implementing perfect 1:1 drawing overlay over crop is complex because crop changes dimensions.
            // For now, simpler approach: If in 'draw' mode, we save the VIEWPORT.
            // But to keep it robust: We will redraw the drawing canvas onto the result canvas.

            const ctx = canvas.getContext('2d');
            if (canvasRef.current && ctx) {
                // 1. Draw Drawings
                ctx.drawImage(canvasRef.current, 0, 0, canvas.width, canvas.height);

                // 2. Burn Text Elements
                // Note: Text positioning on screen is relative to viewport. We need to map it to canvas coordinates.
                // For this simple version, we assume Full Screen Canvas corresponds roughly to the max crop area. 
                // A robust implementation would need coordinate mapping. 
                // For now, we rely on the visual correlation or assume user saves what they see.
                // BETTER APPROACH FOR V1: Since canvasRef is overlaying the image, we just render text to that canvasRef BEFORE merging?
                // Actually, let's just render the text directly to the result canvas using relative percentages if possible,
                // or simplistic absolute mapping if the display size matches.

                // Simplified text burning:
                textElements.forEach(el => {
                    // Get relative position % from screen and apply to canvas size
                    const xPercent = el.x / window.innerWidth;
                    const yPercent = el.y / window.innerHeight;

                    const targetX = xPercent * canvas.width;
                    const targetY = yPercent * canvas.height;
                    // similarly scale font
                    const scaleFactor = canvas.width / window.innerWidth;

                    ctx.font = `bold ${el.fontSize * scaleFactor}px sans-serif`;
                    ctx.fillStyle = el.color;
                    ctx.fillText(el.text, targetX, targetY);
                });
            }

            const finalUrl = canvas.toDataURL('image/jpeg', 0.9);
            onSave(finalUrl, currentFilter);
        }
        setProcessing(false);
    };

    // Drawing Handlers
    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        if (mode !== 'draw' || activeTool !== 'pen') return;
        setIsDrawing(true);

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

        ctx.beginPath();
        ctx.moveTo(clientX - rect.left, clientY - rect.top);

        // Eraser/Whitener Logic
        if (activeColor === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out';
        } else {
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = activeColor;
        }

        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || mode !== 'draw' || activeTool !== 'pen') return;
        // ... rest of draw implementation logic is same, but we need to ensure the fn signature matches
        // Wait, I am replacing the whole block including startDrawing end.

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

        ctx.lineTo(clientX - rect.left, clientY - rect.top);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    // Text Handlers
    const addText = () => {
        const text = prompt("Enter text:");
        if (text) {
            setTextElements(prev => [...prev, {
                id: uuidv4(),
                x: window.innerWidth / 2,
                y: window.innerHeight / 2,
                text,
                color: activeColor === 'white' ? 'black' : (activeColor === 'eraser' ? 'black' : activeColor),
                fontSize: 24
            }]);
            setActiveTool('text');
        }
    };

    const updateTextPosition = (id: string, x: number, y: number) => {
        setTextElements(prev => prev.map(el => el.id === id ? { ...el, x, y } : el));
    };

    const removeText = (id: string) => {
        setTextElements(prev => prev.filter(el => el.id !== id));
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

                {/* Drawing Overlay */}
                {mode === 'draw' && (
                    <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none overflow-hidden">
                        {/* Text Elements */}
                        {textElements.map(el => (
                            <div
                                key={el.id}
                                style={{
                                    position: 'absolute',
                                    left: el.x,
                                    top: el.y,
                                    transform: 'translate(-50%, -50%)',
                                    color: el.color,
                                    fontSize: el.fontSize,
                                    fontWeight: 'bold',
                                    cursor: 'move',
                                    textShadow: '0 0 2px rgba(255,255,255,0.8)'
                                }}
                                className="pointer-events-auto select-none group"
                                onMouseDown={(e) => {
                                    e.stopPropagation();
                                    const startX = e.clientX;
                                    const startY = e.clientY;
                                    const startElX = el.x;
                                    const startElY = el.y;

                                    const onMove = (moveEvent: MouseEvent) => {
                                        const dx = moveEvent.clientX - startX;
                                        const dy = moveEvent.clientY - startY;
                                        updateTextPosition(el.id, startElX + dx, startElY + dy);
                                    };

                                    const onUp = () => {
                                        window.removeEventListener('mousemove', onMove);
                                        window.removeEventListener('mouseup', onUp);
                                    };

                                    window.addEventListener('mousemove', onMove);
                                    window.addEventListener('mouseup', onUp);
                                }}
                                onTouchStart={(e) => {
                                    e.stopPropagation();
                                    const touch = e.touches[0];
                                    const startX = touch.clientX;
                                    const startY = touch.clientY;
                                    const startElX = el.x;
                                    const startElY = el.y;

                                    const onMove = (moveEvent: TouchEvent) => {
                                        const t = moveEvent.touches[0];
                                        const dx = t.clientX - startX;
                                        const dy = t.clientY - startY;
                                        updateTextPosition(el.id, startElX + dx, startElY + dy);
                                    };

                                    const onEnd = () => {
                                        window.removeEventListener('touchmove', onMove);
                                        window.removeEventListener('touchend', onEnd);
                                    };

                                    window.addEventListener('touchmove', onMove);
                                    window.addEventListener('touchend', onEnd);
                                }}
                            >
                                {el.text}
                                <button
                                    onClick={(e) => { e.stopPropagation(); removeText(el.id); }}
                                    className="absolute -top-4 -right-4 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X size={10} />
                                </button>
                            </div>
                        ))}

                        {/* Canvas */}
                        <canvas
                            ref={canvasRef}
                            className={`absolute inset-0 w-full h-full touch-none ${activeTool === 'pen' ? 'cursor-crosshair pointer-events-auto' : 'pointer-events-none'}`}
                            width={window.innerWidth}
                            height={window.innerHeight}
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                            onTouchStart={startDrawing}
                            onTouchMove={draw}
                            onTouchEnd={stopDrawing}
                        />
                    </div>
                )}
            </div>

            {/* Footer Tools - Fixed Height */}
            <div className="flex-shrink-0 bg-dark-300 border-t border-dark-border flex flex-col z-40 safe-area-bottom">
                {/* DRAWING SUB-TOOLBAR */}
                {mode === 'draw' && (
                    <div className="flex items-center justify-between px-4 py-2 border-b border-dark-border bg-dark-200 overflow-x-auto">
                        {/* Colors */}
                        <div className="flex items-center gap-3">
                            {['#ef4444', '#3b82f6', '#000000', 'white'].map(color => (
                                <button
                                    key={color}
                                    onClick={() => { setActiveColor(color); setActiveTool('pen'); }}
                                    className={`w-8 h-8 rounded-full border-2 ${activeColor === color && activeTool === 'pen' ? 'border-primary-500 scale-110' : 'border-gray-600'} shadow-sm relative`}
                                    style={{ backgroundColor: color }}
                                    title={color === 'white' ? 'Whitener' : color}
                                >
                                    {color === 'white' && <span className="absolute inset-0 flex items-center justify-center text-[8px] text-gray-400 font-bold">W</span>}
                                </button>
                            ))}
                            {/* Eraser Button */}
                            <button
                                onClick={() => { setActiveColor('eraser'); setActiveTool('pen'); }}
                                className={`p-1.5 rounded-lg border ${activeColor === 'eraser' ? 'bg-primary-500/20 border-primary-500 text-primary-500' : 'border-gray-600 text-gray-400'} `}
                                title="Eraser"
                            >
                                <Eraser size={18} />
                            </button>
                        </div>

                        {/* Size Slider */}
                        <div className="flex items-center gap-2 mx-4 w-24">
                            <Minus size={12} className="text-gray-500" />
                            <input
                                type="range"
                                min="1" max="20"
                                value={lineWidth}
                                onChange={(e) => setLineWidth(Number(e.target.value))}
                                className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-primary-500"
                            />
                            <Plus size={12} className="text-gray-500" />
                        </div>

                        {/* Add Text */}
                        <button
                            onClick={addText}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${activeTool === 'text' ? 'bg-primary-500 text-white border-primary-500' : 'border-gray-600 text-gray-300 hover:bg-white/5'}`}
                        >
                            <Type size={18} />
                            <span className="text-xs font-bold">Text</span>
                        </button>
                    </div>
                )}

                <div className="p-4 flex items-center justify-center gap-6 overflow-x-auto">
                    {/* Mode Toggle */}
                    <div className="flex gap-2 mr-8 border-r border-gray-700 pr-8">
                        <button
                            onClick={() => setMode('crop')}
                            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${mode === 'crop' ? 'bg-primary-600/20 text-primary-400' : 'text-gray-400 hover:text-white'}`}
                        >
                            <RotateCw size={20} />
                            <span className="text-xs">Crop/Rotate</span>
                        </button>
                        <button
                            onClick={() => setMode('draw')}
                            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${mode === 'draw' ? 'bg-primary-600/20 text-primary-400' : 'text-gray-400 hover:text-white'}`}
                        >
                            <Pencil size={20} />
                            <span className="text-xs">Draw & Text</span>
                        </button>
                    </div>

                    {/* Filter / Rotate Tools (Hide in Draw Mode to clear clutter? Or keep?) -> Keeping common tools */}
                    <div className={`flex gap-4 ${mode === 'draw' ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                        <button
                            onClick={handleRotate}
                            className="flex flex-col items-center gap-1 p-2 text-gray-400 hover:text-white transition-colors"
                        >
                            <RotateCw size={20} />
                            <span className="text-xs whitespace-nowrap">Rotate</span>
                        </button>

                        <div className="h-8 w-px bg-gray-700 mx-2" />

                        <button
                            onClick={() => handleApplyFilter('magic')}
                            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${currentFilter === 'magic' ? 'text-primary-400' : 'text-gray-400'}`}
                        >
                            <Wand2 size={20} />
                            <span className="text-xs">Magic</span>
                        </button>
                        <button
                            onClick={() => handleApplyFilter('bw')}
                            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${currentFilter === 'bw' ? 'text-primary-400' : 'text-gray-400'}`}
                        >
                            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-black to-white border border-gray-500" />
                            <span className="text-xs">B&W</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
