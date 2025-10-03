# Technical Implementation Guide - Usage Limits & Pro Features

**Last Updated:** 2025-01-27
**Tech Stack:** React 19 + TypeScript + Firebase + Stripe
**Target:** Free (10/month) + Pro ($5/month unlimited)

---

## 🏗️ Architecture Overview

### **Phase 1: Beta (Week 1-12) - No Limits**
```
User Flow:
└── Visit site → Upload file → AI Auto-Fix/Save → Done
    (No authentication, no tracking, unlimited usage)
```

### **Phase 2: Launch (Week 13+) - With Limits**
```
User Flow:
├── Anonymous User:
│   └── Visit site → Upload → Check usage (cookie) → AI/Save (if <10) → Done
│   └── If ≥10: Show upgrade modal
│
└── Pro User (Authenticated):
    └── Login → Upload → AI/Save (unlimited) → Done
```

---

## 📊 Usage Tracking System

### **Data Model**

**Cookie/LocalStorage (Free Users):**
```typescript
interface MonthlyUsage {
  month: string;           // "2025-05" (YYYY-MM format)
  adjustments: number;     // 0-10
  resetDate: string;       // "2025-06-01T00:00:00Z"
  lastAction: string;      // "2025-05-15T14:30:00Z"
}

// Example
const usage: MonthlyUsage = {
  month: "2025-05",
  adjustments: 7,
  resetDate: "2025-06-01T00:00:00Z",
  lastAction: "2025-05-15T14:30:00Z"
};
```

**Firebase Firestore (Pro Users):**
```typescript
interface UserProfile {
  uid: string;
  email: string;
  isPro: boolean;
  subscriptionId?: string;
  subscriptionStatus?: 'active' | 'canceled' | 'past_due';
  createdAt: Date;
  lastLogin: Date;
}

// Firestore path: users/{uid}
const user: UserProfile = {
  uid: "abc123",
  email: "user@example.com",
  isPro: true,
  subscriptionId: "sub_1234567890",
  subscriptionStatus: "active",
  createdAt: new Date("2025-05-01"),
  lastLogin: new Date("2025-05-15")
};
```

---

### **Usage Counter Logic**

**App.tsx - State Management:**
```typescript
import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

interface MonthlyUsage {
  month: string;
  adjustments: number;
  resetDate: string;
  lastAction: string;
}

function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [usage, setUsage] = useState<MonthlyUsage>(getUsageFromStorage());

  // Listen to auth state
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch user profile from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setUser(userDoc.data() as UserProfile);
        }
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Check usage on mount and when month changes
  useEffect(() => {
    const currentMonth = new Date().toISOString().slice(0, 7);

    if (usage.month !== currentMonth) {
      // New month - reset counter
      const newUsage: MonthlyUsage = {
        month: currentMonth,
        adjustments: 0,
        resetDate: getNextMonthFirstDay(),
        lastAction: new Date().toISOString()
      };
      setUsage(newUsage);
      saveUsageToStorage(newUsage);
    }
  }, []);

  // ... rest of component
}
```

---

### **Usage Validation Functions**

**services/usageService.ts:**
```typescript
const STORAGE_KEY = 'pdf-corrector-usage';
const FREE_LIMIT = 10;

export interface MonthlyUsage {
  month: string;
  adjustments: number;
  resetDate: string;
  lastAction: string;
}

// Get usage from localStorage
export function getUsageFromStorage(): MonthlyUsage {
  const stored = localStorage.getItem(STORAGE_KEY);
  const currentMonth = new Date().toISOString().slice(0, 7);

  if (stored) {
    const usage = JSON.parse(stored) as MonthlyUsage;

    // Check if month has changed
    if (usage.month !== currentMonth) {
      return createNewMonthUsage(currentMonth);
    }

    return usage;
  }

  return createNewMonthUsage(currentMonth);
}

// Save usage to localStorage
export function saveUsageToStorage(usage: MonthlyUsage): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
}

// Create new month usage object
function createNewMonthUsage(month: string): MonthlyUsage {
  const nextMonth = new Date(month + '-01');
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  return {
    month,
    adjustments: 0,
    resetDate: nextMonth.toISOString(),
    lastAction: new Date().toISOString()
  };
}

// Get next month's first day
function getNextMonthFirstDay(): string {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return nextMonth.toISOString();
}

// Check if user can perform action
export function canPerformAction(
  user: UserProfile | null,
  usage: MonthlyUsage
): { allowed: boolean; reason?: string } {
  // Pro users have unlimited access
  if (user?.isPro && user.subscriptionStatus === 'active') {
    return { allowed: true };
  }

  // Check free user limit
  if (usage.adjustments >= FREE_LIMIT) {
    const resetDate = new Date(usage.resetDate);
    const daysUntilReset = Math.ceil(
      (resetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    return {
      allowed: false,
      reason: `이번 달 ${FREE_LIMIT}회를 모두 사용했습니다. ${daysUntilReset}일 후 리셋됩니다.`
    };
  }

  return { allowed: true };
}

// Increment usage counter
export function incrementUsage(usage: MonthlyUsage): MonthlyUsage {
  const newUsage = {
    ...usage,
    adjustments: usage.adjustments + 1,
    lastAction: new Date().toISOString()
  };
  saveUsageToStorage(newUsage);
  return newUsage;
}

// Get days until reset
export function getDaysUntilReset(usage: MonthlyUsage): number {
  const resetDate = new Date(usage.resetDate);
  return Math.ceil((resetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

// Format reset date for display
export function formatResetDate(usage: MonthlyUsage): string {
  const resetDate = new Date(usage.resetDate);
  return resetDate.toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
```

