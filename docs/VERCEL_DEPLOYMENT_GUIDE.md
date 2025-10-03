# Vercel Deployment Guide - 5-Minute Quickstart

**Last Updated:** 2025-10-03
**Estimated Time:** 5 minutes
**Prerequisites:** GitHub account, project pushed to GitHub

---

## Why Vercel?

**Best for this project:**
- ✅ Zero-config Vite deployment (auto-detected)
- ✅ Edge CDN for best performance
- ✅ Fastest deployment (5 min vs 30 min)
- ✅ Private GitHub repo support (Free tier)
- ✅ Automatic HTTPS with custom domains

**When to use Netlify instead:**
- ❌ Need built-in forms (we'll use Formspree in Week 5)
- ❌ Need serverless functions (not needed yet)

---

## Option 1: Deploy via Web UI (Recommended - 5 Minutes)

### Step 1: Create Vercel Account

1. **Go to Vercel**: https://vercel.com/signup
2. **Sign up with GitHub**: Click "Continue with GitHub"
3. **Authorize Vercel**: Grant Vercel access to your GitHub account
4. **You're in!** Vercel dashboard opens

**Time:** 1 minute

---

### Step 2: Import Project

1. **Click "Add New..."** (top right) → "Project"
2. **Select GitHub repository:**
   - Search for: `pdf-angle-corrector`
   - Click "Import"

3. **Configure Project** (auto-detected):
   ```
   Framework Preset: Vite
   Root Directory: ./
   Build Command: npm run build (auto-detected)
   Output Directory: dist (auto-detected)
   Install Command: npm install (auto-detected)
   ```

4. **Environment Variables** (Optional - Skip for now):
   - We'll add GA4 tracking ID later

5. **Click "Deploy"**

**Time:** 2 minutes

---

### Step 3: Wait for Build

**Build Process** (1-2 minutes):
1. Vercel clones your repository
2. Runs `npm install`
3. Runs `npm run build`
4. Deploys to Edge CDN (global)

**Watch the build log:**
- Real-time logs show progress
- Look for "✓ Production deployment ready"

**If build fails:**
- Check build logs for errors
- Common issues:
  - Missing dependencies: Run `npm install` locally first
  - Build errors: Fix locally, commit, push

**Time:** 2 minutes

---

### Step 4: Your Site is Live! 🎉

**Your URL:**
- Vercel assigns: `https://pdf-angle-corrector.vercel.app`
- Click "Visit" to see your site

**Test functionality:**
- [ ] Upload a PDF file
- [ ] Test AI Auto-Fix button
- [ ] Test rotation slider
- [ ] Test Save/Export
- [ ] Test on mobile device

**If site works:** ✅ Proceed to custom domain setup
**If site has issues:** Check "Troubleshooting" section below

**Time:** Test as long as you need

---

## Option 2: Deploy via CLI (For Advanced Users)

### Install Vercel CLI

```bash
npm i -g vercel
```

### Login

```bash
vercel login
```

### Deploy

```bash
# First deployment (interactive)
vercel

# Production deployment
vercel --prod
```

**Vercel will:**
1. Auto-detect Vite framework
2. Use default settings (build command, output dir)
3. Deploy to production

---

## Custom Domain Setup (Optional)

### Option A: Use Vercel Subdomain (Free)

**Current URL:** `https://pdf-angle-corrector.vercel.app`

**Pros:**
- Free, instant, HTTPS included
- No configuration needed

**Cons:**
- Includes "vercel.app" in URL

---

### Option B: Buy Custom Domain (Recommended)

**Domain to buy:** `pdf-angle-corrector.com`

**Step 1: Purchase Domain**

**Recommended Registrars:**
1. **Namecheap** (cheapest): https://www.namecheap.com
   - Price: ~$8-10/year for .com
   - Coupon codes available online
2. **Cloudflare Registrar** (at-cost):
   - Price: ~$9/year (no markup)
   - Requires Cloudflare account
3. **Google Domains** (now Squarespace):
   - Price: ~$12/year
   - Easy interface

**Buy the domain:**
- Search: `pdf-angle-corrector.com`
- Add to cart
- Checkout (1 year minimum)
- Disable auto-renewal (optional)

---

**Step 2: Connect Domain to Vercel**

### Method 1: Vercel DNS (Recommended - Easier)

**In Vercel:**
1. Go to: Project Settings → Domains
2. Click "Add Domain"
3. Enter: `pdf-angle-corrector.com`
4. Click "Add"
5. Vercel shows nameservers (e.g., `ns1.vercel-dns.com`)

**In your domain registrar (Namecheap/Cloudflare):**
1. Go to domain management
2. Find "Nameservers" section
3. Change from "Registrar DNS" to "Custom DNS"
4. Add Vercel's nameservers:
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```
5. Save changes

**Wait for DNS propagation:**
- Time: 5 minutes to 48 hours (usually <1 hour)
- Check status: https://dnschecker.org/

**Pros:** Automatic HTTPS, easier management, Vercel handles everything
**Cons:** Nameserver change affects all DNS records

---

### Method 2: External DNS (Keep registrar DNS)

**In Vercel:**
1. Go to: Project Settings → Domains
2. Click "Add Domain"
3. Enter: `pdf-angle-corrector.com`
4. Vercel shows DNS records to add

**In your domain registrar:**
1. Go to DNS management
2. Add these records:

**A Record:**
```
Type: A
Name: @ (or leave blank)
Value: 76.76.21.21 (Vercel IP)
TTL: Automatic or 3600
```

**CNAME Record:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: Automatic or 3600
```

**Wait 10-60 minutes for propagation**

**Vercel auto-provisions SSL certificate:**
- Vercel uses Let's Encrypt (free)
- HTTPS enabled automatically (1-5 minutes)

**Result:** Your site is now accessible at:
- `https://pdf-angle-corrector.com` ✅
- `https://www.pdf-angle-corrector.com` ✅

**Pros:** Keep existing DNS setup, more control
**Cons:** Manual DNS configuration, need to update if Vercel IP changes

---

## Environment Variables

### Google Analytics 4 Tracking ID

**When:** After creating GA4 property (Week 2)

**In Vercel:**
1. Go to: Project Settings → Environment Variables
2. Click "Add New"
3. Add variable:
   ```
   Key: VITE_GA4_TRACKING_ID
   Value: G-XXXXXXXXXX (your real ID)
   Environment: Production, Preview, Development
   ```
4. Click "Save"

**Update index.html:**

Replace `G-XXXXXXXXXX` with your real Measurement ID (2 places):

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX', {
    'anonymize_ip': true,
    'cookie_flags': 'SameSite=None;Secure'
  });
