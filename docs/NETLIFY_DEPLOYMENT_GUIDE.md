# Netlify Deployment Guide - Step by Step

**Last Updated:** 2025-10-03
**Estimated Time:** 15-30 minutes
**Prerequisites:** GitHub account, project pushed to GitHub

---

## 📋 Pre-Deployment Checklist

Before deploying, verify:
- ✅ All code committed and pushed to GitHub
- ✅ `netlify.toml` exists in project root
- ✅ `npm run build` works locally
- ✅ No critical bugs

---

## Step 1: Create Netlify Account

1. **Go to Netlify**: https://app.netlify.com/signup
2. **Sign up with GitHub**: Click "Sign up with GitHub"
3. **Authorize Netlify**: Grant Netlify access to your GitHub account
4. **Verify email** (if prompted)

**Result:** You're now logged into Netlify dashboard

---

## Step 2: Connect GitHub Repository

1. **Click "Add new site"** (top right)
2. **Select "Import an existing project"**
3. **Choose "Deploy with GitHub"**
4. **Authorize Netlify** (if first time)
   - Netlify will request access to your repositories
   - Click "Authorize Netlify"

5. **Select repository:**
   - Search for: `pdf-angle-corrector`
   - Click on the repository name

**Note:** If repository doesn't appear:
- Click "Configure Netlify on GitHub"
- Grant access to `pdf-angle-corrector` repository
- Return to Netlify and refresh

---

## Step 3: Configure Build Settings

Netlify should auto-detect settings from `netlify.toml`, but verify:

**Build Settings:**
```
Base directory: (leave empty)
Build command: npm run build
Publish directory: dist
```

**Build Environment:**
```
Node version: 18 (automatically detected from netlify.toml)
```

