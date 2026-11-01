# Migration Plan: Obsidian Ledger → Apple Design System

> Historical planning notes. The initial grouped-system implementation has since
> landed in `DESIGN.md` and `src/app/style.css`; the unchecked phase items below
> describe the pre-migration state and are not a current task list. Use those
> files as the maintained specification and implementation source of truth.

Goal: move BrokeNoMore / SaveLuy (a Next.js 16 + Tailwind v4 + Radix PWA) from the bespoke
"Obsidian Ledger" system to an Apple Human Interface Guidelines (HIG) aligned design system,
installed as the `apple-design` skill at `.agents/skills/apple-design`.

This plan sequences the work in the order the skill's improvement mode prescribes —
**accessibility → platform conventions → craft → polish** — so that nothing downstream is built
on a token core that a later accessibility fix will break.

---

## 0. Reality check before we start

The skill is explicit about scope, and it changes what "use Apple design" can honestly mean here:

> `SKILL.md › Step 1`: "A web app or an Android-only app gets the principles and the foundations
> (accessibility, color, typography, layout, writing) but **not Apple's platform conventions**.
> Say which parts apply."

So this is **not** "convert the app to SwiftUI." We adopt Apple's *foundations* as the new design
system and treat the *platform conventions* (tab bars, sheets, materials, safe areas) as a strong
reference to translate into web/PWA idioms — which is exactly what the skill's
`references/cross-platform.md` and `liquid-glass.md › Cross-platform translation` are for.

Concretely, we are migrating toward:

- Apple's **semantic color roles** (label / secondaryLabel / separator / systemGroupedBackground
  tiers) instead of one flat dark card palette.
- Apple's **Dynamic Type scale** (17 pt body default, 11 pt minimum) instead of a fixed 15 px body.
- Apple's **44×44 pt control** floor and safe-area respect.
- **Light + dark** as first-class, system-driven appearances (no dark-by-default lock-in).
- Apple's **materials** (Liquid Glass on the floating control layer only) — which means *reversing*
  the current `header-solid` / `glass-dock` decision that force-disables blur.
- Apple's **navigation grammar**: bottom tab bar for top-level nav, sheets for modal tasks.

What we deliberately **keep** from Obsidian Ledger, per the skill's craft lens (don't flatten
personality): the integer-cents money discipline, the `.money` tabular-numeral column alignment,
the Khmer-first bilingual typography tuning, and the calm/non-shaming tone from PRODUCT.md. The
HIG asks for a point of view, not a beige clone — Apple's own `branding.md` says identity lives in
color, type, and a few moments while controls stay familiar. Our signature element (the hero
"Available Today" number) survives; it just stops being the only bright thing on an all-dark
canvas.

---

## Phase 1 — Accessibility floor (Critical, do first)

Everything in this phase is a `Critical` finding class in the skill's Lens 1. Nothing visual is
decided here; we only remove failures so later phases inherit a survivable baseline.

- [ ] **1.1 Undo the zoom lock.** `src/app/layout.tsx` viewport sets `maximumScale: 1,
  userScalable: false`. That blocks pinch-zoom, a Dynamic Type / text-scaling failure. Remove both
  (keep `viewport-fit: cover` for safe areas).
  > `accessibility.md › Dynamic Type` / `SKILL.md › Lens 1`: "Text scales with the system setting
  > and layouts survive the largest sizes with hierarchy intact."
- [ ] **1.2 Establish the 44pt control floor as a token, not a wish.** Keep the existing
  `spacing.touch-min: 44px` from DESIGN.md but make it enforceable: audit the tab bar, keypad keys,
  and quick-tap grid in `app-shell.tsx` / `check-panel.tsx` and lift any hit target below 44×44.
  > `SKILL.md › Lens 1`: "Controls: mobile default 44 by 44 pt, minimum 28 by 28 pt."
