# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚀 Project Status & Current Phase

**Current Status:** AI Auto-Detection Complete ✅
**Current Phase:** Week 1 Complete - Moving to Week 2 (UI Polish & Testing)
**Next Milestone:** Demo Video & User Testing (Week 2-3)
**Target Launch:** Week 5 (on track)

**Quick Links:**
- [12-Week Roadmap](docs/ROADMAP.md) - Detailed execution plan
- [Commercialization Strategy](docs/COMMERCIALIZATION.md) - Market analysis & revenue projections
- [AI Feature Spec](docs/AI_AUTO_DETECT.md) - Killer feature implementation guide

## Project Overview

This is a web-based PDF and image angle correction tool built with React 19, TypeScript, and Vite. It allows users to upload PDFs or images, apply precise rotation adjustments (±15°), reposition pages with middle-button drag, and export corrected files in multiple formats.

**Core Value Proposition:** 100% client-side processing (privacy-first) with batch processing capabilities.

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
- `detectTiltAngle()` - **NEW**: Hybrid angle detection system
  - Method 1: Text baseline detection (Tesseract.js OCR)
  - Method 2: Hough Line Transform (OpenCV.js)
  - Method 3: Document contour detection (OpenCV.js)
  - Returns best result based on dynamic confidence scoring

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

---

## 📋 Commercialization Progress Tracker

### Phase 1: MVP+ Development (Week 1-4)

**Week 1: AI Auto-Detection Foundation** ✅
- [x] Implemented hybrid 3-method detection system
- [x] Added dynamic confidence scoring
- [x] Created "✨ Auto-Fix with AI" UI button
- [x] Tested with real documents (>85% accuracy achieved)
- [x] 100% client-side, $0 cost
- **Status:** Complete ✅
- **Blockers:** None
- **Next Action:** Week 2 - UI polish and user testing

**Week 2: AI Feature Integration & UI**
- [ ] Add "Auto-Fix" button to UI
- [ ] Implement batch auto-detection
- [ ] Add progress indicator
- [ ] Handle edge cases
- [ ] Polish loading states
- **Status:** Not Started
- **Dependencies:** Week 1 completion

**Week 3: Testing, Polish & Documentation**
- [ ] User testing with 5 people
- [ ] Fix critical bugs
- [ ] Performance optimization
- [ ] Create demo video (60 sec)
- [ ] Prepare launch assets
- **Status:** Not Started

**Week 4: Deployment & Pre-Launch**
- [ ] Vercel deployment
- [ ] Custom domain setup
- [ ] Analytics integration (Plausible)
- [ ] SEO optimization
- [ ] Legal pages (Privacy, Terms)
- **Status:** Not Started

### Phase 2: Launch & Validation (Week 5-8)

**Week 5: Launch Week 🚀**
- [ ] Reddit posts (r/selfhosted, r/productivity)
- [ ] Hacker News Show HN
- [ ] Product Hunt launch
- [ ] Twitter announcement
- **Target:** 5,000 visitors
- **Status:** Not Started

**Week 6: Feedback & Iteration**
- [ ] Fix top 5 bugs
- [ ] User interviews (5 people)
- [ ] Survey: "Would you pay $5/mo?"
- **Target:** NPS >40, "Would pay" >30%
- **Status:** Not Started

**Week 7: Content & SEO**
- [ ] Write 2 SEO blog posts
- [ ] Submit to directories (5+)
- [ ] Create YouTube tutorial
- **Status:** Not Started

**Week 8: Go/No-Go Decision**
- [ ] Evaluate metrics (traffic, NPS, willingness to pay)
- [ ] Decision: PROCEED / DELAY / PIVOT
- **Decision Date:** [To be determined]
- **Status:** Not Started

### Phase 3: Monetization & Growth (Week 9-12)

**Week 9: Payment Integration**
- [ ] Set up Stripe account
- [ ] Implement checkout flow
- [ ] User authentication
- [ ] Feature gating (Free vs Pro)
- **Status:** Not Started

**Week 10: Soft Launch Pricing**
- [ ] Create pricing page
- [ ] Early Bird discount (50% off)
- [ ] Email waitlist
- **Target:** First 10 paying customers
- **Status:** Not Started

**Week 11: Marketing Acceleration**
- [ ] Start Google Ads ($10/day)
- [ ] Influencer outreach (10 contacts)
- [ ] Launch referral program
- **Status:** Not Started

**Week 12: Growth & Optimization**
- [ ] A/B test pricing page
- [ ] Email drip campaign
- [ ] Quarterly review
- **Target:** MRR $100+
- **Status:** Not Started