**Environment Variables** (optional, for now):
- Skip this step (we'll add GA4 tracking ID later)

**Click "Deploy [site-name]"**

---

## Step 4: Wait for Build

**Build Process** (2-3 minutes):
1. Netlify clones your repository
2. Runs `npm install`
3. Runs `npm run build`
4. Deploys to CDN

**Watch the build log:**
- Click "Deploying your site" to see live logs
- Look for "Site is live" message

**If build fails:**
- Check build logs for errors
- Common issues:
  - Missing dependencies: Run `npm install` locally first
  - Build errors: Fix locally, commit, push

---

## Step 5: Test Your Site

**Your site is now live!**

1. **Find your URL:**
   - Netlify assigns a random URL like: `https://random-name-12345.netlify.app`
   - Click the URL to visit your site

2. **Test functionality:**
   - [ ] Upload a PDF file
   - [ ] Test AI Auto-Fix button
   - [ ] Test rotation slider
   - [ ] Test Save/Export
   - [ ] Test on mobile device

3. **Check browser console:**
   - Press F12 → Console tab
   - Look for errors (should be none)

**If site works:** ✅ Proceed to Step 6
**If site has issues:** Check "Troubleshooting" section below

---

## Step 6: Custom Domain Setup (Optional)

### Option A: Use Netlify Subdomain (Free)

**Current URL:** `https://random-name-12345.netlify.app`

**Change to better name:**
1. Go to: Site settings → Domain management
2. Click "Options" → "Edit site name"
3. Enter: `pdf-angle-corrector` (if available)
4. New URL: `https://pdf-angle-corrector.netlify.app`

**Pros:** Free, instant, HTTPS included
**Cons:** Less professional, includes "netlify.app"

---

### Option B: Buy Custom Domain (Recommended)

**Domain to buy:** `pdf-angle-corrector.com`

**Step 6.1: Purchase Domain**

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

**Step 6.2: Connect Domain to Netlify**

**In Netlify:**
1. Go to: Site settings → Domain management
2. Click "Add custom domain"
3. Enter: `pdf-angle-corrector.com`
4. Click "Verify"
5. Netlify will ask: "Do you own this domain?"
6. Click "Yes, add domain"

**Choose DNS Setup Method:**

---

**Method 1: Netlify DNS (Recommended - Easier)**

1. **In Netlify:**
   - Click "Set up Netlify DNS"
   - Netlify will show nameservers (e.g., `dns1.p01.nsone.net`)

2. **In your domain registrar (Namecheap/Cloudflare):**
   - Go to domain management
   - Find "Nameservers" section
   - Change from "Registrar DNS" to "Custom DNS"
   - Add Netlify's nameservers:
     ```
     dns1.p01.nsone.net
     dns2.p02.nsone.net
     dns3.p03.nsone.net
     dns4.p04.nsone.net
     ```
   - Save changes

3. **Wait for DNS propagation:**
   - Time: 5 minutes to 48 hours (usually <1 hour)
   - Check status: https://dnschecker.org/

**Pros:** Automatic HTTPS, easier management
**Cons:** Nameserver change affects all DNS records

---

**Method 2: External DNS (Keep registrar DNS)**

**In your domain registrar:**
1. Go to DNS management
2. Add these records:

**A Record:**
```
Type: A
Name: @ (or leave blank)
Value: 75.2.60.5 (Netlify load balancer)
TTL: Automatic or 3600
```

**CNAME Record:**
```
Type: CNAME
Name: www
Value: [your-site].netlify.app (e.g., pdf-angle-corrector.netlify.app)
TTL: Automatic or 3600
```

**AAAA Record (IPv6 - optional but recommended):**
```
Type: AAAA
Name: @ (or leave blank)
Value: 2600:1f18:24ba:c800:bb8e:c66d:bec8:6f85
TTL: Automatic or 3600
```

**Wait 10-60 minutes for propagation**

---

**Step 6.3: Enable HTTPS**

**In Netlify:**
1. Go to: Site settings → Domain management → HTTPS
2. Netlify auto-provisions SSL certificate (Let's Encrypt)
3. Wait 1-5 minutes
4. Once ready: "Certificate status: Active"
5. Enable "Force HTTPS" (redirects HTTP → HTTPS)

**Result:** Your site is now accessible at:
- `https://pdf-angle-corrector.com` ✅
- `https://www.pdf-angle-corrector.com` ✅

---

## Step 7: Set Up Google Analytics

**Step 7.1: Create GA4 Property**

1. **Go to Google Analytics**: https://analytics.google.com
2. **Sign in** with Google account
3. **Click "Start measuring"**
4. **Create Account:**
   - Account name: `PDF Angle Corrector`
   - Click Next
5. **Create Property:**
   - Property name: `PDF Angle Corrector`
   - Time zone: Your timezone
   - Currency: Your currency
   - Click Next
6. **Business Details:** (skip or fill)
7. **Business Objectives:** Select "Get baseline reports"
8. **Click "Create"** → Accept Terms

**Step 7.2: Set Up Data Stream**

1. **Select platform:** Web
2. **Website URL:** `https://pdf-angle-corrector.com` (or netlify.app URL)
3. **Stream name:** `PDF Angle Corrector - Production`
4. **Click "Create stream"**

**Step 7.3: Get Measurement ID**

1. **Copy Measurement ID:**
   - Format: `G-XXXXXXXXXX`
   - Example: `G-1A2B3C4D5E`

**Step 7.4: Update index.html**

1. **Open:** `index.html` in your code editor
2. **Find:** (Line 37-45)
   ```html
   <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
   <script>
     window.dataLayer = window.dataLayer || [];
     function gtag(){dataLayer.push(arguments);}
     gtag('js', new Date());
     gtag('config', 'G-XXXXXXXXXX', {
   ```
3. **Replace:** `G-XXXXXXXXXX` with your real Measurement ID (2 places)
4. **Save file**

**Step 7.5: Deploy Update**

```bash
git add index.html
git commit -m "Add Google Analytics tracking ID"
git push
```

Netlify will auto-deploy (2-3 minutes)

**Step 7.6: Verify Tracking**

1. **Visit your site:** `https://pdf-angle-corrector.com`
2. **In Google Analytics:**
   - Go to: Reports → Realtime
   - You should see "1 user" (yourself)
3. **If you see yourself:** ✅ Analytics working!

---

## Step 8: Set Up Email Signup Form (Netlify Forms)

**Step 8.1: Create Signup Form Component**

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
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          'form-name': 'beta-signup',
          email
        }).toString()
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

      <form
        name="beta-signup"
        method="POST"
        data-netlify="true"
        onSubmit={handleSubmit}
        className="flex gap-2"
      >
        <input type="hidden" name="form-name" value="beta-signup" />

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

