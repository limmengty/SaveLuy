import type { SVGProps } from "react";

export function LedgerEmptyActivity(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="160"
      height="120"
      viewBox="0 0 160 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <rect
        x="24"
        y="16"
        width="112"
        height="88"
        rx="8"
        className="stroke-border"
        strokeWidth="1.5"
      />
      <line
        x1="24"
        y1="38"
        x2="136"
        y2="38"
        className="stroke-border"
        strokeWidth="1.5"
      />
      <circle cx="36" cy="27" r="3" className="fill-muted-foreground/30" />
      <circle cx="48" cy="27" r="3" className="fill-muted-foreground/30" />
      <line
        x1="40"
        y1="56"
        x2="100"
        y2="56"
        className="stroke-muted-foreground/40"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="40"
        y1="72"
        x2="85"
        y2="72"
        className="stroke-muted-foreground/40"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="40"
        y1="88"
        x2="110"
        y2="88"
        className="stroke-muted-foreground/20"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M112 56L120 64L116 76"
        className="stroke-primary"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LedgerEmptyWaitlist(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="160"
      height="120"
      viewBox="0 0 160 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <circle
        cx="80"
        cy="60"
        r="44"
        className="stroke-border"
        strokeWidth="1.5"
      />
      <path
        d="M80 32V60L98 72"
        className="stroke-primary"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="80" cy="60" r="2.5" className="fill-primary" />
      <line
        x1="80"
        y1="22"
        x2="80"
        y2="26"
        className="stroke-muted-foreground/40"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="80"
        y1="94"
        x2="80"
        y2="98"
        className="stroke-muted-foreground/40"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="42"
        y1="60"
        x2="46"
        y2="60"
        className="stroke-muted-foreground/40"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="114"
        y1="60"
        x2="118"
        y2="60"
        className="stroke-muted-foreground/40"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function LedgerMilestoneSweep(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="200"
      height="140"
      viewBox="0 0 200 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      {/* Precision Ledger Scales Base */}
      <line x1="60" y1="120" x2="140" y2="120" className="stroke-border" strokeWidth="2" strokeLinecap="round" />
      <line x1="100" y1="120" x2="100" y2="40" className="stroke-border" strokeWidth="2" strokeLinecap="round" />
      
      {/* Balanced Crossbeam */}
      <line x1="40" y1="48" x2="160" y2="48" className="stroke-primary" strokeWidth="2" strokeLinecap="round" />
      <circle cx="100" cy="48" r="4" className="fill-primary" />

      {/* Left Pan: Planned */}
      <line x1="40" y1="48" x2="25" y2="82" className="stroke-muted-foreground/40" strokeWidth="1.5" />
      <line x1="40" y1="48" x2="55" y2="82" className="stroke-muted-foreground/40" strokeWidth="1.5" />
      <path d="M20 82C20 90 60 90 60 82H20Z" className="stroke-border fill-secondary/30" strokeWidth="1.5" />

      {/* Right Pan: Remainder Allocated */}
      <line x1="160" y1="48" x2="145" y2="82" className="stroke-muted-foreground/40" strokeWidth="1.5" />
      <line x1="160" y1="48" x2="175" y2="82" className="stroke-muted-foreground/40" strokeWidth="1.5" />
      <path d="M140 82C140 90 180 90 180 82H140Z" className="stroke-primary fill-primary/10" strokeWidth="1.5" />

      {/* Checkmark Accent */}
      <path
        d="M93 25L98 30L107 20"
        className="stroke-primary"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LedgerLockProtected(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Protected vault fund"
      {...props}
    >
      <rect x="8" y="18" width="32" height="24" rx="6" className="stroke-primary fill-primary/5" strokeWidth="2" />
      <path
        d="M16 18V12C16 7.58172 19.5817 4 24 4C28.4183 4 32 7.58172 32 12V18"
        className="stroke-primary"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="24" cy="28" r="3" className="fill-primary" />
      <line x1="24" y1="31" x2="24" y2="36" className="stroke-primary" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// ============================================================================
// Ledger Lines Quick Action Icon System (No Emojis)
// ============================================================================

export function LedgerIconCoffee(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M10 2v2" />
      <path d="M14 2v2" />
      <path d="M16 8a1 1 0 0 1 1 1v2a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h12Z" />
      <path d="M6 19h12" />
      <path d="M17 11h1a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2h-1" />
    </svg>
  );
}

export function LedgerIconMeal(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M3 12h18" />
      <path d="M4 12c0 5 3.5 8 8 8s8-3 8-8H4Z" />
      <path d="M8 8c0-2.5 1.5-4 4-4s4 1.5 4 4" />
    </svg>
  );
}

export function LedgerIconTransport(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="18" r="3" />
      <path d="M6 15h12" />
      <path d="M9 15l2-7h4l2 7" />
      <path d="M13 8V5" />
    </svg>
  );
}

export function LedgerIconDrink(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M5 4h14l-2 15a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 4Z" />
      <path d="M4 8h16" />
      <line x1="12" y1="2" x2="15" y2="8" />
    </svg>
  );
}

