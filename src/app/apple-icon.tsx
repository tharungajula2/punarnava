import { ImageResponse } from "next/og";

// Home-screen / bookmark icon (PNG). The browser tab uses app/icon.svg.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9f6f0" }}>
        <svg width={132} height={132} viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="11" fill="none" stroke="#1f6b6b" strokeWidth="3.5" strokeLinecap="round" strokeDasharray="56 100" transform="rotate(-50 16 16)" />
          <circle cx="17.15" cy="5.06" r="2.6" fill="#5cc6a0" />
        </svg>
      </div>
    ),
    size,
  );
}
