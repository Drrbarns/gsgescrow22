import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppTopbar } from "@/components/app-shell/topbar";
import { isDbLive } from "@/lib/env";
import { getDb } from "@/lib/db/client";
import { disputes, transactions, evidenceFiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { formatGhs, relativeTime } from "@/lib/utils";
import { ResolveDisputeForm } from "@/components/admin/resolve-dispute-form";
import { createSignedReadUrl } from "@/lib/storage";

export const dynamic = "force-dynamic";

export default async function AdminDisputeDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isDbLive) return notFound();
  const db = getDb();
  const [d] = await db.select().from(disputes).where(eq(disputes.id, id)).limit(1);
  if (!d) return notFound();
  const [txn] = await db.select().from(transactions).where(eq(transactions.id, d.transactionId)).limit(1);
  if (!txn) return notFound();
  const evidence = await db.select().from(evidenceFiles).where(eq(evidenceFiles.disputeId, d.id));
  const evidenceWithUrls = await Promise.all(
    evidence.map(async (e) => {
      const signed = await createSignedReadUrl("evidence", e.storagePath, 60 * 15);
      return { ...e, url: signed.ok ? signed.url : null };
    }),
  );

  return (
    <>
      <AppTopbar
        title={`Dispute on ${txn.ref}`}
        subtitle={`Opened ${relativeTime(d.createdAt)} · ${d.openerRole}`}
      />
      <main className="flex-1">
        <Container size="wide" className="py-8 grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Link href="/admin/disputes" className="inline-flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)]">
              <ArrowLeft size={14} /> All disputes
            </Link>

            <Card className="p-6">
              <h2 className="font-display text-lg font-semibold">Reason</h2>
              <p className="mt-3 text-[15px]">{d.reason}</p>
              {d.description && <p className="mt-3 text-sm text-[var(--muted)] leading-relaxed">{d.description}</p>}
            </Card>

            <Card className="p-6">
              <h2 className="font-display text-lg font-semibold">Order facts</h2>
              <dl className="mt-5 grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <Field label="Item" value={txn.itemDescription} />
                <Field label="Total charged" value={formatGhs(txn.totalCharged)} />
                <Field label="Buyer" value={`${txn.buyerName} · ${txn.buyerPhone}`} />
                <Field label="Seller" value={`${txn.sellerName} · ${txn.sellerPhone}`} />
                <Field label="Delivery to" value={`${txn.deliveryAddress}, ${txn.deliveryCity}`} />
                <Field label="Initiated by" value={txn.initiatedBy} />
              </dl>
            </Card>

            <Card className="p-6">
              <h2 className="font-display text-lg font-semibold">Evidence vault ({evidenceWithUrls.length})</h2>
              {evidenceWithUrls.length === 0 ? (
                <p className="mt-3 text-sm text-[var(--muted)]">No evidence uploaded yet.</p>
              ) : (
                <ul className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {evidenceWithUrls.map((e) => {
                    const isImage = (e.mime ?? "").startsWith("image/");
                    const isPdf = (e.mime ?? "").includes("pdf");
                    const isVideo = (e.mime ?? "").startsWith("video/");
                    return (
                      <li key={e.id} className="rounded-md border border-[var(--border)] overflow-hidden">
                        <div className="aspect-[4/3] bg-[var(--surface-muted)] flex items-center justify-center">
                          {e.url && isImage && (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={e.url} alt="evidence" className="w-full h-full object-cover" />
                          )}
                          {e.url && isVideo && (
                            <video controls className="w-full h-full object-cover">
                              <source src={e.url} type={e.mime ?? "video/mp4"} />
                            </video>
                          )}
                          {e.url && !isImage && !isVideo && (
                            <a
                              href={e.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm font-semibold text-[var(--primary)] underline p-4 text-center"
                            >
                              {isPdf ? "Open PDF" : "Download"}
                            </a>
                          )}
                          {!e.url && <p className="text-xs text-[var(--muted)]">No access</p>}
                        </div>
                        <div className="p-3">
                          <p className="text-xs text-[var(--muted)]">{e.mime ?? "unknown"} · {Math.round((e.sizeBytes ?? 0) / 1024)}KB</p>
                          {e.caption && <p className="text-sm mt-1.5">{e.caption}</p>}
                          {e.url && (
                            <a href={e.url} target="_blank" rel="noreferrer" className="text-xs text-[var(--primary)] underline mt-2 inline-block">
                              Open full size
                            </a>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>
          </div>

          <aside>
            <Card className="p-5">
              <h3 className="font-display font-semibold">Status</h3>
              <Badge className="mt-3" tone={d.state === "open" ? "danger" : "info"} dot>{d.state.replace("_", " ")}</Badge>
              {d.slaDueAt && (
                <p className="text-xs text-[var(--muted)] mt-3">
                  SLA: <span className="font-medium">{relativeTime(d.slaDueAt)}</span>
                </p>
              )}
            </Card>

            <Card className="p-5 mt-4">
              <h3 className="font-display font-semibold">Resolve</h3>
              <ResolveDisputeForm disputeId={d.id} totalCharged={txn.totalCharged} />
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
