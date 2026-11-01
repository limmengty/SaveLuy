---
name: BrokeNoMore Grouped Ledger (Apple HIG-aligned)
description: iOS system-grouped design translated for the web — dynamic system colors, label ladder, Dynamic Type scale, functional-layer glass, emerald app tint
colors:
  primary-light: "oklch(0.48 0.13 162)" # Emerald tint, darkened for 4.5:1 text on light
  primary-dark: "oklch(0.78 0.14 162)"
  background-light: "#f2f2f7" # systemGroupedBackground
  background-dark: "#000000"
  card-light: "#ffffff" # secondarySystemGroupedBackground
  card-dark: "#1c1c1e"
  foreground: "label — #000 light / #fff dark"
  muted-foreground: "secondaryLabel — #6e6e73 light / rgba(235,235,245,.6) dark"
  placeholder: "#6e6e73 light / #98989d dark"
  subtle: "tertiaryLabel — .3 alpha"
  border: "separator — rgba(60,60,67,.29) / rgba(84,84,88,.65)"
  warning: "#b25e09 light / #ff9f0a dark (systemOrange family)"
  destructive: "#d92a1c light / #ff453a dark (systemRed family)"
  momentum: "#5856d6 light / #5e5ce6 dark (systemIndigo)"
  info: "#0057ad light / #0a84ff dark (contrast-adjusted systemBlue family)"
  chart-series-light: "#0066cc · #5856d6 · #c93400 · #007b83"
  chart-series-dark: "#0a84ff · #5e5ce6 · #ff9f0a · #40c8e0"
typography:
  ui:
    fontFamily: "-apple-system, SF Pro Text, Segoe UI, Roboto, sans-serif"
    body: "17px / 24px (iOS Dynamic Type Large)"
    scale: "Footnote 13 · Subhead 15 · Callout 16 · Title3 20 · Title1 28 · LargeTitle 34"
  khmer:
    fontFamily: "Kantumruy Pro (self-hosted, --font-khmer)"
    lineHeight: "1.72"
  money:
    fontFamily: "JetBrains Mono (self-hosted, --font-mono-data), tabular-nums"
  hero:
    fontSize: "clamp(3rem, 2.5rem + 2vw, 3.5rem)"
    letterSpacing: "-0.02em"
    lineHeight: "1.08"
rounded:
  sm: "6px"
  md: "8px"
  lg: "10px"
  xl: "12px"
  2xl: "14px"
  3xl: "18px"
  4xl: "24px"
spacing:
  touch-min: "44px (28px absolute minimum)"
  text-min: "11px"
---

# BrokeNoMore Design System ("Grouped Ledger")

## Overview
Migrated from the bespoke "Obsidian Ledger" dark-slate theme to an Apple
Human Interface Guidelines-aligned system (see
`docs/design/apple-hig-migration-plan.md`). The app renders as an iOS
system-grouped surface: layered background tiers, the label color ladder,
Dynamic Type sizing, and a translucent material reserved for the functional
chrome (header + tab dock). The emerald tint survives as the single app accent
so "On Plan" guidance stays recognizable.

## Colors — iOS dynamic system roles
- **Background tiers:** `--background` = systemGroupedBackground (`#f2f2f7` /
  `#000000`), `--card` = secondary tier (`#fff` / `#1c1c1e`), `--card-tertiary`
  = tertiary tier (`#f2f2f7` / `#2c2c2e`).
- **Label ladder:** `--foreground` (label), `--muted-foreground`
  (secondaryLabel), `--subtle` (tertiaryLabel). Use the semantic roles instead
  of untracked gray values in components.
- Secondary labels use a contrast-adjusted light value so small supporting
  copy remains readable on grouped surfaces. Placeholder text also has a
  dedicated role with readable light and dark values; tertiary/quaternary
  labels are reserved for nonessential symbols and details.
- **Fills:** `--secondary` / `--muted` = systemFill
  (rgba(120,120,128,.16/.32)), `--accent` = quaternary hover tint.
- **Separators:** `--border` = translucent separator;
  `--separator-opaque` for scroll-edge hairlines.
- **Status:** Apple systemRed/systemOrange/systemIndigo families. Light-mode
  warning/destructive use the increased-contrast variants (`#b25e09`,
  `#d92a1c`) so small text passes 4.5:1; dark mode uses `#ff9f0a` / `#ff453a`
  on black foregrounds.
- **App tint:** emerald `oklch(0.48 0.13 162)` light / `oklch(0.78 0.14 162)`
  dark — CTAs, "On Plan", active tab, focus ring.
- **Charts:** Apple palette (blue, indigo, orange, teal, cyan) with
  systemGray plan/grid tokens.
- **Accessibility overrides:** `prefers-contrast: more` swaps in opaque
  separators/fills; `prefers-reduced-transparency: reduce` makes bars opaque.

