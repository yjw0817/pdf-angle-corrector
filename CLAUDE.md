# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a web-based PDF and image angle correction tool built with React 19, TypeScript, and Vite. It allows users to upload PDFs or images, apply precise rotation adjustments (±15°), reposition pages with middle-button drag, and export corrected files in multiple formats.

## Commands

**Development:**
- `npm install` - Install dependencies
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Architecture

### State Management Architecture

The application uses React 19's `useState` for state management with these key state domains:

- **File State**: `files`, `fileType` ('pdf' | 'image'), `pdfDoc`, `imageUrls`
- **Transform State**: `rotations` (Record<pageNumber, degrees>), `pageOffsets` (Record<pageNumber, {x, y}>)
- **Selection State**: `selectedPages` (Set<pageNumber>) - determines which pages receive rotation adjustments
- **UI State**: `exportFormat`, `status`, `statusMessage`, `isDragging`, `showGuidelines`, `sliderValue`

### Key Behavioral Patterns

**Rotation System:**
- Slider adjusts rotation for selected pages (or all pages if none selected)
- Rotation state is per-page (1-indexed page numbers as keys)
- After save, rotations reset to 0 and images are reloaded with baked-in corrections

**Offset System:**
- Middle-button drag applies x/y offsets to individual pages
- Offsets are applied in addition to rotation during rendering and export
- Canvas rendering uses center-based transforms with offset compensation

**Selection System:**
- Multi-page PDFs support page selection via checkboxes
- Selected pages receive rotation adjustments together
- Empty selection applies changes to all pages

### Service Layer

**`services/pdfService.ts`:**
- `createRotatedPdf()` - Uses pdf-lib to create new PDF with rotated pages and applied offsets
- Rotation logic: negates user angle (slider positive = clockwise) for pdf-lib's counter-clockwise system
- Center-rotation is achieved via offset calculations before drawing pages

**`services/imageService.ts`:**
- `rotateAndExportImage()` - Canvas-based rotation and format export (jpg/png/webp)
- `createPdfFromImages()` - Creates PDF from multiple images using pdf-lib

**`services/geminiService.ts`:**
- Currently empty (no AI features implemented)

### External Dependencies (CDN)

**PDF Processing:**
- `pdf.js` 3.11.174 - PDF rendering to canvas for preview
- `pdf-lib` 1.17.1 - PDF manipulation and creation
- Both loaded via CDN in index.html, typed via types.ts `declare global`

**UI:**
- TailwindCSS via CDN
- React 19 via AI Studio CDN import maps

### Critical Implementation Details

**Transform Coordinate Systems:**
- Canvas/screen Y-axis increases downward (standard web coordinates)
- Offsets applied directly without negation in image service
- PDF service applies offsets after rotation transform calculations

**Save Behavior:**
- File System Access API (Chrome/Edge) used first for save dialog
- Falls back to traditional download for unsupported browsers
- After save, rotations and offsets reset to 0 (shows "saved state")
- Image mode: reloads images with baked-in corrections

**Page Numbering:**
- All page numbers are 1-indexed throughout the application
- Maps/Records use page numbers (not array indices) as keys