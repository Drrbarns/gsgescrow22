import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Sell-Safe Buy-Safe — Ghana's protected checkout";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(135deg, #2A1862 0%, #4F2BB8 55%, #6B3DDC 100%)",
          color: "#FBFAFC",
          display: "flex",
          flexDirection: "column",
          padding: "72px 80px",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* atmospheric blobs */}
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -120,
            width: 500,
            height: 500,
            borderRadius: 999,
            background:
              "radial-gradient(circle, rgba(217,207,234,0.35) 0%, rgba(217,207,234,0) 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -160,
            left: -100,
            width: 480,
            height: 480,
            borderRadius: 999,
            background:
              "radial-gradient(circle, rgba(107,61,220,0.45) 0%, rgba(107,61,220,0) 70%)",
          }}
        />

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 76,
              height: 76,
              borderRadius: 18,
              background: "#FBFAFC",
              color: "#4F2BB8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: 36,
              letterSpacing: -1,
              position: "relative",
            }}
          >
            SB
            <div
              style={{
                position: "absolute",
                top: -6,
                right: -6,
                width: 20,
                height: 20,
                borderRadius: 999,
                background: "#D9CFEA",
                border: "4px solid #2A1862",
              }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5 }}>
              Sell-Safe Buy-Safe
            </span>
            <span
              style={{
                fontSize: 14,
                opacity: 0.8,
                letterSpacing: 4,
                textTransform: "uppercase",
                marginTop: 2,
              }}
            >
              by GSG Brands
            </span>
          </div>
        </div>

        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column", marginTop: "auto" }}>
          <div
            style={{
              fontSize: 86,
              fontWeight: 800,
              lineHeight: 1.02,
              letterSpacing: -3,
              maxWidth: 980,
            }}
          >
            Ghana&rsquo;s protected checkout
          </div>
          <div
            style={{
              fontSize: 30,
              marginTop: 24,
              maxWidth: 920,
              opacity: 0.92,
              lineHeight: 1.3,
            }}
          >
            We hold the buyer&rsquo;s money safely until the goods arrive as
            promised. Built for Instagram, WhatsApp & TikTok commerce.
          </div>

          <div
            style={{
              display: "flex",
              gap: 16,
              marginTop: 36,
            }}
          >
            {[
              "Escrow protection",
              "Trust badge",
              "Dispute court",
            ].map((label) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 18px",
                  borderRadius: 999,
                  background: "rgba(251,250,252,0.16)",
                  border: "1px solid rgba(251,250,252,0.35)",
                  fontSize: 20,
                  fontWeight: 600,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 999,
                    background: "#D9CFEA",
                  }}
                />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
