"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";

export function BadgeSnippet() {
  const [copied, setCopied] = useState(false);
  const snippet = `<a href="https://sbbs.gh/u/your-handle" target="_blank" rel="noopener">
  <img src="https://sbbs.gh/api/badge/your-handle" alt="SBBS Verified Seller" width="320" height="92" />
</a>`;
  return (
    <div className="mt-4">
      <pre className="bg-[var(--foreground)] text-white text-xs leading-relaxed p-4 rounded-[var(--radius-md)] overflow-x-auto font-mono">
        {snippet}
      </pre>
      <Button
        variant="secondary"
        size="sm"
        className="mt-3"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(snippet);
            setCopied(true);
            toast.success("Snippet copied");
            setTimeout(() => setCopied(false), 2000);
          } catch {
            toast.error("Couldn't copy — please select and copy manually");
          }
        }}
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
        {copied ? "Copied" : "Copy snippet"}
      </Button>
    </div>
  );
}
