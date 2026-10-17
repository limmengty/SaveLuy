# ADR: Brand Migration to SaveLuy

**Status:** Accepted  
**Date:** 2026-10-17  
**Context:** Product Rebranding from BrokeNoMore to SaveLuy  

---

## 1. Context & Problem Statement
The application previously operated under the working title **BrokeNoMore**. While descriptive of deficit-escape, the brand tone carried deficit and shame connotations ("broke", "act broke") which contradict our primary value proposition: **calm, dignity-driven, mathematical clarity over historical guilt**. 

Additionally, the project is deployed in Cambodia (`en-KH`, `km-KH`) with multi-currency support (USD / KHR). The name **SaveLuy** ("Luy" / លុយ being the natural, culturally embraced term for money/funds in Cambodia) establishes an approachable, dignified, and encouraging identity.

The challenge is executing this transition without disrupting:
1. Existing authenticated user sessions and Google OAuth flows.
2. LocalStorage simulation data for guest/local users.
3. Supabase relational database foreign keys, policies, and queries.
4. Installed Progressive Web App (PWA) caches and icons on mobile devices.

---

## 2. Decision Drivers
- **Zero Downtime & Zero Data Loss:** Never wipe user plans, transactions, or preferences during rebrand.
- **Brand Consistency:** Canonical name is strictly `SaveLuy`. "Luy" is never translated in Khmer or English.
- **Architectural Isolation:** Keep database table schemas and Supabase project URLs intact to eliminate infrastructure risks.
- **PWA & Offline Safety:** Provide backwards-compatible storage fallbacks so installed PWAs update gracefully.

---

## 3. Decisions & Technical Architecture

### 3.1. Canonical Brand Nomenclature
- User-facing name: `SaveLuy`
- Package name: `saveluy`
- Storage prefix: `saveluy.`
- Primary Tagline (EN): *"Know what you can safely spend today."*
- Primary Tagline (KM): *"ដឹងពីចំនួនទឹកប្រាក់ដែលអ្នកអាចចាយបានដោយសុវត្ថិភាពនៅថ្ងៃនេះ។"*

### 3.2. Two-Way Transparent Storage Migration
To guarantee that users with active guest plans don't lose data:
```typescript
// Read order:
const state = localStorage.getItem("saveluy.state.v1") 
  || localStorage.getItem("brokenomore.state.v2");

// On subsequent writes:
localStorage.setItem("saveluy.state.v1", serialized);
```
On intentional sign-out or "Reset demo data", both legacy and new keys are cleared.

### 3.3. Database & Supabase Protection
- **No Table/Column Renames:** Database tables remain `plans`, `transactions`, `profiles`, etc. 
- **User Display Name Fallback:** In `public.handle_new_user()`, default fallback is updated to `'SaveLuy User'` for new signups. Existing user rows remain untouched.

### 3.4. Logo Architecture
A new, original brand mark (`<SaveLuyMark />`) is introduced:
- Geometry: A protective open wallet contour with twin parallel ledger lines intersecting to form a calm, continuous "S" path.
- Implementation: Scalable vector with `currentColor`, viewBox `0 0 32 32`, optimized for ultra-sharp rendering at 20px, 24px, 32px, and 180px.

---

## 4. Consequences
- **Positive:** Dignified, encouraging brand positioning; seamless continuity for all existing users; 100% test and build reliability preserved.
- **External Dependencies:** Requires updating App Name in Google Cloud Console and updating Site URL / Redirects in Supabase Dashboard upon domain launch.
