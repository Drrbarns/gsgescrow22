import { NextResponse } from "next/server";
import { z } from "zod";
import {
  ALLOWED_EVIDENCE_MIMES,
  ALLOWED_KYC_MIMES,
  ALLOWED_LISTING_IMAGE_MIMES,
  MAX_FILE_BYTES,
  createSignedUploadUrl,
  generateStoragePath,
  type StorageBucket,
} from "@/lib/storage";
import { getSessionUser } from "@/lib/auth/session";
import { rateLimit } from "@/lib/idempotency";
import { headers } from "next/headers";
import { audit } from "@/lib/audit/log";

export const runtime = "nodejs";

const schema = z.object({
  scope: z.enum(["kyc", "evidence", "listing"]),
  fileName: z.string().min(1).max(200),
  mime: z.string().min(1),
  sizeBytes: z.number().int().positive().max(MAX_FILE_BYTES),
  subKey: z.string().max(80).optional(),
});

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? user.id;
  const limit = rateLimit(`upload:${ip}`, { capacity: 10, refillPerSec: 0.2 });
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, error: "Too many uploads, please slow down" },
      { status: 429, headers: { "Retry-After": String(Math.ceil(limit.retryAfterMs / 1000)) } },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message ?? "Invalid" }, { status: 400 });
  }

  const { scope, fileName, mime, sizeBytes, subKey } = parsed.data;
  const allowed =
    scope === "kyc"
      ? ALLOWED_KYC_MIMES
      : scope === "evidence"
        ? ALLOWED_EVIDENCE_MIMES
        : ALLOWED_LISTING_IMAGE_MIMES;
  if (!allowed.includes(mime)) {
    return NextResponse.json({ ok: false, error: `Unsupported file type: ${mime}` }, { status: 400 });
  }
  if (sizeBytes > MAX_FILE_BYTES) {
    return NextResponse.json({ ok: false, error: "File too large" }, { status: 400 });
  }

  const bucket: StorageBucket =
    scope === "kyc" ? "kyc" : scope === "evidence" ? "evidence" : "listings";
  const path = generateStoragePath({
    scope,
    userId: user.id,
    originalName: fileName,
    subKey,
  });
  const signed = await createSignedUploadUrl(bucket, path);
  if (!signed.ok) {
    return NextResponse.json({ ok: false, error: signed.error }, { status: 500 });
  }

  await audit({
    action:
      scope === "kyc"
        ? "kyc.submit"
        : scope === "evidence"
          ? "txn.dispute_open"
          : "settings.update",
    targetType: "upload",
    targetId: path,
    payload: { scope, mime, sizeBytes },
  });

  return NextResponse.json({ ok: true, signedUrl: signed.signedUrl, path: signed.path, bucket });
}
