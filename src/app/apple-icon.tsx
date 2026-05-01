import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const runtime = "nodejs";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  const logoBuffer = await readFile(
    join(process.cwd(), "public/brand/fgfg.png"),
  );
  const logoDataUrl = `data:image/png;base64,${logoBuffer.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #4F2BB8 0%, #6B3DDC 100%)",
        }}
      >
        {/* Pill rendered at 152x77 — preserves 2:1 aspect, leaves a tasteful
            margin so iOS doesn't crop into the rounded corners. */}
        <img
          src={logoDataUrl}
          alt=""
          width={152}
          height={77}
          style={{ display: "block" }}
        />
      </div>
    ),
    { ...size },
  );
}