- [ ] **1.3 De-risk color-only status.** The three verdicts (Fits today / Adjusts the week / Needs
  a decision) currently lean on emerald/amber/crimson. Confirm each carries a text label and an
  icon glyph, never hue alone. PRODUCT.md's "no shame" rule already wants this.
  > `color.md › Inclusive color`: "Avoid relying solely on color to differentiate between objects,
  > indicate interactivity, or communicate essential information."
- [ ] **1.4 Contrast pass with real numbers.** The emerald `oklch(0.78 0.14 162)` on obsidian and
  the amber `oklch(0.82 0.13 75)` on dark must clear **4.5:1** for ≤17pt body and **3:1** for
  ≥18pt/bold. Compute from the actual OKLCH→sRGB values, don't eyeball. Keep the existing
  `prefers-reduced-motion` kill-switch in `globals.css:303`.
  > `color.md` / `dark-mode.md › Aim for sufficient color contrast`: minimum 4.5:1, target 7:1.

**Gate:** largest-text-size screenshot of Today + Check screens still legible, hierarchy intact, no
truncation. Commit before Phase 2.

---

## Phase 2 — Token core: rewrite `globals.css` around semantic roles

This is the keystone. The whole palette lives in **one file** (`src/app/globals.css`), so the
highest-leverage move is to redefine the `:root`/`.light`/`.dark` custom properties to Apple's
semantic set, then let everything downstream (the 113 `bg-card`, 213 `border-border`, charts via
`var(--chart-*)`) re-skin automatically without touching feature files yet.

- [ ] **2.1 Add Apple's foreground role ladder.** Introduce `--label`, `--label-secondary`,
  `--label-tertiary`, `--label-quaternary`, `--placeholder`, `--separator`, `--link` as the new
  semantic tokens. Map the old `--foreground`/`--muted-foreground` onto this ladder. This is the
  direct translation of `color.md › Mobile (iOS, iPadOS)` foreground table.
- [ ] **2.2 Add background tiering.** Replace the single flat `--card` elevation with Apple's
  grouped tiers: `--bg-grouped` (primary), `--bg-grouped-secondary` (card), `--bg-grouped-tertiary`
  (nested/inner). Keep the "no card-in-card clutter" rule from DESIGN.md by *using* the tiers for
  real hierarchy rather than nesting borders.
  > `color.md › Mobile`: "Primary for the overall view, Secondary for grouping content, Tertiary
  > for grouping within secondary."
- [ ] **2.3 Make light and dark both real.** Today `:root, .dark` are merged, so dark is the
  default canvas and `.light` is an override patch. Split them into genuine paired definitions so
  each semantic token has an explicit light and dark value, and add an increased-contrast variant
  hook (`@media (prefers-contrast: more)`).
  > `dark-mode.md › Embrace colors that adapt`: supply bright and dim variants; avoid hard-coded
  > values that don't adapt.
- [ ] **2.4 Switch the appearance driver from dark-default to system.** In
  `src/components/theme-provider.tsx` change `defaultTheme="dark"` to `defaultTheme="system"` so
  the app follows the OS, matching `dark-mode.md › Avoid offering an app-specific setting`. Keep
  the `theme-color` meta sync, but drive both `#fafaf8`/`#171c24` from the new tokens.
- [ ] **2.5 Decide the accent strategy.** Apple defines a single *tint/accent* used for primary
  actions and selection, and says content is mostly monochrome so the accent reads. We map
  `--primary` → the app tint (emerald is a legitimate brand accent — keep it, but verify it works
  as a tint on **both** light and dark, not just dark). Everything that is *not* a primary action
  drops to label/secondary tones.
  > `SKILL.md › Lens 3`: "brand color is saved for primary actions and status… or moved into the
  > content layer."
- [ ] **2.6 Radius → Apple's continuous-corner feel.** Current base `--radius: 1rem` (16px) drives
  73 `rounded-2xl` uses. Apple uses *fewer, softer* radii and a continuous corner shape. Reduce the
  scale (target ~10–14px for cards, full for pills/keypad) and set `--radius` once; add a
  `corner-shape: superellipse` note (limited browser support — treat as progressive, not required).

