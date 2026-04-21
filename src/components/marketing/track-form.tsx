"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export function TrackForm() {
  const router = useRouter();
  const [ref, setRef] = useState("");
  const [submitting, setSubmitting] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const v = ref.trim().toUpperCase();
        if (!v) return;
        setSubmitting(true);
        router.push(`/track/${encodeURIComponent(v)}`);
      }}
      className="space-y-4"
    >
      <div>
        <Label htmlFor="ref">Order reference</Label>
        <Input
          id="ref"
          placeholder="SB-XXXXX-XXXX"
          value={ref}
          onChange={(e) => setRef(e.target.value)}
          autoFocus
          className="font-mono"
        />
      </div>
      <Button type="submit" loading={submitting} className="w-full">
        Track this order
      </Button>
    </form>
  );
}
