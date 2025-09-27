import React, { useState, useCallback, useEffect } from 'react';
import type { PdfDocument } from './types';
import { createRotatedPdf } from './services/pdfService';
import { UploadIcon, DownloadIcon, RotateCcwIcon, LoaderIcon } from './components/Icons';

type Status = 'idle' | 'loading' | 'analyzing' | 'generating' | 'success' | 'error';

const StatusIndicator: React.FC<{ status: Status; message: string }> = ({ status, message }) => {
    if (status === 'idle') return null;

    const getIcon = () => {
        switch (status) {
            case 'loading':
            case 'analyzing':
            case 'generating':
                return <LoaderIcon className="animate-spin h-5 w-5 mr-2" />;
            default:
                return null;
        }
    };

    return (
        <div className="fixed top-5 right-5 bg-slate-800 text-white py-2 px-4 rounded-lg shadow-lg flex items-center z-50">
            {getIcon()}
            <span>{message}</span>
        </div>
    );
};

const App: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [pdfDoc, setPdfDoc] = useState<PdfDocument | null>(null);
    const [rotations, setRotations] = useState<Record<number, number>>({});
    const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
    const [pageOffsets, setPageOffsets] = useState<Record<number, { x: number; y: number }>>({});
    const [status, setStatus] = useState<Status>('idle');
    const [statusMessage, setStatusMessage] = useState<string>('');
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [showGuidelines, setShowGuidelines] = useState<boolean>(true);
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!file) return;

        const loadPdf = async () => {
            setStatus('loading');
            setStatusMessage('Loading PDF...');
            try {
                const arrayBuffer = await file.arrayBuffer();
                const doc = await pdfjsLib.getDocument(arrayBuffer).promise;
                setPdfDoc(doc);
                const initialRotations: Record<number, number> = {};
                const initialOffsets: Record<number, { x: number; y: number }> = {};
                for (let i = 1; i <= doc.numPages; i++) {
                    initialRotations[i] = 0;
                    initialOffsets[i] = { x: 0, y: 0 };
                }
                setRotations(initialRotations);
                setPageOffsets(initialOffsets);
                setSelectedPages(new Set());
                setStatus('success');
                setStatusMessage(`Loaded ${doc.numPages} pages.`);
            } catch (error) {
                console.error("Error loading PDF:", error);
                setStatus('error');
                setStatusMessage('Failed to load PDF.');
            } finally {
                setTimeout(() => setStatus('idle'), 2000);
            }
        };

        loadPdf();
    }, [file]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setRotations({});
            setSelectedPages(new Set());
            setPdfDoc(null);
        }
    };

    const handleRotationChange = (delta: number) => {
        setRotations(prev => {
            const newRotations = { ...prev };
            const pagesToUpdate = selectedPages.size > 0 ? Array.from(selectedPages) : Object.keys(prev).map(Number);
            pagesToUpdate.forEach(pageNum => {
                newRotations[pageNum] = (prev[pageNum] || 0) + delta;
            });
            return newRotations;
        });
    };

    const handleDownload = async () => {
        if (!file || Object.keys(rotations).length === 0) return;

        setStatus('generating');
        setStatusMessage('Generating corrected PDF...');
        try {
            const originalPdfBytes = await file.arrayBuffer();
            const rotatedPdfBytes = await createRotatedPdf(originalPdfBytes, rotations);
            const blob = new Blob([rotatedPdfBytes], { type: 'application/pdf' });
            const originalName = file.name.replace(/\.pdf$/i, '');
            const suggestedName = `${originalName}_corrected.pdf`;

            // Try File System Access API (Chrome/Edge)
            if ('showSaveFilePicker' in window) {
                try {
                    const handle = await (window as any).showSaveFilePicker({
                        suggestedName: suggestedName,
                        types: [{
                            description: 'PDF Files',
                            accept: { 'application/pdf': ['.pdf'] }
                        }]
                    });
                    const writable = await handle.createWritable();
                    await writable.write(blob);
                    await writable.close();
                    setStatus('success');
                    setStatusMessage('File saved successfully!');
                    return;
                } catch (err: any) {
                    // User cancelled or error occurred
                    if (err.name === 'AbortError') {
                        setStatus('idle');
                        return;
                    }
                    console.warn('File System Access API failed, falling back to download:', err);
                }
            }

            // Fallback to traditional download
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = suggestedName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            setStatus('success');
            setStatusMessage('Download complete!');
        } catch (error) {
            console.error("Error generating PDF:", error);
            setStatus('error');
            setStatusMessage('Failed to generate PDF.');
        } finally {
            setTimeout(() => setStatus('idle'), 2000);
        }
    };

    const handleDragEvents = (e: React.DragEvent<HTMLDivElement>, isEntering: boolean) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(isEntering);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            if (e.dataTransfer.files[0].type === 'application/pdf') {
                setFile(e.dataTransfer.files[0]);
                setRotations({});
                setSelectedPages(new Set());
                setPdfDoc(null);
            } else {
                setStatus('error');
                setStatusMessage('Please drop a PDF file.');
                setTimeout(() => setStatus('idle'), 2000);
            }
        }
    };
    
    const handleToggleSelect = (pageNumber: number) => {
        const newSelection = new Set(selectedPages);
        if (newSelection.has(pageNumber)) {
            newSelection.delete(pageNumber);
        } else {
            newSelection.add(pageNumber);
        }
        setSelectedPages(newSelection);
    };

    const handlePageOffsetChange = useCallback((pageNumber: number, deltaX: number, deltaY: number) => {
        setPageOffsets(prev => ({
            ...prev,
            [pageNumber]: {
                x: (prev[pageNumber]?.x || 0) + deltaX,
                y: (prev[pageNumber]?.y || 0) + deltaY
            }
        }));
    }, []);

    const handleResetPageOffset = useCallback((pageNumber: number) => {
        setPageOffsets(prev => ({
            ...prev,
            [pageNumber]: { x: 0, y: 0 }
        }));
    }, []);

    const [sliderValue, setSliderValue] = useState<number>(0);
    const pagesForSlider = selectedPages.size > 0 ? Array.from(selectedPages).sort((a, b) => a - b) : [];
    const displayRotation = pagesForSlider.length > 0 ? rotations[pagesForSlider[0]] ?? 0 : 0;
    const hasMultipleRotations = pagesForSlider.length > 1 && pagesForSlider.some(p => rotations[p] !== rotations[pagesForSlider[0]]);

    useEffect(() => {
        if (pagesForSlider.length > 0) {
            setSliderValue(displayRotation);
        } else {
            setSliderValue(0);
        }
    }, [selectedPages, displayRotation, pagesForSlider.length]);

    return (
        <div 
            className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center p-4 sm:p-8 transition-colors duration-300"
            onDragEnter={(e) => handleDragEvents(e, true)}
            onDragLeave={(e) => handleDragEvents(e, false)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
        >
            <StatusIndicator status={status} message={statusMessage} />

            <div className="w-full max-w-5xl mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-brand-600">
                        PDF Angle Corrector
                    </h1>
                    <p className="text-slate-400 mt-2">
                        Upload a scanned PDF, adjust angles, and download the fixed version.
                    </p>
                </header>

                <main className="space-y-6">
                    <div className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${isDragging ? 'border-brand-500 bg-slate-800' : 'border-slate-700'}`}>
                        <div className="flex flex-col items-center justify-center">
                            <UploadIcon className="h-12 w-12 text-slate-500 mb-4" />
                            <label htmlFor="file-upload" className="relative cursor-pointer bg-brand-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-brand-700 transition-colors">
                                <span>Select PDF File</span>
                                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="application/pdf" />
                            </label>
                            <p className="mt-2 text-sm text-slate-400">or drag and drop</p>
                        </div>
                        {file && (
                            <p className="mt-4 text-slate-300">
                                Current file: <span className="font-semibold text-brand-400">{file.name}</span>
                            </p>
                        )}
                    </div>

                    {pdfDoc && (
                        <>
                            <div className="bg-slate-800 p-6 rounded-xl shadow-lg space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-4 sm:space-y-0">
                                    <div className="flex-grow">
                                        <label htmlFor="rotation" className="block text-sm font-medium text-slate-300 mb-2">
                                            Rotation Angle: <span className="font-bold text-brand-400">{sliderValue.toFixed(2)}°</span>
                                            {pagesForSlider.length > 0 ? (
                                                <span className="text-xs text-brand-400 ml-2">({pagesForSlider.length} page{pagesForSlider.length > 1 ? 's' : ''} selected)</span>
                                            ) : (
                                                <span className="text-xs text-slate-400 ml-2">(All pages)</span>
                                            )}
                                        </label>
                                        <div className="flex items-center space-x-3">
                                            <span className="text-xs text-slate-400">-15°</span>
                                            <input
                                                id="rotation"
                                                type="range"
                                                min="-15"
                                                max="15"
                                                step="0.05"
                                                value={sliderValue}
                                                onChange={(e) => {
                                                    const newValue = parseFloat(e.target.value);
                                                    const delta = newValue - sliderValue;
                                                    setSliderValue(newValue);
                                                    handleRotationChange(delta);
                                                }}
                                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
                                            />
                                            <span className="text-xs text-slate-400">+15°</span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            setRotations(prev => {
                                                const newRotations = { ...prev };
                                                const pagesToReset = pagesForSlider.length > 0 ? pagesForSlider : Object.keys(prev).map(Number);
                                                pagesToReset.forEach(pageNum => {
                                                    newRotations[pageNum] = 0;
                                                });
                                                return newRotations;
                                            });
                                            setSliderValue(0);
                                        }}
                                        className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold bg-slate-700 hover:bg-slate-600 rounded-md transition-colors w-full sm:w-auto"
                                    >
                                        <RotateCcwIcon className="h-4 w-4" /> Reset
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    <button
                                        onClick={handleDownload}
                                        disabled={status === 'generating'}
                                        className="flex items-center justify-center w-full px-4 py-3 font-semibold text-white bg-brand-600 rounded-md hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <DownloadIcon className="h-5 w-5 mr-2" />
                                        Download Corrected PDF
                                    </button>
                                </div>
                            </div>

                            <div className="bg-slate-800/50 rounded-xl overflow-hidden">
                                <div className="flex items-center justify-end p-4 bg-slate-800/80 border-b border-slate-700">
                                    <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={showGuidelines}
                                            onChange={(e) => setShowGuidelines(e.target.checked)}
                                            className="w-4 h-4 accent-brand-500"
                                        />
                                        Show Guidelines
                                    </label>
                                </div>
                                <div 
                                    ref={scrollContainerRef}
                                    className="relative p-4 overflow-auto max-h-[70vh]"
                                >
                                    {showGuidelines && (
                                        <>
                                            <div 
                                                className="absolute inset-0 pointer-events-none z-10"
                                                style={{
                                                    backgroundImage: `
                                                        linear-gradient(to right, rgba(59, 130, 246, 0.2) 1px, transparent 1px),
                                                        linear-gradient(to bottom, rgba(59, 130, 246, 0.2) 1px, transparent 1px)
                                                    `,
                                                    backgroundSize: '20px 20px'
                                                }}
                                            />
                                            <div className="absolute top-0 left-1/2 w-0.5 h-full bg-red-500/40 pointer-events-none z-10" style={{ transform: 'translateX(-50%)' }} />
                                            <div className="absolute left-0 top-1/2 w-full h-0.5 bg-red-500/40 pointer-events-none z-10" style={{ transform: 'translateY(-50%)' }} />
                                        </>
                                    )}
                                    <div className="space-y-4">
                                        {Array.from({ length: pdfDoc.numPages }, (_, i) => (
                                            <PdfPagePreview 
                                                key={i} 
                                                pdfDoc={pdfDoc} 
                                                pageNumber={i + 1} 
                                                rotation={rotations[i + 1] ?? 0}
                                                isSelected={selectedPages.has(i + 1)}
                                                onSelect={handleToggleSelect}
                                                offset={pageOffsets[i + 1] || { x: 0, y: 0 }}
                                                onOffsetChange={handlePageOffsetChange}
                                                onResetOffset={handleResetPageOffset}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
};

interface PdfPagePreviewProps {
    pdfDoc: PdfDocument;
    pageNumber: number;
    rotation: number;
    isSelected: boolean;
    onSelect: (pageNumber: number) => void;
    offset: { x: number; y: number };
    onOffsetChange: (pageNumber: number, deltaX: number, deltaY: number) => void;
    onResetOffset: (pageNumber: number) => void;
}

const PdfPagePreview: React.FC<PdfPagePreviewProps> = ({ pdfDoc, pageNumber, rotation, isSelected, onSelect, offset, onOffsetChange, onResetOffset }) => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(null);

    useEffect(() => {
        const renderPage = async () => {
            const page = await pdfDoc.getPage(pageNumber);
            const scale = 1.5;
            const viewport = page.getViewport({ scale });
            const canvas = canvasRef.current;
            if (!canvas) return;

            const context = canvas.getContext('2d');
            if (!context) return;
            
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            page.render({ canvasContext: context, viewport: viewport });
        };

        renderPage();
    }, [pdfDoc, pageNumber]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button === 1) { // Middle button
            e.preventDefault();
            e.stopPropagation();
            setIsPanning(true);
            setPanStart({ x: e.clientX, y: e.clientY });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isPanning && panStart) {
            e.preventDefault();
            e.stopPropagation();
            const deltaX = e.clientX - panStart.x;
            const deltaY = e.clientY - panStart.y;
            onOffsetChange(pageNumber, deltaX, deltaY);
            setPanStart({ x: e.clientX, y: e.clientY });
        }
    };

    const handleMouseUp = (e: React.MouseEvent) => {
        if (e.button === 1) {
            e.stopPropagation();
            setIsPanning(false);
            setPanStart(null);
        }
    };

    const handleMouseLeave = () => {
        if (isPanning) {
            setIsPanning(false);
            setPanStart(null);
        }
    };

    const [canvasSize, setCanvasSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

    useEffect(() => {
        if (canvasRef.current) {
            setCanvasSize({
                width: canvasRef.current.width,
                height: canvasRef.current.height
            });
        }
    }, [canvasRef.current?.width, canvasRef.current?.height]);

    return (
        <div className="flex flex-col items-center">
            <div 
                className={`relative overflow-hidden ${
                    isSelected 
                        ? 'border-4 border-brand-500 shadow-brand-500/50 ring-4 ring-brand-400/30' 
                        : 'border-4 border-slate-600 shadow-black/40'
                } shadow-lg`}
                style={{
                    width: canvasSize.width || 'auto',
                    height: canvasSize.height || 'auto',
                    cursor: isPanning ? 'grabbing' : 'grab'
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
            >
                <div
                    className="absolute"
                    style={{ 
                        transform: `translate(${offset.x}px, ${offset.y}px) rotate(${rotation}deg)`,
                        transformOrigin: 'center center',
                        left: '50%',
                        top: '50%',
                        marginLeft: -(canvasSize.width / 2),
                        marginTop: -(canvasSize.height / 2)
                    }}
                    onClick={(e) => {
                        if (!isPanning) {
                            e.stopPropagation();
                            onSelect(pageNumber);
                        }
                    }}
                >
                    <canvas ref={canvasRef} />
                </div>
                 <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onSelect(pageNumber)}
                    className="absolute top-3 right-3 h-6 w-6 cursor-pointer accent-brand-500 z-10"
                />
            </div>
            <div className="flex items-center gap-2 mt-2">
                <p className="text-xs text-slate-500">Page {pageNumber} ({rotation.toFixed(2)}°)</p>
                {(offset.x !== 0 || offset.y !== 0) && (
                    <button
                        onClick={() => onResetOffset(pageNumber)}
                        className="text-xs px-2 py-0.5 bg-slate-700 hover:bg-slate-600 rounded text-slate-300"
                    >
                        Reset
                    </button>
                )}
            </div>
        </div>
    );
};


export default App;