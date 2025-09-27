# Deployment Strategy

## Platform Selection

### Recommended: Vercel (Primary Choice)

**Why Vercel:**
- ✅ Free tier: 100GB bandwidth/month
- ✅ Automatic HTTPS + global CDN
- ✅ GitHub integration (push = auto-deploy)
- ✅ Custom domain support (free)
- ✅ Built-in analytics
- ✅ Zero configuration for Vite projects
- ✅ Excellent performance (Edge network)

**Pricing:**
```
Hobby (Free):
- 100GB bandwidth/mo
- 100 deployments/day
- Sufficient for 5,000-10,000 visitors/mo

Pro ($20/mo):
- 1TB bandwidth/mo
- Unlimited deployments
- Priority support
- Analytics
- Needed when traffic >10K/mo
```

### Alternative Platforms

**Netlify**
- Similar to Vercel
- Better for forms/serverless functions
- 100GB bandwidth free tier
- Good choice if Vercel fails

**Cloudflare Pages**
- **Unlimited bandwidth** (best for high traffic)
- Free tier very generous
- Slightly more complex setup
- Best when traffic >50K/mo

**GitHub Pages**
- Completely free
- 100GB bandwidth/mo soft limit
- No custom backend possible
- Good for pure static sites

---

## Deployment Process

### Initial Setup (Vercel)

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Link project
cd /path/to/pdf-angle-corrector
vercel link

