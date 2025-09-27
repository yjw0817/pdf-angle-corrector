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

      // Skip very short text (likely noise)
      if (line.text.trim().length < 2) return;

      const { x0, y0, x1, y1 } = line.bbox;
      const lineWidth = Math.abs(x1 - x0);
      const lineHeight = Math.abs(y1 - y0);

      // Skip if too tall (likely vertical text or noise)
      if (lineHeight > lineWidth) return;

      // Calculate angle from baseline
      const dx = x1 - x0;
      const dy = y1 - y0;
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

      // Accept all small angles (±15 degrees), including very small ones
      if (Math.abs(angle) < 15) {
        angles.push(angle);
      }
    });

    if (angles.length < 2) {
      // Not enough text lines
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

    const detectedAngle = -findDominantAngle(angles);
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

        // Canny edge detection with lower thresholds for thin lines
        cv.Canny(gray, edges, 30, 100, 3, false);

        // HoughLinesP parameters (relaxed for receipts/forms):
        // rho=1, theta=Math.PI/180, threshold=50 (less strict)
        // minLineLength=50 (shorter lines ok), maxLineGap=10
        cv.HoughLinesP(edges, lines, 1, Math.PI / 180, 50, 50, 10);

        const angles: number[] = [];
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;

        // Define margin to exclude border lines (5% from each edge)
        const marginX = imgWidth * 0.05;
        const marginY = imgHeight * 0.05;

        for (let i = 0; i < lines.rows; i++) {
          const x1 = lines.data32S[i * 4];
          const y1 = lines.data32S[i * 4 + 1];
          const x2 = lines.data32S[i * 4 + 2];
          const y2 = lines.data32S[i * 4 + 3];

          // Skip lines too close to image borders (likely border/background)
          const nearBorder =
            x1 < marginX || x2 < marginX || x1 > imgWidth - marginX || x2 > imgWidth - marginX ||
            y1 < marginY || y2 < marginY || y1 > imgHeight - marginY || y2 > imgHeight - marginY;

          if (nearBorder) continue;

          const dx = x2 - x1;
          const dy = y2 - y1;

          // Skip very short lines (likely noise)
          const lineLength = Math.sqrt(dx * dx + dy * dy);
          if (lineLength < imgWidth * 0.1) continue; // At least 10% of image width

          // Calculate angle in degrees
          let angle = (Math.atan2(dy, dx) * 180) / Math.PI;

          // Normalize to [-90, 90] range
          while (angle > 90) angle -= 180;
          while (angle < -90) angle += 180;

          // Only use nearly horizontal lines (within ±15 degrees of horizontal)
          if (Math.abs(angle) <= 15) {
            angles.push(angle);
          }
        }

        src.delete();
        gray.delete();
        edges.delete();
        lines.delete();

        if (angles.length < 3) {
          // Need at least 3 lines for detection
          resolve(null);
          return;
        }

        // Use dominant angle (most common angle via clustering)
        const detectedAngle = -findDominantAngle(angles);

        // Calculate standard deviation for confidence
        const mean = angles.reduce((a, b) => a + b, 0) / angles.length;
        const variance = angles.reduce((sum, angle) => sum + Math.pow(angle - mean, 2), 0) / angles.length;
        const stdDev = Math.sqrt(variance);

        // Simple confidence based on consistency and sample size
        let confidence = 0.9;
        if (stdDev > 1.5) {
          confidence = 0.6; // Low confidence if inconsistent
        } else if (stdDev > 0.8) {
          confidence = 0.75; // Medium confidence
        }

        // Boost confidence with more lines
        if (angles.length > 20) {
          confidence = Math.min(0.95, confidence + 0.05);
        }

        // If angle is very small (< 0.5 degrees), it might be already straight
        // Reduce confidence to allow fallback to text detection
        if (Math.abs(detectedAngle) < 0.5) {
          confidence = Math.min(confidence, 0.65);
        }

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
 * Simple detection: Lines first, text only as fallback
 * @param imageUrl - Data URL or blob URL of the image
 * @returns Detected angle in degrees (positive = clockwise correction needed)
 */
export const detectTiltAngle = async (imageUrl: string): Promise<number> => {
  console.log('🔍 Auto-detecting document angle...');

  // Step 1: Try line detection (most reliable)
  try {
    const lineResult = await detectAngleFromLines(imageUrl);
    if (lineResult !== null && lineResult.confidence >= 0.7) {
      console.log(`✅ Line detection: ${lineResult.angle.toFixed(2)}° (confidence: ${lineResult.confidence.toFixed(2)})`);
      return lineResult.angle;
    } else if (lineResult !== null) {
      console.log(`⚠️ Line detection low confidence: ${lineResult.confidence.toFixed(2)}, trying text detection...`);
    }
  } catch (error) {
    console.warn('Line detection failed:', error);
  }

  // Step 2: Fallback to text detection
  try {
    const textResult = await detectAngleFromTextBaselines(imageUrl);
    if (textResult !== null) {
      console.log(`✅ Text detection (fallback): ${textResult.angle.toFixed(2)}° (confidence: ${textResult.confidence.toFixed(2)})`);
      return textResult.angle;
    }
  } catch (error) {
    console.warn('Text detection failed:', error);
  }

  // Step 3: Last resort - no detection succeeded
  console.warn('❌ Auto-detection failed, returning 0°');
  return 0;
};

const median = (values: number[]): number => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
};

/**
 * Find the most common angle using clustering
 * Groups similar angles together and returns the average of the largest group
 */
const findDominantAngle = (angles: number[]): number => {
  if (angles.length === 0) return 0;
  if (angles.length === 1) return angles[0];

  // Sort angles for clustering
  const sorted = [...angles].sort((a, b) => a - b);

  // Cluster angles that are within 1 degree of each other
  const clusters: number[][] = [];
  let currentCluster: number[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    if (Math.abs(sorted[i] - sorted[i - 1]) <= 1.0) {
      // Add to current cluster
      currentCluster.push(sorted[i]);
    } else {
      // Start new cluster
      clusters.push(currentCluster);
      currentCluster = [sorted[i]];
    }
  }
  clusters.push(currentCluster); // Don't forget last cluster

  // Find the largest cluster (majority vote)
  let largestCluster = clusters[0];
  for (const cluster of clusters) {
    if (cluster.length > largestCluster.length) {
      largestCluster = cluster;
    }
  }

  // Debug: log cluster info
  console.log(`📊 Found ${clusters.length} angle clusters, largest has ${largestCluster.length}/${angles.length} angles`);

  // Return the average of the largest cluster
  const sum = largestCluster.reduce((a, b) => a + b, 0);
  return sum / largestCluster.length;
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