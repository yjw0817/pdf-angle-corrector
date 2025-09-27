# Monetization Strategy

## Pricing Philosophy

**Core Principle: "Generous Freemium"**

Give enough value for free to drive viral growth, charge for convenience and professional features.

**Key Rules:**
1. ✅ Free tier must be genuinely useful (not crippled)
2. ✅ Never hold user data hostage
3. ✅ Clear value proposition for paid tiers
4. ✅ Transparent pricing (no hidden fees)
5. ✅ Annual discount (20-30% off)

---

## Pricing Tiers

### Free (Forever)

**Target:** Individual users, students, occasional use

**Features:**
- ✅ Unlimited file processing
- ✅ All manual rotation/flip features
- ✅ Position adjustment (offset)
- ✅ Guidelines display
- ✅ Individual file save
- ✅ All export formats (PDF, JPG, PNG, WebP)
- ✅ No watermarks
- ✅ No time limits

**Limitations:**
- ⚠️ Daily limit: 20 files/day (generous but prevents abuse)
- ⚠️ Simultaneous processing: 5 files max
- ⚠️ File size: 50MB per file
- ❌ No AI auto-detection
- ❌ No batch naming templates
- ❌ No rotation presets
- ❌ Community support only

**Conversion Goal:** 0.5-1% of free users upgrade to Pro

---

### Pro - $5/month or $40/year (save 33%)

**Target:** Professionals, frequent users, small businesses

**Value Proposition:**
"Save 10+ hours/month with AI automation. Worth it if you process >20 documents/week."

**Includes Everything in Free, Plus:**
- ✨ **AI Auto-Detection** (killer feature)
  - Automatic tilt detection and correction
  - Batch process 100 files with 1 click
  - 90% accuracy on standard documents

- ✨ **Unlimited Processing**
  - No daily file limits
  - Simultaneous: 50 files
  - File size: 500MB per file

- ✨ **Productivity Features**
  - Batch naming templates (`[filename]_corrected_[date].pdf`)
  - Save rotation presets (e.g., "Scanner -3.5°")
  - Keyboard shortcuts
  - Dark mode

- ✨ **Priority Support**
  - 24-hour email response (vs 7 days for free)
  - Direct feature requests
  - Bug fix priority

- ✨ **Advanced Stats**
  - Files processed counter
  - Time saved tracker
  - Usage analytics

**Annual Savings:** $20/year (2 months free)

**Target Conversion:** 20-50 subscribers in first 3 months

---

### Business - $15/month or $150/year (save 17%)

**Target:** Small teams, agencies, businesses

**Value Proposition:**
"Professional document processing for teams. Includes API access and team management."

**Includes Everything in Pro, Plus:**
- 🏢 **Team Features**
  - 5 team seats included
  - Additional seats: $3/month each
  - Centralized billing
  - Usage dashboard per user

- 🏢 **API Access** (coming soon)
  - REST API for automation
  - 10,000 API calls/month
  - Webhooks support
  - API documentation

- 🏢 **Advanced Features**
  - Watermark/logo overlay
  - Custom branding (white-label option)
  - Batch export with folder structure
  - OCR integration (when added)

- 🏢 **Business Support**
  - 12-hour email response
  - Phone support (callback)
  - Onboarding session (30 min)
  - Quarterly business review

- 🏢 **Compliance**
  - Invoicing (VAT included if EU)
  - Purchase order support
  - Data processing agreement (DPA)

**Target Conversion:** 5-10 business customers in first 6 months

---

### Enterprise - Custom Pricing

**Target:** Large organizations, regulated industries, high-volume users

**Starting at $500/month**

**Value Proposition:**
"Self-hosted, secure, scalable. For organizations with strict compliance requirements."

**Includes Everything in Business, Plus:**
- 💼 **Self-Hosted Deployment**
  - Docker container
  - On-premises installation
  - Full source code access (license key)
  - White-label (remove all branding)

- 💼 **SLA Guarantee**
  - 99.9% uptime SLA
  - <24h critical bug fix
  - Dedicated support engineer