---

## 🔘 UI Integration

### **AI Auto-Fix Button**

**App.tsx - Auto-Fix Handler:**
```typescript
const handleAutoFix = async () => {
  // Check if user can perform action
  const { allowed, reason } = canPerformAction(user, usage);

  if (!allowed) {
    showUpgradeModal(reason || '사용 횟수를 초과했습니다.');
    return;
  }

  // Perform AI detection
  setStatus('detecting');
  setStatusMessage('AI가 각도를 분석 중입니다...');

  try {
    // AI detection logic...
    const angle = await detectTiltAngle(imageUrls[0]);

    // Apply rotation
    // ...

    // Increment usage counter (only for free users)
    if (!user?.isPro) {
      const newUsage = incrementUsage(usage);
      setUsage(newUsage);

      // Show remaining count
      const remaining = FREE_LIMIT - newUsage.adjustments;
      setStatusMessage(`✅ 완료! (남은 횟수: ${remaining}/${FREE_LIMIT})`);
    } else {
      setStatusMessage('✅ 완료!');
    }

  } catch (error) {
    setStatus('error');
    setStatusMessage('AI 분석 실패. 다시 시도해주세요.');
  }
};
```

---

### **Save/Export Button**

**App.tsx - Save Handler:**
```typescript
const handleSave = async (format: 'pdf' | 'jpg' | 'png' | 'webp') => {
  // Check if user can perform action
  const { allowed, reason } = canPerformAction(user, usage);

  if (!allowed) {
    showUpgradeModal(reason || '사용 횟수를 초과했습니다.');
    return;
  }

  // Check page limit (free users: max 50 pages)
  if (!user?.isPro && fileType === 'pdf' && files.length > 50) {
    showPageLimitModal(files.length);
    return;
  }

  // Perform save
  setStatus('saving');
  setStatusMessage('파일을 저장하는 중...');

  try {
    if (fileType === 'pdf') {
      await savePdf();
    } else {
      await saveImage(format);
    }

    // Increment usage counter (only for free users)
    if (!user?.isPro) {
      const newUsage = incrementUsage(usage);
      setUsage(newUsage);

      const remaining = FREE_LIMIT - newUsage.adjustments;
      setStatusMessage(`✅ 저장 완료! (남은 횟수: ${remaining}/${FREE_LIMIT})`);
    } else {
      setStatusMessage('✅ 저장 완료!');
    }

  } catch (error) {
    setStatus('error');
    setStatusMessage('저장 실패. 다시 시도해주세요.');
  }
};
```

---

### **50 Page Limit Modal**

**components/PageLimitModal.tsx:**
```typescript
interface PageLimitModalProps {
  pageCount: number;
  onProcess50Pages: () => void;
  onUpgradeToPro: () => void;
  onClose: () => void;
}

function PageLimitModal({ pageCount, onProcess50Pages, onUpgradeToPro, onClose }: PageLimitModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">큰 파일이 감지되었습니다</h2>

        <p className="text-gray-600 mb-6">
          이 PDF는 <span className="font-bold text-blue-600">{pageCount}페이지</span>입니다.
          <br />
          무료 플랜은 <span className="font-bold">최대 50페이지</span>까지 처리할 수 있습니다.
        </p>

        <div className="space-y-3">
          <button
            onClick={onProcess50Pages}
            className="w-full py-3 px-4 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition"
          >
            처음 50페이지만 처리
          </button>

          <button
            onClick={onUpgradeToPro}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
          >
            Pro 업그레이드 ($5/월) →
          </button>

          <button
            onClick={onClose}
            className="w-full py-2 text-gray-500 hover:text-gray-700 transition"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

### **Upgrade Modal**

**components/UpgradeModal.tsx:**
```typescript
interface UpgradeModalProps {
  reason?: string;
  remainingDays?: number;
  onUpgrade: () => void;
  onClose: () => void;
}

