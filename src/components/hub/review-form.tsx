"use client";

import { useState, useTransition } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { submitReview } from "@/lib/actions/review";

export function ReviewForm({ txnRef }: { txnRef: string }) {
  const [stars, setStars] = useState(5);
  const [body, setBody] = useState("");
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <Card className="p-5">
        <h3 className="font-display font-semibold">Thanks for the review</h3>
        <p className="text-sm text-[var(--muted)] mt-2">
          It will appear on the seller&rsquo;s public profile.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <h3 className="font-display font-semibold">Leave a review</h3>
      <p className="text-sm text-[var(--muted)] mt-1">
        Help other Ghanaians know who to trust.
      </p>
      <div className="mt-4 flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setStars(n)}
            aria-label={`${n} stars`}
            className={
              "p-1 rounded " +
              (n <= stars ? "text-[var(--accent)]" : "text-[var(--muted)]")
            }
          >
            <Star size={22} fill={n <= stars ? "currentColor" : "none"} />
          </button>
        ))}
      </div>
      <Textarea
        rows={3}
        className="mt-3"
        placeholder="A sentence for the next buyer (optional)"
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      <Button
        className="mt-3 w-full"
        loading={isPending}
        onClick={() =>
          startTransition(async () => {
            const r = await submitReview({ ref: txnRef, stars, body });
            if (!r.ok) toast.error(r.error ?? "Couldn't submit");
            else {
              toast.success("Review posted");
              setDone(true);
            }
          })
        }
      >
        Post review
      </Button>
    </Card>
  );
}