**Gate:** with only `globals.css` changed, spot-check Today, Plan, Activity, Check in both
appearances. If a screen looks broken, that's a token mapping bug — fix the token, not the screen.

---

## Phase 3 — Typography: from Google Fonts to Dynamic Type

Fonts are the most visible "Apple" signal and currently the weakest link: they load as a
render-blocking `<link>` in `layout.tsx:40`, with `--font-sans`/`--font-mono` referenced but never
defined.

- [ ] **3.1 Adopt the system font stack as the UI face.** Apple's `typography.md › Using system
  fonts` says don't embed SF, use the system font. For the web/PWA that means
  `font-family: -apple-system, "SF Pro Text", system-ui, …`. Set this in `@theme` as `--font-sans`
  so controls and navigation become San Francisco. This alone removes the render-blocking
  Jakarta dependency for UI.
  > `typography.md › Developer note`: "don't embed system fonts in your app."
- [ ] **3.2 Build the Dynamic Type scale in CSS.** Recreate Apple's text styles as utilities /
  theme tokens using the **Large (default)** column from `typography.md › Specifications`: Body 17,
  Headline 17/semibold, Title 3 20, Title 2 22, Title 1 28, Large Title 34, Footnote 13, Caption 12.
  Set the app body from the current 15px to 17px and use `rem`+`clamp` so text scales with the
  OS/browser setting rather than freezing.
- [ ] **3.3 Kill light weights for small text.** DESIGN.md loads Jakarta 300–800; Apple says avoid
  Ultralight/Thin/Light for small text. Constrain the shipped weights to Regular/Medium/Semibold/Bold.
  > `typography.md › Ensuring legibility`: "prefer Regular, Medium, Semibold, or Bold."
- [ ] **3.4 Preserve the two product-specific type needs.**
  (a) **Khmer**: Kantumruy Pro must stay (system font won't render Khmer subscripts correctly).
  Keep the `:lang(km)` rule and the 1.72 line-height tuning, and load Kantumruy via `next/font` so
  it's self-hosted, not a remote link.
  (b) **Money**: keep `JetBrains Mono` tabular for the `.money`/`amount-hero` column alignment —
  this is a data-utility face, which `typography.md` explicitly allows ("a utility face for data").
  Also self-host via `next/font`.
- [ ] **3.5 Hero number under larger text.** DESIGN.md pins the hero at 48/56px. Re-express it as a
  scale that grows with the accessibility setting and re-test it doesn't collide at AX sizes.
  Note: `.amount-hero` is asserted in `tests-e2e/user-journeys.spec.ts:16` — **keep the class name**
  or update that selector in the same PR.

**Gate:** body reads 17px at default, scales at Larger Text; Khmer still renders without clipping;
money columns still align at the largest size.

---

## Phase 4 — Platform conventions: navigation + modal grammar

This applies Apple's component model, translated to web. Do it after tokens so components inherit
the palette.

- [ ] **4.1 Bottom dock → real tab bar.** The current 5-slot dock in `app-shell.tsx` is close to an
  iOS tab bar already. Conform it:
  - Tabs **navigate, they don't act.** The raised central "Check" button currently reads as an
    action FAB embedded in nav. `tab-bars.md` says "Use a tab bar to support navigation, not to
    provide actions." Decide: keep Check as a *destination tab* (it has a `/check` route, so this
    is defensible) but strip the "act" affordance, **or** move Check to a toolbar prominent action
    and make all five slots true destinations. Document the choice.
  - Filled symbol for the active tab, single-word labels, never hide/disable a tab.
  > `SKILL.md › Lens 2`: "Tabs navigate, they don't act. Few tabs… never hidden or disabled,
  > filled symbols preferred."
- [ ] **4.2 Header → toolbar, actions live there.** Per `toolbars.md`, put view actions in the top
  toolbar with the prominent style reserved for one key action (Done/Submit). Keep the header
  monochrome over content.
- [ ] **4.3 Sheets for modal tasks, one at a time.** The Check keypad drawer, the template switcher
  (already a bottom sheet per commit aa93efa), and the transaction detail modal should all follow
  `sheets.md`: a grabber when resizable, swipe-to-dismiss, an exit other than "Done", and a medium
  detent considered for progressive disclosure. Radix `dialog`/`sheet` primitives in
  `src/components/ui/` are the implementation surface.
- [ ] **4.4 Safe areas + one-handed reach.** Keep the existing `safe-top`/`safe-bottom` utilities,
  but re-verify important controls sit mid-or-lower screen, not under the notch region.
- [ ] **4.5 Desktop = sidebar conversion.** `app-shell.tsx` already has a desktop sidebar. Per
  `sidebars.md`/`split-views.md`: at most two levels, collapsible, no critical actions pinned to the
  bottom. This is the "tab bar converts to sidebar on tablet" pattern — keep that pairing.

**Gate:** run the skill's **Navigation structure** mode over the whole route map; every section
reachable, current location visible, converts sensibly mobile↔desktop.

---

## Phase 5 — Materials & the bar (reverses the anti-blur decision)

The audit found `header-solid` and `glass-dock` currently force `backdrop-filter: none !important`
with an opaque `var(--background)` fill — a deliberate past choice. Apple's model wants the exact
opposite on the functional layer: real translucency so content scrolls beneath. This is the biggest
philosophical reversal in the migration; land it as its own PR so it can be reviewed in isolation.

- [ ] **5.1 Restore glass on the functional layer only.** Tab bar, header toolbar, and sheets get
  the Liquid Glass approximation from `liquid-glass.md › Cross-platform translation`:
  `backdrop-filter: blur(24px) saturate(1.4)` (use `-webkit-` prefix) + translucent fill (~60–80%
  white in light / black in dark) + a 1px translucent hairline border. Remove the `!important`
  opt-outs from `header-solid`/`glass-dock`.
- [ ] **5.2 Keep glass OFF the content layer.** Cards, list rows, and chart surfaces stay opaque
  standard materials. "Glass on app backgrounds, cards, list rows, or content containers is a
  defect" (`liquid-glass.md › Review checklist 1`). Our current opaque cards are correct — leave them.
- [ ] **5.3 One accent on glass, background not glyph.** Tint the primary action's background
  (the Done/Check prominent button), not its label. Never a row of tinted controls.
  > `color.md › Liquid Glass color`: "To emphasize primary actions, apply color to the background."
- [ ] **5.4 Respect the reduced-transparency & contrast fallbacks.** Under
  `prefers-reduced-transparency` / `prefers-contrast: more`, fall back to opaque fills; under
  `prefers-reduced-motion`, drop the morph/refraction animation (already have the global switch).
  > `liquid-glass.md › Accessibility states` (item 5).
- [ ] **5.5 Perf guard.** `backdrop-filter` over scrolling charts/keypad is expensive. Keep glass
  regions few and small (Apple's rule too), and re-run the PWA startup audit (`docs/pwa-startup-audit.md`)
  so the material doesn't regress the mobile paint path.

**Gate:** run the skill's **Liquid Glass** review mode + the curated checklist (7 items). Content
must remain legible at the resting scroll position where it meets each bar (scroll edge effect).

---

## Phase 6 — Craft & signature (make it SaveLuy, not a template)

- [ ] **6.1 Name the point of view.** Per `SKILL.md › Lens 3`, one sentence: what the app is
  remembered by. Recommendation: the **hero "Available Today" number as the single
  bright-accent moment on an otherwise monochrome grouped-inset canvas** — that is already the
  product thesis from PRODUCT.md ("undisputed focal anchor"). Lean into it rather than fight it.
- [ ] **6.2 Spend boldness in one place.** With Phase 2 de-emphasizing everything that isn't a
  primary action, confirm the accent appears on: the hero number, the verdict chip, and the primary
  CTA — nothing else. Remove one accessory (skill's prompt): candidates are the `card-interactive`
  hover border `color-mix` and the `card-pop`/`scale-105` dock flourish; pick the one that earns
  the least and drop it.
- [ ] **6.3 Charts → semantic palette.** Re-point the 12 `--chart-*` tokens at the new background
  tiers and label ladder (they already read via `var()`, so this is a `globals.css` change, not a
  component change). Verify chart legibility in both appearances + increased contrast.
- [ ] **6.4 Icons.** Keep the bespoke 2px-stroke SVG line icons (DESIGN.md rule, and they're a real
  differentiator). Ensure weight matches adjacent text and every icon-only control has an accessible
  label (`SKILL.md › Lens 1`).

---

## Phase 7 — Writing & content (Lens 5)

- [ ] **7.1 Labels say what happens.** "Check purchase" not "Submit". Action keeps its name through
  the flow. Audit `src/features/**` copy and next-intl message files.
- [ ] **7.2 Platform capitalization.** Apple uses **title-style** for buttons, menu items, and
  titles. Current copy is mixed. Pick title-case for controls consistently — but do this via the
  i18n message catalogs so English and Khmer both stay coherent (Khmer has no case; keep the rule
  scoped to Latin strings).
- [ ] **7.3 Errors & empty states direct people.** Say what's wrong and the fix, no apology, no
  shame banner (PRODUCT.md). Empty states invite the next action.

---

## Phase 8 — Rollout mechanics, tests, and risk

**Sequencing per PR** (each gated by the phase above):
1 → 2 → 3 → 4 → 5 → 6 → 7. Never bundle the material reversal (5) with the token rewrite (2);
that's where regressions hide.

**Test impact**
- `.amount-hero` is asserted at `tests-e2e/user-journeys.spec.ts:16` — keep the class name through
  Phase 3 or update the selector in the same commit.
- Keypad tests tap buttons by **digit name**, and the code uses `data-keypad-input`. Preserve the
  accessible names on any restyled keypad (`check-panel.tsx`) or those taps break.
- Most other e2e is role/text/URL based, so class-level restyling is safe — that's why we change
  `globals.css` values, not 200 component class strings, wherever possible.

**Key risks**
- **Khmer rendering** is the #1 hazard: the system-font migration (3.1) must *not* strip Kantumruy
  for `:lang(km)`. Test USD-kr bilingual rows after every type change.
- **Anti-blur reversal (5)** touches past deliberate fixes (`e41da4a`, `4d52066` WebKit blur-bleed,
  dock dead-space). Re-test iOS Safari specifically; the old commits exist for a reason.
- **Default-appearance flip (2.4)** changes what every existing screenshot/audit compares against;
  re-capture baselines after it.

**Definition of done**
Every screen passes the skill's five lenses with no `Critical`, ≤2 `High`; light + dark +
increased-contrast all legible; Dynamic-Type largest size survives with money alignment and Khmer
intact; the app reads as SaveLuy, not an Apple clone — because, as the skill warns,
"Don't flatten the personality."

---

## Appendix — Obsidian Ledger → Apple token map

| Current token | New Apple-aligned role | Notes |
| --- | --- | --- |
| `--background` (oklch 0.14 250) | `--bg-grouped` (system grouped) | now has a real light value |
| `--card` (single elevation) | `--bg-grouped-secondary` / `-tertiary` | tiered, not one flat card |
| `--foreground` | `--label` | ladder starts here |
| `--muted-foreground` | `--label-secondary` / `--tertiary` | split into the 4-level ladder |
| `--border` | `--separator` | translucent on glass, opaque in content |
| `--primary` (emerald) | app **tint/accent** | keep emerald as brand accent, verify on light |
| `--warning` (amber) / `--destructive` (crimson) | **status** colors | keep semantics; must pass contrast in both modes |
| `--radius: 16px` | ~10–14px + continuous corner | fewer, softer radii |
| Plus Jakarta Sans (UI) | **system font** (SF) | self-host removed for UI |
| Kantumruy Pro (Khmer) | Kantumruy Pro | KEEP via next/font |
| JetBrains Mono (`.money`) | SF Mono / JetBrains Mono | KEEP as data utility face |