function UpgradeModal({ reason, remainingDays, onUpgrade, onClose }: UpgradeModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">무료 횟수를 모두 사용했습니다</h2>

        <p className="text-gray-600 mb-4">
          {reason || '이번 달 10회를 모두 사용했습니다.'}
        </p>

        {remainingDays && (
          <p className="text-sm text-gray-500 mb-6">
            {remainingDays}일 후 리셋됩니다.
          </p>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-bold text-blue-900 mb-2">Pro 플랜 혜택:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✅ 무제한 조정 횟수</li>
            <li>✅ 무제한 페이지 수</li>
            <li>✅ 다중 파일 배치 처리</li>
            <li>✅ 우선 이메일 지원</li>
          </ul>
        </div>

        <div className="space-y-3">
          <button
            onClick={onUpgrade}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition"
          >
            Pro 업그레이드 ($5/월) →
          </button>

          <p className="text-center text-sm text-gray-500">
            🎁 얼리버드: 첫 3개월 $3/월
          </p>

          <button
            onClick={onClose}
            className="w-full py-2 text-gray-500 hover:text-gray-700 transition"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

### **Usage Display (Header)**

**components/UsageIndicator.tsx:**
```typescript
interface UsageIndicatorProps {
  user: UserProfile | null;
  usage: MonthlyUsage;
}

function UsageIndicator({ user, usage }: UsageIndicatorProps) {
  if (user?.isPro && user.subscriptionStatus === 'active') {
    return (
      <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
        <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
        Pro
      </div>
    );
  }

  const remaining = FREE_LIMIT - usage.adjustments;
  const percentage = (remaining / FREE_LIMIT) * 100;

  const color = percentage > 50 ? 'green' : percentage > 20 ? 'yellow' : 'red';
  const bgColor = `bg-${color}-100`;
  const textColor = `text-${color}-800`;
  const dotColor = `bg-${color}-600`;

  return (
    <div className={`flex items-center gap-2 px-3 py-1 ${bgColor} ${textColor} rounded-full text-sm font-medium`}>
      <span className={`w-2 h-2 ${dotColor} rounded-full`}></span>
      {remaining}/{FREE_LIMIT} 남음
    </div>
  );
}
```

---

## 🔐 Firebase Authentication

### **Setup (Week 9-10)**

**firebase.ts:**
```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

---

### **Sign Up / Login**

**components/AuthModal.tsx:**
```typescript
import { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

function AuthModal({ onClose }: { onClose: () => void }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleEmailAuth = async () => {
    try {
      setError('');

      if (isSignUp) {
        // Sign up
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // Create user profile in Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          isPro: false,
          createdAt: new Date(),
          lastLogin: new Date(),
        });
      } else {
        // Sign in
        await signInWithEmailAndPassword(auth, email, password);
      }

      onClose();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      setError('');
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);

      // Create user profile if new user
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        isPro: false,
        createdAt: new Date(),
        lastLogin: new Date(),
      }, { merge: true });

      onClose();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-6">
          {isSignUp ? '회원가입' : '로그인'}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <button
            onClick={handleEmailAuth}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
          >
            {isSignUp ? '가입하기' : '로그인'}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">또는</span>
            </div>
          </div>

          <button
            onClick={handleGoogleAuth}
            className="w-full py-3 border border-gray-300 hover:bg-gray-50 rounded-lg font-medium transition flex items-center justify-center gap-2"
          >
            <img src="/google-icon.svg" alt="Google" className="w-5 h-5" />
            Google로 계속하기
          </button>

          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="w-full py-2 text-blue-600 hover:text-blue-700 transition"
          >
            {isSignUp ? '이미 계정이 있으신가요? 로그인' : '계정이 없으신가요? 회원가입'}
          </button>

          <button
            onClick={onClose}
            className="w-full py-2 text-gray-500 hover:text-gray-700 transition"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## 💳 Stripe Integration

### **Setup (Week 10)**

**Stripe Checkout Session:**
```typescript
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

async function handleUpgradeClick() {
  const stripe = await stripePromise;

  if (!stripe || !user) return;

  // Create checkout session (call your backend)
  const response = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: user.uid,
      priceId: 'price_1234567890', // Stripe price ID
      mode: 'subscription',
    }),
  });

  const session = await response.json();

  // Redirect to Stripe Checkout
  const result = await stripe.redirectToCheckout({
    sessionId: session.id,
  });

  if (result.error) {
    console.error(result.error.message);
  }
}
```

---

### **Webhook Handler (Backend - Netlify Function)**

**netlify/functions/stripe-webhook.ts:**
```typescript
import Stripe from 'stripe';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function handler(event: any) {
  const sig = event.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let stripeEvent: Stripe.Event;

  try {
    stripeEvent = stripe.webhooks.constructEvent(event.body, sig, webhookSecret);
  } catch (err: any) {
    return {
      statusCode: 400,
      body: `Webhook Error: ${err.message}`,
    };
  }

  // Handle events
  switch (stripeEvent.type) {
    case 'checkout.session.completed': {
      const session = stripeEvent.data.object as Stripe.Checkout.Session;

      // Update user to Pro
      await updateDoc(doc(db, 'users', session.metadata?.userId!), {
        isPro: true,
        subscriptionId: session.subscription as string,
        subscriptionStatus: 'active',
      });
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = stripeEvent.data.object as Stripe.Subscription;

      // Downgrade user
      await updateDoc(doc(db, 'users', subscription.metadata?.userId!), {
        isPro: false,
        subscriptionStatus: 'canceled',
      });
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = stripeEvent.data.object as Stripe.Invoice;

      // Update subscription status
      await updateDoc(doc(db, 'users', invoice.metadata?.userId!), {
        subscriptionStatus: 'past_due',
      });
      break;
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ received: true }),
  };
}
```

---

## 🚀 Deployment Checklist

### **Week 1-2: Beta Deploy**
- [ ] Create Netlify account (private repo support)
- [ ] Configure build settings (`npm run build`)
- [ ] Set up custom domain (`pdf-angle-corrector.com`)
- [ ] Configure environment variables (none for beta)
- [ ] Deploy to production

### **Week 9-10: Pro Tier Preparation**
- [ ] Create Firebase project
- [ ] Enable Authentication (Email + Google)
- [ ] Create Firestore database
- [ ] Add Firebase SDK to project
- [ ] Create Stripe account
- [ ] Set up $5/mo subscription product
- [ ] Set up $3/mo Early Bird product
- [ ] Configure Stripe webhooks
- [ ] Create Netlify function (stripe-webhook)
- [ ] Test payment flow (test mode)

### **Week 13: Launch Day**
- [ ] Activate Stripe (live mode)
- [ ] Update environment variables (live keys)
- [ ] Deploy usage tracking logic
- [ ] Test end-to-end flow (sign up → pay → use)
- [ ] Monitor errors (Sentry optional)

---

## 📝 Environment Variables

**.env (Local Development):**
```bash
# Firebase (Week 9+)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Stripe (Week 10+)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Analytics
VITE_GA_TRACKING_ID=G-XXXXXXXXXX
```

**Netlify Environment Variables:**
```bash
# Same as .env, but configured in Netlify dashboard
# Build settings → Environment → Environment variables
```

---

## 🧪 Testing Strategy

### **Manual Testing (Week 12):**

**Free User Flow:**
1. Visit site (anonymous)
2. Upload PDF (10 pages)
3. Click AI Auto-Fix → Check usage: 1/10
4. Click Save → Check usage: 2/10
5. Repeat 8 more times → Check usage: 10/10
6. Try AI Auto-Fix → Expect upgrade modal
7. Try Save → Expect upgrade modal

**Pro User Flow:**
1. Sign up (email + password)
2. Upgrade to Pro (test mode payment)
3. Upload PDF (100 pages)
4. Click AI Auto-Fix → No usage limit
5. Click Save → No usage limit
6. Check Firestore: `isPro = true`

**50 Page Limit:**
1. Visit site (anonymous)
2. Upload PDF (100 pages)
3. Click Save → Expect page limit modal
4. Option 1: Process 50 pages → Success
5. Option 2: Upgrade to Pro → Redirect to payment

**Month Reset:**
1. Set usage to 10/10 (manually in localStorage)
2. Change month in localStorage to previous month
3. Refresh page → Check usage: 0/10

---

## 📊 Analytics Events

**Google Analytics 4 Events:**

```typescript
// Track AI Auto-Fix usage
gtag('event', 'auto_fix_click', {
  user_type: user?.isPro ? 'pro' : 'free',
  remaining_count: FREE_LIMIT - usage.adjustments,
});

// Track save/export
gtag('event', 'file_export', {
  format: 'pdf' | 'jpg' | 'png' | 'webp',
  user_type: user?.isPro ? 'pro' : 'free',
  page_count: files.length,
});

// Track upgrade modal shown
gtag('event', 'upgrade_modal_shown', {
  reason: 'limit_reached' | 'page_limit',
});

// Track upgrade click
gtag('event', 'upgrade_click', {
  source: 'modal' | 'header' | 'page_limit',
});

// Track successful subscription
gtag('event', 'purchase', {
  transaction_id: session.id,
  value: 5.00,
  currency: 'USD',
  items: [{ item_name: 'Pro Subscription', price: 5.00 }],
});
```

---

**Document Version:** 1.0
**Last Updated:** 2025-01-27
**Next Review:** Week 10 (Stripe integration)
