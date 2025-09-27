
// This file is used to declare global variables for libraries loaded via CDN.

declare global {
  // For pdf.js from https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js
  const pdfjsLib: {
    GlobalWorkerOptions: {
      workerSrc: string;
    };
    getDocument: (src: string | ArrayBuffer) => {
      promise: Promise<PdfDocument>;
    };
  };

  // For pdf-lib from https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js
  const PDFLib: {
    PDFDocument: {
      create: () => Promise<any>;
      load: (pdf: ArrayBuffer) => Promise<any>;
    };
    degrees: (angle: number) => number;
  };
}

export interface PdfDocument {
  numPages: number;
  getPage: (pageNumber: number) => Promise<PdfPage>;
}

export interface PdfPage {
  getViewport: (options: { scale: number }) => PdfViewport;
  render: (context: {
    canvasContext: CanvasRenderingContext2D;
    viewport: PdfViewport;
  }) => {
    promise: Promise<void>;
  };
}

export interface PdfViewport {
  width: number;
  height: number;
}

export type FileType = 'pdf' | 'image';

export interface ImageFile {
  file: File;
  dataUrl: string;
}

export type ExportFormat = 'pdf' | 'jpg' | 'png' | 'webp';

// This empty export ensures the file is treated as a module, which is required for 'declare global'.
export {};
