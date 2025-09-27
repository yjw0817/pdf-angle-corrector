import type { ExportFormat } from '../types';

export const rotateAndExportImage = async (
    imageUrl: string,
    rotation: number,
    offset: { x: number; y: number },
    format: ExportFormat,
    flipHorizontal: boolean = false,
    flipVertical: boolean = false
): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Failed to get canvas context'));
                return;
            }

            // Calculate rotated dimensions
            const angle = rotation * (Math.PI / 180);
            const cos = Math.abs(Math.cos(angle));
            const sin = Math.abs(Math.sin(angle));
            const newWidth = img.width * cos + img.height * sin;
            const newHeight = img.width * sin + img.height * cos;

            canvas.width = newWidth;
            canvas.height = newHeight;

            // Apply transformations
            // Order: translate to center -> flip -> rotate -> translate with offset
            ctx.translate(newWidth / 2, newHeight / 2);
            ctx.scale(flipHorizontal ? -1 : 1, flipVertical ? -1 : 1);
            ctx.rotate(angle);
            ctx.translate(-img.width / 2 + offset.x, -img.height / 2 - offset.y);
            ctx.drawImage(img, 0, 0);

            // Export based on format
            const mimeType = format === 'jpg' ? 'image/jpeg' : 
                            format === 'png' ? 'image/png' : 
                            'image/webp';
            const quality = format === 'jpg' ? 0.95 : undefined;

            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error('Failed to create blob'));
                }
            }, mimeType, quality);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = imageUrl;
    });
};

export const createPdfFromImages = async (
    imageUrls: string[],
    rotations: Record<number, number>,
    offsets: Record<number, { x: number; y: number }>,
    flips: Record<number, { horizontal: boolean; vertical: boolean }>
): Promise<Uint8Array> => {
    const { PDFDocument } = PDFLib;
    const pdfDoc = await PDFDocument.create();

    for (let i = 0; i < imageUrls.length; i++) {
        const pageNumber = i + 1;
        const rotation = rotations[pageNumber] || 0;
        const offset = offsets[pageNumber] || { x: 0, y: 0 };
        const flip = flips[pageNumber] || { horizontal: false, vertical: false };

        // Create rotated image blob
        const blob = await rotateAndExportImage(imageUrls[i], rotation, offset, 'png', flip.horizontal, flip.vertical);
        const arrayBuffer = await blob.arrayBuffer();
        
        // Embed image in PDF
        let image;
        if (blob.type === 'image/png') {
            image = await pdfDoc.embedPng(arrayBuffer);
        } else {
            image = await pdfDoc.embedJpg(arrayBuffer);
        }

        const page = pdfDoc.addPage([image.width, image.height]);
        page.drawImage(image, {
            x: 0,
            y: 0,
            width: image.width,
            height: image.height,
        });
    }

    return await pdfDoc.save();
};