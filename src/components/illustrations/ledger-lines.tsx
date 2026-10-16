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

