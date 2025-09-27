import type { ExportFormat } from '../types';
import { createWorker, type Worker } from 'tesseract.js';

/**
 * Wait for OpenCV to be ready
 */
const waitForOpenCV = (): Promise<void> => {
  return new Promise((resolve) => {
    if (typeof cv !== 'undefined' && cv.Mat) {
      resolve();
    } else {
      const checkInterval = setInterval(() => {
        if (typeof cv !== 'undefined' && cv.Mat) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
    }
  });
};

/**
 * Method 1: Detect angle using text baselines (most accurate for text documents)
 */
const detectAngleFromTextBaselines = async (imageUrl: string): Promise<{ angle: number; confidence: number } | null> => {
  let worker: Worker | null = null;

  try {
    worker = await createWorker(['eng', 'kor'], 1);
    const { data } = await worker.recognize(imageUrl);

    if (!data.lines || data.lines.length < 3) {
      // Need at least 3 text lines for reliable detection
      return null;
    }

    const angles: number[] = [];

    // Calculate baseline angles from text lines
    data.lines.forEach((line) => {
      if (!line.baseline || !line.bbox || !line.text) return;

      // Skip very short lines (likely noise)
      if (line.text.trim().length < 3) return;

      const { x0, y0, x1, y1 } = line.bbox;
      const lineWidth = Math.abs(x1 - x0);
      const lineHeight = Math.abs(y1 - y0);

      // Skip if line is too short or too tall (likely not horizontal text)
      if (lineWidth < 50 || lineHeight > lineWidth / 2) return;

      // Calculate angle from baseline
      const dx = x1 - x0;
      const dy = y1 - y0;
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

      // Filter reasonable angles (±15 degrees)
      if (Math.abs(angle) < 15) {
        angles.push(angle);
      }
    });

    if (angles.length < 3) {
      // Not enough reliable text lines
      return null;
    }

    // Calculate standard deviation to assess consistency
    const mean = angles.reduce((a, b) => a + b, 0) / angles.length;
    const variance = angles.reduce((sum, angle) => sum + Math.pow(angle - mean, 2), 0) / angles.length;
    const stdDev = Math.sqrt(variance);

    // If angles are inconsistent, reduce confidence
    let confidence = 0.9;
    if (stdDev > 2.0) {
      confidence = 0.4; // Low confidence if angles vary too much
    } else if (stdDev > 1.0) {
      confidence = 0.6; // Medium confidence
    }

    const detectedAngle = -median(angles);
    return { angle: detectedAngle, confidence };

  } catch (error) {
    console.warn('Text baseline detection failed:', error);
    return null;
  } finally {
    if (worker) await worker.terminate();
  }
};

/**
 * Method 2: Detect angle using Hough Line Transform (good for documents with lines/tables)
 */
const detectAngleFromLines = async (imageUrl: string): Promise<{ angle: number; confidence: number } | null> => {
  await waitForOpenCV();

  return new Promise((resolve) => {
    const img = new Image();

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const src = cv.matFromImageData(imageData);
        const gray = new cv.Mat();
        const edges = new cv.Mat();
        const lines = new cv.Mat();

        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
        cv.Canny(gray, edges, 50, 150, 3, false);
        cv.HoughLinesP(edges, lines, 1, Math.PI / 180, 80, 50, 10);

        const angles: number[] = [];

        for (let i = 0; i < lines.rows; i++) {
          const x1 = lines.data32S[i * 4];
          const y1 = lines.data32S[i * 4 + 1];
          const x2 = lines.data32S[i * 4 + 2];
          const y2 = lines.data32S[i * 4 + 3];

          const dx = x2 - x1;
          const dy = y2 - y1;
          const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

          const normalizedAngle = angle % 180;
          if (
            (normalizedAngle < 15 || normalizedAngle > 165) ||
            (normalizedAngle > 75 && normalizedAngle < 105)
          ) {
            let correctedAngle = normalizedAngle;
            if (correctedAngle > 90) {
              correctedAngle = correctedAngle - 180;
            }
            if (Math.abs(correctedAngle) < 15) {
              angles.push(correctedAngle);
            }
          }
        }

        src.delete();
        gray.delete();
        edges.delete();
        lines.delete();

        if (angles.length < 5) {
          // Need at least 5 lines for reliable detection
          resolve(null);
          return;
        }

        // Calculate standard deviation
        const mean = angles.reduce((a, b) => a + b, 0) / angles.length;
        const variance = angles.reduce((sum, angle) => sum + Math.pow(angle - mean, 2), 0) / angles.length;
        const stdDev = Math.sqrt(variance);

        // Adjust confidence based on consistency
        let confidence = 0.8;
        if (stdDev > 2.0) {
          confidence = 0.5;
        } else if (stdDev > 1.0) {
          confidence = 0.65;
        } else if (stdDev < 0.5) {
          confidence = 0.95; // Very consistent lines = high confidence
        }

        const detectedAngle = -median(angles);
        resolve({ angle: detectedAngle, confidence });

      } catch (error) {
        console.warn('Line detection failed:', error);
        resolve(null);
      }
    };

    img.onerror = () => resolve(null);
    img.src = imageUrl;
  });
};

/**
 * Method 3: Detect document contours for alignment
 */
