import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: 8,
          border: "2px solid #10b981",
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Top Ledger Arc S */}
          <path
            d="M21.5 11.5H13C11.3431 11.5 10 12.8431 10 14.5C10 16.1569 11.3431 17.5 13 17.5H19"
            stroke="#10b981"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Bottom Ledger Arc S */}
          <path
            d="M13 17.5H19C20.6569 17.5 22 18.8431 22 20.5C22 22.1569 20.6569 23.5 19 23.5H10.5"
            stroke="#10b981"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="21.5" cy="11.5" r="1.6" fill="#10b981" />
          <circle cx="10.5" cy="23.5" r="1.6" fill="#10b981" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