## Typography
- System font stack first (`-apple-system` → SF Pro on Apple devices, Segoe
  UI on Windows), Kantumruy Pro self-hosted for `:lang(km)` glyphs, JetBrains
  Mono self-hosted via `.money` / `--font-mono-data` for tabular numerals.
- Body is 17px/24px (iOS Dynamic Type Large default). Minimum text is 11px;
  10px sizes are banned.
- Type scale tokens `--text-body` … `--text-large-title` mirror the iOS ramp
  (Footnote 13 · Subhead 15 · Callout 16 · Title3 20 · Title1 28 · LargeTitle 34).
- The app-shell header `h1` renders as the iOS LargeTitle: 28/34 on mobile,
  34/41 with -0.022em tracking at `lg:`.
- Hero number ("Available Today") keeps `.amount-hero` (e2e selector) —
  clamp(3rem…3.5rem), -0.02em tracking, 1.08 leading, tabular-nums.

## Layout & Surfaces
- **iOS inset-grouped lists** are built from five `@utility` primitives in
  `src/app/style.css` — never restyle them per-view:
  - `ios-list`: borderless group, `bg-card`, 10px radius, `overflow-hidden`.
  - `ios-row`: 44px-min row; `& + &::before` draws the 1px hairline separator
    (`--separator-opaque`) inset 16px via `--ios-sep-inset`.
  - `ios-row-icon-sep`: bumps the separator inset to 60px for rows with a
    leading icon square (separator starts after the icon).
  - `ios-section-header`: gray Footnote-13 semibold header above each group.
  - `ios-icon`: 29×29 solid tinted icon square, 7px radius, glyph
    `size-4` in `text-primary-foreground`/`text-warning-foreground`/etc.
  - `ios-chevron`: tertiaryLabel `ChevronRight` on navigable rows.
- Content cards follow the same inset-grouped look: `rounded-[10px] bg-card`,
  no border, single elevation, no card-in-card nesting, no decorative shadows.
- Sheets: 12px top radius (`rounded-t-[12px]`).
- Hit targets: buttons `h-11` (44px), keypad keys 44px, quick-bump chips
  h-10+, tab items full-height; 28px absolute floor.
- Clear vertical cadence between operational blocks; Khmer keeps
  `line-height: 1.72` tuning for subscript consonants.

## Navigation & Materials
- **Header + bottom dock** use the functional-layer glass (`bar-glass` /
  `glass-dock`): ~72% translucent fill + `blur(24px) saturate(1.4)` + hairline
  border. Content scrolls beneath via absolute bars and calc() safe-area
  padding on the scroller.
- Bottom tab bar: 4 items with Check as a tab — icon 22px, label 11px,
  active = primary color + heavier stroke weight.
- Sheets: bottom on mobile with drag grabber, right panel on desktop;
  opaque `bg-card` (no double blur on the modal layer).
- Glass is never applied to the content layer — cards and rows stay opaque.
- Tactile keypad: 44px keys, immediate press feedback, digit accessible names
  preserved for e2e.

## Layout & Responsive Behavior
- The layout follows available width, not named device models. Use compact layouts
  for narrow viewports and let the app shell move to its desktop navigation at
  the existing `lg` breakpoint; keep all destinations and actions available in
  either layout.
- Keep reading content at a comfortable measure (about 65–75 characters per
  line). Financial dashboards may use wider columns, but chart labels and
  explanatory copy must remain readable without horizontal scrolling.
- Use the 4px spacing unit (`--space-unit`) as the base rhythm. Common gaps and
  insets should land on 8, 12, 16, 24, or 32px; use one-off values only when a
  component's geometry requires them.
- Group related controls closely and separate unrelated tasks with whitespace
  before adding another card. A surface should represent one task, one summary,
  or one coherent set of rows. Avoid nested cards and decorative dividers.
- Respect top and bottom safe areas. Scrollable content must leave room for the
  fixed header and dock, including device insets and browser zoom.

## Color Roles & Contrast
- Use role tokens from `src/app/style.css`; do not introduce one-off gray or
  status colors in feature components. `--background`, `--card`, and
  `--card-tertiary` express surface hierarchy. `--foreground`,
  `--muted-foreground`, `--subtle`, and `--quaternary-label` are the label
  ladder. `--placeholder` is reserved for input hints, and `--link` is for
  navigational text.
- `--primary` / `--success` mean SaveLuy's positive plan state and primary
  action. `--warning`, `--destructive`, `--momentum`, and `--info` keep their
  status meanings across screens. Do not use a status color as decoration or
  to imply a second meaning.
- Color values have light, dark, and increased-contrast variants. Text and
  essential icons must meet WCAG AA contrast against their actual rendered
  surface (4.5:1 for normal text, 3:1 for large text). Recheck translucent
  surfaces against the content beneath them. Color never carries a status by
  itself; pair it with a word, icon, or shape.
- The current opaque text-color checks are: app tint 5.94:1 on light cards and
  9.01:1 on dark cards; info 7.08:1 on white and 4.65:1 on dark cards;
  warning 4.67:1 on white and 8.28:1 on dark cards; destructive 4.89:1 on
  white and 4.99:1 on dark cards. White text on the momentum fill is 5.65:1
  light and 5.06:1 dark. These figures apply to the listed opaque combinations;
  translucent fills must be checked after compositing.