</script>
```

**Redeploy:**
```bash
git add index.html
git commit -m "Add Google Analytics tracking ID"
git push
```

Vercel auto-deploys (1-2 minutes)

---

## Email Signup Form (Week 5 - Using Formspree)

**Why Formspree:**
- Simple HTML form submission
- Free tier: 50 submissions/month
- No backend code needed
- Works perfectly with Vercel

**Step 1: Create Formspree Account**

1. **Go to Formspree**: https://formspree.io/
2. **Sign up** (free tier)
3. **Create new form:**
   - Name: "PDF Angle Corrector - Beta Signup"
   - Get form endpoint: `https://formspree.io/f/YOUR_FORM_ID`

**Step 2: Create Signup Form Component**

Create new file: `components/EmailSignup.tsx`

```typescript
import React, { useState } from 'react';

export function EmailSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');

    try {
      const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 my-8">
      <h3 className="text-xl font-bold text-blue-900 mb-2">
        Join the Beta 🚀
      </h3>
      <p className="text-blue-700 mb-4">
        Get notified when we launch Pro tier. Early Bird: $3/mo (40% off)
      </p>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          disabled={status === 'submitting' || status === 'success'}
          className="flex-1 px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          type="submit"
          disabled={status === 'submitting' || status === 'success'}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
        >
          {status === 'submitting' ? 'Joining...' : status === 'success' ? 'Joined! ✓' : 'Join Beta'}
        </button>
      </form>

      {status === 'success' && (
        <p className="text-green-600 text-sm mt-2">
          ✓ You're on the list! Check your email for confirmation.
        </p>
      )}
      {status === 'error' && (
        <p className="text-red-600 text-sm mt-2">
          ✗ Something went wrong. Please try again.
        </p>
      )}
    </div>
  );
}
```

**Step 3: Add to App.tsx**

```typescript
// Add import at top
import { EmailSignup } from './components/EmailSignup';

// Add component in your UI (e.g., after header)
<EmailSignup />
```

**Step 4: Deploy**

```bash
git add .
git commit -m "Add email signup form (Formspree)"
git push
```

**Verify:**
1. Visit your site
2. Enter your email in the form
3. Submit
4. Check: Formspree Dashboard → Submissions
5. You should see your submission!

---

## Deploy Notifications (Optional)

**Get notified when deploys succeed/fail:**

**In Vercel:**
1. Go to: Project Settings → Git
2. Enable:
   - **Deploy Hooks** - Webhook for CI/CD
   - **Ignored Build Step** - Skip builds if no changes
   - **Auto-assign Team** - Assign team to deployments

**Email Notifications:**
- Vercel sends emails automatically for:
  - Production deployments (success/failure)
  - Preview deployments (PR comments)

**Slack Integration:**
1. Go to: Project Settings → Integrations
2. Search: "Slack"
3. Install and configure

---

## Deploy Previews (Automatic)

**Automatic preview for Pull Requests:**

