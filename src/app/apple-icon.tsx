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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <span
            style={{
              color: "#10b981",
              fontSize: 104,
              fontWeight: 800,
              fontFamily: "sans-serif",
              letterSpacing: -4,
              lineHeight: 1,
            }}
          >
            B
          </span>
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: "50%",
              backgroundColor: "#10b981",
              position: "absolute",
              top: 10,
              right: -10,
            }}
          />
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
