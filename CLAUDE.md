# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚀 Project Status & Current Phase

**Current Status:** ✅ Week 2 Complete - Performance Optimization 100점 달성!
**Current Phase:** Week 3 - Content Creation & Marketing Preparation
**Next Milestone:** Demo video + Reddit launch post → Week 5 Beta Launch
**Target Launch:** Week 13 (May 2025) - Free Plan (10/month) + Pro ($5/month)

**🏆 WEEK 2 성과:**
- ✅ **Lighthouse 100점 달성** (Performance: 34→100, +66점!)
- ✅ **Tailwind PostCSS 전환** (3.4MB→14.8KB, 99% 감소)
- ✅ **Lazy Loading 구현** (OpenCV.js, PDF.js, pdf-lib)
- ✅ **성능 지표 개선:**
  - FCP: 7.1s → 1.3s (81% 개선)
  - LCP: 8.1s → 1.3s (84% 개선)
  - TBT: 1,290ms → 60ms (95% 개선)
- ✅ **AI Auto-Fix 콘솔 버그 수정** (timeout 보호 추가)

**📊 Business Model (Finalized):**
- **Free Plan:** 10 adjustments/month, max 50 pages/file, single file only
- **Pro Plan:** $5/month unlimited (Early Bird: $3/month for 3 months)
- **Beta Period:** 12 weeks (Feb-Apr 2025) - Unlimited free access
- **Launch Date:** May 1, 2025 - Activate usage limits
- **Private Repository:** Source code NOT open source (prevent copying)
- **SEO-First Strategy:** Web search > GitHub stars

**Quick Links:**
- [Business Strategy](docs/STRATEGY.md) - Freemium model with 10/month limit
- [Beta Plan](docs/BETA_PLAN.md) - 3-month roadmap (Week 1-13)
- [Implementation Guide](docs/IMPLEMENTATION.md) - Technical specs for usage tracking
- [SEO Strategy](docs/SEO_GUIDE.md) - Marketing & web search optimization
- [AI Feature Spec](docs/AI_AUTO_DETECT.md) - Killer feature implementation

## Project Overview

This is a web-based PDF and image angle correction tool built with React 19, TypeScript, and Vite. It allows users to upload PDFs or images, apply precise rotation adjustments (±15°), reposition pages with middle-button drag, and export corrected files in multiple formats.

**Core Value Proposition:** 100% client-side processing (privacy-first) with batch processing capabilities.

## Commands

