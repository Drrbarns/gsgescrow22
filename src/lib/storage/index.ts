import { createClient } from "@supabase/supabase-js";
import { env, isAuthLive } from "@/lib/env";

export const STORAGE_BUCKETS = {
  kyc: "sbbs-kyc",
  evidence: "sbbs-evidence",
  public: "sbbs-public",
  listings: "sbbs-listings",
} as const;

export type StorageBucket = keyof typeof STORAGE_BUCKETS;

/**
 * Supabase projects should configure the `sbbs-listings` bucket as PUBLIC so
 * listing cover images can be served on the marketplace without a signed URL
 * round-trip. KYC and evidence buckets must remain private.
 */
export function publicListingUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  const base = env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base}/storage/v1/object/public/${STORAGE_BUCKETS.listings}/${path}`;
}

function getServiceClient() {
  if (!isAuthLive || !env.SUPABASE_SERVICE_ROLE_KEY) return null;
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL!, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Create a signed upload URL the client can PUT directly to — no file ever
 * flows through our server, and the signed URL expires in 5 minutes.
 */
export async function createSignedUploadUrl(
  bucket: StorageBucket,
  path: string,
): Promise<{ ok: boolean; signedUrl?: string; token?: string; path?: string; error?: string }> {
  const sb = getServiceClient();
  if (!sb) return { ok: false, error: "Storage not configured" };
  const { data, error } = await sb.storage.from(STORAGE_BUCKETS[bucket]).createSignedUploadUrl(path);
  if (error) return { ok: false, error: error.message };
  return { ok: true, signedUrl: data.signedUrl, token: data.token, path: data.path };
}

/**
 * Create a short-lived signed URL for reading a private file. Used when an
 * admin is reviewing KYC docs or dispute evidence.
 */
export async function createSignedReadUrl(
  bucket: StorageBucket,
  path: string,
  ttlSeconds = 60 * 15,
): Promise<{ ok: boolean; url?: string; error?: string }> {
  const sb = getServiceClient();
  if (!sb) return { ok: false, error: "Storage not configured" };
  const { data, error } = await sb.storage.from(STORAGE_BUCKETS[bucket]).createSignedUrl(path, ttlSeconds);
  if (error) return { ok: false, error: error.message };
  return { ok: true, url: data.signedUrl };
}

export function generateStoragePath(opts: {
  scope: "kyc" | "evidence" | "listing";
  userId: string;
  originalName: string;
  subKey?: string;
}): string {
  const ext = opts.originalName.includes(".")
    ? opts.originalName.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") ?? "bin"
    : "bin";
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  const base = `${opts.userId}/${opts.subKey ? `${opts.subKey}/` : ""}${ts}-${rand}.${ext}`;
  return base;
}

export const ALLOWED_KYC_MIMES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

export const ALLOWED_EVIDENCE_MIMES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "application/pdf",
  "video/mp4",
  "video/quicktime",
];

export const ALLOWED_LISTING_IMAGE_MIMES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export const MAX_FILE_BYTES = 12 * 1024 * 1024;