# 4. Deploy to production
vercel --prod
```

### GitHub Auto-Deploy Setup

**1. Push to GitHub**
```bash
git remote add origin https://github.com/yourusername/pdf-angle-corrector.git
git push -u origin master
```

**2. Connect Vercel**
- Go to vercel.com
- Click "Add New Project"
- Import from GitHub
- Select repository
- Auto-detected: Vite framework
- Click "Deploy"

**3. Auto-Deploy Configured**
```
Every push to master → Automatic production deploy
Every PR → Preview deployment
```

### Vercel Configuration

**vercel.json**
```json
{
  "version": 2,
  "name": "pdf-angle-corrector",
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    },
    {
      "source": "/(.*)\\.(js|css|woff2?|ttf|otf|eot|svg|png|jpg|jpeg|gif|webp|avif)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

---

## Custom Domain Setup

### Domain Purchase

**Recommended Registrars:**
1. **Namecheap** ($9-12/year, easy to use)
2. **Cloudflare** ($8-10/year, best performance)
3. **Google Domains** ($12/year, simple)

**Domain Suggestions:**
- pdfanglefixer.com
- docstraightener.com
- straightenpdf.com
- fixmypdf.app
- scanfixer.io

### DNS Configuration

**For Vercel:**
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**In Vercel Dashboard:**
1. Project Settings → Domains
2. Add domain: `yourdomain.com`
3. Add `www.yourdomain.com` → redirect to main
4. Wait 5-60 minutes for DNS propagation

---

## Performance Optimization

### Build Optimization

**vite.config.ts**
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/cdnjs\.cloudflare\.com/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cdn-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          }
        ]
      },
      manifest: {
        name: 'PDF Angle Corrector',
        short_name: 'PDF Fixer',
        description: 'Fix tilted PDFs and images instantly',
        theme_color: '#3B82F6',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  build: {
    target: 'es2015',
    rollupOptions: {
      output: {
        manualChunks: {
          'pdf-vendor': ['pdf-lib'],
          'pdfjs-vendor': ['pdfjs-dist'],
          'react-vendor': ['react', 'react-dom']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
});
```

### Asset Optimization

**Image Optimization:**
```bash
# Install image optimizer
npm install -D vite-plugin-image-optimizer

# Add to vite.config.ts
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

export default defineConfig({
  plugins: [
    ViteImageOptimizer({
      png: { quality: 80 },
      jpeg: { quality: 85 },
      webp: { quality: 85 }
    })
  ]
});
```

**Font Optimization:**
```css
/* Use only necessary font weights */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap');
```

---

## SEO Configuration

### Meta Tags (index.html)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <!-- Primary Meta Tags -->
  <title>PDF Angle Corrector - Free Online Document Straightener</title>
  <meta name="title" content="PDF Angle Corrector - Free Online Document Straightener">
  <meta name="description" content="Fix tilted PDFs and images instantly. 100% privacy-focused, no upload. Batch processing, flip, rotate. Perfect for scanned documents.">
  <meta name="keywords" content="pdf angle corrector, straighten pdf, fix tilted scan, document rotation, pdf straightener, privacy pdf tool">

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://yourdomain.com/">
  <meta property="og:title" content="PDF Angle Corrector - Free Online Document Straightener">
  <meta property="og:description" content="Fix tilted PDFs and images instantly. 100% privacy-focused, no upload required.">
  <meta property="og:image" content="https://yourdomain.com/og-image.png">

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="https://yourdomain.com/">
  <meta property="twitter:title" content="PDF Angle Corrector - Free Online Document Straightener">
  <meta property="twitter:description" content="Fix tilted PDFs and images instantly. 100% privacy-focused, no upload required.">
  <meta property="twitter:image" content="https://yourdomain.com/og-image.png">

  <!-- Favicon -->
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">

  <!-- Canonical URL -->
  <link rel="canonical" href="https://yourdomain.com/">
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>
```

### Sitemap Generation

**public/sitemap.xml**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://yourdomain.com/</loc>
    <lastmod>2025-01-27</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://yourdomain.com/about</loc>
    <lastmod>2025-01-27</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://yourdomain.com/privacy</loc>
    <lastmod>2025-01-27</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
</urlset>
```

### Robots.txt

**public/robots.txt**
```
User-agent: *
Allow: /
Sitemap: https://yourdomain.com/sitemap.xml

User-agent: GPTBot
Disallow: /

User-agent: ChatGPT-User
Disallow: /
```

---

## Analytics Setup

### Option 1: Plausible (Recommended - Privacy-Focused)

**Why Plausible:**
- GDPR/CCPA compliant
- No cookie banner needed
- Lightweight (<1KB script)
- $9/month (10K visitors)

**Setup:**
```html
<!-- Add to index.html -->
<script defer data-domain="yourdomain.com" src="https://plausible.io/js/script.js"></script>
```

**Track Custom Events:**
```typescript
// Track file upload
window.plausible?.('File Upload', { props: { type: 'pdf', count: '5' } });

// Track save
window.plausible?.('Save Files', { props: { format: 'pdf' } });

// Track Pro conversion
window.plausible?.('Pro Signup', { props: { plan: 'monthly' } });
```

### Option 2: Google Analytics 4

**Setup:**
```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX', {
    'anonymize_ip': true,
    'allow_google_signals': false,
    'allow_ad_personalization_signals': false
  });
</script>
```

**⚠️ Requires cookie consent banner**

---

## Monitoring & Error Tracking

### Sentry Setup (Free Tier: 5K errors/mo)

```bash
npm install @sentry/react @sentry/vite-plugin
```

**src/main.tsx**
```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://xxxxx@oxxxxx.ingest.sentry.io/xxxxx",
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay()
  ],
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  environment: import.meta.env.MODE
});
```

**Error Boundaries:**
```typescript
const SentryErrorBoundary = Sentry.ErrorBoundary;

<SentryErrorBoundary fallback={<ErrorFallback />}>
  <App />
</SentryErrorBoundary>
```

---

## Progressive Web App (PWA)

### Service Worker Benefits
- ✅ Offline functionality
- ✅ Faster subsequent loads
- ✅ "Add to Home Screen" on mobile
- ✅ 30% higher retention rate

### PWA Configuration (via VitePWA)

Already configured in vite.config.ts above. Additional setup:

**public/manifest.json** (auto-generated)
```json
{
  "name": "PDF Angle Corrector",
  "short_name": "PDF Fixer",
  "description": "Fix tilted PDFs and images",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3B82F6",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

---

## Security Hardening

### Content Security Policy

**Add to vercel.json:**
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://plausible.io https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' https://plausible.io;"
        }
      ]
    }
  ]
}
```

### Environment Variables

**Never commit secrets to Git. Use Vercel Environment Variables:**

Vercel Dashboard → Project → Settings → Environment Variables

```
VITE_STRIPE_PUBLIC_KEY=pk_live_xxxxx
VITE_SENTRY_DSN=https://xxxxx
VITE_PLAUSIBLE_DOMAIN=yourdomain.com
```

---

## Performance Monitoring

### Lighthouse CI

```bash
npm install -D @lhci/cli

