# Architecture Decision Record (ADR): PWA App Shell, Viewport, and Safe Areas

**Status:** Accepted  
**Date:** 17 October 2026  
**Deciders:** Principal UX Engineer, Senior Next.js Engineer, PWA Specialist  
**Context:**  
BrokeNoMore is designed primarily as an installed mobile Progressive Web Application (PWA) with a primary viewport target of 390 × 844 CSS px (iOS Safari standalone & Android Chrome).

In previous iterations:
- App headers and status areas suffered from safe-area collisions with the iOS dynamic island/notch.
- In standalone mode, the entire marketing header was hidden inconsistently.
- Document scrolling on the root `window` caused erratic rubber-banding and overlapping bottom dock navigation on top of form inputs and interactive buttons.
- Cold launch exhibited white-screen flashes before hydration.

---

## Decision

1. **One Single App Shell Architecture:**
   - The root document (`html`, `body`) is locked to the viewport (`height: 100dvh`, `overflow: hidden`, `overscroll-behavior: none`).
   - The application layout (`AppShell`) owns the 100dvh viewport and provides a single internal vertical scroll root (`ScrollRoot` with `overflow-y: auto`, `overscroll-behavior-y: contain`, `-webkit-overflow-scrolling: touch`).
   - Top contextual app bar and bottom glass navigation dock are rendered **outside** the `ScrollRoot`.

2. **Unified Safe-Area Tokens:**
   - Viewport metadata declares `viewportFit: "cover"`.
   - Top clearance: Applied exclusively to the top app bar via `pt-[env(safe-area-inset-top)]` with a fixed base height (48px mobile, 64px desktop).
   - Bottom clearance: Applied exclusively to the bottom dock via `pb-[max(12px,env(safe-area-inset-bottom))]`.
   - Scroll clearance: The `ScrollRoot` content wrapper includes a mandatory bottom padding token:
     `pb-[calc(4.5rem+env(safe-area-inset-bottom)+1.5rem)]` ensuring the last interactive card or input can never be obscured by the bottom navigation dock.

3. **Standalone vs. Browser Mode Disambiguation:**
   - In standalone mode, hide only marketing banners or public landing previews.
   - Never globally hide all `<header>` elements. In standalone mode, render a compact contextual app bar displaying the view title, date, action trigger, and profile avatar.

4. **Zero-Blank PWA Startup Layering:**
   - Add Apple touch startup images matching major iOS viewports.
   - Paint a server-rendered layout skeleton via route-level `loading.tsx` immediately upon HTTP response.
   - Enforce server-side authentication redirection in `src/proxy.ts` and `src/app/[locale]/(app)/layout.tsx` before sending HTML, eliminating client-only `return null` gating.

---

## Consequences

- **Positive:**
  - Guaranteed zero collision with notch, dynamic island, and home indicator on iOS.
  - Native feel: no document rubber-banding behind status bar; fixed dock stays in place.
  - Form fields and buttons remain 100% visible and accessible even with mobile virtual keyboard open.
  - Startup time drops significantly with branded initial paint.
- **Trade-offs:**
  - Desktop browsers must ensure standard scrollbars remain styled and accessible inside the inner scroll container.
