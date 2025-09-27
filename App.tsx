import React, { useState, useCallback, useEffect } from 'react';
import type { PdfDocument, PdfFileData } from './types';
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
    const [pdfFiles, setPdfFiles] = useState<PdfFileData[]>([]);
    const [currentFileIndex, setCurrentFileIndex] = useState<number>(0);
    const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
    const [status, setStatus] = useState<Status>('idle');
    const [statusMessage, setStatusMessage] = useState<string>('');
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [showGuidelines, setShowGuidelines] = useState<boolean>(true);
    const [showWarning, setShowWarning] = useState<boolean>(true);
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);

    const currentFile = pdfFiles[currentFileIndex];

    useEffect(() => {
        // Reset selected pages when switching files
        setSelectedPages(new Set());
    }, [currentFileIndex]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files).filter(f => f.type === 'application/pdf');
            if (files.length === 0) {
                setStatus('error');
                setStatusMessage('Please select PDF files only.');
                setTimeout(() => setStatus('idle'), 2000);
                e.target.value = '';
                return;
            }

            setStatus('loading');
            setStatusMessage(`Loading ${files.length} PDF file(s)...`);

            try {
                const loadedFiles: PdfFileData[] = [];
                for (const file of files) {
                    const arrayBuffer = await file.arrayBuffer();
                    const doc = await pdfjsLib.getDocument(arrayBuffer).promise;

                    const rotations: Record<number, number> = {};
                    const offsets: Record<number, { x: number; y: number }> = {};
                    for (let i = 1; i <= doc.numPages; i++) {
                        rotations[i] = 0;
                        offsets[i] = { x: 0, y: 0 };
                    }

                    loadedFiles.push({
                        file,
                        pdfDoc: doc,
                        rotations,
                        offsets
                    });
                }

                setPdfFiles(loadedFiles);
                setCurrentFileIndex(0);
                setStatus('success');
                setStatusMessage(`Loaded ${loadedFiles.length} PDF file(s).`);
            } catch (error) {
                console.error("Error loading PDFs:", error);
                setStatus('error');
                setStatusMessage('Failed to load PDF files.');
            } finally {
                setTimeout(() => setStatus('idle'), 2000);
            }
        }
        e.target.value = '';
    };

    const handleRotationChange = (delta: number) => {
        if (!currentFile) return;

        setPdfFiles(prev => {
            const updated = [...prev];
            const newRotations = { ...updated[currentFileIndex].rotations };
            const pagesToUpdate = selectedPages.size > 0
                ? Array.from(selectedPages)
                : Object.keys(newRotations).map(Number);

            pagesToUpdate.forEach(pageNum => {
                newRotations[pageNum] = (newRotations[pageNum] || 0) + delta;
            });

            updated[currentFileIndex] = {
                ...updated[currentFileIndex],
                rotations: newRotations
            };
            return updated;
        });
    };

    const handleSaveAll = async () => {
        if (pdfFiles.length === 0) return;
        if (!('showSaveFilePicker' in window)) {
            setStatus('error');
            setStatusMessage('Your browser does not support automatic file saving. Please use Chrome or Edge.');
            setTimeout(() => setStatus('idle'), 3000);
            return;
        }

        setStatus('generating');
        setStatusMessage('Saving all files...');

        try {
            for (let i = 0; i < pdfFiles.length; i++) {
                const pdfFile = pdfFiles[i];
                const originalPdfBytes = await pdfFile.file.arrayBuffer();
                const rotatedPdfBytes = await createRotatedPdf(
                    originalPdfBytes,
                    pdfFile.rotations,
                    pdfFile.offsets
                );
                const blob = new Blob([rotatedPdfBytes], { type: 'application/pdf' });

                try {
                    const handle = await (window as any).showSaveFilePicker({
                        suggestedName: pdfFile.file.name,
                        types: [{
                            description: 'PDF Files',
                            accept: { 'application/pdf': ['.pdf'] }
                        }]
                    });
                    const writable = await handle.createWritable();
                    await writable.write(blob);
                    await writable.close();

                    setStatusMessage(`Saved ${i + 1}/${pdfFiles.length} files...`);
                } catch (err: any) {
                    if (err.name === 'AbortError') {
                        setStatus('idle');
                        setStatusMessage(`Cancelled. Saved ${i}/${pdfFiles.length} files.`);
                        setTimeout(() => setStatus('idle'), 2000);
                        return;
                    }
                    throw err;
                }
            }

            setStatus('success');
            setStatusMessage(`All ${pdfFiles.length} files saved successfully!`);
        } catch (error) {
            console.error("Error saving PDFs:", error);
            setStatus('error');
            setStatusMessage('Failed to save PDF files.');
        } finally {
            setTimeout(() => setStatus('idle'), 2000);
        }
    };

    const handleDragEvents = (e: React.DragEvent<HTMLDivElement>, isEntering: boolean) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(isEntering);
    };

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const files = Array.from(e.dataTransfer.files).filter(f => f.type === 'application/pdf');
            if (files.length === 0) {
                setStatus('error');
                setStatusMessage('Please drop PDF files only.');
                setTimeout(() => setStatus('idle'), 2000);
                return;
            }

            setStatus('loading');
            setStatusMessage(`Loading ${files.length} PDF file(s)...`);

            try {
                const loadedFiles: PdfFileData[] = [];
                for (const file of files) {
                    const arrayBuffer = await file.arrayBuffer();
                    const doc = await pdfjsLib.getDocument(arrayBuffer).promise;

                    const rotations: Record<number, number> = {};
                    const offsets: Record<number, { x: number; y: number }> = {};
                    for (let i = 1; i <= doc.numPages; i++) {
                        rotations[i] = 0;
                        offsets[i] = { x: 0, y: 0 };
                    }

                    loadedFiles.push({
                        file,
                        pdfDoc: doc,
                        rotations,
                        offsets
                    });
                }

                setPdfFiles(loadedFiles);
                setCurrentFileIndex(0);
                setStatus('success');
                setStatusMessage(`Loaded ${loadedFiles.length} PDF file(s).`);
            } catch (error) {
                console.error("Error loading PDFs:", error);
                setStatus('error');
                setStatusMessage('Failed to load PDF files.');
            } finally {
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
        setPdfFiles(prev => {
            const updated = [...prev];
            const newOffsets = { ...updated[currentFileIndex].offsets };
            newOffsets[pageNumber] = {
                x: (newOffsets[pageNumber]?.x || 0) + deltaX,
                y: (newOffsets[pageNumber]?.y || 0) + deltaY
            };
            updated[currentFileIndex] = {
                ...updated[currentFileIndex],
                offsets: newOffsets
            };
            return updated;
        });
    }, [currentFileIndex]);

    const handleResetPageOffset = useCallback((pageNumber: number) => {
        setPdfFiles(prev => {
            const updated = [...prev];
            const newOffsets = { ...updated[currentFileIndex].offsets };
            newOffsets[pageNumber] = { x: 0, y: 0 };
            updated[currentFileIndex] = {
                ...updated[currentFileIndex],
                offsets: newOffsets
            };
            return updated;
        });
    }, [currentFileIndex]);

    const [sliderValue, setSliderValue] = useState<number>(0);
    const pagesForSlider = selectedPages.size > 0 ? Array.from(selectedPages).sort((a, b) => a - b) : [];
    const displayRotation = currentFile && pagesForSlider.length > 0
        ? currentFile.rotations[pagesForSlider[0]] ?? 0
        : 0;

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
                        Multi-PDF Angle Corrector
                    </h1>
                    <p className="text-slate-400 mt-2">
                        Upload multiple PDFs, adjust angles, and save to original files.
                    </p>
                </header>

                {showWarning && pdfFiles.length === 0 && (
                    <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-xl p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 text-yellow-500 text-2xl">⚠️</div>
                            <div className="flex-1">
                                <h3 className="font-bold text-yellow-400 mb-2">Important Warning</h3>
                                <p className="text-sm text-slate-300 mb-2">
                                    This tool will save changes directly to the original PDF files. Please ensure you have backups before proceeding.
                                </p>
                                <p className="text-sm text-slate-300">
                                    The save dialog will prompt for each file's location. Select the same location as the original to overwrite it.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowWarning(false)}
                                className="text-slate-400 hover:text-slate-200"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                )}

                <main className="space-y-6">
                    <div className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${isDragging ? 'border-brand-500 bg-slate-800' : 'border-slate-700'}`}>
                        <div className="flex flex-col items-center justify-center">
                            <UploadIcon className="h-12 w-12 text-slate-500 mb-4" />
                            <label htmlFor="file-upload" className="relative cursor-pointer bg-brand-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-brand-700 transition-colors">
                                <span>Select PDF Files</span>
                                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="application/pdf" multiple />
                            </label>
                            <p className="mt-2 text-sm text-slate-400">or drag and drop</p>
                        </div>
                        {pdfFiles.length > 0 && (
                            <p className="mt-4 text-slate-300">
                                <span className="font-semibold text-brand-400">{pdfFiles.length} PDF file(s)</span> loaded
                            </p>
                        )}
                    </div>

                    {pdfFiles.length > 0 && (
                        <>
                            {/* File Navigation */}
                            {pdfFiles.length > 1 && (
                                <div className="bg-slate-800 p-4 rounded-xl shadow-lg">
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => setCurrentFileIndex(Math.max(0, currentFileIndex - 1))}
                                            disabled={currentFileIndex === 0}
                                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
                                        >
                                            ← Previous
                                        </button>
                                        <div className="flex-1 text-center">
                                            <p className="text-sm text-slate-400">File {currentFileIndex + 1} of {pdfFiles.length}</p>
                                            <p className="font-semibold text-brand-400 truncate">{currentFile.file.name}</p>
                                        </div>
                                        <button
                                            onClick={() => setCurrentFileIndex(Math.min(pdfFiles.length - 1, currentFileIndex + 1))}
                                            disabled={currentFileIndex === pdfFiles.length - 1}
                                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
                                        >
                                            Next →
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Rotation Controls */}
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
                                            if (!currentFile) return;
                                            setPdfFiles(prev => {
                                                const updated = [...prev];
                                                const newRotations = { ...updated[currentFileIndex].rotations };
                                                const pagesToReset = pagesForSlider.length > 0
                                                    ? pagesForSlider
                                                    : Object.keys(newRotations).map(Number);
                                                pagesToReset.forEach(pageNum => {
                                                    newRotations[pageNum] = 0;
                                                });
                                                updated[currentFileIndex] = {
                                                    ...updated[currentFileIndex],
                                                    rotations: newRotations
                                                };
                                                return updated;
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
                                        onClick={handleSaveAll}
                                        disabled={status === 'generating'}
                                        className="flex items-center justify-center w-full px-4 py-3 font-semibold text-white bg-brand-600 rounded-md hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <DownloadIcon className="h-5 w-5 mr-2" />
                                        Save All {pdfFiles.length} PDF{pdfFiles.length > 1 ? 's' : ''}
                                    </button>
                                </div>
                            </div>

                            {/* PDF Preview */}
                            {currentFile && (
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
                                        className="p-4 overflow-auto max-h-[70vh]"
                                    >
                                        <div className="space-y-4">
                                            {Array.from({ length: currentFile.pdfDoc.numPages }, (_, i) => (
                                                <PdfPagePreview
                                                    key={i}
                                                    pdfDoc={currentFile.pdfDoc}
                                                    pageNumber={i + 1}
                                                    rotation={currentFile.rotations[i + 1] ?? 0}
                                                    isSelected={selectedPages.has(i + 1)}
                                                    onSelect={handleToggleSelect}
                                                    offset={currentFile.offsets[i + 1] || { x: 0, y: 0 }}
                                                    onOffsetChange={handlePageOffsetChange}
                                                    onResetOffset={handleResetPageOffset}
                                                    showGuidelines={showGuidelines}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
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
    showGuidelines: boolean;
}

const PdfPagePreview: React.FC<PdfPagePreviewProps> = ({ pdfDoc, pageNumber, rotation, isSelected, onSelect, offset, onOffsetChange, onResetOffset, showGuidelines }) => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(null);
    const [canvasSize, setCanvasSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

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
            setCanvasSize({ width: canvas.width, height: canvas.height });
        };

        renderPage();
    }, [pdfDoc, pageNumber]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button === 1) {
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