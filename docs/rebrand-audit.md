# SaveLuy Brand Migration Audit: BrokeNoMore to SaveLuy

**Date:** 2026-10-17  
**Principal Brand Designer, UX Engineer & Senior Next.js Developer:** Antigravity  
**Target Identity:** SaveLuy (`saveluy`, `@saveluy/app`, `saveluy.app`)  
**Status:** Audit Complete — Phase 0  

---

## 1. Executive Summary & Inventory Overview

This audit catalogs every reference to the legacy brand **BrokeNoMore** across the application repository, documentation, database migrations, authentication pipelines, storage keys, and external platform configurations.

### Canonical Product Nomenclature
- **User-facing Product Name:** `SaveLuy` (Never "saveLuy", "Saveluy", "Save Luy", or "SAVE LUY")
- **Product Wordmark:** `SaveLuy`
- **Lowercase Technical Identifier:** `saveluy`
- **Hyphenated Identifier:** `save-luy`
- **Package Name:** `saveluy`
- **PWA Short Name:** `SaveLuy`
- **Production Target Domain:** `saveluy.app`
- **Vercel Temporary Domain:** `saveluy.vercel.app` (with fallback to `broke-no-more-o1al.vercel.app` redirect)
- **Environment Prefix:** `SAVELUY_`
- **Storage Namespace:** `saveluy`

> [!NOTE]
> **"Luy"** (លុយ - Khmer for money/funds) is part of the brand name and must remain unmodified in both Khmer and English interfaces. Surrounding taglines are localized naturally, but **SaveLuy** is brand-immutable.

---

## 2. Complete Reference Classification Matrix

Every reference has been classified into one of five mandatory operational tiers:
1. **Tier A: Change Immediately** (User-facing UI, page metadata, icons, brand assets, app copy, manifest).
2. **Tier B: Preserve Temporarily for Compatibility** (Storage key read fallbacks, existing redirect allow-lists).
3. **Tier C: Rename Only After Deployment Approval** (Repository name, Vercel project name, production domain).
4. **Tier D: Internal Identifier to Remain Unchanged** (Postgres table names, Supabase project ref `tfjqwsjisvxbcdqoacbs`).
5. **Tier E: Manual External Console Tasks** (Google Cloud Console OAuth app name & logo, Supabase Auth URL config).

---

### Classification Inventory

