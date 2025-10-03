# Business Strategy - Freemium with Monthly Usage Limits

**Last Updated:** 2025-01-27
**Status:** Finalized
**Target Launch:** Week 13 (May 2025)

---

## 🎯 Core Business Model

### **Freemium with Taste-Test Strategy**

**Philosophy:** "맛만 보고 필요한 사람은 구매하라는 의미" (Let users taste, then buy if needed)

**Key Insight:** Low usage frequency - users typically need angle correction for occasional scanner issues, not daily use.

---

## 📊 Pricing Structure

### **Free Plan** (월 10회 제한)

```
✅ Core Features:
- AI-powered auto angle detection (✨ Auto-Fix)
- Manual rotation adjustment (±15°)
- Single file processing only
- Multi-page PDF support (최대 50 페이지)
- Image processing (JPG, PNG, WebP)
- Export to PDF/Image formats
- 100% client-side processing (privacy-first)

📌 Limitations:
- 10 adjustments per month (월 10회)
- Max 50 pages per action
- Single file only (no batch processing)
- Usage resets on 1st of each month
```

**Action Counting Rules:**
- ✨ AI Auto-Fix button click = 1 action
- 💾 Save/Export button click = 1 action
- Slider adjustments (without save) = 0 actions
- File upload = 0 actions

**50 Page Limit Behavior:**
```typescript
if (pageCount > 50 && !user.isPro) {
  showModal({
    title: "큰 파일이 감지되었습니다",
    message: `이 PDF는 ${pageCount}페이지입니다.`,
    options: [
      { label: "처음 50페이지만 처리", action: () => processPages(50) },
      { label: "Pro 업그레이드 ($5/월)", action: upgradeToPro }
    ]
  });
}
```

---

### **Pro Plan** ($5/month)

```
✅ Everything in Free, plus:
- Unlimited adjustments per month
- Unlimited pages per file
- Batch processing (여러 파일 한 번에 처리)
- Priority email support
- Early access to new features

🎁 Early Bird Pricing (처음 3개월):
- $3/month (40% discount)
- Limited to first 500 subscribers
- Locks in for 3 months
```

**Target Users:**
- Office workers processing daily documents
- Legal professionals (contracts, forms)
- Accountants (receipts, invoices)
- Medical administrators (patient forms)
- Anyone needing >10 adjustments/month

---

## 📈 Revenue Projections

### **Conservative Scenario**

```
Beta Phase (Week 1-12):
├── Target signups: 1,000-2,000 users
├── Beta: Unlimited free access
├── Goal: Build user base + gather feedback
└── Revenue: $0 (beta period)

Launch (Week 13 - May 2025):
├── Free plan activated (10/month limit)
├── Pro plan launched ($5/month, Early Bird $3)
├── Expected conversion: 15-20%
└── Pro users: 150-400

Month 1 Revenue:
├── Early Bird: 150-400 users × $3 = $450-1,200
└── MRR: $450-1,200

Month 6 Revenue:
├── Total users: 3,000-5,000
├── Pro users: 450-1,000 (15% conversion)
├── Regular price: $5/month
└── MRR: $2,250-5,000
```

---

### **Optimistic Scenario**

```
Month 12 Revenue:
├── Total users: 10,000-15,000
├── Pro users: 2,000-3,000 (20% conversion)
└── MRR: $10,000-15,000

Year 2 Revenue:
├── Total users: 50,000+
├── Pro users: 10,000+ (20% conversion)
└── MRR: $50,000+
```

---

## 💡 Strategy Rationale

### **Why 10/month (not 30/day)?**

**User Insight:** "사용 빈도가 높을것같지 않고 보통 스캐너 문제로 삐뚤게 된경우"

1. **Realistic Usage Pattern:**
   - Most users need this for occasional scanner issues
   - Not a daily-use tool
   - 10/month captures typical usage (1-2 files/week)

2. **Conversion Psychology:**
   - Lower limit = higher perceived value of Pro
   - 30/day feels unlimited (no incentive to upgrade)
   - 10/month creates urgency when limit hits

3. **Revenue Optimization:**
   - 15-20% conversion rate (vs 5% with 30/day)
   - Users who need >10/month are power users (willing to pay)
   - Clean split between casual users (free) and professionals (Pro)

---

### **Why No Ads?**

**User Preference:** "광고는 빼는것이 좋을것같습니다. 쾌적한 환경을 위해"

1. **Cleaner UX:**
   - No distractions during critical document work
   - Professional image (not a "free ad-supported tool")
   - Higher trust for privacy-focused product

2. **Higher Conversion:**
   - Studies show 3-5x better conversion without ads
   - Users more willing to pay for ad-free experience
   - Premium positioning (not a "cheap ad tool")

3. **Simpler Implementation:**
   - No ad network integration
   - No cookie consent complexity
   - Faster page load (better SEO)

---

### **Why Action-Based Counting?**

**Granularity:** "한꺼번에 조절도 되고 각각도 조절이 되는데"

1. **Fair to All Users:**
   - Heavy user (100-page PDF) uses same 1 action as light user (1 page)
   - 50-page limit prevents extreme abuse
   - Encourages Pro upgrade for large files

2. **Simple to Understand:**
   - Clear rule: AI Auto-Fix or Save = 1 action
   - No complex page-based math
   - Easy to explain in UI

3. **Prevents Gaming:**
   - Can't split 100-page PDF into 10 files to save actions
   - Batch processing requires Pro (natural upsell)

---

## 🚀 Beta Strategy (3 Months)

### **Timeline**

