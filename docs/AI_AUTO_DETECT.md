# AI Auto-Detection Feature Specification

## Executive Summary

AI-powered automatic tilt detection and correction is the **killer feature** that transforms this product from "nice to have" to "must have."

**Business Impact:**
- 3x increase in conversion rate (0.2% → 0.6%)
- 30x time savings (15 minutes → 30 seconds for 30 pages)
- Clear value proposition for $5/mo pricing
- Strong marketing angle ("AI-powered")

**Technical Feasibility:**
- Implementation time: 1-2 weeks
- Technology: Tesseract.js (OCR) or OpenCV.js (line detection)
- Accuracy target: 85-90%
- Performance target: <3 seconds per page

---

## Problem Statement

### Current User Flow (Manual)
```
1. Upload tilted PDF (30 pages)
2. Page 1: Drag slider (-5°... -7°... -7.5° ✓)
3. Page 2: Drag slider again (-6°... ✓)
4. Page 3: Drag slider again...
...
30. Page 30: Finally done! (15 minutes elapsed)
```

**Pain Points:**
- Time-consuming (30-60 seconds per page)
- Repetitive (same action 30 times)
- Tedious (requires constant visual adjustment)
- Error-prone (human fatigue after 20+ pages)

### Proposed Flow (AI Auto-Detection)
```
1. Upload tilted PDF (30 pages)
2. Click "Auto-Fix All" button
3. AI analyzes... (30 seconds)
4. All pages corrected ✓ (30 seconds total)
```

**Benefits:**
- 30x faster (15 min → 30 sec)
- Zero effort (1 click vs 100+ slider adjustments)
- Consistent quality (no human fatigue)
- "Wow" factor (impressive to users)

---

## Technical Approach

### Option 1: OCR-Based Detection (Tesseract.js) ⭐ Recommended

**How It Works:**
1. Extract text from document using OCR
2. Analyze text bounding boxes
3. Calculate median angle of text lines
4. Return correction angle (opposite of tilt)

**Pros:**
- ✅ High accuracy (85-90% on standard documents)
- ✅ Multi-language support (English, Korean, Chinese, etc.)
- ✅ Works with text-heavy documents
- ✅ Client-side (privacy preserved)
- ✅ Free and open source

**Cons:**
- ⚠️ Large file size (+3MB to bundle)
- ⚠️ Slower (2-3 seconds per page)
- ⚠️ Doesn't work on text-free documents (images, diagrams)
- ⚠️ CPU-intensive

**Accuracy by Document Type:**
```
Standard text documents: 90-95%
Receipts/invoices: 85-90%
Forms/tables: 80-85%
Mixed content (text + images): 75-85%
Image-only: 0% (no text to detect)
```

**Implementation:**
```bash
npm install tesseract.js
```

```typescript
// services/autoRotateService.ts
import { createWorker } from 'tesseract.js';

export async function detectTiltAngle(imageUrl: string): Promise<number> {
  const worker = await createWorker('eng+kor');

  const { data } = await worker.recognize(imageUrl);

  // Extract angles from word bounding boxes
  const angles: number[] = [];
  data.words.forEach(word => {
    const angle = calculateAngleFromBbox(word.bbox);
    if (Math.abs(angle) < 30) { // Filter outliers
      angles.push(angle);
    }
  });

  // Return median angle (robust to outliers)
  const medianAngle = median(angles);

  await worker.terminate();
  return -medianAngle; // Negative to correct tilt
}

function calculateAngleFromBbox(bbox: any): number {
  const { x0, y0, x1, y1 } = bbox;
  const dx = x1 - x0;
  const dy = y1 - y0;
  return Math.atan2(dy, dx) * (180 / Math.PI);
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}
```

---

### Option 2: Line Detection (OpenCV.js)

**How It Works:**
1. Convert image to grayscale
2. Apply edge detection (Canny)
3. Detect lines using Hough Transform
4. Calculate dominant line angle
5. Return correction angle

