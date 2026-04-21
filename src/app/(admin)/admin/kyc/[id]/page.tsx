import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppTopbar } from "@/components/app-shell/topbar";
import { isDbLive } from "@/lib/env";
import { getDb } from "@/lib/db/client";
import { kycSubmissions, profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createSignedReadUrl } from "@/lib/storage";
import { KycReviewActions } from "@/components/admin/kyc-review-actions";
import { relativeTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminKycDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isDbLive) return notFound();
  const db = getDb();
  const [sub] = await db.select().from(kycSubmissions).where(eq(kycSubmissions.id, id)).limit(1);
  if (!sub) return notFound();
  const [profile] = sub.profileId
    ? await db.select().from(profiles).where(eq(profiles.id, sub.profileId)).limit(1)
    : [undefined];

  async function sign(path: string | null) {
    if (!path) return null;
    const r = await createSignedReadUrl("kyc", path, 60 * 15);
    return r.ok ? r.url! : null;
  }

  const [front, back, selfie] = await Promise.all([sign(sub.docFrontPath), sign(sub.docBackPath), sign(sub.selfiePath)]);

  return (
    <>
      <AppTopbar
        title={sub.legalName}
        subtitle={`${sub.docType.replace("_", " ")} · submitted ${relativeTime(sub.createdAt)}`}
        actions={
          <Badge
            tone={sub.state === "approved" ? "success" : sub.state === "rejected" ? "danger" : "warning"}
            dot
          >
            {sub.state}
          </Badge>
        }
      />
      <main className="flex-1">
        <Container size="wide" className="py-8 grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Link
              href="/admin/kyc"
              className="inline-flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              <ArrowLeft size={14} /> All submissions
            </Link>

            <div className="grid sm:grid-cols-3 gap-4">
              <DocPane label="Front" url={front} path={sub.docFrontPath} />
              <DocPane label="Back" url={back} path={sub.docBackPath} />
              <DocPane label="Selfie" url={selfie} path={sub.selfiePath} />
            </div>

            <Card className="p-6">
              <h3 className="font-display font-semibold">Submission</h3>
              <dl className="mt-4 grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <Field label="Legal name" value={sub.legalName} />
                <Field label="Doc type" value={sub.docType.replace("_", " ")} />
                <Field label="Doc number" value={sub.docNumber ?? "—"} />
                <Field label="State" value={sub.state} />
                {sub.notes && <Field label="Reviewer notes" value={sub.notes} />}
              </dl>
            </Card>

            {profile && (
              <Card className="p-6">
                <h3 className="font-display font-semibold">Profile</h3>
                <dl className="mt-4 grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  <Field label="Email" value={profile.email ?? "—"} />
                  <Field label="Phone" value={profile.phone ?? "—"} />
                  <Field label="Current KYC" value={profile.kycStatus} />
                  <Field label="Joined" value={relativeTime(profile.createdAt)} />
                  <Field label="Trust score" value={profile.trustScore.toFixed(2)} />
                  <Field label="Suspended" value={profile.suspended ? "Yes" : "No"} />
                </dl>
              </Card>
            )}
          </div>

          <aside>
            <Card className="p-5">
              <h3 className="font-display font-semibold">Decision</h3>
              <p className="text-sm text-[var(--muted)] mt-1">
                Approving enables the Trust Badge and unlocks the full payout cap for this seller.
              </p>
              {sub.state === "pending" ? (
                <div className="mt-4">
                  <KycReviewActions submissionId={sub.id} />
                </div>
              ) : (
                <Badge className="mt-4" tone={sub.state === "approved" ? "success" : "danger"} dot>
                  {sub.state}
                </Badge>
              )}
            </Card>
            <Card className="p-5 mt-4">
              <h3 className="font-display font-semibold">Audit reminder</h3>
              <p className="text-sm text-[var(--muted)] mt-1">
                Every signed URL read above is time-boxed to 15 minutes. Reviewing documents is audit-logged when you approve or reject.
              </p>
            </Card>
          </aside>
        </Container>
      </main>
    </>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-[0.14em] font-semibold text-[var(--muted)]">{label}</dt>
      <dd className="mt-1 break-words">{value}</dd>
    </div>
  );
}

function DocPane({ label, url, path }: { label: string; url: string | null; path: string | null }) {
  if (!path) {
    return (
      <Card className="p-4 border-dashed">
        <p className="text-xs uppercase tracking-[0.14em] font-semibold text-[var(--muted)]">{label}</p>
        <p className="mt-2 text-sm text-[var(--muted)]">Not uploaded</p>
      </Card>
    );
  }
  const isImage = /\.(png|jpe?g|webp|heic)$/i.test(path);
  const isPdf = /\.pdf$/i.test(path);
  return (
    <Card className="overflow-hidden">
      <div className="aspect-[3/4] bg-[var(--surface-muted)] flex items-center justify-center">
        {url && isImage && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={url} alt={label} className="w-full h-full object-cover" />
        )}
        {url && isPdf && (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-semibold text-[var(--primary)] underline p-6 text-center"
          >
            Open {label} (PDF)
          </a>
        )}
        {url && !isImage && !isPdf && (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-semibold text-[var(--primary)] underline p-6 text-center"
          >
            Download file
          </a>
        )}
        {!url && <p className="text-xs text-[var(--muted)]">Couldn&rsquo;t sign URL</p>}
      </div>
      <div className="px-3 py-2 border-t border-[var(--border)] flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{label}</p>
        {url && (
          <a href={url} target="_blank" rel="noreferrer" className="text-xs text-[var(--primary)] underline">
            Open full size
          </a>
        )}
      </div>
    </Card>
  );
}