- 💼 **Enterprise Features**
  - SSO (SAML, OAuth)
  - LDAP/Active Directory integration
  - Audit logs
  - Role-based access control (RBAC)
  - Custom integrations

- 💼 **Support & Services**
  - Dedicated account manager
  - Custom development
  - Training sessions for teams
  - Implementation consulting

**Sales Process:** Direct sales, 3-6 month cycle

---

## Add-On Pricing (Optional Revenue Streams)

### One-Time Purchases

**Lifetime Pro License:** $99
- Pay once, use forever
- All Pro features
- No monthly/annual fees
- Limited to first 100 customers (scarcity)

**Credit Packs (for Free users):**
- 100 files: $2 (extra processing beyond daily limit)
- 500 files: $8
- 1000 files: $12
- Valid for 1 year

### Future Add-Ons

**OCR Module:** +$5/month
- Convert scanned PDFs to searchable
- 1,000 pages/month included
- Additional $0.01/page

**Cloud Storage Integration:** +$3/month
- Auto-sync with Dropbox, Google Drive
- Automatic backup of corrected files

---

## Payment Processing

### Primary: Stripe

**Why Stripe:**
- ✅ Industry standard (trusted)
- ✅ Easy integration (Stripe Checkout)
- ✅ Handles subscriptions
- ✅ Global payment methods
- ✅ Automatic invoicing

**Fees:** 2.9% + $0.30 per transaction

**Setup:**
```typescript
// Install
npm install @stripe/stripe-js stripe

// Create checkout session
const checkout = await stripe.checkout.sessions.create({
  mode: 'subscription',
  payment_method_types: ['card'],
  line_items: [{
    price: 'price_xxxxx', // Pro monthly
    quantity: 1
  }],
  success_url: 'https://yourdomain.com/success',
  cancel_url: 'https://yourdomain.com/pricing'
});
```

### Alternative: Paddle (Recommended for EU/Global)

**Why Paddle:**
- ✅ Merchant of record (handles VAT/taxes)
- ✅ No compliance burden
- ✅ Higher fees but saves time
- ✅ Multi-currency support
- ✅ Fraud protection

**Fees:** 5% + $0.50 per transaction
- Higher than Stripe, but handles all tax compliance
- Worth it for global sales (EU VAT is complex)

---

## Pricing Page Design

### Key Elements

**Clear Value Comparison:**
```
┌─────────────┬─────────────┬──────────────┐
│    Free     │     Pro     │   Business   │
│             │  $5/month   │  $15/month   │
├─────────────┼─────────────┼──────────────┤
│ 20 files/day│ Unlimited   │ Unlimited    │
│ Manual only │ AI Auto ✓   │ AI Auto ✓    │
│ Community   │ Priority ✓  │ Phone ✓      │
│ -           │ -           │ API Access ✓ │
│ -           │ -           │ 5 seats ✓    │
└─────────────┴─────────────┴──────────────┘

[Get Started] [Start Free]  [Contact Sales]
```

**Social Proof:**
- "Used by 10,000+ users"
- "Featured on Product Hunt #1"
- Testimonials (after getting customers)

**FAQ:**
- "Can I cancel anytime?" → Yes, instant cancellation
- "Do you offer refunds?" → 30-day money-back guarantee
- "How secure is payment?" → Stripe (bank-level security)

**Trial Option (Optional):**
- 7-day free trial of Pro (no credit card required)
- Or 14-day money-back guarantee

---

## Conversion Optimization

### Pricing Psychology

**Anchoring Effect:**
```
❌ Bad: Show Free first
✅ Good: Show Pro first (makes it seem reasonable)
```

**Decoy Pricing:**
```
Free: $0
Pro: $5/month ← Most popular (highlight this)
Business: $15/month
```
→ Pro seems like best value compared to Business

**Annual Discount:**
```
Monthly: $5/month = $60/year
Annual: $40/year (save $20!)
```
→ Encourage annual for cash flow

### CTAs (Call-to-Actions)

**Strong CTAs:**
- ✅ "Start Free Trial" (not "Sign Up")
- ✅ "Upgrade Now" (not "Go Pro")
- ✅ "Save $20/year" (show savings)

