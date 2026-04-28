import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #4F2BB8 0%, #6B3DDC 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#FBFAFC",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
          fontWeight: 800,
          fontSize: 92,
          letterSpacing: -3,
          position: "relative",
        }}
      >
        SB
        <div
          style={{
            position: "absolute",
            top: 26,
            right: 26,
            width: 22,
            height: 22,
            borderRadius: 999,
            background: "#D9CFEA",
            border: "4px solid #FBFAFC",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