**Pros:**
- ✅ Fast (0.5-1 second per page)
- ✅ Works on text-free documents (tables, diagrams)
- ✅ Lower CPU usage than OCR
- ✅ Good for documents with strong lines

**Cons:**
- ⚠️ Lower accuracy (75-85%)
- ⚠️ Fails on documents with few lines
- ⚠️ OpenCV.js learning curve
- ⚠️ Still large file size (+2MB)

**Use Cases:**
- Engineering drawings
- Forms with grid lines
- Tables
- Scanned pages with ruled paper

**Implementation:**
```bash
npm install opencv.js
```

```typescript
import cv from 'opencv.js';

export function detectTiltByLines(imageUrl: string): number {
  const img = cv.imread(imageUrl);
  const gray = new cv.Mat();
  const edges = new cv.Mat();
  const lines = new cv.Mat();

  // Convert to grayscale
  cv.cvtColor(img, gray, cv.COLOR_RGBA2GRAY);

  // Detect edges
  cv.Canny(gray, edges, 50, 150);

  // Detect lines
  cv.HoughLines(edges, lines, 1, Math.PI / 180, 100);

  // Calculate median angle of detected lines
  const angles: number[] = [];
  for (let i = 0; i < lines.rows; i++) {
    const rho = lines.data32F[i * 2];
    const theta = lines.data32F[i * 2 + 1];
    const angle = (theta * 180 / Math.PI) - 90;
    angles.push(angle);
  }

  // Clean up
  img.delete();
  gray.delete();
  edges.delete();
  lines.delete();

  return -median(angles);
}
```

---

### Option 3: Hybrid Approach (Best of Both)

**Strategy:**
1. Try line detection first (fast)
2. If confidence low (<80%), use OCR as fallback
3. If both available, average the results

**Advantages:**
- ✅ Best accuracy (90-95%)
- ✅ Works on most document types
- ✅ Adaptive (chooses best method)

**Disadvantages:**
- ⚠️ Most complex implementation
- ⚠️ Largest bundle size (+5MB)
- ⚠️ Longer processing time when fallback triggered

**Recommended for:** Version 2.0 (after validating OCR-only)

---

### Option 4: Cloud API (Google Vision AI)

**How It Works:**
1. Upload image to Google Cloud
2. Use Document Text Detection API
3. Receive angle in response
4. Apply correction

**Pros:**
- ✅ Highest accuracy (95-98%)
- ✅ Fastest processing (1 second)
- ✅ No client-side computation
- ✅ Easy implementation

**Cons:**
- ❌ **Privacy violation** (server upload required)
- ❌ Cost: $1.50 per 1,000 pages
- ❌ Requires internet connection
- ❌ Complexity (API keys, billing)

**Verdict:** ❌ **Not Recommended** - Destroys core privacy value proposition

---

## Recommended Implementation: Tesseract.js (OCR)

### Phase 1: Basic Implementation (Week 1)

**Goal:** Working prototype with 85% accuracy

**Tasks:**
1. Install Tesseract.js
2. Create `services/autoRotateService.ts`
3. Implement `detectTiltAngle()` function
4. Test on 20 sample documents
5. Measure accuracy and performance

**Deliverable:**
```typescript
// Usage
const angle = await detectTiltAngle(imageDataUrl);
console.log(`Detected tilt: ${angle}°`);
```

**Success Criteria:**
- Accuracy: >85% on test set
- Performance: <3 seconds per page
- No browser crashes

---

### Phase 2: UI Integration (Week 1-2)

**Goal:** User-friendly "Auto-Fix" button

**UI Components:**

**1. Auto-Fix Button**
```tsx
// Add to existing controls
<div className="auto-fix-section">
  <button
    onClick={handleAutoFix}
    disabled={isProcessing}
    className="auto-fix-button"
  >
    🤖 Auto-Fix
    {isProcessing && <Spinner />}
  </button>
  <span className="feature-badge">Pro</span>
</div>
```