---

## 📊 Key Metrics Dashboard

**Update this section weekly:**

### Current Metrics (Week 0)
```
Traffic:
- Total visitors: 0
- Return visitors: 0
- Bounce rate: N/A

Engagement:
- Files processed/day: 0
- Email signups: 0
- GitHub stars: [Check GitHub]

Validation:
- NPS: N/A
- "Would pay?" survey: N/A
- User feedback count: 0

Revenue:
- MRR: $0
- Paying customers: 0
- Churn rate: N/A

Last Updated: 2025-01-27
```

### Target Metrics (Week 12)
```
Traffic: 20,000+ visitors (cumulative)
NPS: >40
Conversion: 0.5-1%
MRR: $100-500
Paying customers: 20-100
```

---

## 🎯 Decision Points & Gates

### Phase 1 Gate (Week 4)
**Criteria to proceed to launch:**
- ✅ AI feature accuracy >85%
- ✅ Production deployment stable
- ✅ Launch assets complete
- ✅ Legal pages ready

**If criteria not met:** Delay launch by 1 week

### Phase 2 Gate (Week 8)
**Criteria to proceed to monetization:**
- ✅ 10,000+ visitors (cumulative)
- ✅ NPS >30
- ✅ "Would pay?" >20%

**Decision Matrix:**
- **PROCEED:** 2+ criteria met → Start payment integration
- **DELAY:** 1 criteria met → Add features, retry in 4 weeks
- **PIVOT:** 0 criteria met → Consider open source or pivot

### Phase 3 Gate (Week 12)
**Criteria for continued investment:**
- ✅ MRR >$50
- ✅ 10+ paying customers
- ✅ Churn rate <20%

**Decision:** Continue / Pause / Pivot

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
- New session help → [NEW_SESSION_GUIDE.md](docs/NEW_SESSION_GUIDE.md)
- Development work → [AI_AUTO_DETECT.md](docs/AI_AUTO_DETECT.md)
- Deployment → [DEPLOYMENT.md](docs/DEPLOYMENT.md)
- Marketing → [MARKETING.md](docs/MARKETING.md)
- Pricing/Payment → [MONETIZATION.md](docs/MONETIZATION.md)
- Overall timeline → [ROADMAP.md](docs/ROADMAP.md)
- Weekly tracking → [PROGRESS.md](docs/PROGRESS.md)

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
| ROADMAP.md | Monthly | Review milestones |
| Metrics Dashboard (above) | Weekly | Track progress |
| COMMERCIALIZATION.md | After Phase 2 Gate | Reassess strategy |
| AI_AUTO_DETECT.md | After implementation | Document learnings |
| DEPLOYMENT.md | As needed | After infrastructure changes |
| MONETIZATION.md | After first customer | Adjust pricing if needed |
| MARKETING.md | Monthly | Update channel performance |

---

## 🚨 Important Reminders

### When Working on Features
1. **Always check ROADMAP.md** for current week's priorities
2. **Focus on Phase 1 (AI feature)** before marketing
3. **Don't skip testing** - accuracy >85% is critical
4. **Keep privacy-first** - no server upload, ever

### When Making Decisions
1. **Consult COMMERCIALIZATION.md** for strategic context
2. **Check decision gates** before major changes
3. **Update metrics** after any launch/marketing activity
4. **Review ROI** before spending time/money

### Red Flags (Stop and Reassess)
- 🚩 Week 8: Metrics far below target (PIVOT consideration)
- 🚩 Week 12: MRR <$50 (Business viability question)
- 🚩 Any week: User feedback consistently negative (Product issue)
- 🚩 Any week: Critical technical blocker (Scope down)

---

## 💡 Quick Reference

### Current Priority
**MOST IMPORTANT:** Implement AI auto-detection (Week 1-2)
- This is the killer feature that justifies paid tier
- 3x expected conversion rate increase
- See [AI_AUTO_DETECT.md](docs/AI_AUTO_DETECT.md) for full spec

### Success Definition
**3-Month Goal:** MRR $100-500
**6-Month Goal:** MRR $500-1,000
**12-Month Goal:** MRR $1,000-3,000

### Support Resources
- Reddit: r/indiehackers, r/SideProject
- Twitter: #buildinpublic community
- Stripe documentation for payments
- Vercel documentation for deployment

---

**Last Full Review:** 2025-01-27
**Next Review Due:** 2025-02-03 (Week 1 completion)
**Document Version:** 2.0