"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Upload, FileText, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { attachEvidence } from "@/lib/actions/dispute";

interface UploadedFile {
  path: string;
  name: string;
  mime: string;
  size: number;
  caption: string;
}

export function EvidenceUploader({ disputeId }: { disputeId: string }) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const res = await fetch("/api/upload/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scope: "evidence",
          fileName: file.name,
          mime: file.type,
          sizeBytes: file.size,
          subKey: disputeId,
        }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        signedUrl?: string;
        path?: string;
        error?: string;
      };
      if (!data.ok || !data.signedUrl || !data.path) {
        toast.error(data.error ?? "Couldn't prepare upload");
        return;
      }
      const up = await fetch(data.signedUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      if (!up.ok) {
        toast.error("Upload failed");
        return;
      }
      setFiles((prev) => [
        ...prev,
        { path: data.path!, name: file.name, mime: file.type, size: file.size, caption: "" },
      ]);
      toast.success(`${file.name} uploaded`);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setUploading(false);
    }
  }

  function attachAll() {
    if (files.length === 0) return;
    startTransition(async () => {
      for (const f of files) {
        const r = await attachEvidence(disputeId, f.path, f.mime, f.size, f.caption);
        if (!r.ok) toast.error(r.error ?? "Couldn't attach");
      }
      toast.success(`${files.length} file${files.length === 1 ? "" : "s"} attached`);
      setFiles([]);
    });
  }

  return (
    <div className="space-y-3">
      <label className="flex flex-col items-center justify-center rounded-[var(--radius-md)] border-2 border-dashed border-[var(--border-strong)] bg-[var(--surface-muted)]/40 p-6 cursor-pointer hover:border-[var(--primary)]/50 hover:bg-[var(--primary-soft)]/30 transition-colors">
        <Upload size={22} className="text-[var(--muted)]" />
        <span className="mt-2 text-sm font-medium">
          {uploading ? "Uploading…" : "Drop photos, videos or PDFs here"}
        </span>
        <span className="text-xs text-[var(--muted)] mt-0.5">Chat screenshots, dispatch slips, photos of the item. Up to 12MB each.</span>
        <input
          type="file"
          multiple
          accept="image/*,.pdf,video/mp4,video/quicktime"
          className="sr-only"
          disabled={uploading}
          onChange={(e) => {
            const fs = Array.from(e.target.files ?? []);
            fs.forEach(handleFile);
            e.currentTarget.value = "";
          }}
        />
      </label>

      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((f, i) => (
            <li key={f.path} className="flex items-start gap-3 p-3 rounded-md border border-[var(--border)] bg-[var(--surface)]">
              {f.mime.startsWith("image/") ? (
                <ImageIcon size={18} className="text-[var(--primary)] shrink-0 mt-1" />
              ) : (
                <FileText size={18} className="text-[var(--primary)] shrink-0 mt-1" />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium truncate">{f.name}</p>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  {f.mime} · {Math.round(f.size / 1024)}KB
                </p>
                <Input
                  placeholder="Caption (optional)"
                  className="mt-2"
                  value={f.caption}
                  onChange={(e) =>
                    setFiles((prev) =>
                      prev.map((p, idx) => (idx === i ? { ...p, caption: e.target.value } : p)),
                    )
                  }
                />
              </div>
              <button
                type="button"
                className="text-[var(--muted)] hover:text-[var(--danger)]"
                onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                aria-label="Remove"
              >
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {files.length > 0 && (
        <Button loading={isPending} onClick={attachAll}>
          Attach {files.length} {files.length === 1 ? "file" : "files"} to dispute
        </Button>
      )}
    </div>
  );
}