**Weak CTAs:**
- ❌ "Learn More"
- ❌ "Buy Now"
- ❌ "Subscribe"

### Upgrade Prompts (In-App)

**Gentle Nudges:**
```
Free user hits daily limit:
"You've reached today's limit (20 files).
 Upgrade to Pro for unlimited processing. ($5/mo)"
[Maybe Later] [Upgrade Now]
```

```
Free user processes 10+ files:
"💡 Pro Tip: AI Auto-Detection would save you 15 minutes.
 Try it free for 7 days?"
[Not Interested] [Start Trial]
```

**Timing Matters:**
- Show upgrade prompt after successful use (not on first visit)
- Show AI feature teaser after 3rd manual adjustment
- Offer discount on first upgrade attempt failure

---

## Revenue Projections

### Conservative Model (70% probability)

**Assumptions:**
- 5,000 monthly visitors (month 3)
- Free → Pro conversion: 0.5%
- Pro → Business conversion: 10%
- Annual plan adoption: 30%

**Monthly Breakdown:**
```
Month 1-2: $0 (free validation phase)
Month 3: $100-200 (10-20 Pro users)
Month 6: $300-500 (50 Pro, 3 Business)
Month 12: $500-1,000 (100 Pro, 5 Business)

Year 1 ARR: $6,000-12,000
```

### Optimistic Model (20% probability)

**Assumptions:**
- 20,000 monthly visitors (month 6)
- Conversion: 0.8%
- Viral growth from Reddit/HN

**Monthly Breakdown:**
```
Month 3: $500 (viral traction)
Month 6: $1,500
Month 12: $3,000-5,000

Year 1 ARR: $30,000-60,000
```

### Per-Customer Value (LTV)

**Lifetime Value Calculation:**
```
Pro Monthly User:
- Churn rate: 5%/month
- Avg lifetime: 20 months
- LTV: $5 × 20 = $100

Pro Annual User:
- Churn rate: 20%/year
- Avg lifetime: 5 years
- LTV: $40 × 5 = $200

Business User:
- Churn rate: 10%/year
- Avg lifetime: 10 years
- LTV: $150 × 10 = $1,500
```

**Acceptable CAC (Customer Acquisition Cost):**
- Pro: <$30 (3:1 LTV:CAC ratio)
- Business: <$500

---

## Churn Prevention

### Retention Strategies

**Onboarding Email Sequence:**
```
Day 1: Welcome + Quick start guide
Day 3: "Did you know?" AI feature highlight
Day 7: Check-in + support offer
Day 14: Usage stats + value reminder
Day 28: Renewal reminder (for monthly)
```

**Usage Milestones:**
```
10 files processed: "You're on a roll! 🎉"
100 files: "Power user! Here's a 20% discount for annual"
1,000 files: "VIP status - free upgrade to Business"
```

**Win-Back Campaign:**
```
Cancelled user:
Day 7: "We miss you. 50% off for 3 months?"
Day 30: "What went wrong?" (feedback survey)
Day 90: "New features added. Come back?"
```

**Exit Survey:**
When user cancels, ask:
- [ ] Too expensive
- [ ] Didn't use enough
- [ ] Missing features (which?)
- [ ] Found alternative (which?)
- [ ] Other (explain)

---

## Metrics to Track

### Key Performance Indicators

**Acquisition Metrics:**
- Visitors → Free users (signup rate)
- Free → Trial (trial activation rate)
- Trial → Paid (conversion rate)

**Revenue Metrics:**
- MRR (Monthly Recurring Revenue)
- ARR (Annual Recurring Revenue)
- ARPU (Average Revenue Per User)
- Churn rate (monthly %)

**Engagement Metrics:**
- DAU/MAU ratio (Daily/Monthly Active Users)
- Files processed per user
- Feature usage (AI auto-detect adoption)

**Target Metrics (Month 6):**
```
Visitors: 10,000/mo
Free signups: 1,000 (10% conversion)
Paid users: 50 (5% free → paid)
MRR: $250-500
Churn: <10%/mo
NPS: >40
```

---

## Early-Stage Monetization Strategy

### Phase 1: Free for All (Week 1-4)