| Location / File | Current Reference | Tier | Action & Rationale |
| :--- | :--- | :--- | :--- |
| `package.json` | `"name": "brokenomore-app"` | **Tier A** | Update to `"saveluy"`. Clean build manifest. |
| `src/app/layout.tsx` | `"BrokeNoMore — What can I spend today?"` | **Tier A** | Update to `"SaveLuy — Know what you can safely spend today."` |
| `src/app/layout.tsx` | `appleWebApp.title: "BrokeNoMore"` | **Tier A** | Update to `"SaveLuy"`. Native iOS home screen label. |
| `src/app/manifest.ts` | `name: "BrokeNoMore — ..."` | **Tier A** | Update to `name: "SaveLuy — Know what you can safely spend today."`. |
| `src/app/manifest.ts` | `short_name: "BrokeNoMore"` | **Tier A** | Update to `short_name: "SaveLuy"`. PWA icon caption. |
| `src/messages/en-KH.json` | `"appName": "BrokeNoMore"` | **Tier A** | Update to `"SaveLuy"`. Canonical brand wordmark in header/nav. |
| `src/messages/en-KH.json` | `"disclaimer": "BrokeNoMore records..."` | **Tier A** | Update to `"SaveLuy records your plan. It doesn't move real money."` |
| `src/messages/km-KH.json` | `"appName": "BrokeNoMore"` | **Tier A** | Update to `"SaveLuy"` (Preserve Luy unchanged in Khmer). |
| `src/messages/km-KH.json` | `"disclaimer": "BrokeNoMore កត់ត្រា..."` | **Tier A** | Update to `"SaveLuy កត់ត្រាផែនការរបស់អ្នក មិនផ្ទេរប្រាក់ពិតប្រាកដទេ។"` |
| `src/components/app-shell/app-shell.tsx` | `Broke<span className="text-primary">No</span>More` | **Tier A** | Replace with new SaveLuy brand mark & wordmark component (`SaveLuy`). |
| `src/components/app-shell/app-shell.tsx` | `aria-label="BrokeNoMore Home"` | **Tier A** | Update to `aria-label="SaveLuy Home"`. |
| `src/features/auth/login-view.tsx` | `Broke<span className="text-primary">No</span>More` | **Tier A** | Replace with SaveLuy brand lockup & wordmark component. |
| `src/features/auth/login-view.tsx` | `brokenomore.app/today` (in mockup) | **Tier A** | Update URL mockup pill to `saveluy.app/today`. |
| `src/features/auth/login-view.tsx` | `© 2026 BrokeNoMore` | **Tier A** | Update to `© 2026 SaveLuy`. |
| `src/features/admin/admin-shell.tsx` | `BrokeNoMore Admin` | **Tier A** | Update to `SaveLuy Admin Console`. |
| `src/app/[locale]/(app)/*/page.tsx` | `title: "BrokeNoMore — Today"` etc. | **Tier A** | Update to `title: "SaveLuy — Today"` / `"SaveLuy — ថ្ងៃនេះ"`. |
| `src/app/[locale]/(marketing)/login/page.tsx` | `title: "BrokeNoMore — Sign In"` | **Tier A** | Update to `title: "SaveLuy — Sign In"` / `"SaveLuy — ចូលគណនី"`. |
| `src/app/icon.tsx` & `apple-icon.tsx` | Letter "B" monogram glyph | **Tier A** | Replace with new geometric SaveLuy "S" shield ledger symbol. |
| `public/icon.svg` | Letter "B" logo asset | **Tier A** | Create and replace with `SaveLuy` vector mark asset. |
| Brand Component Assets | *Missing brand directory* | **Tier A** | Create `components/brand/save-luy-mark.tsx`, `save-luy-wordmark.tsx`, `save-luy-lockup.tsx`. |
| `src/lib/wealth-engine/provider.tsx` | `STORAGE_KEY = "brokenomore.state.v2"` | **Tier B** | Implement two-way backward-compatible migration to `saveluy.state.v1`. Read old key if new key empty. |
| `src/features/onboarding/*.tsx` | `brokenomore.draft.income` & `brokenomore.draft.template` | **Tier B** | Transparently read old draft keys before writing to `saveluy.draft.*`. |
| `src/features/settings/settings-view.tsx` | `localStorage.removeItem("brokenomore.state.v2")` | **Tier B** | Clean both `saveluy.state.v1` and legacy `brokenomore.state.v2` on logout/reset. |
| `src/app/auth/callback/route.ts` | Redirect fallback domain | **Tier B** | Keep `broke-no-more-o1al.vercel.app` in allowed origin checks until new domain configured. |
| Supabase DB `profiles.display_name` default | `'BrokeNoMore User'` (trigger fallback) | **Tier B** | Update default in function `handle_new_user()` to `'SaveLuy User'` for new signups. Old rows untouched. |
| Supabase Database Schema | `public.plans`, `public.transactions`, etc. | **Tier D** | **REMAIN UNCHANGED.** Do not rename database tables, columns, or triggers to prevent data loss. |
| Supabase Project Reference | `tfjqwsjisvxbcdqoacbs` | **Tier D** | **REMAIN UNCHANGED.** Remote cloud infrastructure connection. |
| Google OAuth Client ID & Secrets | Client ID `958655188947-...` | **Tier D/E** | Keep active credentials; update App Name to "SaveLuy" in Google Cloud Console. |
| Google Cloud Console | App Name: "BrokeNoMore" | **Tier E** | Change to "SaveLuy", upload square 512x512 SaveLuy icon. |
| Supabase Auth URL Configuration | Site URL & Redirect allow-list | **Tier E** | Add `https://saveluy.app` and `https://saveluy.vercel.app` when deployed. |

---

## 3. Brand Identity Specifications (SaveLuy)

### Core Positioning
SaveLuy helps individuals protect their essential obligations (rent, bills, future goals) and spend the remaining balance with daily mathematical confidence.

### Visual Voice
- **Tone:** Calm, trustworthy, practical, approachable, grounded.
- **Palette:** Obsidian ledger canvas (`#0b0f17`), pure emerald accent (`#10b981`), secondary slate (`oklch(0.22 0.014 250)`).
- **Core Geometry:** Protective open wallet / rounded shield contour intersecting with two parallel ledger lines that form an elegant minimalist "S" contour.
- **Monochrome & Small Scale:** Readable down to 16×16px (favicon) and 24×24px (mobile header mark).
