/**
 * Creates a new PDF with all pages rotated by a specified angle.
 * This function works by creating a new document and drawing the rotated pages
 * from the original document onto it. This is a robust method for applying
 * arbitrary rotation that is compatible with pdf-lib v1.17.1.
 * @param originalPdfBytes - The ArrayBuffer of the original PDF file.
 * @param rotations - An object mapping page numbers (1-indexed) to the angle in degrees to rotate the page.
 * @param offsets - An object mapping page numbers (1-indexed) to x,y offsets for positioning.
 * @returns A promise that resolves to a Uint8Array of the new, rotated PDF.
 */
export const createRotatedPdf = async (originalPdfBytes: ArrayBuffer, rotations: Record<number, number>, offsets: Record<number, { x: number; y: number }> = {}): Promise<Uint8Array> => {
    try {
        const { PDFDocument, degrees } = PDFLib;

        // Load the original PDF document
        const originalDoc = await PDFDocument.load(originalPdfBytes);
        
        // Create a new PDF document to draw the rotated pages onto
        const newDoc = await PDFDocument.create();

        // Get the page indices from the original document
        const pageIndices = originalDoc.getPageIndices();

        // Embed all pages from the original document into the new document
        // This makes them reusable drawing objects
        const embeddedPages = await newDoc.embedPdf(originalPdfBytes, pageIndices);

        // Iterate over each page to be rotated
        pageIndices.forEach((pageIndex, i) => {
            const pageNumber = pageIndex + 1;
            const angle = rotations[pageNumber] || 0;

            const originalPage = originalDoc.getPage(pageIndex);
            const embeddedPage = embeddedPages[i];
            const { width, height } = originalPage.getSize();

            // Add a new blank page to the new document with the same dimensions
            const newPage = newDoc.addPage([width, height]);

            // The angle from the slider is the correction needed. Positive = clockwise.
            // pdf-lib's rotation is counter-clockwise for positive angles.
            // So, we negate the angle for the rotation.
            const rotationAngleInDegrees = -angle;
            const rotationAngleInRadians = rotationAngleInDegrees * (Math.PI / 180);

            // The `drawPage` operation rotates around the bottom-left corner (x, y).
            // To rotate around the page center, we need to calculate the correct x and y
            // offsets to compensate for the rotation.
            const cosAngle = Math.cos(rotationAngleInRadians);
            const sinAngle = Math.sin(rotationAngleInRadians);
            
            const baseX = (width / 2) - (width / 2) * cosAngle + (height / 2) * sinAngle;
            const baseY = (height / 2) - (width / 2) * sinAngle - (height / 2) * cosAngle;

            // Apply user offset (from middle-button drag)
            const pageOffset = offsets[pageNumber] || { x: 0, y: 0 };
            const x = baseX + pageOffset.x;
            const y = baseY + pageOffset.y;

            // Draw the embedded page onto the new page with the calculated translation and rotation
            newPage.drawPage(embeddedPage, {
                x,
                y,
                rotate: degrees(rotationAngleInDegrees),
            });
        });

        // Serialize the new PDFDocument to bytes (a Uint8Array)
        const pdfBytes = await newDoc.save();

        return pdfBytes;
    } catch (error) {
        console.error("Failed to create rotated PDF:", error);
        throw new Error("An error occurred while processing the PDF.");
    }
};