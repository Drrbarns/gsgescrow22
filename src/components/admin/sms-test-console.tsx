"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { adminSendSms } from "@/lib/actions/admin-sms";

export function SmsTestConsole() {
  const [to, setTo] = useState("");
  const [body, setBody] = useState("");
  const [isPending, startTransition] = useTransition();

  function send() {
    if (!to || !body) {
      toast.error("Recipient and body required");
      return;
    }
    startTransition(async () => {
      const r = await adminSendSms({ to, body });
      if (!r.ok) toast.error(r.error ?? "Failed");
      else {
        toast.success("SMS sent — check the log below");
        setBody("");
      }
    });
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold">Test SMS console</h2>
          <p className="text-sm text-[var(--muted)] mt-0.5">
            Send an ad-hoc message through the active SMS provider. Every send is audit-logged.
          </p>
        </div>
      </div>
      <div className="mt-5 grid sm:grid-cols-12 gap-3">
        <div className="sm:col-span-4">
          <Label>Recipient</Label>
          <Input
            placeholder="024 000 0000"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
          <p className="text-[11px] text-[var(--muted)] mt-1">
            Any Ghana format — we&rsquo;ll normalise to 233XXXXXXXXX.
          </p>
        </div>
        <div className="sm:col-span-8">
          <Label>Message</Label>
          <Textarea
            rows={3}
            placeholder="Type your message (max 480 chars)"
            value={body}
            maxLength={480}
            onChange={(e) => setBody(e.target.value)}
          />
          <div className="flex items-center justify-between mt-1">
            <span className="text-[11px] text-[var(--muted)]">
              {body.length} / 480 · {Math.max(1, Math.ceil(body.length / 160))} SMS segment
              {body.length > 160 ? "s" : ""}
            </span>
            <Button size="sm" loading={isPending} onClick={send}>
              <Send size={14} /> Send test
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
