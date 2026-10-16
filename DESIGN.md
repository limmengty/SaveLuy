---
name: BrokeNoMore Obsidian Ledger
description: Calm, high-precision personal finance design system in OKLCH dark slate with emerald guidance
colors:
  primary: "oklch(0.78 0.14 162)" # Emerald mint guidance
  primary-foreground: "oklch(0.16 0.03 162)"
  background: "oklch(0.14 0.01 250)" # Deep obsidian slate
  foreground: "oklch(0.96 0.005 250)" # Crisp ledger white
  card: "oklch(0.18 0.012 250)" # Elevated surface slate
  card-foreground: "oklch(0.96 0.005 250)"
  muted: "oklch(0.22 0.014 250)"
  muted-foreground: "oklch(0.72 0.015 250)"
  border: "oklch(0.28 0.018 250)"
  warning: "oklch(0.82 0.13 75)" # Warm amber for paced adjustment
  warning-foreground: "oklch(0.20 0.04 75)"
  destructive: "oklch(0.70 0.16 25)" # Soft crimson for hard overdraft
  destructive-foreground: "oklch(0.18 0.03 25)"
typography:
  display:
    fontFamily: "Plus Jakarta Sans, Kantumruy Pro, sans-serif"
    fontSize: "clamp(3rem, 6vw, 3.5rem)"
    fontWeight: 700
    lineHeight: "1.1"
    letterSpacing: "-0.035em"
  money:
    fontFamily: "JetBrains Mono, monospace"
    fontVariantNumeric: "tabular-nums"
    fontWeight: 600
  body:
    fontFamily: "Plus Jakarta Sans, Kantumruy Pro, sans-serif"
    fontSize: "15px"
    lineHeight: "22px"
rounded:
  sm: "12px"
  md: "14px"
  lg: "16px"
  xl: "20px"
  full: "9999px"
spacing:
  touch-min: "44px"
  card-pad: "20px"
  section-gap: "28px"
---

# BrokeNoMore Design System ("Obsidian Ledger")

## Overview
"Obsidian Ledger" represents financial poise, dignity, and mathematical calm. It avoids cartoonish gamification, neon graphs, or aggressive guilt-inducing red banners. Instead, it presents an ultra-clear ledger environment where the user's primary decision number ("Available Today") is the undisputed focal anchor.

## Colors
- **Obsidian Dark (Primary Canvas):** High-contrast OKLCH dark slate with subtle cold undertone (`oklch(0.14 0.01 250)`). Provides deep visual rest.
- **Emerald Mint (Guidance Accent):** `oklch(0.78 0.14 162)`. Used strictly for "On Plan" statuses, confirmation badges, and key operational CTAs.
- **Warm Amber (Adjustment Warning):** `oklch(0.82 0.13 75)`. Used when spending requires pacing adjustment across upcoming days, communicating mathematical reality without panic.
- **Soft Crimson (Decision Required):** `oklch(0.70 0.16 25)`. Used when a purchase exceeds the week's flexible limits.

## Typography
- **English UI:** `Plus Jakarta Sans` (300 to 800 weight). Humanist geometry with open apertures that remain crisp at small sizes.
- **Khmer UI:** `Kantumruy Pro` (300 to 700 weight). Carefully tuned with `line-height: 1.72` and `letter-spacing: 0.012em` to prevent ascender/descender clipping on complex subscript consonants.
- **Numerals & Currency:** `JetBrains Mono` with `tabular-nums`. Every number across columns, tables, and comparison cards aligns vertically with exact precision.

## Layout & Rhythm
- **Clear Vertical Cadence:** 28px (`gap-7` / `space-y-7`) between primary operational blocks.
- **No Card-in-Card Clutter:** Single-elevation surface cards (`bg-card border border-border rounded-2xl`) containing distinct clean internal dividers rather than nested bordered boxes.
- **Touch Ergonomics:** All buttons, quick-tap categories, keypad triggers, and tab items adhere to a strict minimum 44×44px hit-box target for rapid one-handed mobile capture.

## Components & Affordances
- **Hero Number:** 48px/56px bold tabular text with a subtle 220ms ease-out translateY transition on calculation re-evaluation.
- **Quick Add Grid:** Bespoke 2px stroke monochrome line SVGs paired with tactile cards (`active:scale-[0.98]`).
- **Tactile Keypad:** 48px tall calculator keys with immediate visual feedback (`bg-secondary/50` -> `active:bg-secondary`).

## Do's and Don'ts
- **DO:** Always display money in `.money` tabular numbers with standard currency symbol placement.
- **DO:** Keep all financial arithmetic in pure integer cents.
- **DON'T:** Use raw emoji glyphs for core financial categories; use bespoke 2px stroke line SVGs.
- **DON'T:** Add decorative pastel gradients, floating card shadows, or distracting confetti animations.
