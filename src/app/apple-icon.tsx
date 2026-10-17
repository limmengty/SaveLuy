import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0b0f17",
          borderRadius: 40,
          border: "4px solid rgba(16, 185, 129, 0.4)",
        }}
      >
        <svg
          width="120"
          height="120"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Shield Vault */}
          <rect
            x="3"
            y="3"
            width="26"
            height="26"
            rx="8"
            stroke="#10b981"
            strokeWidth="2"
            fill="#10b981"
            fillOpacity="0.1"
          />
          {/* Top Ledger Arc S */}
          <path
            d="M21.5 11.5H13C11.3431 11.5 10 12.8431 10 14.5C10 16.1569 11.3431 17.5 13 17.5H19"
            stroke="#10b981"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Bottom Ledger Arc S */}
          <path
            d="M13 17.5H19C20.6569 17.5 22 18.8431 22 20.5C22 22.1569 20.6569 23.5 19 23.5H10.5"
            stroke="#10b981"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="21.5" cy="11.5" r="1.4" fill="#10b981" />
          <circle cx="10.5" cy="23.5" r="1.4" fill="#10b981" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