**Development:**
- `npm install` - Install dependencies
- `npm run dev` - Start Vite dev server (runs on http://localhost:3000)
- `npm run build` - Build for production (output to dist/)
- `npm run preview` - Preview production build

**Testing:**
- No automated tests yet (Week 3 deliverable)
- Manual testing workflow: Test with sample PDFs in project root

## Architecture

### Project Structure

**Root-level organization** (no src/ directory):
- `App.tsx` - Main application component with state management
- `index.tsx` - React entry point
- `types.ts` - TypeScript type definitions and global declarations
- `services/` - Business logic layer
  - `pdfService.ts` - PDF manipulation using pdf-lib
  - `imageService.ts` - Image processing and AI angle detection
  - `geminiService.ts` - (Unused, deprecated AI service)
- `components/` - Reusable UI components
  - `Icons.tsx` - SVG icon components

**Path Alias:** `@/*` resolves to project root (configured in vite.config.ts and tsconfig.json)

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
- `detectTiltAngle()` - **NEW (Week 1)**: AI angle detection system
  - **Primary Method:** Hough Line Transform (OpenCV.js) - detects straight lines
  - **Fallback Method:** Text baseline detection (Tesseract.js OCR)
  - **Key Features:**
    - Clustering algorithm for majority voting (groups angles within 1°)
    - Border filtering (excludes 5% margin to ignore scan borders)
    - Length filtering (ignores lines < 10% of image width)
    - Confidence-based method selection (≥0.7 threshold)
  - **Algorithm:** Lines first → Text fallback → Return 0° if both fail
  - **Status:** Works well for most documents, needs canvas bug fix

### External Dependencies (CDN)

**PDF Processing:**
- `pdf.js` 3.11.174 - PDF rendering to canvas for preview
- `pdf-lib` 1.17.1 - PDF manipulation and creation

**AI/Computer Vision:**
- `OpenCV.js` 4.8.0 - Line detection, contour detection (CDN)
- `Tesseract.js` - OCR text detection (npm package)

**UI:**
- TailwindCSS via CDN
- React 19 via AI Studio CDN import maps

All loaded via CDN or npm, typed via types.ts `declare global`

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

**AI Auto-Detection (Week 1 Implementation - COMPLETE):**
- "✨ Auto-Fix with AI" button for single page/file analysis
- "Auto-Fix All X Files with AI" button for batch processing
- Detection strategy: Lines → Text → Fail gracefully (return 0°)
- Works on both single images and multi-page PDFs
- Precision: ±0.1-1° (0.5mm offset on A4 paper)
- Detection quality: >85% accuracy on structured documents

### Common Development Issues

**Canvas Reuse Error (FIXED - Week 1):**
- **Previous Symptom:** `Error: Cannot use the same canvas during multiple render() operations`
- **Root Cause:** Multiple PdfPagePreview components calling page.render() simultaneously
- **Solution:** Global render queue with promise chaining (`pdfRenderQueue = Promise.resolve()`)
- **Additional Fixes:**
  - Staggered rendering: 50ms delay per page to prevent browser freeze
  - Loading states: Visual feedback during rendering
  - Unique React keys: `key={file-${fileIndex}-page-${pageNum}}` prevents canvas reuse
  - Immediate canvas clear: Prevents flickering on file transitions
- **Status:** ✅ RESOLVED - All canvas conflicts eliminated

**OpenCV.js Loading:**
- OpenCV.js loads asynchronously from CDN
- Use `waitForOpenCV()` helper before calling cv functions
- Type safety: `cv` declared as `any` in types.ts (no official TypeScript types available)

**Tesseract.js Worker Management:**
- Workers must be properly terminated to avoid memory leaks
- Always use try-finally blocks with `worker.terminate()`
- Language loading can take 2-3 seconds on first use

**File System Access API:**
- Only works in Chrome/Edge (not Firefox/Safari)
- Falls back to traditional download for unsupported browsers
- Requires user gesture (button click) to trigger

---

## 📋 Commercialization Progress Tracker

### Phase 1: MVP+ Development (Week 1-4)

**Week 1: AI Auto-Detection Foundation** ✅ 100% Complete
- [x] Installed Tesseract.js + OpenCV.js
- [x] Implemented line detection (Hough Transform - PRIMARY)
- [x] Implemented text baseline detection (OCR - FALLBACK)
- [x] Added angle clustering algorithm (majority voting)
- [x] Added border/length filtering for noisy documents
- [x] Created "✨ Auto-Fix with AI" UI button
- [x] Dynamic confidence scoring (≥0.7 threshold)
- [x] Multi-page PDF support
- [x] Batch processing with "Auto-Fix All Files" button
- [x] **FIXED:** Canvas reuse error with global render queue
- [x] **FIXED:** UI flickering with loading states and unique keys
- [x] **FIXED:** Browser performance with staggered rendering
- **Status:** ✅ COMPLETE - All features working
- **Completed:** 2025-01-27

**Technical Achievements:**
- ✅ Algorithm simplified to production-ready (lines → text fallback)
- ✅ Clustering prevents noise from affecting results
- ✅ 100% client-side processing ($0 cost, privacy-first)
- ✅ Works well for most documents (>85% accuracy on clean documents)
- ✅ Global render queue eliminates all canvas conflicts
- ✅ Precision: ±0.1-1° (0.5mm offset on A4 paper - excellent for production)

**Week 2: SEO & Deployment Preparation** 🔄 In Progress
- [x] ~~Fix canvas reuse error~~ (Completed in Week 1)
- [x] Finalize business strategy (10/month limit model)
- [x] Create STRATEGY.md (business model documentation)
- [x] Create BETA_PLAN.md (3-month beta timeline)
- [x] Create IMPLEMENTATION.md (technical implementation guide)
- [x] Create SEO_GUIDE.md (marketing & SEO strategy)
- [ ] Deploy to Netlify (private repo support)
- [ ] Set up Google Analytics 4
- [ ] Create SEO-optimized landing page
- [ ] Set up custom domain (pdf-angle-corrector.com)
- [ ] Write meta tags and structured data
- **Status:** Strategy complete, deployment next
- **Next Action:** Netlify deployment + SEO optimization

**Week 3-4: Beta Launch Preparation**
- [ ] Create Reddit launch posts (3-5 subreddits)
- [ ] Write Hacker News Show HN post
- [ ] Create demo GIF/video (30 sec)
- [ ] Set up email signup form (Netlify Forms)
- [ ] Create privacy policy page
- [ ] Test with diverse documents (10+ samples)
- [ ] Performance benchmarking
- **Status:** Not Started

### Phase 2: Beta Testing (Week 5-12)

**Week 5-8: Beta Growth & Content Marketing**
- [ ] Launch beta (Reddit, Hacker News, Product Hunt)
- [ ] Write 2-3 SEO blog posts (1,500+ words each)
- [ ] Create YouTube tutorial (2-3 min)
- [ ] Submit to 10+ directories
- [ ] User surveys and feedback collection
- [ ] Target: 500-1,000 beta users
- **Status:** Not Started

**Week 9-12: Revenue Validation & Pro Tier Prep**
- [ ] "Would pay $5/mo?" survey
- [ ] Set up Firebase Authentication
- [ ] Implement Stripe Checkout (test mode)
- [ ] Create usage tracking system (localStorage)
- [ ] Build upgrade modal and Pro tier UI
- [ ] Notify users of upcoming limits (Week 12)
- [ ] Target: 1,000-2,000 beta users
- **Status:** Not Started

### Phase 3: Official Launch (Week 13+)

**Week 13: Launch Day (May 1, 2025) 🚀**
- [ ] Activate Free plan (10/month limit)
- [ ] Launch Pro plan ($5/month, Early Bird $3)
- [ ] Send launch email to all beta users
- [ ] Monitor Free → Pro conversion (target: 15-20%)
- [ ] Target: 150-400 Pro subscribers ($450-1,200 MRR)
- **Status:** Not Started

**Month 2-6: Growth & Optimization**
- [ ] Content marketing (2-3 blog posts/month)
- [ ] Paid ads (Google, Reddit - $50-100/month)
- [ ] A/B test pricing page
- [ ] Email drip campaign
- [ ] Target: $2,250-5,000 MRR by Month 6
- **Status:** Not Started


---

## 📊 Key Metrics Dashboard

**Update this section weekly:**

### Current Metrics (Week 1)
```
Business Strategy:
- Model: Freemium (10/month free, $5/month Pro)
- Beta Period: 12 weeks (Feb-Apr 2025)
- Launch Date: May 1, 2025
- Early Bird: $3/month (first 500 users)

Development:
- AI Feature: ✅ Complete
- Canvas Bug: ✅ Fixed
- Deployment: ⏳ Netlify setup pending
- SEO: ⏳ Optimization pending

Traffic:
- Total visitors: 0 (pre-launch)
- Beta signups: 0
- Target: 1,000-2,000 beta users

Revenue (Projected):
- Month 1 MRR: $450-1,200 (Early Bird)
- Month 6 MRR: $2,250-5,000
- Year 1 MRR: $10,000-15,000
- Conversion target: 15-20%

Last Updated: 2025-01-27
```

### Target Metrics (Week 13 - Launch)
```
Beta Results (Week 12):
- Beta users: 1,000-2,000
- "Would pay $5/mo?": >30% yes
- NPS: >40
- AI accuracy: >85%

Launch Day (May 1):
- Free → Pro conversion: 15-20%
- Pro subscribers: 150-400
- MRR: $450-1,200
- Churn: <5%
```

---

## 🎯 Decision Points & Gates

### Beta Gate (Week 12)
**Criteria to proceed to launch:**
- ✅ 1,000+ beta users
- ✅ NPS >40
- ✅ "Would pay $5/mo?" >30%
- ✅ AI accuracy >85%

**Decision Matrix:**
- **PROCEED:** 3+ criteria met → Launch Free plan + Pro tier (Week 13)
- **DELAY:** 2 criteria met → Extend beta 1 month, improve features
- **PIVOT:** <2 criteria met → Reconsider pricing or business model

### Launch Success Gate (Month 1)
**Criteria for continued investment:**
- ✅ Free → Pro conversion >10%
- ✅ MRR >$300
- ✅ Churn <10%

**Decision:** Scale Up / Maintain / Optimize

### Growth Gate (Month 6)
**Criteria for scaling up marketing:**
- ✅ MRR >$2,000
- ✅ 500+ Pro users
- ✅ Churn <8%
- ✅ LTV/CAC >5:1

**Decision:** Increase ad budget / Hire help / Stay bootstrapped

---

## 📖 Documentation Guide

### For New Sessions
When starting a new Claude Code session, always:

1. **Run `/init`** to load this file automatically
2. **Check Current Phase** (top of this file)
3. **Review Weekly Tasks** (Progress Tracker section)
4. **Update Metrics** (if week has passed)
5. **Consult [NEW_SESSION_GUIDE.md](docs/NEW_SESSION_GUIDE.md)** for prompts and workflows

**Quick Start Commands:**
```
/init
현재 진행 상황 확인하고 이번 주 할 일 알려줘
```

**Relevant Documents:**
- **Business Strategy** → [STRATEGY.md](docs/STRATEGY.md) - Core monetization model
- **Beta Plan** → [BETA_PLAN.md](docs/BETA_PLAN.md) - 3-month beta roadmap (Week 1-13)
- **Technical Implementation** → [IMPLEMENTATION.md](docs/IMPLEMENTATION.md) - Usage tracking & Pro tier
- **Marketing & SEO** → [SEO_GUIDE.md](docs/SEO_GUIDE.md) - Web search optimization
- **AI Feature** → [AI_AUTO_DETECT.md](docs/AI_AUTO_DETECT.md) - Angle detection implementation
- **Original Roadmap** → [ROADMAP.md](docs/ROADMAP.md) - ⚠️ OUTDATED (replaced by new strategy)

### Weekly Review Process

**Every Monday, update:**
1. Mark completed tasks with ✅
2. Update "Current Phase" and "Next Milestone"
3. Update metrics dashboard
4. Identify blockers
5. Set goals for current week

**Template for weekly update:**
```markdown
## Week X Update (YYYY-MM-DD)

Completed:
- Task 1
- Task 2

In Progress:
- Task 3 (50% done)

Blockers:
- Issue 1 (need X to resolve)

Metrics:
- Visitors: X
- Signups: X
- Revenue: $X

Next Week Goals:
- Goal 1
- Goal 2
```

### Document Update Schedule

| Document | Update Frequency | Owner |
|----------|------------------|-------|
| CLAUDE.md (this file) | Weekly | Always update |
| STRATEGY.md | After beta (Week 12) | Reassess conversion rates |
| BETA_PLAN.md | Weekly | Track weekly progress |
| IMPLEMENTATION.md | As needed | After technical changes |
| SEO_GUIDE.md | Monthly | Update keyword rankings |
| Metrics Dashboard (above) | Weekly | Track progress |
| AI_AUTO_DETECT.md | After improvements | Document learnings |

---

## 🚨 Important Reminders

### When Working on Features
1. **Always check BETA_PLAN.md** for current week's priorities
2. **Focus on SEO & deployment (Week 2-4)** before beta launch
3. **Private repository** - source code NOT open source
4. **Keep privacy-first** - no server upload, ever

### When Making Decisions
1. **Consult STRATEGY.md** for business model details
2. **Check decision gates** before major changes
3. **Update metrics** after any launch/marketing activity
4. **Review ROI** before spending time/money

### Red Flags (Stop and Reassess)
- 🚩 Week 12: Beta users <500 (DELAY consideration)
- 🚩 Week 12: "Would pay?" <20% (Pricing issue)
- 🚩 Month 1: Conversion <10% (Product-market fit issue)
- 🚩 Month 1: Churn >15% (Retention problem)
- 🚩 Any week: User feedback consistently negative (Product issue)

---

## 💡 Quick Reference

### Current Priority (Week 2)
**MOST IMPORTANT:** Netlify deployment + SEO optimization
- Deploy to production (private repo)
- Set up Google Analytics 4
- Optimize landing page for SEO
- See [SEO_GUIDE.md](docs/SEO_GUIDE.md) for full strategy

### Success Definition
**Beta Goal (Week 12):** 1,000-2,000 users, 30%+ would pay $5/mo
**Launch Goal (Month 1):** 15-20% Free → Pro conversion, $450-1,200 MRR
**Month 6 Goal:** $2,250-5,000 MRR, 450-1,000 Pro users
**Year 1 Goal:** $10,000-15,000 MRR, 2,000-3,000 Pro users

### Key Documents
1. **STRATEGY.md** - Business model (10/month free, $5/mo Pro)
2. **BETA_PLAN.md** - Week-by-week roadmap (Week 1-13)
3. **IMPLEMENTATION.md** - Technical implementation guide
4. **SEO_GUIDE.md** - Marketing & web search strategy

### Support Resources
- Netlify: Private repo deployment, forms
- Firebase: Authentication, Firestore
- Stripe: Subscription payments
- Google Analytics: Traffic tracking
- Reddit: r/productivity, r/selfhosted

---

**Last Full Review:** 2025-01-27
**Next Review Due:** 2025-02-03 (Week 2 progress check)
**Document Version:** 3.0 (NEW STRATEGY)