# .lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:4173'],
      numberOfRuns: 3
    },
    assert: {
      assertions: {
        'categories:performance': ['error', {minScore: 0.9}],
        'categories:accessibility': ['error', {minScore: 0.9}],
        'categories:seo': ['error', {minScore: 0.9}]
      }
    }
  }
};

# Run
npm run build
npm run preview &
lhci autorun
```

### Web Vitals Monitoring

```typescript
// src/utils/vitals.ts
import { onCLS, onFID, onLCP, onFCP, onTTFB } from 'web-vitals';

export function reportWebVitals() {
  onCLS(metric => sendToAnalytics(metric));
  onFID(metric => sendToAnalytics(metric));
  onLCP(metric => sendToAnalytics(metric));
  onFCP(metric => sendToAnalytics(metric));
  onTTFB(metric => sendToAnalytics(metric));
}

function sendToAnalytics(metric: any) {
  window.plausible?.(metric.name, {
    props: {
      value: Math.round(metric.value),
      rating: metric.rating
    }
  });
}
```

---

## Deployment Checklist

### Pre-Launch
- [ ] Build passes without errors
- [ ] All features tested in production mode
- [ ] Analytics installed and tested
- [ ] Error tracking (Sentry) configured
- [ ] SEO meta tags complete
- [ ] Sitemap generated
- [ ] robots.txt configured
- [ ] Favicon set (all sizes)
- [ ] OG image created (1200x630)
- [ ] Privacy policy page
- [ ] Terms of service page

### Launch Day
- [ ] Deploy to Vercel
- [ ] Custom domain connected
- [ ] HTTPS verified
- [ ] Test on Chrome, Firefox, Safari, Edge
- [ ] Test on mobile (iOS, Android)
- [ ] Lighthouse score >90 all categories
- [ ] Submit to Google Search Console
- [ ] Submit sitemap to Bing Webmaster Tools
- [ ] Add to AlternativeTo, Capterra

### Post-Launch
- [ ] Monitor analytics daily
- [ ] Check error logs (Sentry)
- [ ] Respond to user feedback
- [ ] Track Core Web Vitals
- [ ] Monitor uptime (UptimeRobot)

---

## Scaling Considerations

### Traffic Thresholds

**0-10K visitors/mo:** Vercel Free Tier
- No action needed
- Monitor bandwidth usage

**10K-50K visitors/mo:** Vercel Pro ($20/mo)
- Upgrade when approaching 100GB/mo
- Enable Vercel Analytics

**50K-200K visitors/mo:** Cloudflare Pages
- Migrate to unlimited bandwidth platform
- Use Cloudflare CDN in front of Vercel

**200K+ visitors/mo:** Consider dedicated infrastructure
- AWS S3 + CloudFront
- Self-hosted with load balancer
- Or enterprise Vercel plan

---

## Backup & Disaster Recovery

### Git as Source of Truth
- All code in GitHub (private repo)
- Tag releases: `git tag v1.0.0`
- Never edit directly in Vercel

### Database Backup (Future)
If adding user accounts later:
- Daily automated backups
- Store in S3 or similar
- Test restore process monthly

### Rollback Procedure
```bash
# Vercel keeps all deployments
vercel rollback

# Or via dashboard: Deployments → Promote to Production
```

---

## Cost Estimates

### Minimum (0-5K visitors/mo)
```
Domain: $12/year
Vercel: $0/mo (free tier)
Plausible: $0/mo (free trial) or $9/mo
Total: ~$10-20/mo
```

### Growth Phase (10K-50K visitors/mo)
```
Domain: $12/year
Vercel Pro: $20/mo
Plausible: $19/mo (100K pageviews)
Sentry: $0/mo (free tier sufficient)
Total: ~$40/mo
```

### Scale Phase (100K+ visitors/mo)
```
Domain: $12/year
Cloudflare Pages: $0/mo (unlimited)
Plausible: $69/mo (1M pageviews)
Sentry Pro: $26/mo
CDN: $0 (Cloudflare free)
Total: ~$100/mo
```

---

## Next Steps

1. ✅ Review this deployment strategy
2. ⏭️ Execute initial Vercel deployment
3. ⏭️ Configure custom domain
4. ⏭️ Install analytics
5. ⏭️ Complete SEO checklist
6. ⏭️ Launch!

**Estimated Time:** 1-2 days for initial setup

---

**Document Version:** 1.0
**Last Updated:** 2025-01-27
**Next Review:** After first deployment