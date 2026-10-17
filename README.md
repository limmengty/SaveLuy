# SaveLuy (សន្សំលុយ)

> **Know what you can safely spend today.**  
> *ដឹងពីចំនួនទឹកប្រាក់ដែលអ្នកអាចចាយបានដោយសុវត្ថិភាពនៅថ្ងៃនេះ។*

SaveLuy is a calm, dignity-driven daily spending decision engine built as an offline-capable Progressive Web App (PWA). Instead of retrospective expense tracking that induces financial guilt, SaveLuy answers one simple question every morning: **"What can I safely spend today?"**

---

## 🌟 Core Philosophy & Design Principles

1. **Forward-Looking Clarity Over Historical Guilt**: SaveLuy does not shame you for past spending. It dynamically recalculates your remaining safe daily allowance so you always stay in control.
2. **Mathematical Feasibility**: Enforces real-time balance constraints:
   $$\text{Protected Monthly} + \left(\text{Weekly Flexible} \times \frac{52}{12}\right) \le \text{Monthly Flexible Income}$$
3. **Zero Floating-Point Precision Drift**: All financial figures are strictly calculated and stored in **integer minor units (cents)** end-to-end. Localized currency formatting occurs only at the final display layer.
4. **Pre-Purchase Impact Checking**: Test the impact of a potential purchase before spending, with a 24-hour delayed cooling-off list for impulse purchases.
5. **Emergency Vault Protection**: A dedicated, audit-logged emergency unlock mechanism allows accessing protected funds during genuine crises without breaking base recurring envelopes.

---

## ✨ Features

- **☀️ Today View**: Live remaining safe-to-spend amount, daily baseline calculation, and 1-tap quick transaction capture.
- **🛡️ Purchase Impact Check**: See how an expense affects your daily allowance for the rest of the week before buying. Includes a **24-Hour Wait List** to curb impulse buying.
- **📋 Plan & Strategy Templates**: Mathematically balanced allocation templates (*Balanced Starter*, *Safety First*, *Flex Forward*) that automatically adapt to your declared income.
- **📜 Activity & Transaction Feed**: Chronological transaction history grouped by day, with instant 1-tap undo and URL-sharable filter state via `nuqs`.
- **🔄 Weekly Review & Pacing Momentum**: Weekly reset workflow, discipline streak tracking, and an anonymous, privacy-safe community pacing league.
- **🇰🇭 Dual-Language & Multi-Currency**: Full internationalization for English (`en-KH`) and Khmer (`km-KH`), with native support for USD (`$`) and Cambodian Riel (`៛`).
- **📱 PWA & Offline First**: Standalone display mode, iOS safe-area handling, zero white-screen startup images, and durable local storage with transparent legacy migration.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Runtime & Package Manager**: [Bun](https://bun.sh/)
- **UI & Styling**: [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/), [Radix UI](https://www.radix-ui.com/)
- **Icons & Illustrations**: [Lucide React](https://lucide.dev/) & bespoke architectural SVG vector illustrations
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL with RLS, Google OAuth, Avatar Storage bucket)
- **Localization**: [next-intl](https://next-intl-docs.vercel.app/) (`en-KH` & `km-KH`)
- **State & URL Sync**: [nuqs](https://nuqs.47ng.com/) (type-safe URL search params)
- **Validation**: [Zod 4](https://zod.dev/) & React Hook Form
- **Testing**: Bun Test (Unit & Financial Invariants) & Playwright (E2E User Journeys)

---

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (v1.2+) installed on your machine.
- A [Supabase](https://supabase.com/) project (optional for local guest testing; required for cloud sync & authentication).

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/limmengty/SaveLuy.git
cd SaveLuy
bun install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App Environment
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Note**: For offline local development, SaveLuy includes an automatic guest fallback mode that runs seamlessly using local storage when Supabase is not connected.

### 3. Run the Development Server

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) (or the active port shown in terminal) to view the app in your browser.

---

## 🧪 Testing & Verification

Run the test suite and quality verification commands:

```bash
# Run TypeScript compilation and strict type checks
bun run typecheck

# Run unit tests (Financial integrity, template generators, wealth engine calculations)
bun test

# Run End-to-End browser tests with Playwright
bun run test:e2e

# Build production bundle with Turbopack
bun run build
```

---

## 📂 Project Structure

```
├── docs/                      # Architectural Decision Records (ADRs) and technical audits
├── public/                    # Brand assets, PWA icons, manifest, and service worker
├── src/
│   ├── app/                   # Next.js 16 App Router pages, localized routes ([locale])
│   ├── components/            # UI component library, AppShell, brand marks, and illustrations
│   │   ├── app-shell/         # Fixed top header, desktop sidebar, and mobile glass dock
│   │   ├── brand/             # Official SVG lockups, marks, and wordmarks
│   │   └── ui/                # Standardized shadcn/ui components (Input, Select, Textarea, etc.)
│   ├── features/              # Feature modules
│   │   ├── admin/             # Admin console and queue monitoring
│   │   ├── auth/              # Authentication and login views
│   │   ├── onboarding/        # First-time user onboarding & dynamic template generator
│   │   ├── planning/          # Plan view, strategy template switcher, emergency unlock modal
│   │   ├── purchase-check/    # Pre-purchase calculation panel & 24h wait list
│   │   ├── review/            # Weekly reset and surplus sweeps
│   │   ├── settings/          # Currency, language, theme, and profile preferences
│   │   └── transactions/      # Activity feed and transaction inspection modal
│   ├── lib/                   # Core business logic
│   │   ├── api/               # Supabase service layer and database queries
│   │   ├── money/             # Minor-unit currency parsing, formatting, and feasibility validation
│   │   ├── storage/           # Durable storage management and migration helpers
│   │   ├── validation/        # Zod schemas for forms and financial limits
│   │   └── wealth-engine/     # Deterministic daily pacing, envelope calculations, and state provider
│   └── messages/              # i18n localization dictionaries (en-KH, km-KH)
└── supabase/                  # Database migrations and storage policies
```

---

## 📄 License

This project is open-source software licensed under the [MIT License](LICENSE).