- Secondary labels measure 5.07:1 on white and 4.54:1 on the grouped light
  background. Dark secondary labels measure 5.52:1 on a dark card. Placeholder
  text uses the same minimum contrast target.
- Chart palette roles distinguish series, not severity by default. Keep
  redundant labels/markers for essential data, use `--chart-grid` quietly, and
  verify the chart in both appearances and increased contrast. Informative
  light chart strokes are tuned to at least 3:1 on white (for example, plan
  gray 4.52:1, orange 5.28:1, and protected funds cyan 5.05:1); axis labels
  use a darker gray to meet text contrast. The grid is decorative and becomes
  stronger when increased contrast is requested.
- The distinctive element is the calm, legible daily safe-spend figure. Keep
  emerald emphasis focused on that plan state and the action that helps someone
  follow it; surrounding content stays neutral.

## Type, Icons & Content
- Use the system UI font for controls and navigation. Use Kantumruy Pro for
  Khmer text and JetBrains Mono only for aligned monetary/data values. Do not
  use font weight alone to establish hierarchy; combine size, spacing, and
  placement.
- Type styles are semantic: Body 17/24, Callout 16, Subhead 15, Footnote 13,
  Caption 12, Title3 20, Title2 22, Title1 28, Large Title 34. Small text uses
  at least medium weight. Use rem-based or fluid sizes for new display styles;
  layouts must survive browser zoom and enlarged text without clipping.
- Khmer text uses the established 1.72 line-height. Let mixed Khmer/Latin rows
  wrap naturally and avoid fixed heights around translated copy.
- Icons use the existing Lucide line family, generally 2px stroke, and match
  adjacent text in visual weight. Use filled/tinted icon squares only for the
  established grouped-list pattern. Icon-only controls need an accessible name
  and a visible focus state.
- Write in short, calm, non-shaming language. Action labels state the result
  ("Save changes", "Check purchase"). Errors say what happened and what action
  can recover; empty states offer a useful next step. Status copy always names
  the state instead of relying on color.

## Interaction, Elevation & Motion
- A tap target is at least 44×44px on touch layouts. On desktop, keep the
  clickable region comfortably larger than the visible icon; provide hover,
  pressed, disabled, and keyboard-focus states for interactive controls.
- Focus uses the semantic `--ring` token and must remain visible against both
  the control and surrounding surface. Do not suppress the browser outline
  without replacing it.
- Elevation is functional: grouped rows and cards use no decorative shadow;
  popovers and modal sheets may use `--elevation-popover` or
  `--elevation-modal` to separate a temporary layer. Avoid stacked shadows.
- Use `--motion-fast`, `--motion-standard`, and `--motion-emphasis` for brief
  state changes. Motion should explain a change or confirm an action. Avoid
  looping or decorative motion; reduced-motion users receive a static state
  with equivalent feedback.
- Translucency belongs only on the functional navigation layer. With reduced
  transparency or increased contrast, the bars become opaque and remain
  legible. Never blur financial content, forms, or chart surfaces.

## Component States & Accessibility
- Data-backed components account for loading, populated, empty, filtered-empty,
  error, stale/revalidating, offline, and permission-denied states where those
  states apply. Preserve the component's final geometry while loading; every
  error has a recovery action where recovery is possible.
- Announce important updates to assistive technology without moving focus.
  Maintain logical heading order, descriptive control names, keyboard access,
  sufficient contrast, and non-color status cues.
- Prefer explicit controls over gesture-only actions. A sheet has a clear close
  path, and destructive actions explain the consequence and provide a cancel
  route. Frequent reversible actions should offer undo where practical.
- Test compact width, desktop width, keyboard-only navigation, screen-reader
  labels, light/dark appearance, increased contrast, reduced transparency,
  reduced motion, Khmer wrapping, and browser zoom before considering a new
  shared primitive complete.

## Source of Truth
- Implemented visual tokens and reusable primitives: `src/app/style.css`.
- Shared navigation and shell behavior: `src/components/app-shell/app-shell.tsx`.
- Product voice and audience: `PRODUCT.md`.
- When this document and implementation disagree, reconcile the CSS token and
  this specification together; do not patch a shared design rule in one view.

## Do's and Don'ts
- **DO:** express status with icon + label + color, never color alone.
- **DO:** use the label ladder for text hierarchy and systemFill for recessed containers.
- **DO:** display money in `.money` tabular numbers with standard currency symbol placement.
- **DO:** keep all financial arithmetic in pure integer cents.
- **DON'T:** place glass/blur behind scrolling content rows or charts.
- **DON'T:** use raw emoji glyphs for core financial categories; keep 2px-stroke line icons.
- **DON'T:** drop below 11px text or 44px touch targets, or add decorative gradients and confetti.
