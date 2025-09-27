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
    const [status, setStatus] = useState<Status>('idle');
    const [statusMessage, setStatusMessage] = useState<string>('');
    const [isDragging, setIsDragging] = useState<boolean>(false);

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
                for (let i = 1; i <= doc.numPages; i++) {
                    initialRotations[i] = 0;
                }
                setRotations(initialRotations);
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
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const originalName = file.name.replace(/\.pdf$/i, '');
            a.download = `${originalName}_corrected.pdf`;
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

                            <div className="bg-slate-800/50 p-4 rounded-xl overflow-y-auto max-h-[70vh]">
                                <div className="space-y-4">
                                    {Array.from({ length: pdfDoc.numPages }, (_, i) => (
                                        <PdfPagePreview 
                                            key={i} 
                                            pdfDoc={pdfDoc} 
                                            pageNumber={i + 1} 
                                            rotation={rotations[i + 1] ?? 0}
                                            isSelected={selectedPages.has(i + 1)}
                                            onSelect={handleToggleSelect}
                                        />
                                    ))}
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
}

const PdfPagePreview: React.FC<PdfPagePreviewProps> = ({ pdfDoc, pageNumber, rotation, isSelected, onSelect }) => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);

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

    return (
        <div className="flex flex-col items-center">
            <div 
                className="relative cursor-pointer"
                onClick={() => onSelect(pageNumber)}
            >
                <div
                    className={`transition-all duration-150 ease-in-out shadow-lg shadow-black/40 border-2 ${isSelected ? 'border-brand-500' : 'border-transparent'}`}
                    style={{ transform: `rotate(${rotation}deg)` }}
                >
                    <canvas ref={canvasRef} />
                </div>
                 <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onSelect(pageNumber)}
                    className="absolute top-2 right-2 h-6 w-6 cursor-pointer accent-brand-500"
                />
            </div>
            <p className="text-xs text-slate-500 mt-2">Page {pageNumber} ({rotation.toFixed(2)}°)</p>
        </div>
    );
};


export default App;