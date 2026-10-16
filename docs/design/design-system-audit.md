# BrokeNoMore Design System Audit: Obsidian Ledger

**Version:** 2.0  
**Status:** Audit & Specification Complete  
**Design Direction:** **Obsidian Ledger** (calm financial precision, restrained neutrals, emerald primary, functional amber/rose, tabular money, limited surfaces)

---

## 1. Current Tokens & Raw-Value Violations

### 1.1. Color Violations
Currently in `src/app/globals.css`, color variables are declared in OKLCH within `:root`. However:
1. **No Light Theme Tokens:** `:root` defines dark values only. When the OS or user requests light mode, the UI either stays dark or suffers unreadable contrast because semantic mapping for `.light` is completely absent.
2. **Raw Tailwind Color Classes:** Several feature files use raw arbitrary colors or unmapped tailwind shades (e.g. `bg-emerald-500`, `text-amber-400`, `border-zinc-800`, `bg-secondary/50`) instead of semantic tokens (`--color-primary`, `--color-warning`, `--color-border`).

### 1.2. Typography & Numerical Tokens
1. **Tabular Numerals:** The `@utility money` rule sets `font-variant-numeric: tabular-nums`. However, several financial labels in `plan-view.tsx` and `activity-view.tsx` omit this utility class, resulting in jittery widths when numbers change.
2. **Khmer Font Sizing & Line Height:** `body` defines `font-family: var(--font-sans, "Manrope", "Noto Sans Khmer", ...)`. In Khmer script, complex consonant clusters and vowel sub/superscripts (e.g., ្, ិ, ី) require 15–20% additional line-height to prevent vertical clipping. Using the English 22px line height causes text crowding and clipped ascenders/descenders.

### 1.3. Spacing, Radius & Elevation
- Spacing follows a 4px grid in theory, but views exhibit irregular gaps (`gap-7`, `p-5`, `pb-32`).
- Containers overuse rounded cards: every section is wrapped in `rounded-2xl border border-border bg-card`, violating the PRD directive to **use fewer, more meaningful containers** and avoid "bento card fatigue."

---

## 2. Token System Recommendations

### 2.1. Semantic Palette (OKLCH)

```css
/* Dark Mode (Obsidian Ledger) */
:root, .dark {
  --background: oklch(0.14 0.01 250);       /* Deep Obsidian */
  --foreground: oklch(0.96 0.005 250);     /* Off-White */
  --surface: oklch(0.18 0.012 250);        /* Elevated Surface */
  --surface-border: oklch(0.26 0.015 250); /* Precision Border */
  --primary: oklch(0.78 0.14 162);         /* Ledger Emerald */
  --primary-foreground: oklch(0.16 0.03 162);
  --warning: oklch(0.82 0.13 75);          /* Amber Re-pace */
  --warning-foreground: oklch(0.20 0.04 75);
  --destructive: oklch(0.70 0.16 25);      /* Rose Attention */
  --destructive-foreground: oklch(0.18 0.03 25);
  --muted: oklch(0.22 0.012 250);
  --muted-foreground: oklch(0.72 0.015 250);
}

/* Light Mode (Parchment Precision) */
.light {
  --background: oklch(0.98 0.003 90);      /* Calm Warm Linen */
  --foreground: oklch(0.18 0.01 250);      /* Deep Ink */
  --surface: oklch(1.0 0 0);               /* Crisp White */
  --surface-border: oklch(0.90 0.005 90);  /* Soft Rule */
  --primary: oklch(0.48 0.13 162);         /* Deep Emerald */
  --primary-foreground: oklch(0.99 0 0);
  --warning: oklch(0.55 0.14 70);          /* Amber Ochre */
  --warning-foreground: oklch(0.99 0 0);
  --destructive: oklch(0.52 0.17 25);      /* Muted Crimson */
  --destructive-foreground: oklch(0.99 0 0);
  --muted: oklch(0.94 0.005 90);
  --muted-foreground: oklch(0.46 0.01 250);
}
```

### 2.2. Type Scale Table

| Token | Mobile | Desktop Admin | Font Family | Usage |
|---|---|---|---|---|
| `display-money` | 48/52, 750 | 44/48, 750 | Geist Mono / Tabular | Safe-spend hero figure only |
| `page-title` | 24/30, 650 | 28/34, 650 | Geist Sans / Noto Sans Khmer | Unique `h1` per page |
| `section-title` | 18/24, 650 | 18/24, 650 | Geist Sans / Noto Sans Khmer | Section headers |
| `body` | 16/24 (En), 16/28 (Km) | 14/21, 400 | Geist Sans / Noto Sans Khmer | Body copy & explanations |
| `label` | 14/20, 550 | 13/18, 550 | Geist Sans | Form controls, table headers |
| `meta` | 12/16, 500 | 12/16, 500 | Geist Mono / Tabular | Timestamps, counters |

---

## 3. Component Hierarchy & Ownership

```
Primitives (shadcn / Radix)
  ├── Button (44px min touch target, high-contrast states)
  ├── Dialog / Sheet (Purchase Check Drawer, Mobile Nav)
  ├── Progress (Multi-tone ledger bar)
  ├── Separator & Input
  └── Skeleton (Content placeholders)

Composites
  ├── AppShell (Responsive sidebar + bottom navigation + header)
  ├── LedgerMetric (Display money + label + pace indicator)
  ├── OfflineBanner (Connectivity alert)
  └── ConfirmationDialog (Consequence-aware irreversible actions)

Feature Components
  ├── TodayView (Hero safe spend + Quick Add + Why calculation)
  ├── CheckPanel (Keypad calculator + impact projection)
  ├── ActivityTimeline (Filterable, reverse-action spending log)
  ├── ProgressView (Discipline trend, streaks, opt-in league)
  └── AdminAttentionQueue (High-severity operational triage)
```

---

## 4. State Matrix Specification

Every component must explicitly handle and be visually tested across:

1. **Default / Populated:** Primary state with normal financial data.
2. **Loading / Hydrating:** Pulse skeleton layout matching final heights to prevent Cumulative Layout Shift (CLS).
3. **Empty:** Contextual explanation + single affirmative primary action (never a dead end).
4. **No-Results (Filtering):** Search or filter term feedback with "Clear filter" button.
5. **Error / Failed:** Human-readable message explaining the issue + retry action (no raw technical traces).
6. **Stale / Re-validating:** Subtle sync spinner or badge while background query updates.
7. **Offline:** Non-intrusive persistent status bar; disable destructive actions, allow optimistic local logs with pending indicator.
8. **Permission Denied:** Explanatory banner; redirect to dashboard or request access flow.