Already enabled by default! When you create a PR:
1. Vercel builds a preview
2. Adds comment to PR with preview URL
3. Perfect for testing before merging
4. Auto-updates on every commit

**Example PR comment:**
```
✅ Preview deployed to https://pdf-angle-corrector-git-feature-abc123.vercel.app
```

---

## 🎉 Deployment Complete!

**Your site is now:**
- ✅ Live on Vercel
- ✅ HTTPS enabled (secure)
- ✅ Auto-deploys on push
- ✅ Edge CDN (global fast loading)
- ✅ Deploy previews (PR workflow)
- ✅ Custom domain (if purchased)

**Next Steps (Week 2):**
- [ ] Replace GA4 placeholder ID with real tracking ID
- [ ] Test production build (cross-browser, mobile)
- [ ] Create email signup form preparation (for Week 5)

**Next Steps (Week 3):**
- [ ] Create demo GIF
- [ ] Write Reddit launch post
- [ ] Prepare Product Hunt assets
- [ ] User testing with 5 people

---

## 🔧 Troubleshooting

### Build Fails

**Error: "Command not found: npm"**
- **Fix:** Vercel auto-detects Node.js, should not happen. Check build logs.

**Error: "Module not found"**
- **Fix:** Run `npm install` locally, commit `package-lock.json`, push

**Error: Build timeout**
- **Fix:** Check for infinite loops or heavy dependencies. Vercel timeout is 45 min (generous).

---

### Site Loads but Broken

**Blank page (white screen):**
1. Open browser console (F12)
2. Check for JavaScript errors
3. Common cause: Incorrect import paths

**Assets not loading (404):**
1. Check Vite config (`publicDir`, `base`)
2. Ensure assets in `public/` folder

**OpenCV.js or Tesseract.js not loading:**
1. Check CDN URLs in `index.html`
2. Check browser console for CORS errors
3. Vercel doesn't block CDN resources by default

---

### Custom Domain Issues

**Domain not working after 24 hours:**
1. Check DNS propagation: https://dnschecker.org/
2. Verify nameservers or A/CNAME records
3. Clear browser cache (Ctrl+Shift+Del)

**HTTPS not working:**
1. Wait 5-10 minutes for certificate provisioning
2. Check: Project Settings → Domains → SSL
3. Vercel auto-renews Let's Encrypt certificates

**"Domain already in use":**
- Domain is already connected to another Vercel project
- Remove from old project first, then add to new one

---

### Analytics Not Working

**No data in Google Analytics:**
1. Check Measurement ID is correct (G-XXXXXXXXXX)
2. Disable ad blockers (they block GA)
3. Test in incognito mode
4. Wait 24-48 hours for data to appear

---

### Email Signup Not Working

**Form submissions not showing:**
1. Check Formspree form endpoint is correct
2. Verify form is using POST method
3. Check Formspree dashboard → Submissions
4. Free tier limit: 50 submissions/month

---

## 📞 Support

**Vercel Documentation:**
- Getting Started: https://vercel.com/docs
- Custom Domains: https://vercel.com/docs/custom-domains
- Environment Variables: https://vercel.com/docs/environment-variables

**Community Support:**
- Vercel Community: https://github.com/vercel/vercel/discussions
- GitHub Issues: (your repo)

**Formspree Documentation:**
- Getting Started: https://help.formspree.io/hc/en-us
- React Integration: https://help.formspree.io/hc/en-us/articles/360055613373

---

## 📊 Post-Deployment Checklist

After deployment, verify:

**Technical:**
- [ ] Site loads on desktop (Chrome, Firefox, Safari, Edge)
- [ ] Site loads on mobile (iOS Safari, Android Chrome)
- [ ] HTTPS working (green lock icon)
- [ ] All features working (upload, AI, save)
- [ ] No console errors (F12 → Console)
- [ ] Lighthouse score >90 (F12 → Lighthouse)

**SEO:**
- [ ] Meta tags visible (View Source)
- [ ] Open Graph preview: https://www.opengraph.xyz/
- [ ] Schema.org valid: https://validator.schema.org/
- [ ] robots.txt accessible: `/robots.txt`
- [ ] sitemap.xml accessible: `/sitemap.xml`

**Analytics:**
- [ ] Google Analytics tracking (Realtime shows visitors)
- [ ] Email signup form working (test submission - Week 5)

**Performance:**
- [ ] PageSpeed Insights >90: https://pagespeed.web.dev/
- [ ] GTmetrix Grade A: https://gtmetrix.com/

**Security:**
- [ ] Security Headers A: https://securityheaders.com/
- [ ] SSL Labs A+: https://www.ssllabs.com/ssltest/

---

**Deployment Version:** 1.0
**Last Updated:** 2025-10-03
**Next Review:** After Week 5 beta launch

🚀 **Your site is live! Time to launch the beta!**
