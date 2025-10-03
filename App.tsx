import React, { useState, useCallback, useEffect } from 'react';
import type { PdfDocument, PdfFileData, ImageFileData, AppMode } from './types';
import { createRotatedPdf } from './services/pdfService';
import { rotateAndExportImage, createPdfFromImages, detectTiltAngle } from './services/imageService';
import { UploadIcon, DownloadIcon, RotateCcwIcon, LoaderIcon } from './components/Icons';

type Status = 'idle' | 'loading' | 'analyzing' | 'generating' | 'success' | 'error';

// Global PDF render queue to prevent concurrent render operations
let pdfRenderQueue = Promise.resolve();

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
    const [mode, setMode] = useState<AppMode>('pdf');
    const [pdfFiles, setPdfFiles] = useState<PdfFileData[]>([]);
    const [imageFiles, setImageFiles] = useState<ImageFileData[]>([]);
    const [currentFileIndex, setCurrentFileIndex] = useState<number>(0);
    const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
    const [status, setStatus] = useState<Status>('idle');
    const [statusMessage, setStatusMessage] = useState<string>('');
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [showGuidelines, setShowGuidelines] = useState<boolean>(true);
    const [showInfo, setShowInfo] = useState<boolean>(true);
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);

    const currentPdfFile = mode === 'pdf' ? pdfFiles[currentFileIndex] : null;
    const currentImageFile = mode === 'image' ? imageFiles[currentFileIndex] : null;

    useEffect(() => {
        setSelectedPages(new Set());
    }, [currentFileIndex, mode]);

    useEffect(() => {
        // Reset when switching modes
        setPdfFiles([]);
        setImageFiles([]);
        setCurrentFileIndex(0);
        setSelectedPages(new Set());
    }, [mode]);

    const handlePdfFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
                    const flips: Record<number, { horizontal: boolean; vertical: boolean }> = {};
                    for (let i = 1; i <= doc.numPages; i++) {
                        rotations[i] = 0;
                        offsets[i] = { x: 0, y: 0 };
                        flips[i] = { horizontal: false, vertical: false };
                    }

                    loadedFiles.push({
                        file,
                        pdfDoc: doc,
                        rotations,
                        offsets,
                        flips
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

    const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
            if (files.length === 0) {
                setStatus('error');
                setStatusMessage('Please select image files only.');
                setTimeout(() => setStatus('idle'), 2000);
                e.target.value = '';
                return;
            }

            setStatus('loading');
            setStatusMessage(`Loading ${files.length} image(s)...`);

            try {
                const loadedFiles: ImageFileData[] = await Promise.all(
                    files.map(file => new Promise<ImageFileData>((resolve) => {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            resolve({
                                file,
                                dataUrl: e.target?.result as string,
                                rotation: 0,
                                offset: { x: 0, y: 0 },
                                flipHorizontal: false,
                                flipVertical: false
                            });
                        };
                        reader.readAsDataURL(file);
                    }))
                );

                setImageFiles(loadedFiles);
                setCurrentFileIndex(0);
                setStatus('success');
                setStatusMessage(`Loaded ${loadedFiles.length} image(s).`);
            } catch (error) {
                console.error("Error loading images:", error);
                setStatus('error');
                setStatusMessage('Failed to load images.');
            } finally {
                setTimeout(() => setStatus('idle'), 2000);
            }
        }
        e.target.value = '';
    };

    const handleRotationChange = (delta: number) => {
        if (mode === 'pdf' && currentPdfFile) {
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
        } else if (mode === 'image' && currentImageFile) {
            setImageFiles(prev => {
                const updated = [...prev];
                updated[currentFileIndex] = {
                    ...updated[currentFileIndex],
                    rotation: updated[currentFileIndex].rotation + delta
                };
                return updated;
            });
        }
    };

    const handleFlip = (direction: 'horizontal' | 'vertical') => {
        if (mode === 'pdf' && currentPdfFile) {
            setPdfFiles(prev => {
                const updated = [...prev];
                const newFlips = { ...updated[currentFileIndex].flips };
                const pagesToUpdate = selectedPages.size > 0
                    ? Array.from(selectedPages)
                    : Object.keys(newFlips).map(Number);

                pagesToUpdate.forEach(pageNum => {
                    const currentFlip = newFlips[pageNum] || { horizontal: false, vertical: false };
                    newFlips[pageNum] = {
                        ...currentFlip,
                        [direction]: !currentFlip[direction]
                    };
                });

                updated[currentFileIndex] = {
                    ...updated[currentFileIndex],
                    flips: newFlips
                };
                return updated;
            });
        } else if (mode === 'image' && currentImageFile) {
            setImageFiles(prev => {
                const updated = [...prev];
                updated[currentFileIndex] = {
                    ...updated[currentFileIndex],
                    [direction === 'horizontal' ? 'flipHorizontal' : 'flipVertical']:
                        !updated[currentFileIndex][direction === 'horizontal' ? 'flipHorizontal' : 'flipVertical']
                };
                return updated;
            });
        }
    };

    const handleSavePdfs = async () => {
        if (pdfFiles.length === 0) return;
        if (!('showSaveFilePicker' in window)) {
            setStatus('error');
            setStatusMessage('Your browser does not support automatic file saving. Please use Chrome or Edge.');
            setTimeout(() => setStatus('idle'), 3000);
            return;
        }

        setStatus('generating');
        setStatusMessage('Saving all PDFs...');

        try {
            for (let i = 0; i < pdfFiles.length; i++) {
                const pdfFile = pdfFiles[i];
                const originalPdfBytes = await pdfFile.file.arrayBuffer();
                const rotatedPdfBytes = await createRotatedPdf(
                    originalPdfBytes,
                    pdfFile.rotations,
                    pdfFile.offsets,
                    pdfFile.flips
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
            setStatusMessage(`All ${pdfFiles.length} PDFs saved!`);
        } catch (error) {
            console.error("Error saving PDFs:", error);
            setStatus('error');
            setStatusMessage('Failed to save PDF files.');
        } finally {
            setTimeout(() => setStatus('idle'), 2000);
        }
    };

    const handleExportImagesToPdf = async () => {
        if (imageFiles.length === 0) return;

        setStatus('generating');
        setStatusMessage('Creating PDF from images...');

        try {
            const imageUrls = imageFiles.map(img => img.dataUrl);
            const rotations: Record<number, number> = {};
            const offsets: Record<number, { x: number; y: number }> = {};

            const flips: Record<number, { horizontal: boolean; vertical: boolean }> = {};

            imageFiles.forEach((img, i) => {
                rotations[i + 1] = img.rotation;
                offsets[i + 1] = img.offset;
                flips[i + 1] = {
                    horizontal: img.flipHorizontal,
                    vertical: img.flipVertical
                };
            });

            const pdfBytes = await createPdfFromImages(imageUrls, rotations, offsets, flips);
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });

            if ('showSaveFilePicker' in window) {
                try {
                    const handle = await (window as any).showSaveFilePicker({
                        suggestedName: 'images_corrected.pdf',
                        types: [{
                            description: 'PDF Files',
                            accept: { 'application/pdf': ['.pdf'] }
                        }]
                    });
                    const writable = await handle.createWritable();
                    await writable.write(blob);
                    await writable.close();
                    setStatus('success');
                    setStatusMessage('PDF created successfully!');
                    return;
                } catch (err: any) {
                    if (err.name === 'AbortError') {
                        setStatus('idle');
                        return;
                    }
                }
            }

            // Fallback download
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'images_corrected.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            setStatus('success');
            setStatusMessage('PDF created successfully!');
        } catch (error) {
            console.error("Error creating PDF:", error);
            setStatus('error');
            setStatusMessage('Failed to create PDF.');
        } finally {
            setTimeout(() => setStatus('idle'), 2000);
        }
    };

    const handleSaveImages = async () => {
        if (imageFiles.length === 0) return;
        if (!('showSaveFilePicker' in window)) {
            setStatus('error');
            setStatusMessage('Your browser does not support automatic file saving. Please use Chrome or Edge.');
            setTimeout(() => setStatus('idle'), 3000);
            return;
        }

        setStatus('generating');
        setStatusMessage('Saving images...');

        try {
            for (let i = 0; i < imageFiles.length; i++) {
                const imageFile = imageFiles[i];
                const format = imageFile.file.type.split('/')[1] as 'jpg' | 'png' | 'webp' || 'png';

                const blob = await rotateAndExportImage(
                    imageFile.dataUrl,
                    imageFile.rotation,
                    imageFile.offset,
                    format === 'jpeg' ? 'jpg' : format,
                    imageFile.flipHorizontal,
                    imageFile.flipVertical
                );

                const originalName = imageFile.file.name;
                const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
                const ext = originalName.split('.').pop() || format;

                try {
                    const handle = await (window as any).showSaveFilePicker({
                        suggestedName: `${nameWithoutExt}_corrected.${ext}`,
                        types: [{
                            description: 'Image Files',
                            accept: { [imageFile.file.type]: [`.${ext}`] }
                        }]
                    });
                    const writable = await handle.createWritable();
                    await writable.write(blob);
                    await writable.close();

                    setStatusMessage(`Saved ${i + 1}/${imageFiles.length} images...`);
                } catch (err: any) {
                    if (err.name === 'AbortError') {
                        setStatus('idle');
                        setStatusMessage(`Cancelled. Saved ${i}/${imageFiles.length} images.`);
                        setTimeout(() => setStatus('idle'), 2000);
                        return;
                    }
                    throw err;
                }
            }

            setStatus('success');
            setStatusMessage(`All ${imageFiles.length} images saved!`);
        } catch (error) {
            console.error("Error saving images:", error);
            setStatus('error');
            setStatusMessage('Failed to save images.');
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
            const files = Array.from(e.dataTransfer.files);

            if (mode === 'pdf') {
                const pdfFiles = files.filter(f => f.type === 'application/pdf');
                if (pdfFiles.length === 0) {
                    setStatus('error');
                    setStatusMessage('Please drop PDF files only.');
                    setTimeout(() => setStatus('idle'), 2000);
                    return;
                }
                // Simulate file input change
                const input = document.getElementById('file-upload') as HTMLInputElement;
                const dataTransfer = new DataTransfer();
                pdfFiles.forEach(f => dataTransfer.items.add(f));
                if (input) {
                    input.files = dataTransfer.files;
                    handlePdfFileChange({ target: input, currentTarget: input } as any);
                }
            } else {
                const imageFiles = files.filter(f => f.type.startsWith('image/'));
                if (imageFiles.length === 0) {
                    setStatus('error');
                    setStatusMessage('Please drop image files only.');
                    setTimeout(() => setStatus('idle'), 2000);
                    return;
                }
                const input = document.getElementById('file-upload') as HTMLInputElement;
                const dataTransfer = new DataTransfer();
                imageFiles.forEach(f => dataTransfer.items.add(f));
                if (input) {
                    input.files = dataTransfer.files;
                    handleImageFileChange({ target: input, currentTarget: input } as any);
                }
            }
        }
    };

    const handleToggleSelect = (pageNumber: number) => {
        if (mode !== 'pdf') return;
        const newSelection = new Set(selectedPages);
        if (newSelection.has(pageNumber)) {
            newSelection.delete(pageNumber);
        } else {
            newSelection.add(pageNumber);
        }
        setSelectedPages(newSelection);
    };

    const handlePageOffsetChange = useCallback((pageNumber: number, deltaX: number, deltaY: number) => {
        if (mode === 'pdf') {
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
        }
    }, [currentFileIndex, mode]);

    const handleImageOffsetChange = useCallback((deltaX: number, deltaY: number) => {
        if (mode === 'image') {
            setImageFiles(prev => {
                const updated = [...prev];
                updated[currentFileIndex] = {
                    ...updated[currentFileIndex],
                    offset: {
                        x: updated[currentFileIndex].offset.x + deltaX,
                        y: updated[currentFileIndex].offset.y + deltaY
                    }
                };
                return updated;
            });
        }
    }, [currentFileIndex, mode]);

    const handleResetPageOffset = useCallback((pageNumber: number) => {
        if (mode === 'pdf') {
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
        }
    }, [currentFileIndex, mode]);

    const handleResetImageOffset = useCallback(() => {
        if (mode === 'image') {
            setImageFiles(prev => {
                const updated = [...prev];
                updated[currentFileIndex] = {
                    ...updated[currentFileIndex],
                    offset: { x: 0, y: 0 }
                };
                return updated;
            });
        }
    }, [currentFileIndex, mode]);

    const [sliderValue, setSliderValue] = useState<number>(0);
    const pagesForSlider = mode === 'pdf' && selectedPages.size > 0
        ? Array.from(selectedPages).sort((a, b) => a - b)
        : [];
    const displayRotation = mode === 'pdf' && currentPdfFile && pagesForSlider.length > 0
        ? currentPdfFile.rotations[pagesForSlider[0]] ?? 0
        : mode === 'image' && currentImageFile
        ? currentImageFile.rotation
        : 0;

    useEffect(() => {
        setSliderValue(displayRotation);
    }, [displayRotation, currentFileIndex, selectedPages]);

    const fileCount = mode === 'pdf' ? pdfFiles.length : imageFiles.length;

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
                        Document Angle Corrector
                    </h1>
                    <p className="text-slate-400 mt-2">
                        Adjust angles and save corrected files
                    </p>
                </header>

                {/* Mode Tabs */}
                <div className="flex justify-center mb-6">
                    <div className="inline-flex bg-slate-800 rounded-lg p-1">
                        <button
                            onClick={() => setMode('pdf')}
                            className={`px-6 py-2 rounded-md font-semibold transition-colors ${
                                mode === 'pdf'
                                    ? 'bg-brand-600 text-white'
                                    : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            PDF Mode
                        </button>
                        <button
                            onClick={() => setMode('image')}
                            className={`px-6 py-2 rounded-md font-semibold transition-colors ${
                                mode === 'image'
                                    ? 'bg-brand-600 text-white'
                                    : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            Image Mode
                        </button>
                    </div>
                </div>

                {showInfo && fileCount === 0 && (
                    <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 text-blue-400 text-xl">ℹ️</div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-blue-300 mb-2">
                                    {mode === 'pdf' ? 'PDF Mode' : 'Image Mode'}
                                </h3>
                                <p className="text-sm text-slate-300 mb-2">
                                    {mode === 'pdf'
                                        ? 'Process multiple PDF files and save each individually with angle corrections.'
                                        : 'Process multiple images and export as a single corrected PDF file.'}
                                </p>
                                <p className="text-xs text-slate-400">
                                    Note: File saving requires Chrome or Edge browser.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowInfo(false)}
                                className="text-slate-500 hover:text-slate-300"
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
                                <span>Select {mode === 'pdf' ? 'PDF' : 'Image'} Files</span>
                                <input
                                    id="file-upload"
                                    name="file-upload"
                                    type="file"
                                    className="sr-only"
                                    onChange={mode === 'pdf' ? handlePdfFileChange : handleImageFileChange}
                                    accept={mode === 'pdf' ? 'application/pdf' : 'image/*'}
                                    multiple
                                />
                            </label>
                            <p className="mt-2 text-sm text-slate-400">or drag and drop</p>
                        </div>
                        {fileCount > 0 && (
                            <p className="mt-4 text-slate-300">
                                <span className="font-semibold text-brand-400">{fileCount} {mode === 'pdf' ? 'PDF' : 'image'} file(s)</span> loaded
                            </p>
                        )}
                    </div>

                    {fileCount > 0 && (
                        <>
                            {/* File Navigation */}
                            <div className="bg-slate-800 p-4 rounded-xl shadow-lg">
                                <div className="flex items-center gap-4">
                                    {fileCount > 1 && (
                                        <button
                                            onClick={() => setCurrentFileIndex(Math.max(0, currentFileIndex - 1))}
                                            disabled={currentFileIndex === 0}
                                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
                                        >
                                            ← Previous
                                        </button>
                                    )}
                                    <div className="flex-1 text-center">
                                        {fileCount > 1 && (
                                            <p className="text-sm text-slate-400">File {currentFileIndex + 1} of {fileCount}</p>
                                        )}
                                        <p className="font-semibold text-brand-400 truncate">
                                            {mode === 'pdf' && currentPdfFile ? currentPdfFile.file.name : ''}
                                            {mode === 'image' && currentImageFile ? currentImageFile.file.name : ''}
                                        </p>
                                    </div>
                                    {fileCount > 1 && (
                                        <button
                                            onClick={() => setCurrentFileIndex(Math.min(fileCount - 1, currentFileIndex + 1))}
                                            disabled={currentFileIndex === fileCount - 1}
                                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
                                        >
                                            Next →
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* AI Auto-Fix Button */}
                            <div className="bg-slate-800 p-4 rounded-xl shadow-lg">
                                <button
                                    onClick={async () => {
                                        setStatus('analyzing');
                                        setStatusMessage('AI analyzing document angles...');

                                        try {
                                            if (mode === 'pdf' && currentPdfFile) {
                                                const pagesToAnalyze = pagesForSlider.length > 0
                                                    ? pagesForSlider
                                                    : Array.from({ length: currentPdfFile.pdfDoc.numPages }, (_, i) => i + 1);

                                                let analyzedCount = 0;
                                                const newRotations = { ...currentPdfFile.rotations };

                                                // Use already rendered preview canvases instead of re-rendering
                                                for (const pageNum of pagesToAnalyze) {
                                                    try {
                                                        setStatusMessage(`Analyzing page ${pageNum}/${pagesToAnalyze.length}...`);

                                                        // Find the preview canvas that's already rendered
                                                        const previewCanvases = document.querySelectorAll('canvas');
                                                        let sourceCanvas: HTMLCanvasElement | null = null;

                                                        // Find the canvas for this page number
                                                        for (const canvas of Array.from(previewCanvases)) {
                                                            const pageIndex = Array.from(previewCanvases).indexOf(canvas);
                                                            if (pageIndex + 1 === pageNum) {
                                                                sourceCanvas = canvas;
                                                                break;
                                                            }
                                                        }

                                                        if (!sourceCanvas || sourceCanvas.width === 0) {
                                                            console.warn(`Canvas for page ${pageNum} not found or not rendered`);
                                                            continue;
                                                        }

                                                        // Convert existing canvas to image URL
                                                        const imageUrl = sourceCanvas.toDataURL('image/png');

                                                        // Detect angle
                                                        const detectedAngle = await detectTiltAngle(imageUrl);
                                                        newRotations[pageNum] = detectedAngle;
                                                        analyzedCount++;

                                                        setStatusMessage(`Analyzing... ${analyzedCount}/${pagesToAnalyze.length} pages`);

                                                    } catch (error) {
                                                        console.error(`Error analyzing page ${pageNum}:`, error);
                                                        // Continue with next page
                                                    }
                                                }

                                                setPdfFiles(prev => {
                                                    const updated = [...prev];
                                                    updated[currentFileIndex] = {
                                                        ...updated[currentFileIndex],
                                                        rotations: newRotations
                                                    };
                                                    return updated;
                                                });

                                                setStatus('success');
                                                setStatusMessage(`✨ Auto-corrected ${analyzedCount} page(s)!`);
                                            } else if (mode === 'image' && currentImageFile) {
                                                const detectedAngle = await detectTiltAngle(currentImageFile.url);

                                                setImageFiles(prev => {
                                                    const updated = [...prev];
                                                    updated[currentFileIndex] = {
                                                        ...updated[currentFileIndex],
                                                        rotation: detectedAngle
                                                    };
                                                    return updated;
                                                });

                                                setStatus('success');
                                                setStatusMessage('✨ Auto-corrected!');
                                            }
                                        } catch (error) {
                                            console.error('Auto-fix error:', error);
                                            setStatus('error');
                                            setStatusMessage('Failed to auto-detect angle. Please adjust manually.');
                                        } finally {
                                            setTimeout(() => setStatus('idle'), 3000);
                                        }
                                    }}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-3 text-base font-semibold bg-gradient-to-r from-purple-600 to-brand-600 hover:from-purple-700 hover:to-brand-700 rounded-lg transition-all shadow-lg hover:shadow-xl"
                                    disabled={status === 'analyzing'}
                                >
                                    {status === 'analyzing' ? (
                                        <>
                                            <LoaderIcon className="animate-spin h-5 w-5" />
                                            AI Analyzing...
                                        </>
                                    ) : (
                                        <>
                                            ✨ Auto-Fix with AI
                                        </>
                                    )}
                                </button>
                                <p className="text-xs text-slate-400 text-center mt-2">
                                    {mode === 'pdf' && pagesForSlider.length > 0
                                        ? `Will analyze ${pagesForSlider.length} selected page(s)`
                                        : mode === 'pdf'
                                        ? 'Will analyze all pages'
                                        : 'Detect and correct text tilt automatically'}
                                </p>
                            </div>

                            {/* Rotation Controls */}
                            <div className="bg-slate-800 p-6 rounded-xl shadow-lg space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-4 sm:space-y-0">
                                    <div className="flex-grow">
                                        <label htmlFor="rotation" className="block text-sm font-medium text-slate-300 mb-2">
                                            Rotation Angle: <span className="font-bold text-brand-400">{sliderValue.toFixed(2)}°</span>
                                            {mode === 'pdf' && pagesForSlider.length > 0 && (
                                                <span className="text-xs text-brand-400 ml-2">({pagesForSlider.length} page{pagesForSlider.length > 1 ? 's' : ''} selected)</span>
                                            )}
                                            {mode === 'pdf' && pagesForSlider.length === 0 && (
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
                                            if (mode === 'pdf' && currentPdfFile) {
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
                                            } else if (mode === 'image' && currentImageFile) {
                                                setImageFiles(prev => {
                                                    const updated = [...prev];
                                                    updated[currentFileIndex] = {
                                                        ...updated[currentFileIndex],
                                                        rotation: 0
                                                    };
                                                    return updated;
                                                });
                                            }
                                            setSliderValue(0);
                                        }}
                                        className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold bg-slate-700 hover:bg-slate-600 rounded-md transition-colors w-full sm:w-auto"
                                    >
                                        <RotateCcwIcon className="h-4 w-4" /> Reset
                                    </button>
                                </div>

                                {/* Quick Rotation Buttons */}
                                <div className="space-y-3">
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => handleRotationChange(90)}
                                            className="px-3 py-1.5 text-sm font-semibold bg-slate-700 hover:bg-slate-600 rounded-md transition-colors"
                                        >
                                            ↻ 90°
                                        </button>
                                        <button
                                            onClick={() => handleRotationChange(180)}
                                            className="px-3 py-1.5 text-sm font-semibold bg-slate-700 hover:bg-slate-600 rounded-md transition-colors"
                                        >
                                            ↻ 180°
                                        </button>
                                        <button
                                            onClick={() => handleRotationChange(270)}
                                            className="px-3 py-1.5 text-sm font-semibold bg-slate-700 hover:bg-slate-600 rounded-md transition-colors"
                                        >
                                            ↻ 270°
                                        </button>
                                        <button
                                            onClick={() => handleRotationChange(-90)}
                                            className="px-3 py-1.5 text-sm font-semibold bg-slate-700 hover:bg-slate-600 rounded-md transition-colors"
                                        >
                                            ↺ 90°
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <input
                                            type="number"
                                            placeholder="Custom angle"
                                            className="px-3 py-1.5 text-sm bg-slate-700 text-slate-100 rounded-md border border-slate-600 focus:border-brand-500 focus:outline-none w-32"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    const value = parseFloat((e.target as HTMLInputElement).value);
                                                    if (!isNaN(value)) {
                                                        handleRotationChange(value);
                                                        (e.target as HTMLInputElement).value = '';
                                                    }
                                                }
                                            }}
                                        />
                                        <span className="text-xs text-slate-400 self-center">Press Enter to apply</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => handleFlip('horizontal')}
                                            className="px-3 py-1.5 text-sm font-semibold bg-slate-700 hover:bg-slate-600 rounded-md transition-colors"
                                        >
                                            ↔ Flip Horizontal
                                        </button>
                                        <button
                                            onClick={() => handleFlip('vertical')}
                                            className="px-3 py-1.5 text-sm font-semibold bg-slate-700 hover:bg-slate-600 rounded-md transition-colors"
                                        >
                                            ↕ Flip Vertical
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    {mode === 'pdf' ? (
                                        <button
                                            onClick={handleSavePdfs}
                                            disabled={status === 'generating'}
                                            className="flex items-center justify-center w-full px-4 py-3 font-semibold text-white bg-brand-600 rounded-md hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <DownloadIcon className="h-5 w-5 mr-2" />
                                            Save All {fileCount} PDF{fileCount > 1 ? 's' : ''}
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                onClick={handleSaveImages}
                                                disabled={status === 'generating'}
                                                className="flex items-center justify-center w-full px-4 py-3 font-semibold text-white bg-brand-600 rounded-md hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <DownloadIcon className="h-5 w-5 mr-2" />
                                                Save All {fileCount} Image{fileCount > 1 ? 's' : ''}
                                            </button>
                                            <button
                                                onClick={handleExportImagesToPdf}
                                                disabled={status === 'generating'}
                                                className="flex items-center justify-center w-full px-4 py-3 font-semibold text-white bg-slate-700 rounded-md hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <DownloadIcon className="h-5 w-5 mr-2" />
                                                Export as PDF
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Preview */}
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
                                        {mode === 'pdf' && currentPdfFile && Array.from({ length: currentPdfFile.pdfDoc.numPages }, (_, i) => (
                                            <PdfPagePreview
                                                key={i}
                                                pdfDoc={currentPdfFile.pdfDoc}
                                                pageNumber={i + 1}
                                                rotation={currentPdfFile.rotations[i + 1] ?? 0}
                                                isSelected={selectedPages.has(i + 1)}
                                                onSelect={handleToggleSelect}
                                                offset={currentPdfFile.offsets[i + 1] || { x: 0, y: 0 }}
                                                flip={currentPdfFile.flips[i + 1] || { horizontal: false, vertical: false }}
                                                onOffsetChange={handlePageOffsetChange}
                                                onResetOffset={handleResetPageOffset}
                                                showGuidelines={showGuidelines}
                                                isAnalyzing={status === 'analyzing'}
                                            />
                                        ))}
                                        {mode === 'image' && currentImageFile && (
                                            <ImagePreview
                                                imageUrl={currentImageFile.dataUrl}
                                                rotation={currentImageFile.rotation}
                                                offset={currentImageFile.offset}
                                                flipHorizontal={currentImageFile.flipHorizontal}
                                                flipVertical={currentImageFile.flipVertical}
                                                onOffsetChange={handleImageOffsetChange}
                                                onResetOffset={handleResetImageOffset}
                                                showGuidelines={showGuidelines}
                                            />
                                        )}
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
    flip: { horizontal: boolean; vertical: boolean };
    onOffsetChange: (pageNumber: number, deltaX: number, deltaY: number) => void;
    onResetOffset: (pageNumber: number) => void;
    showGuidelines: boolean;
    isAnalyzing: boolean;
}

const PdfPagePreview: React.FC<PdfPagePreviewProps> = ({ pdfDoc, pageNumber, rotation, isSelected, onSelect, offset, flip, onOffsetChange, onResetOffset, showGuidelines, isAnalyzing }) => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(null);
    const [canvasSize, setCanvasSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

    useEffect(() => {
        const renderPage = async () => {
            // Join the global render queue to prevent concurrent renders
            const myRenderTask = pdfRenderQueue.then(async () => {
                const page = await pdfDoc.getPage(pageNumber);
                const scale = 1.5;
                const viewport = page.getViewport({ scale });
                const canvas = canvasRef.current;
                if (!canvas) return;

                const context = canvas.getContext('2d');
                if (!context) return;

                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({ canvasContext: context, viewport: viewport }).promise;
                setCanvasSize({ width: canvas.width, height: canvas.height });
            });

            // Update the global queue to wait for this render
            pdfRenderQueue = myRenderTask;

            // Wait for this render to complete
            await myRenderTask;
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
                        transform: `translate(${offset.x}px, ${offset.y}px) scale(${flip.horizontal ? -1 : 1}, ${flip.vertical ? -1 : 1}) rotate(${rotation}deg)`,
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

interface ImagePreviewProps {
    imageUrl: string;
    rotation: number;
    offset: { x: number; y: number };
    flipHorizontal: boolean;
    flipVertical: boolean;
    onOffsetChange: (deltaX: number, deltaY: number) => void;
    onResetOffset: () => void;
    showGuidelines: boolean;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ imageUrl, rotation, offset, flipHorizontal, flipVertical, onOffsetChange, onResetOffset, showGuidelines }) => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(null);
    const [imageSize, setImageSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

    useEffect(() => {
        const img = new Image();
        img.onload = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const scale = Math.min(800 / img.width, 800 / img.height, 1.5);
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;

            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            setImageSize({ width: canvas.width, height: canvas.height });
        };
        img.src = imageUrl;
    }, [imageUrl]);

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
            onOffsetChange(deltaX, deltaY);
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
                className="relative overflow-hidden border-4 border-slate-600 shadow-black/40 shadow-lg"
                style={{
                    width: imageSize.width || 'auto',
                    height: imageSize.height || 'auto',
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
                        transform: `translate(${offset.x}px, ${offset.y}px) scale(${flipHorizontal ? -1 : 1}, ${flipVertical ? -1 : 1}) rotate(${rotation}deg)`,
                        transformOrigin: 'center center',
                        left: '50%',
                        top: '50%',
                        marginLeft: -(imageSize.width / 2),
                        marginTop: -(imageSize.height / 2)
                    }}
                >
                    <canvas ref={canvasRef} />
                </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
                <p className="text-xs text-slate-500">Rotation: {rotation.toFixed(2)}°</p>
                {(offset.x !== 0 || offset.y !== 0) && (
                    <button
                        onClick={onResetOffset}
                        className="text-xs px-2 py-0.5 bg-slate-700 hover:bg-slate-600 rounded text-slate-300"
                    >
                        Reset Position
                    </button>
                )}
            </div>
        </div>
    );
};

export default App;