```
Week 1-4 (Feb 2025):
├── Deploy to Netlify
├── Launch announcement (Reddit, HN)
├── Goal: 200-500 initial users
└── Status: Beta - Unlimited Free

Week 5-8 (Mar 2025):
├── Content marketing (SEO blog posts)
├── Product Hunt launch
├── Goal: 500-1,000 total users
└── Status: Beta - Unlimited Free

Week 9-12 (Apr 2025):
├── User surveys ("Would you pay $5/mo?")
├── Prepare Pro tier features
├── Week 12: Notify users of upcoming limits
└── Goal: 1,000-2,000 total users

Week 13 (May 1, 2025):
├── Official Launch
├── Free plan: 10/month limit activated
├── Pro plan: $5/month (Early Bird $3 for 3 months)
└── Goal: 150-400 Pro conversions (15-20%)
```

---

### **Beta Goals**

**User Acquisition:**
- 1,000-2,000 signups (email waitlist)
- 500-1,000 active users (processed ≥1 file)
- NPS score >40

**Product Validation:**
- AI detection accuracy >85%
- User satisfaction >4.0/5.0
- "Would pay $5/mo?" >30% yes

**Marketing Channels:**
- Reddit: r/productivity, r/selfhosted (500+ upvotes)
- Hacker News Show HN (100+ points)
- SEO: Rank top 10 for "PDF angle correction"

---

### **User Notification Strategy (Week 12)**

**Email/Popup Message:**
```
📢 Important: Free Plan Changes (May 1)

Thank you for using our beta! Starting May 1:

✅ Free Plan: 10 adjustments/month
🚀 Pro Plan: Unlimited for $5/month
🎁 Early Bird: $3/month (first 3 months only)

Lock in Early Bird pricing now:
[Upgrade to Pro →]

Questions? Contact support@pdf-angle-corrector.com
```

---

## 📊 Success Metrics

### **Month 1 (May 2025) Goals:**
```
Free → Pro conversion: 15-20%
Pro subscribers: 150-400
MRR: $450-1,200 (Early Bird pricing)
Churn rate: <10%
NPS: >40
```

### **Month 6 Goals:**
```
Total users: 3,000-5,000
Pro subscribers: 450-1,000
MRR: $2,250-5,000
Churn rate: <8%
LTV: $54 (12 months @ 7% churn)
```

### **Year 1 Goals:**
```
Total users: 10,000-15,000
Pro subscribers: 2,000-3,000
MRR: $10,000-15,000
CAC: <$10 (via SEO, organic)
LTV/CAC ratio: >5:1
```

---

## 🛡️ Risk Mitigation

### **Risk 1: Low Conversion (<10%)**

**Mitigation:**
- A/B test pricing ($3, $5, $7)
- Add more Pro features (compression, watermark removal)
- Offer free trial (7 days Pro access)
- Reduce free limit to 5/month (if needed)

---

### **Risk 2: High Churn (>15%)**

**Mitigation:**
- Email drip campaign (tips, use cases)
- Customer success outreach (personal emails)
- Annual plan discount (2 months free = $50/year)
- Feature requests from churned users

---

### **Risk 3: Code Copying (Private Repo Breach)**

**Mitigation:**
- AGPL license (if open sourced later)
- Obfuscation for production build
- Server-side features (future: OCR, compression)
- Brand recognition (first-mover advantage)
- Community building (GitHub, Discord)

---

### **Risk 4: SEO Failure (No Organic Traffic)**

**Mitigation:**
- Paid ads budget ($50-100/month)
- Reddit/HN marketing (proven channels)
- Affiliate program (10% commission)
- YouTube tutorials (evergreen content)

---

## 💰 Cost Structure

### **Monthly Costs (Year 1)**

```
Infrastructure:
├── Netlify (Hosting): $0 (Free tier, 100GB bandwidth)
├── Firebase Auth: $0 (up to 10,000 MAU)
├── Firebase Firestore: $0-5 (user data storage)
├── Domain: $1/month ($12/year)
└── CDN (OpenCV, PDF.js): $0 (free CDNs)

Payment Processing:
├── Stripe: 2.9% + $0.30 per transaction
└── Example: 400 users × $3 = $1,200
    └── Stripe fees: $35 + $120 = $155
    └── Net: $1,045

Support:
├── Email: $0 (Gmail/Outlook)
└── Support tool: $0 (initially manual)

Marketing (Optional):
├── Google Ads: $50-100/month (if SEO fails)
└── Affiliate commissions: 10% of revenue

Total Monthly Costs: $1-6 (before Stripe fees, no ads)
```

**Break-Even:**
- Fixed costs: ~$5/month
- Stripe fee: ~9% of revenue
- Break-even: 2-3 Pro users ($6-9 MRR)
- Profitability: >10 Pro users (>90% margin)

---

## 📝 Next Steps

### **Immediate (This Week):**
1. ✅ Finalize strategy (this document)
2. ⏳ Create implementation guide (IMPLEMENTATION.md)
3. ⏳ Plan SEO strategy (SEO_GUIDE.md)
4. ⏳ Update project roadmap (CLAUDE.md)

### **Week 2-4:**
1. Deploy to Netlify (private repo)
2. Set up Google Analytics
3. Create landing page (SEO-optimized)
4. Launch beta (Reddit, HN)

### **Week 5-12:**
1. Content marketing (2-3 blog posts)
2. User interviews (5-10 people)
3. Survey: "Would pay $5/mo?"
4. Prepare Pro tier (Firebase + Stripe)

### **Week 13:**
1. Launch Free plan (10/month limit)
2. Launch Pro plan ($5/month, Early Bird $3)
3. Monitor conversion rate
4. Celebrate first Pro subscriber! 🎉

---

**Document Version:** 1.0
**Last Review:** 2025-01-27
**Next Review:** After beta launch (Week 5)