**Goal:** Validate market, collect feedback

**Actions:**
- No payment at all
- "Coming Soon: Pro Plan"
- Email capture for waitlist
- Survey: "Would you pay $5/mo?"

**Success Criteria:**
- 100+ email signups
- 50%+ "Yes, would pay"
- NPS >40

### Phase 2: Soft Launch Pricing (Week 5-8)

**Goal:** Get first 10 paying customers

**Strategy:**
- Early Bird discount: 50% off forever
- $2.50/mo instead of $5
- "First 100 customers only"

**Marketing:**
- Email waitlist: "Early access open"
- Reddit: "We're launching paid tier"
- Scarcity: "75 spots left"

### Phase 3: Standard Pricing (Week 9+)

**Goal:** Establish sustainable pricing

**Actions:**
- Full price: $5/mo Pro
- End early bird (grandfathered users keep $2.50)
- Add Business tier
- Marketing focus on ROI

---

## Payment Implementation

### Stripe Integration

**Step 1: Create Products**
```bash
# Create Pro Monthly
stripe products create \
  --name="Pro Monthly" \
  --description="Unlimited processing + AI"

stripe prices create \
  --product=prod_xxxxx \
  --unit-amount=500 \
  --currency=usd \
  --recurring[interval]=month

# Create Pro Annual
stripe prices create \
  --product=prod_xxxxx \
  --unit-amount=4000 \
  --currency=usd \
  --recurring[interval]=year
```

**Step 2: Checkout Flow**
```typescript
// src/services/paymentService.ts
import { loadStripe } from '@stripe/stripe-js';

const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export async function checkoutPro(plan: 'monthly' | 'annual') {
  const priceId = plan === 'monthly'
    ? 'price_xxxxx'
    : 'price_yyyyy';

  const response = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ priceId })
  });

  const session = await response.json();
  await stripe?.redirectToCheckout({ sessionId: session.id });
}
```

**Step 3: Backend (Serverless Function)**
```typescript
// api/create-checkout-session.ts (Vercel Serverless)
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export default async function handler(req, res) {
  const { priceId } = req.body;

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${req.headers.origin}/pricing`,
    customer_email: req.body.email
  });

  res.json({ id: session.id });
}
```

**Step 4: Webhook (Handle Subscriptions)**
```typescript
// api/webhooks/stripe.ts
export default async function handler(req, res) {
  const sig = req.headers['stripe-signature'];
  const event = stripe.webhooks.constructEvent(
    req.body,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET!
  );

  switch (event.type) {
    case 'checkout.session.completed':
      // Grant Pro access
      await grantProAccess(event.data.object.customer);
      break;
    case 'customer.subscription.deleted':
      // Revoke Pro access
      await revokeProAccess(event.data.object.customer);
      break;
  }

  res.json({ received: true });
}
```

---

## Legal & Compliance

### Required Documents

**1. Privacy Policy**
- Must have before collecting emails
- Template: [privacypolicies.com](https://www.privacypolicies.com/)
- Key points: What data collected (minimal), how used, GDPR rights

**2. Terms of Service**
- Refund policy (30 days)
- Usage limits (fair use)
- Service availability (no uptime guarantee for free)
- Termination rights

**3. Cookie Policy**
- If using analytics (Plausible = no cookies needed!)
- If using Stripe (payment cookies)

### Tax Compliance

**Stripe Tax:**
- Enable Stripe Tax ($0.50/transaction)
- Automatic calculation of sales tax/VAT
- Simplifies compliance

**Paddle:**
- Merchant of record (they handle all tax)
- Better for international sales
- Higher fee but zero compliance burden

---

## Next Steps

1. ✅ Review pricing tiers
2. ⏭️ Set up Stripe account
3. ⏭️ Create product/price IDs
4. ⏭️ Build payment integration
5. ⏭️ Write pricing page copy
6. ⏭️ Launch "Coming Soon" waitlist
7. ⏭️ Soft launch to early adopters

**Estimated Time:** 1 week for payment integration

---

**Document Version:** 1.0
**Last Updated:** 2025-01-27
**Next Review:** After first paying customer