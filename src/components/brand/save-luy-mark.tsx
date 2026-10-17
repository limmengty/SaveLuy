import type { SVGProps } from "react";

interface SaveLuyMarkProps extends SVGProps<SVGSVGElement> {
  size?: number;
  variant?: "emerald" | "current" | "monochrome";
}

/**
 * SaveLuy Canonical Brand Mark
 *
 * Core Concept:
 * A minimal "S" path formed by two precision ledger lines nestled inside
 * a protective rounded shield/wallet vault contour.
 *
 * Designed to be razor-sharp at 20px–24px, completely monochrome-compatible,
 * with no external typography dependencies.
 */
export function SaveLuyMark({
  size = 32,
  variant = "emerald",
  className,
  ...props
}: SaveLuyMarkProps) {
  const isEmerald = variant === "emerald";

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
      {/* Outer Shield/Vault Vault Contour */}
      <rect
        x="3"
        y="3"
        width="26"
        height="26"
        rx="8"
        stroke={isEmerald ? "var(--primary)" : "currentColor"}
        strokeWidth="2"
        fill={isEmerald ? "var(--primary)" : "currentColor"}
        fillOpacity="0.08"
      />

      {/* Top Ledger Arc of the "S" */}
      <path
        d="M21.5 11.5H13C11.3431 11.5 10 12.8431 10 14.5C10 16.1569 11.3431 17.5 13 17.5H19"
        stroke={isEmerald ? "var(--primary)" : "currentColor"}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Bottom Ledger Arc of the "S" */}
      <path
        d="M13 17.5H19C20.6569 17.5 22 18.8431 22 20.5C22 22.1569 20.6569 23.5 19 23.5H10.5"
        stroke={isEmerald ? "var(--primary)" : "currentColor"}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Precision Balance Dot: Daily Clarity Indicator */}
      <circle
        cx="21.5"
        cy="11.5"
        r="1.2"
        fill={isEmerald ? "var(--primary)" : "currentColor"}
      />
      <circle
        cx="10.5"
        cy="23.5"
        r="1.2"
        fill={isEmerald ? "var(--primary)" : "currentColor"}
      />
    </svg>
  );
}