**2. Progress Modal**
```tsx
{showProgress && (
  <Modal>
    <h3>Analyzing documents...</h3>
    <ProgressBar value={progress} max={totalPages} />
    <p>Page {currentPage} of {totalPages}</p>
    <p>Estimated time: {estimatedTime}s</p>
    <button onClick={cancelAutoFix}>Cancel</button>
  </Modal>
)}
```

**3. Results Summary**
```tsx
{autoFixComplete && (
  <div className="results-summary">
    <h3>✓ Auto-correction complete!</h3>
    <p>Processed {totalPages} pages</p>
    <p>Average correction: {avgAngle}°</p>
    <div className="actions">
      <button onClick={previewResults}>Preview</button>
      <button onClick={applyCorrections}>Apply All</button>
      <button onClick={revertChanges}>Cancel</button>
    </div>
  </div>
)}
```

**User Flow:**
```
1. User uploads PDF
2. User clicks "Auto-Fix" button
3. Modal appears: "Analyzing page 1/30..."
4. Progress bar fills up (2-3 sec per page)
5. Summary appears: "✓ Corrected 30 pages"
6. User previews results
7. User clicks "Apply All" or adjusts manually
```

---

### Phase 3: Performance Optimization (Week 2)

**Challenge:** Tesseract.js is CPU-intensive and blocks UI

**Solution: Web Workers**

**Implementation:**
```typescript
// services/autoRotate.worker.ts
import { createWorker } from 'tesseract.js';

self.addEventListener('message', async (e) => {
  const { imageUrl, pageNumber } = e.data;

  try {
    const worker = await createWorker('eng');
    const angle = await detectTiltAngle(imageUrl);
    await worker.terminate();

    self.postMessage({
      pageNumber,
      angle,
      success: true
    });
  } catch (error) {
    self.postMessage({
      pageNumber,
      error: error.message,
      success: false
    });
  }
});
```

```typescript
// Usage in main thread
const worker = new Worker(new URL('./autoRotate.worker.ts', import.meta.url));

worker.postMessage({ imageUrl, pageNumber });

worker.onmessage = (e) => {
  const { pageNumber, angle, success } = e.data;
  if (success) {
    setRotations(prev => ({ ...prev, [pageNumber]: angle }));
    setProgress(pageNumber / totalPages * 100);
  }
};
```

**Benefits:**
- ✅ UI stays responsive
- ✅ Can cancel processing
- ✅ Progress updates smooth

---

### Phase 4: Error Handling & Edge Cases

**Edge Case 1: No Text Detected**
```typescript
if (data.words.length === 0) {
  return {
    angle: 0,
    confidence: 0,
    error: 'No text detected. Try manual adjustment.'
  };
}
```

**Edge Case 2: Very Small Tilt (<1°)**
```typescript
if (Math.abs(angle) < 1) {
  return {
    angle: 0,
    confidence: 1,
    message: 'Document already straight!'
  };
}
```

**Edge Case 3: Extreme Rotation (>30°)**
```typescript
if (Math.abs(angle) > 30) {
  return {
    angle: Math.round(angle / 90) * 90, // Snap to 90° increments
    confidence: 0.5,
    message: 'Extreme rotation detected. Please verify.'
  };
}
```

**Edge Case 4: Mixed Orientations**
```typescript
// If standard deviation of angles is high
if (standardDeviation(angles) > 5) {
  return {
    angle: medianAngle,
    confidence: 0.6,
    message: 'Mixed orientations detected. Check individual pages.'
  };
}
```

---

## Feature Gating (Free vs Pro)

### Free Tier Behavior

**Option A: Completely Disabled**
```tsx
<button onClick={showUpgradeModal} disabled={!isPro}>
  🤖 Auto-Fix <span className="pro-badge">Pro</span>
</button>

{showUpgradeModal && (
  <Modal>
    <h3>Upgrade to Pro</h3>
    <p>AI Auto-Detection is a Pro feature.</p>
    <p>Save 30 minutes on every batch with 1-click correction.</p>
    <button onClick={checkout}>Upgrade for $5/mo</button>
  </Modal>
)}
```