**Step 8.2: Add to App.tsx**

```typescript
// Add import at top
import { EmailSignup } from './components/EmailSignup';

// Add component in your UI (e.g., after header)
<EmailSignup />
```

**Step 8.3: Create Hidden Form (for Netlify detection)**

Add to `index.html` (before closing `</body>`):

```html
<!-- Netlify Forms - Hidden -->
<form name="beta-signup" netlify netlify-honeypot="bot-field" hidden>
  <input type="email" name="email" />
</form>
```

**Step 8.4: Deploy and Test**

```bash
git add .
git commit -m "Add email signup form (Netlify Forms)"
git push
```

**After deployment:**
1. Visit your site
2. Enter your email in the form
3. Submit
4. Check: Netlify Dashboard → Forms → "beta-signup"
5. You should see your submission!

---

## Step 9: Enable Deploy Notifications (Optional)

**Get notified when deploys succeed/fail:**

1. **In Netlify:** Site settings → Build & deploy → Deploy notifications
2. **Add notification:**
   - Email notifications (deploy succeeded)
   - Email notifications (deploy failed)
   - Slack (if you use Slack)

---

## Step 10: Set Up Deploy Previews (Optional)

**Automatic preview for Pull Requests:**

Already enabled by default! When you create a PR:
1. Netlify builds a preview
2. Adds comment to PR with preview URL
3. Perfect for testing before merging

---

## 🎉 Deployment Complete!

**Your site is now:**
- ✅ Live on Netlify
- ✅ HTTPS enabled (secure)
- ✅ Auto-deploys on push
- ✅ Google Analytics tracking
- ✅ Email signup working
- ✅ Custom domain (if purchased)

**Next Steps (Week 3):**
- [ ] Create demo GIF
- [ ] Write Reddit launch post
- [ ] Prepare Product Hunt assets
- [ ] User testing with 5 people

---

## 🔧 Troubleshooting

### Build Fails

**Error: "Command not found: npm"**
- **Fix:** Check Node version in `netlify.toml` (should be 18)

**Error: "Module not found"**
- **Fix:** Run `npm install` locally, commit `package-lock.json`, push

**Error: Build timeout**
- **Fix:** Check for infinite loops or heavy dependencies

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
2. Verify CSP headers in `netlify.toml`

---

### Custom Domain Issues

**Domain not working after 24 hours:**
1. Check DNS propagation: https://dnschecker.org/
2. Verify nameservers or A/CNAME records
3. Clear browser cache (Ctrl+Shift+Del)

**HTTPS not working:**
1. Wait 5-10 minutes for certificate provisioning
2. Check: Site settings → Domain management → HTTPS
3. If failed: Click "Renew certificate"

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
1. Check hidden form in `index.html`
2. Verify `name="beta-signup"` matches
3. Check Netlify dashboard → Forms
4. Spam filter: Check spam folder

---

## 📞 Support

**Netlify Documentation:**
- Getting Started: https://docs.netlify.com/get-started/
- Custom Domains: https://docs.netlify.com/domains-https/custom-domains/
- Netlify Forms: https://docs.netlify.com/forms/setup/

**Community Support:**
- Netlify Community: https://answers.netlify.com/
- GitHub Issues: (your repo)

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
- [ ] Email signup form working (test submission)

**Performance:**
- [ ] PageSpeed Insights >90: https://pagespeed.web.dev/
- [ ] GTmetrix Grade A: https://gtmetrix.com/

**Security:**
- [ ] Security Headers A: https://securityheaders.com/
- [ ] SSL Labs A+: https://www.ssllabs.com/ssltest/

---

**Deployment Version:** 1.0
**Last Updated:** 2025-10-03
**Next Review:** After Week 3 beta launch

🚀 **Your site is live! Time to launch the beta!**
