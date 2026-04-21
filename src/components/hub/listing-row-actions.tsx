"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { MoreHorizontal, ExternalLink, Power, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteListing, togglePublish } from "@/lib/actions/listings";

export function ListingRowActions({
  id,
  slug,
  state,
}: {
  id: string;
  slug: string;
  state: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function close() {
    setOpen(false);
  }

  return (
    <div className="relative">
      <Button size="icon" variant="ghost" onClick={() => setOpen((v) => !v)} aria-label="Actions">
        <MoreHorizontal size={16} />
      </Button>
      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={close} />
          <div className="absolute right-0 mt-2 w-52 rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface)] shadow-[var(--shadow-pop)] z-30 overflow-hidden">
            <Link
              href={`/hub/listings/${id}/edit`}
              className="flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-[var(--surface-muted)]"
              onClick={close}
            >
              <Pencil size={14} /> Edit
            </Link>
            <Link
              href={`/products-services/${slug}`}
              target="_blank"
              className="flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-[var(--surface-muted)]"
              onClick={close}
            >
              <ExternalLink size={14} /> View public page
            </Link>
            <button
              type="button"
              className="flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-[var(--surface-muted)] w-full text-left"
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  const r = await togglePublish(id);
                  if (!r.ok) toast.error(r.error ?? "Failed");
                  else {
                    toast.success(
                      r.state === "published"
                        ? "Listing is live"
                        : r.state === "pending_review"
                          ? "Submitted for review"
                          : "Listing unpublished",
                    );
                    close();
                    router.refresh();
                  }
                })
              }
            >
              <Power size={14} />
              {state === "published" ? "Unpublish" : "Publish"}
            </button>
            <div className="border-t border-[var(--border)]" />
            <button
              type="button"
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-[var(--danger)] hover:bg-[var(--surface-muted)] w-full text-left"
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  if (!confirm("Archive this listing? It will be hidden from the marketplace.")) return;
                  const r = await deleteListing(id);
                  if (!r.ok) toast.error(r.error ?? "Failed");
                  else {
                    toast.success("Archived");
                    close();
                    router.refresh();
                  }
                })
              }
            >
              <Trash2 size={14} /> Archive
            </button>
          </div>
        </>
      )}
    </div>
  );
}
