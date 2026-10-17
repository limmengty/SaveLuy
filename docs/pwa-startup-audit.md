# PWA Startup & Shell Audit

**Target Viewport:** 390 × 844 CSS px  
**Date:** 17 October 2026  
**Auditor:** Principal PWA Engineer  
**Status:** Complete (Phase 0)

---

## 1. PWA Manifest & Launch Configuration

### Current Manifest (`src/app/manifest.ts`)
```typescript
{
  name: "BrokeNoMore — What can I spend today?",
  short_name: "BrokeNoMore",
  description: "A calm daily spending decision system with instant capture and purchase impact checking.",
  start_url: "/",
  display: "standalone",
  background_color: "#0b0f17",
  theme_color: "#10b981",
  orientation: "portrait",
  categories: ["finance", "lifestyle", "productivity"],
  icons: [
    { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" }
  ]
}
```

### Critical Findings & Deficiencies
1. **SVG Only for PWA Icons:**
   - While modern desktop Chromium supports SVG icons in manifests, iOS Safari and older Android WebAPK packagers require concrete raster PNG icons (specifically 192 × 192 and 512 × 512 with explicit maskable safe zones).
   - `apple-icon.tsx` dynamically generates a 180 × 180 PNG, but static links for standalone home-screen icons must be declared in root HTML `<head>`.
2. **Missing iOS Startup Images (`apple-touch-startup-image`):**
   - iOS WebKit in standalone mode launches a blank window until the first frame is painted by the rendering engine unless `apple-touch-startup-image` link tags matching the device's exact screen dimensions and pixel ratios are supplied.
   - For an iPhone 14/15/16 (390 × 844 at 3x DPR: 1170 × 2532 px), the absence of a startup image causes a 500ms–1500ms white or black flash.
3. **External Font Blocking:**
   - `src/app/layout.tsx` lines 37–40 import Google Fonts via external `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?...">`.
   - On slow mobile networks or offline restarts, this external network request blocks CSSOM construction and delays First Contentful Paint (FCP).
   - Solution: Self-host fonts using Next.js `next/font/google` with `display: 'swap'` and subsets.

---

## 2. White-Screen Analysis & Zero-Blank Architecture

### Root Causes of White-Screen Flash
1. **Absence of Server-Rendered Route Skeletons (`loading.tsx`):**
   - Routes in `(app)/` and `(onboarding)/` lacked co-located `loading.tsx` files.
   - When a user opens the PWA, Next.js App Router waits for the async Server Component (`AppGroupLayout` auth check and `TodayPage` params resolution) before rendering any DOM.
   - If network or Supabase token validation takes 400ms, the user sees nothing during that window.
2. **Client-Only Auth Gating Pattern (Historically):**
   - Previous versions of the app returned `if (!user) return null;` or a full-page spinner in client components while waiting for `supabase.auth.getUser()`.
   - The current architecture properly uses Server Components for auth redirection, but needs an immediate static shell painted by `loading.tsx`.
3. **Theme Hydration Flash:**
   - `ThemeProvider` in `src/app/layout.tsx` uses `attribute="class" defaultTheme="dark" enableSystem`.
   - While `suppressHydrationWarning` is on `<html>`, an inline theme bootstrapping snippet is necessary to guarantee that the canvas background color (`#0b0f17` in dark, `#f8f8f6` in light) is painted before React hydrates.

### Three-Layer Launch Model
```text
┌────────────────────────────────────────────────────────┐
│ Layer 1: Native OS Launch Surface                      │
│ - manifest background_color (#0b0f17)                  │
│ - apple-touch-startup-image (exact 390x844 @3x)        │
└───────────────────────────────────┬────────────────────┘
                                    │ Instant (0 ms)
┌───────────────────────────────────▼────────────────────┐
│ Layer 2: Server-Rendered App Shell (loading.tsx)       │
│ - Viewport-fit cover container                         │
│ - Safe-area top padding + Header brand mark            │
│ - Skeleton Available Today card + Quick Add chips      │
│ - Static glass bottom dock                             │
└───────────────────────────────────┬────────────────────┘
                                    │ Streamed (<250 ms)
┌───────────────────────────────────▼────────────────────┐
│ Layer 3: Dynamic Authenticated Route Content           │
│ - Hydrated calculations, user avatar, real transactions│
│ - Smooth crossfade into live state                     │
└────────────────────────────────────────────────────────┘
```

---

## 3. Safe-Area & Viewport Ownership

### Current Viewport Metadata (`src/app/layout.tsx`)
```typescript
export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};
```
- `viewportFit: "cover"` is correctly declared.
- However, safe area insets were handled haphazardly:
  - Header: did not incorporate `env(safe-area-inset-top)` into height or padding. In standalone mode on iOS, the dynamic island / notch overlapped the app title.
  - Dock: applied `pb-[env(safe-area-inset-bottom)]`, but did not reserve a unified bottom clearance token for scroll containers.
  - Document scrolling was unbounded on `window`, allowing iOS rubber-banding to pull the status bar behind unpadded content.

### Required Architecture: Unified Shell Layout
```text
html/body: fixed viewport; overflow: hidden; height: 100dvh
└── AppShell (100dvh, flex flex-col)
    ├── Header (fixed height + env(safe-area-inset-top), outside scroll root)
    ├── Main Scroller (flex-1 overflow-y-auto overscroll-y-contain)
    │   └── Content Container (pb-[calc(4.5rem+env(safe-area-inset-bottom)+1rem)])
    └── Glass Bottom Dock (fixed bottom-0, pb-[env(safe-area-inset-bottom)], outside scroll root)
```

---

## 4. Service Worker & Caching Rules

- **Static Assets (`/_next/static/*`, `/fonts/*`, `/icon.svg`):**
  - Cache-first strategy with versioned hashes.
- **HTML Navigation Requests (`/today`, `/plan`, etc.):**
  - Network-first with immediate offline fallback page.
  - Private user financial HTML must never be stored in a shared or public cache.
- **Supabase API Requests (`*.supabase.co`):**
  - Network-only. Offline writes queue into client IndexedDB / `WealthEngine` state with idempotency keys.

---

## 5. Startup Budgets & Verification Metrics

| Metric | Target Budget | Current Baseline (Estimated) |
|---|---|---|
| **White-Screen Flash** | **0 ms** (Theme-matched canvas immediately) | 600–1200 ms |
| **First Contentful Paint (FCP)** | **< 800 ms** (Throttled 4G) | ~1400 ms |
| **Largest Contentful Paint (LCP)** | **≤ 2.0 s** | ~2.4 s |
| **Interaction to Next Paint (INP)** | **< 100 ms** | < 80 ms (Clean React state) |
| **Cumulative Layout Shift (CLS)** | **< 0.05** | < 0.02 (Font metric matching required) |