**Option B: Limited Trial (3 uses)**
```tsx
const [autoFixCount, setAutoFixCount] = useState(0);
const FREE_LIMIT = 3;

if (!isPro && autoFixCount >= FREE_LIMIT) {
  showUpgradeModal();
} else {
  await runAutoFix();
  setAutoFixCount(prev => prev + 1);
}

// Show remaining uses
<p>Free trial: {FREE_LIMIT - autoFixCount} uses left</p>
```

**Recommendation:** Option B (trial) for better conversion

---

## User Experience Design

### Loading States

**Initial Click:**
```
[Auto-Fix] → [🔄 Starting...] (0.5s)
```

**Processing:**
```
🤖 Analyzing documents...
█████░░░░░░░░░░ 33%
Page 10 of 30
Estimated: 40s remaining
```

**Complete:**
```
✓ Auto-correction complete!

Results:
- Processed 30 pages
- Average correction: -6.8°
- Time saved: ~15 minutes

[Preview] [Apply All] [Cancel]
```

### Confidence Indicators

Show confidence for each page:
```
Page 1: -7.2° ✓ (95% confidence)
Page 2: -6.8° ✓ (92% confidence)
Page 3: -2.1° ⚠ (65% confidence) ← Review needed
```

**Actions:**
- Green checkmark (>80%): Auto-apply
- Yellow warning (50-80%): Ask user to verify
- Red X (<50%): Manual adjustment required

---

## Testing Strategy

### Accuracy Testing

**Test Dataset:**
Create a test set of 100 documents:
- 30 standard text documents (-1° to -15° tilt)
- 20 receipts/invoices (-2° to -10° tilt)
- 20 forms/tables (-3° to -12° tilt)
- 20 mixed content (-5° to -20° tilt)
- 10 edge cases (no text, extreme rotation)

**Ground Truth:**
Manually measure actual tilt angle for each

**Metrics:**
```
Accuracy = |detected_angle - actual_angle| < 2°
Precision = correctly_detected / total_detected
Recall = correctly_detected / total_actual

Target:
- Accuracy: >85%
- Precision: >80%
- Recall: >80%
```

### Performance Testing

**Metrics to Track:**
```
Time per page:
- Target: <3 seconds (average)
- Maximum: <5 seconds (p95)

Memory usage:
- Peak: <500MB (single page)
- Sustained: <1GB (batch of 50)

CPU usage:
- Peak: <80% (one core)
- Sustained: <50% (during batch)
```

**Test Cases:**
- Single page (various sizes)
- Batch of 10 pages
- Batch of 50 pages
- Batch of 100 pages (stress test)

---

## Pricing Justification

### Value Calculation

**For a user processing 20 documents/week:**

**Without AI (Manual):**
- Time per document: 30 seconds
- Weekly time: 20 × 30s = 10 minutes
- Monthly time: 40 minutes
- Annual time: 8 hours

**With AI (Auto):**
- Time per document: 2 seconds (1 click)
- Weekly time: 20 × 2s = 40 seconds
- Monthly time: 3 minutes
- Annual time: 36 minutes

**Time Saved:**
- Monthly: 37 minutes
- Annual: ~8 hours

**ROI Calculation:**
```
Value of time saved:
- At $20/hour: $160/year value
- Pro cost: $60/year
- Net value: $100/year
- ROI: 2.7x
```

**Conclusion:** AI feature easily justifies $5/mo pricing

---

## Marketing Messaging

### Feature Announcement

**Headline:**
"Introducing AI-Powered Auto-Correction"

**Subheadline:**
"30-page PDF? 1 click. 30 seconds. Perfect."

**Body:**
```
We've added AI that automatically detects and corrects
document tilt. What used to take 15 minutes now takes
30 seconds.

How it works:
1. Upload your tilted documents
2. Click "Auto-Fix"
3. Done. All pages perfectly straightened.

No more slider dragging. No more guessing angles.
Just perfect documents, instantly.

Try it free for 7 days →
```