const detectDocumentContour = async (imageUrl: string): Promise<{ angle: number; offset: { x: number; y: number } } | null> => {
  await waitForOpenCV();

  return new Promise((resolve) => {
    const img = new Image();

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const src = cv.matFromImageData(imageData);
        const gray = new cv.Mat();
        const binary = new cv.Mat();
        const contours = new cv.MatVector();
        const hierarchy = new cv.Mat();

        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
        cv.threshold(gray, binary, 127, 255, cv.THRESH_BINARY);
        cv.findContours(binary, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

        // Find largest contour (document boundary)
        let maxArea = 0;
        let maxContourIdx = -1;

        for (let i = 0; i < contours.size(); i++) {
          const contour = contours.get(i);
          const area = cv.contourArea(contour);
          if (area > maxArea) {
            maxArea = area;
            maxContourIdx = i;
          }
        }

        if (maxContourIdx === -1 || maxArea < img.width * img.height * 0.1) {
          src.delete();
          gray.delete();
          binary.delete();
          contours.delete();
          hierarchy.delete();
          resolve(null);
          return;
        }

        const docContour = contours.get(maxContourIdx);
        const rect = cv.minAreaRect(docContour);

        // Calculate rotation angle
        let angle = rect.angle;
        if (rect.size.width < rect.size.height) {
          angle = angle + 90;
        }

        // Normalize angle to [-45, 45]
        if (angle > 45) angle = angle - 90;
        if (angle < -45) angle = angle + 90;

        // Calculate offset to center
        const centerX = rect.center.x - img.width / 2;
        const centerY = rect.center.y - img.height / 2;

        src.delete();
        gray.delete();
        binary.delete();
        contours.delete();
        hierarchy.delete();

        resolve({
          angle: -angle,
          offset: { x: -centerX, y: -centerY }
        });

      } catch (error) {
        console.warn('Contour detection failed:', error);
        resolve(null);
      }
    };

    img.onerror = () => resolve(null);
    img.src = imageUrl;
  });
};

/**
 * Combined detection method: tries multiple approaches and uses the most reliable result
 * Priority: Dynamic based on confidence scores
 * @param imageUrl - Data URL or blob URL of the image
 * @returns Detected angle in degrees (positive = clockwise correction needed)
 */
export const detectTiltAngle = async (imageUrl: string): Promise<number> => {
  console.log('🔍 Starting multi-method angle detection...');

  const results: Array<{ method: string; angle: number; confidence: number }> = [];

  // Method 2: Hough Line Transform (try this first - fastest and most reliable for structured docs)
  try {
    const lineResult = await detectAngleFromLines(imageUrl);
    if (lineResult !== null) {
      results.push({ method: 'Hough Lines', ...lineResult });
      console.log(`✓ Hough lines: ${lineResult.angle.toFixed(2)}° (confidence: ${lineResult.confidence.toFixed(2)})`);
    }
  } catch (error) {
    console.warn('Line detection failed:', error);
  }

  // Method 1: Text baselines (only if lines didn't give high confidence)
  const needTextDetection = results.length === 0 || results[0].confidence < 0.8;
  if (needTextDetection) {
    try {
      const textResult = await detectAngleFromTextBaselines(imageUrl);
      if (textResult !== null) {
        results.push({ method: 'Text Baselines', ...textResult });
        console.log(`✓ Text baselines: ${textResult.angle.toFixed(2)}° (confidence: ${textResult.confidence.toFixed(2)})`);
      }
    } catch (error) {
      console.warn('Text baseline detection failed:', error);
    }
  }

  // Method 3: Document contours (only as last resort)
  const needContourDetection = results.length === 0 || results.every(r => r.confidence < 0.6);
  if (needContourDetection) {
    try {
      const contourResult = await detectDocumentContour(imageUrl);
      if (contourResult !== null) {
        results.push({ method: 'Contours', angle: contourResult.angle, confidence: 0.5 });
        console.log(`✓ Contours: ${contourResult.angle.toFixed(2)}° (confidence: 0.5)`);
      }
    } catch (error) {
      console.warn('Contour detection failed:', error);
    }
  }

  // Select best result based on confidence
  if (results.length === 0) {
    console.warn('❌ No detection method succeeded');
    return 0;
  }

  // If we have high-confidence line detection, use it immediately
  const lineResult = results.find(r => r.method === 'Hough Lines' && r.confidence >= 0.9);
  if (lineResult) {
    console.log(`✅ High-confidence line detection: ${lineResult.angle.toFixed(2)}°`);
    return lineResult.angle;
  }

  // If multiple results are similar, use weighted average
  if (results.length >= 2) {
    const angles = results.map(r => r.angle);
    const avgAngle = angles.reduce((a, b) => a + b, 0) / angles.length;
    const variance = angles.reduce((sum, angle) => sum + Math.pow(angle - avgAngle, 2), 0) / angles.length;

    // If variance is low (results agree), use weighted average
    if (variance < 1.0) {
      const weightedSum = results.reduce((sum, r) => sum + r.angle * r.confidence, 0);
      const totalConfidence = results.reduce((sum, r) => sum + r.confidence, 0);
      const finalAngle = weightedSum / totalConfidence;
      console.log(`✅ Methods agree! Using weighted average: ${finalAngle.toFixed(2)}° (variance: ${variance.toFixed(2)})`);
      return finalAngle;
    } else {
      console.log(`⚠️ Methods disagree (variance: ${variance.toFixed(2)}), using highest confidence`);
    }
  }

  // Otherwise use highest confidence result
  const best = results.reduce((a, b) => a.confidence > b.confidence ? a : b);
  console.log(`✅ Best result: ${best.method} = ${best.angle.toFixed(2)}° (confidence: ${best.confidence.toFixed(2)})`);
  return best.angle;
};

const median = (values: number[]): number => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
};

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