export function LedgerIconGroceries(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M6 6h15l-1.5 9h-13L4 3H2" />
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="17" cy="20" r="1.5" />
      <path d="M9 11h6" />
    </svg>
  );
}

// Verdict SVGs
export function LedgerVerdictSafe(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <circle cx="20" cy="20" r="18" className="stroke-primary fill-primary/10" strokeWidth="2" />
      <path
        d="M13 20L18 25L27 15"
        className="stroke-primary"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LedgerVerdictRepace(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <circle cx="20" cy="20" r="18" className="stroke-warning fill-warning/10" strokeWidth="2" />
      <path
        d="M20 12V21L26 25"
        className="stroke-warning"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Brand Logo Mark: Obsidian Ledger Vault
export function LedgerBrandMark({ className, size = 32, ...props }: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <rect
        x="2"
        y="2"
        width="28"
        height="28"
        rx="8"
        className="fill-primary/10 stroke-primary/30"
        strokeWidth="1.5"
      />
      <path
        d="M10 9h6.5a4.5 4.5 0 0 1 0 9H10V9Z"
        className="stroke-primary"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 18h7.5a4.5 4.5 0 0 1 0 9H10V18Z"
        className="stroke-primary"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="22.5" cy="9.5" r="2" className="fill-primary" />
    </svg>
  );
}

/**
 * Bespoke Hero Artwork: "Obsidian Ledger & Protected Vault Geometry"
 * Elegant currentColor architectural SVG with calm precision lines, vault concentric arches,
 * balance crossbeam, and prospective daily clarity indicator.
 */
export function LedgerClarityHeroArt(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 540 460"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto drop-shadow-2xl"
      aria-hidden="true"
      {...props}
    >
      <defs>
        <radialGradient id="ledgerGlow" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.14" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ledgerBeam" x1="270" y1="50" x2="270" y2="400" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.5" />
          <stop offset="60%" stopColor="var(--primary)" stopOpacity="0.15" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
        <linearGradient id="cardGlow" x1="140" y1="180" x2="400" y2="340" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--card)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="var(--card)" stopOpacity="0.6" />
        </linearGradient>
      </defs>

      {/* Ambient Radial Aura */}
      <circle cx="270" cy="220" r="210" fill="url(#ledgerGlow)" />

      {/* Precision Ledger Grid Lines (Calm Cadence) */}
      <g opacity="0.15" stroke="currentColor" strokeWidth="1">
        <line x1="80" y1="100" x2="460" y2="100" strokeDasharray="3 6" />
        <line x1="60" y1="170" x2="480" y2="170" strokeDasharray="3 6" />
        <line x1="40" y1="240" x2="500" y2="240" strokeDasharray="3 6" />
        <line x1="60" y1="310" x2="480" y2="310" strokeDasharray="3 6" />
        <line x1="80" y1="380" x2="460" y2="380" strokeDasharray="3 6" />
        <line x1="150" y1="60" x2="150" y2="420" strokeDasharray="3 6" />
        <line x1="270" y1="40" x2="270" y2="430" stroke="url(#ledgerBeam)" strokeWidth="1.5" strokeDasharray="none" />
        <line x1="390" y1="60" x2="390" y2="420" strokeDasharray="3 6" />
      </g>

      {/* Outer Vault Concentric Arcs */}
      <circle cx="270" cy="225" r="170" stroke="currentColor" strokeOpacity="0.12" strokeWidth="1.5" />
      <circle cx="270" cy="225" r="135" stroke="var(--primary)" strokeOpacity="0.25" strokeWidth="1.5" strokeDasharray="5 7" />

      {/* Floating Precision Diamond Compass */}
      <polygon
        points="270,75 282,95 270,115 258,95"
        fill="var(--primary)"
        fillOpacity="0.2"
        stroke="var(--primary)"
        strokeWidth="1.5"
      />
      <circle cx="270" cy="95" r="2.5" fill="var(--primary)" />

      {/* Glass Architecture Primary Core: Daily Clarity Node */}
      <rect
        x="120"
        y="145"
        width="300"
        height="160"
        rx="20"
        fill="url(#cardGlow)"
        stroke="var(--border)"
        strokeWidth="1.5"
      />

      {/* Accent Header Ribbon inside Core */}
      <path
        d="M120 165 C120 154 129 145 140 145 H400 C411 145 420 154 420 165 V192 H120 V165 Z"
        fill="currentColor"
        fillOpacity="0.04"
      />
      <line x1="120" y1="192" x2="420" y2="192" stroke="var(--border)" strokeWidth="1" />

      {/* Window Controls (Minimalist Dots) */}
      <circle cx="145" cy="168" r="4" fill="var(--primary)" fillOpacity="0.8" />
      <circle cx="160" cy="168" r="4" fill="currentColor" fillOpacity="0.2" />
      <circle cx="175" cy="168" r="4" fill="currentColor" fillOpacity="0.1" />

      {/* Top Status Capsule: 100% Protected */}
      <rect x="305" y="159" width="100" height="20" rx="10" fill="var(--primary)" fillOpacity="0.15" stroke="var(--primary)" strokeOpacity="0.4" strokeWidth="1" />
      <circle cx="317" cy="169" r="3" fill="var(--primary)" />
      <line x1="326" y1="169" x2="393" y2="169" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" />

      {/* Center Metric Line: Available Today Vector */}
      <line x1="150" y1="218" x2="225" y2="218" stroke="currentColor" strokeOpacity="0.4" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="150" y1="250" x2="295" y2="250" stroke="var(--primary)" strokeWidth="5" strokeLinecap="round" />
      <line x1="305" y1="250" x2="350" y2="250" stroke="currentColor" strokeOpacity="0.2" strokeWidth="5" strokeLinecap="round" />

      {/* Secondary Progress Bar */}
      <line x1="150" y1="280" x2="390" y2="280" stroke="currentColor" strokeOpacity="0.1" strokeWidth="2" strokeLinecap="round" />
      <line x1="150" y1="280" x2="260" y2="280" stroke="var(--primary)" strokeOpacity="0.7" strokeWidth="2" strokeLinecap="round" />

      {/* Orbiting Satellite Node 1: Flexible Envelopes (Left) */}
      <g transform="translate(60, 260)">
        <rect x="0" y="0" width="130" height="68" rx="14" fill="var(--card)" fillOpacity="0.9" stroke="var(--border)" strokeWidth="1.2" />
        <circle cx="24" cy="24" r="10" fill="var(--primary)" fillOpacity="0.15" stroke="var(--primary)" strokeWidth="1.2" />
        <path d="M19 24L22 27L28 21" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="42" y1="22" x2="110" y2="22" stroke="currentColor" strokeOpacity="0.7" strokeWidth="2" strokeLinecap="round" />
        <line x1="20" y1="46" x2="90" y2="46" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" />
      </g>

      {/* Orbiting Satellite Node 2: Protected Vault (Right) */}
      <g transform="translate(350, 240)">
        <rect x="0" y="0" width="130" height="68" rx="14" fill="var(--card)" fillOpacity="0.9" stroke="var(--border)" strokeWidth="1.2" />
        <circle cx="24" cy="24" r="10" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1.2" />
        <rect x="20" y="21" width="8" height="6" rx="1.5" stroke="currentColor" strokeOpacity="0.7" strokeWidth="1" fill="none" />
        <path d="M22 21V19C22 17.89 22.89 17 24 17C25.11 17 26 17.89 26 19V21" stroke="currentColor" strokeOpacity="0.7" strokeWidth="1" />
        <line x1="42" y1="22" x2="110" y2="22" stroke="currentColor" strokeOpacity="0.7" strokeWidth="2" strokeLinecap="round" />
        <line x1="20" y1="46" x2="75" y2="46" stroke="currentColor" strokeOpacity="0.5" strokeWidth="3" strokeLinecap="round" />
      </g>

      {/* Connecting Flow Rays */}
      <path d="M190 285 C220 300 240 310 270 310" stroke="var(--primary)" strokeOpacity="0.3" strokeWidth="1.5" strokeDasharray="3 4" fill="none" />
      <path d="M350 270 C320 295 300 305 270 305" stroke="var(--primary)" strokeOpacity="0.3" strokeWidth="1.5" strokeDasharray="3 4" fill="none" />

      {/* Bottom Foundation Balance Anchor */}
      <ellipse cx="270" cy="380" rx="90" ry="12" stroke="currentColor" strokeOpacity="0.12" strokeWidth="1.5" />
      <circle cx="270" cy="380" r="4" fill="var(--primary)" />
    </svg>
  );
}


