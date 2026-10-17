# SaveLuy Brand Migration Checklist & Backlog

**Target Brand:** SaveLuy  
**Tracking File:** `docs/rebrand-todo.md`  

---

## Phase 0: Brand Audit & Architecture (Current)
- [x] Complete repository grep & reference audit across all filetypes (`docs/rebrand-audit.md`)
- [x] Classify all references into Tiers A–E
- [x] Formulate Architectural Decision Record (`docs/adr/ADR-save-luy-rebrand.md`)
- [x] Define migration backlog (`docs/rebrand-todo.md`)

---

## Phase 1: Brand Assets & Visual Identity Components
- [x] Create `src/components/brand/save-luy-mark.tsx`:
  - Minimal "S" path formed by twin ledger lines within a protective rounded shield/wallet contour.
  - `currentColor` support, size props, no external font dependencies, sharp at 20–24px.
- [x] Create `src/components/brand/save-luy-wordmark.tsx`:
  - "SaveLuy" exact typography with subtle weight contrast on "Save" (font-extrabold) and "Luy" (font-black text-primary).
- [x] Create `src/components/brand/save-luy-lockup.tsx`:
  - Integrated horizontal mark + wordmark responsive component with proper ARIA accessibility labels.
- [x] Generate Public Vector Brand Assets:
  - `public/brand/save-luy-mark.svg`
  - `public/brand/save-luy-logo-light.svg`
  - `public/brand/save-luy-logo-dark.svg`
  - `public/icon.svg`
- [x] Update App Router Dynamic Icon Handlers:
  - `src/app/icon.tsx` (Replace legacy "B" with SaveLuy shield-ledger geometric mark).
  - `src/app/apple-icon.tsx` (180×180px high-DPI iOS touch icon).

---

## Phase 2: Metadata, Manifest & Core App Shell Rebrand
- [x] Update Root Metadata in `src/app/layout.tsx`:
  - `title`: `"SaveLuy — Know what you can safely spend today."`
  - `appleWebApp.title`: `"SaveLuy"`
- [x] Update PWA Manifest in `src/app/manifest.ts`:
  - `name`: `"SaveLuy — Know what you can safely spend today."`
  - `short_name`: `"SaveLuy"`
  - `id`: `"saveluy-pwa-v1"`
  - Point icons to new SaveLuy assets.
- [x] Update Route Metadata across all subpages:
  - `src/app/[locale]/(app)/today/page.tsx`
  - `src/app/[locale]/(app)/plan/page.tsx`
  - `src/app/[locale]/(app)/activity/page.tsx`
  - `src/app/[locale]/(app)/progress/page.tsx`
  - `src/app/[locale]/(app)/review/page.tsx`
  - `src/app/[locale]/(app)/settings/page.tsx`
  - `src/app/[locale]/(marketing)/login/page.tsx`
  - `src/app/[locale]/admin/layout.tsx`
- [x] Update Navigation & Shell Components:
  - `src/components/app-shell/app-shell.tsx`: replace brand lockup with `<SaveLuyLockup />`.
  - `src/features/admin/admin-shell.tsx`: update header text to "SaveLuy Admin Console".

---

## Phase 3: Client Storage & Session Compatibility Migration
- [x] Create transparent storage migration utility in `src/lib/storage/migrate-storage.ts`:
  - Check for `saveluy.state.v1`.
  - If missing, check for legacy `brokenomore.state.v2`, migrate contents seamlessly, and set migration flag.
  - Transparently read onboarding draft keys `brokenomore.draft.*` -> `saveluy.draft.*`.
- [x] Update `src/lib/wealth-engine/provider.tsx`:
  - Use migrated state with zero data loss or session reset for existing users.
- [x] Update `src/features/settings/settings-view.tsx`:
  - Sign out cleans both old and new keys without error.

---

## Phase 4: Localization & Copy Refinement
- [x] Update `src/messages/en-KH.json`:
  - `common.appName`: `"SaveLuy"`
  - `review.disclaimer`: `"SaveLuy records your plan. It doesn't move real money."`
  - Clean up any legacy shame-based phrasing.
- [x] Update `src/messages/km-KH.json`:
  - `common.appName`: `"SaveLuy"` (Preserve "SaveLuy" exact).
  - `review.disclaimer`: `"SaveLuy កត់ត្រាផែនការរបស់អ្នក មិនផ្ទេរប្រាក់ពិតប្រាកដទេ។"`
- [x] Update `src/features/auth/login-view.tsx`:
  - Integrate new `<SaveLuyLockup />` and update hero mockup URL to `saveluy.app/today`.
  - Update copyright text to `© 2026 SaveLuy`.

---

## Phase 5: Verification & Quality Gates
- [x] Run `bun test src` (All 15 engine, financial, and template tests passed).
- [x] Run `bun run typecheck` (Zero TypeScript errors).
- [x] Run `bun run build` (Next.js Turbopack build passing all 33 routes).
- [ ] Document External Deployment Checklist (Google Cloud Console, Supabase Auth URLs, Vercel custom domain).