### Before/After Comparison

**Visual:**
```
Before AI:
❌ 15 minutes per batch
❌ 100+ manual adjustments
❌ Tedious and repetitive
❌ Human error after page 20

After AI:
✓ 30 seconds per batch
✓ 1-click correction
✓ Consistent quality
✓ Time for coffee ☕
```

---

## Technical Implementation Checklist

### Development Phase
- [ ] Install Tesseract.js
- [ ] Create `autoRotateService.ts`
- [ ] Implement `detectTiltAngle()` function
- [ ] Add median/outlier filtering
- [ ] Create Web Worker for performance
- [ ] Add progress tracking
- [ ] Implement cancellation
- [ ] Handle errors gracefully

### UI Phase
- [ ] Add "Auto-Fix" button
- [ ] Create progress modal
- [ ] Add results summary
- [ ] Implement confidence indicators
- [ ] Add Pro badge/gate
- [ ] Create upgrade prompt
- [ ] Test loading states
- [ ] Polish animations

### Testing Phase
- [ ] Create test dataset (100 documents)
- [ ] Measure accuracy metrics
- [ ] Performance benchmarks
- [ ] Cross-browser testing
- [ ] Mobile testing
- [ ] Edge case testing
- [ ] User testing (5 people)

### Launch Phase
- [ ] Update README
- [ ] Create demo video (AI feature)
- [ ] Write announcement blog post
- [ ] Update pricing page
- [ ] Email waitlist
- [ ] Social media announcement

---

## Performance Metrics (Post-Launch)

### Usage Metrics
- % of Pro users using AI feature
- Avg files processed with AI per user
- AI success rate (user doesn't manual adjust after)

### Conversion Impact
- Free → Pro conversion (before vs after AI)
- Time to upgrade (before vs after AI)
- Upgrade from limit hit vs feature desire

### Quality Metrics
- User satisfaction with AI results (survey)
- Manual adjustment after AI (%)
- AI feature NPS

**Target:**
- AI adoption: >80% of Pro users
- Success rate: >85% (no manual adjust needed)
- Conversion lift: 3x (0.2% → 0.6%)

---

## Roadmap (Future Enhancements)

### Version 1.1
- [ ] Multi-language support (add more languages)
- [ ] Confidence threshold settings
- [ ] Batch AI for specific page ranges

### Version 1.2
- [ ] Hybrid detection (line + OCR)
- [ ] Learning from manual corrections
- [ ] AI suggests rotation for best readability

### Version 2.0
- [ ] Perspective correction (not just rotation)
- [ ] AI-powered cropping (remove margins)
- [ ] Quality enhancement (denoise, contrast)

---

## FAQ

**Q: Why not use cloud AI (Google/AWS)?**
A: Privacy. Our core value prop is "no upload." Cloud AI requires server upload.

**Q: What if AI gets it wrong?**
A: User can always manual adjust. AI is a convenience, not a requirement.

**Q: Why charge for AI when it's free tech (Tesseract)?**
A: We're charging for the convenience and time saved, not the underlying tech.

**Q: What about non-text documents (images)?**
A: Version 1.0 focuses on text documents. V1.2 will add line detection for images.

**Q: How does this compare to Adobe's auto-rotate?**
A: Adobe uses server AI. Ours is client-side (privacy). Similar accuracy.

---

## Conclusion

AI Auto-Detection is the **killer feature** that:
1. Justifies $5/mo pricing
2. 3x increases conversion rate
3. Differentiates from free alternatives
4. Creates viral "wow" moments
5. Saves users real time (measurable ROI)

**Implementation:** 1-2 weeks
**Expected Impact:** +200% revenue
**Risk:** Low (can always fall back to manual)

**Recommendation:** Implement immediately, launch with "Early Bird" pricing to validate value.

---

**Document Version:** 1.0
**Last Updated:** 2025-01-27
**Next Review:** After implementation (Week 2)