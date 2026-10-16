# BrokeNoMore SVG & Motion Plan: Obsidian Ledger

**Version:** 2.0  
**Design Direction:** Obsidian Ledger  
**Goal:** Deliver purposeful financial feedback, spatial continuity, and custom line illustrations while guaranteeing zero cognitive fatigue and strict accessibility compliance.

---

## 1. Existing Asset & Motion Inventory

- **Current Animations:**
  - Single CSS keyframe `@keyframes fadeNum` in `src/app/globals.css` (220ms ease-out translateY + fade).
  - Reduced motion is handled via a blunt universal CSS override (`*, *::before, *::after { animation: none !important; transition: none !important; }`), which abruptly cuts transitions.
- **Current SVGs & Icons:**
  - Lucide icons (`lucide-react`) used exclusively (`Calculator`, `Home`, `PieChart`, `List`, `User`, `Lock`, `Plus`, `AlertTriangle`).
  - No bespoke illustrations or line artwork exist for empty states or celebratory milestones.
  - Quick add buttons use raw character emoji (`q.emoji`), violating the PRD directive: *"Avoid emoji as the primary icon system."*

---

## 2. "Ledger Lines" Custom SVG Asset List

All illustrations use a single cohesive aesthetic: **Ledger Lines**—1.5px to 2px continuous geometric stroke lines, 0-fill or subtle 5% emerald/neutral wash, and precise architectural drafting styling.

| Asset Name | Viewport / Size | Purpose | Accessible Treatment |
|---|---|---|---|
| `ledger-empty-activity.svg` | 160 × 120px | Displayed when no transactions exist in the period. Depicts an open, pristine ledger sheet with subtle guideline strokes. | `aria-hidden="true"`, accompanied by `<h2>No activity logged yet</h2>` |
| `ledger-empty-waitlist.svg` | 160 × 120px | Displayed when the 24h waitlist is empty. Depicts an hourglass aligned with a calendar ledger mark. | `aria-hidden="true"`, accompanied by `<h2>No items on cooldown</h2>` |
| `ledger-milestone-sweep.svg` | 200 × 140px | Displayed at Sunday Sweep review completion. Depicts balanced balance scales settling cleanly on an emerald pivot. | `aria-hidden="true"`, accompanied by `<h2>Week closed & balanced</h2>` |
| `ledger-lock-protected.svg` | 48 × 48px | Depicts protected vault funds (Home and Future fund) with dual keyhole line art. | `role="img" aria-label="Protected fund"` |
| `ledger-verdict-safe.svg` | 40 × 40px | Displayed in Purchase Check when purchase fits today's limit. | `aria-hidden="true"` |
| `ledger-verdict-repace.svg` | 40 × 40px | Displayed in Purchase Check when purchase adjusts the weekly pace. | `aria-hidden="true"` |

---

## 3. Motion Token Table

All transitions use standard physical spring or restrained easing curves. No bouncy "game" physics or unmotivated looping motions.

| Token | CSS / Transition Spec | Description & Use | Reduced-Motion Equivalent |
|---|---|---|---|
| `--motion-fast` | `150ms cubic-bezier(0.16, 1, 0.3, 1)` | Micro-interactions (button tap, checkbox, chip selection) | Instant (`0ms`) |
| `--motion-page` | `240ms cubic-bezier(0.16, 1, 0.3, 1)` | Route cross-fade and landmark container entrance | Cross-fade opacity only (`120ms`) |
| `--motion-drawer` | `320ms cubic-bezier(0.32, 0.72, 0, 1)` | Purchase Check bottom sheet slide-up | Instant opacity fade (`150ms`) |
| `--motion-number` | `200ms ease-out` | Numeric value transitions (odometer / tabular change) | Immediate value swap (`0ms`) |
| `--motion-undo` | `300ms ease-in-out` | Toast undo bar timer drain | Static countdown timer |

---

## 4. Interaction-by-Interaction Motion Plan

### 4.1. Safe Spend Calculation & Number Pacing
- **Trigger:** Adding an expense or tapping Undo.
- **Motion:** Old value fades up 4px as new value fades in from -4px using tabular numerals. Total duration 200ms.
- **Why:** Signals immediate recalculation without layout jitter.

### 4.2. Purchase Check Keypad & Impact Projection
- **Trigger:** Entering digits in Check Purchase.
- **Motion:** As digits are pressed, the verdict pill (Fits Today / Adjusts Week / Needs Decision) transitions color and copy with a smooth 180ms ease, and the "Next days" projection bar smoothly resizes.
- **Why:** Immediate visual feedback on financial consequences before committing.

### 4.3. Quick Add Optimistic Push & Undo Toast
- **Trigger:** Tapping a Quick Add chip.
- **Motion:** Chip provides an instant scale-down (0.97) on active press; toast appears at bottom with a progress indicator for the 5-second undo window. If undone, the newly prepended list item collapses height from 56px to 0px over 180ms.
- **Why:** Guarantees speed (<3s flow) while offering safety and spatial clarity.

---

## 5. Accessibility & Reduced Motion Verification

1. **`useReducedMotion()` Hook:** Integrate Motion for React's `useReducedMotion()` in animated components.
2. **Replacement Strategy:**
   ```tsx
   const shouldReduceMotion = useReducedMotion();
   const animate = shouldReduceMotion
     ? { opacity: 1 }
     : { opacity: 1, y: 0 };
   const initial = shouldReduceMotion
     ? { opacity: 0 }
     : { opacity: 0, y: 8 };
   ```
3. **No Trapped Animation:** No infinite or looping animations will run without a visible Pause/Stop control.
