import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const runtime = "nodejs";
export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default async function Icon() {
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
          background: "transparent",
        }}
      >
        {/* Wide pill is ~931x470 (≈2:1). Render it as 480x242 centered on
            the 512x512 canvas — keeps the brand mark recognisable in tabs
            without distortion. */}
        <img
          src={logoDataUrl}
          alt=""
          width={480}
          height={242}
          style={{ display: "block" }}
        />
      </div>
    ),
    { ...size },
  );
}
