"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Input, Label, Textarea, FieldHint } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, MessageCircle, Mail, Send } from "lucide-react";
import { calculateFees } from "@/lib/payments";
import { formatGhs, ghsToPesewas } from "@/lib/utils";
import { createTransaction } from "@/lib/actions/transaction";

const BUYER_BPS = 150;
const SELLER_BPS = 150;
const RIDER_FEE = 200;

type Form = {
  buyerName: string;
  buyerPhone: string;
  sellerName: string;
  sellerPhone: string;
  itemDescription: string;
  productCedis: string;
  deliveryCedis: string;
  deliveryAddress: string;
  deliveryCity: string;
};

export function SellerWizard() {
  const [form, setForm] = useState<Form>({
    buyerName: "",
    buyerPhone: "",
    sellerName: "",
    sellerPhone: "",
    itemDescription: "",
    productCedis: "",
    deliveryCedis: "0",
    deliveryAddress: "Buyer to confirm",
    deliveryCity: "Accra",
  });
  const [link, setLink] = useState<{ ref: string; url: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  function set<K extends keyof Form>(k: K, v: Form[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  const fees = useMemo(
    () =>
      calculateFees({
        productAmount: ghsToPesewas(form.productCedis || "0"),
        deliveryAmount: ghsToPesewas(form.deliveryCedis || "0"),
        buyerFeeBps: BUYER_BPS,
        sellerFeeBps: SELLER_BPS,
        riderReleaseFee: RIDER_FEE,
      }),
    [form.productCedis, form.deliveryCedis],
  );

  function valid(): boolean {
    return Boolean(
      form.buyerName &&
        form.buyerPhone &&
        form.sellerName &&
        form.sellerPhone &&
        form.itemDescription &&
        Number(form.productCedis) > 0,
    );
  }

  async function submit() {
    startTransition(async () => {
      const r = await createTransaction({
        initiatedBy: "seller",
        buyerName: form.buyerName,
        buyerPhone: form.buyerPhone,
        sellerName: form.sellerName,
        sellerPhone: form.sellerPhone,
        itemDescription: form.itemDescription,
        deliveryAddress: form.deliveryAddress,
        deliveryCity: form.deliveryCity,
        productCedis: Number(form.productCedis),
        deliveryCedis: Number(form.deliveryCedis || "0"),
      });
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      const url = r.authorizationUrl;
      setLink({ ref: r.ref, url });
      toast.success("Payment link generated");
    });
  }

  if (link) {
    const waMsg = encodeURIComponent(
      `Hi ${form.buyerName}, here's your protected SBBS payment link for "${form.itemDescription}" — ${formatGhs(fees.totalCharged)}: ${link.url}`,
    );
    return (
      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <Card className="p-6 sm:p-8">
            <Badge tone="success" dot>Link ready</Badge>
            <h3 className="font-display text-xl font-semibold mt-4">
              Your protected payment link
            </h3>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Send this to <span className="font-medium text-[var(--foreground)]">{form.buyerName}</span>.
              The moment they pay, you&rsquo;ll get an SMS that funds are held safely.
            </p>
            <div className="mt-5 flex flex-col sm:flex-row gap-2">
              <input
                readOnly
                value={link.url}
                className="flex-1 h-11 rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface-muted)] px-3 font-mono text-sm"
              />
              <Button
                variant="secondary"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(link.url);
                    setCopied(true);
                    toast.success("Copied");
                    setTimeout(() => setCopied(false), 1500);
                  } catch {
                    toast.error("Couldn't copy");
                  }
                }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <div className="mt-6 grid sm:grid-cols-3 gap-2">
              <a
                href={`https://wa.me/?text=${waMsg}`}
                target="_blank"
                rel="noreferrer"
              >
                <Button variant="secondary" className="w-full">
                  <MessageCircle size={14} /> WhatsApp
                </Button>
              </a>
              <a
                href={`sms:${form.buyerPhone}?&body=${waMsg}`}
              >
                <Button variant="secondary" className="w-full">
                  <Send size={14} /> SMS
                </Button>
              </a>
              <a
                href={`mailto:?subject=Your SBBS payment link&body=${waMsg}`}
              >
                <Button variant="secondary" className="w-full">
                  <Mail size={14} /> Email
                </Button>
              </a>
            </div>
            <hr className="my-6 border-[var(--border)]" />
            <p className="text-sm text-[var(--muted)]">
              Reference: <span className="font-mono">{link.ref}</span>
            </p>
            <div className="mt-6 flex gap-3">
              <Button onClick={() => setLink(null)} variant="secondary">
                Create another
              </Button>
              <a href="/hub">
                <Button>Open my Hub</Button>
              </a>
            </div>
          </Card>
        </div>
        <aside className="lg:col-span-4">
          <Card className="p-6 lg:sticky lg:top-24">
            <h3 className="font-display text-lg font-semibold">After the buyer pays</h3>
            <ol className="mt-4 space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="font-mono text-xs text-[var(--muted)]">01</span>
                <span>SBBS SMS&rsquo;s you that funds are held.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-xs text-[var(--muted)]">02</span>
                <span>You dispatch and tap &ldquo;Mark dispatched&rdquo; in your Hub.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-xs text-[var(--muted)]">03</span>
                <span>Buyer releases the delivery code, or 72h auto-release fires.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-mono text-xs text-[var(--muted)]">04</span>
                <span>Approver clicks Approve, your MoMo is credited.</span>
              </li>
            </ol>
          </Card>
        </aside>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-12 gap-6">
      <Card className="p-6 sm:p-8 lg:col-span-8 space-y-5">
        <div>
          <h3 className="font-display text-xl font-semibold">Buyer details</h3>
          <p className="text-sm text-[var(--muted)]">
            From the DM you&rsquo;re currently in.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label required>Buyer&rsquo;s name</Label>
            <Input
              placeholder="Ama Asare"
              value={form.buyerName}
              onChange={(e) => set("buyerName", e.target.value)}
            />
          </div>
          <div>
            <Label required>Buyer&rsquo;s phone</Label>
            <Input
              placeholder="024 000 0000"
              value={form.buyerPhone}
              onChange={(e) => set("buyerPhone", e.target.value)}
            />
          </div>
        </div>

        <hr className="border-[var(--border)]" />

        <div>
          <h3 className="font-display text-xl font-semibold">Your details</h3>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label required>Your name / shop</Label>
            <Input
              placeholder="Kente Couture"
              value={form.sellerName}
              onChange={(e) => set("sellerName", e.target.value)}
            />
          </div>
          <div>
            <Label required>Your MoMo number</Label>
            <Input
              placeholder="024 000 0000"
              value={form.sellerPhone}
              onChange={(e) => set("sellerPhone", e.target.value)}
            />
            <FieldHint>This is where your payout will be sent.</FieldHint>
          </div>
        </div>

        <hr className="border-[var(--border)]" />

        <div>
          <h3 className="font-display text-xl font-semibold">The item</h3>
        </div>
        <div>
          <Label required>What's being sold</Label>
          <Textarea
            rows={2}
            placeholder="Black kente dress, size M"
            value={form.itemDescription}
            onChange={(e) => set("itemDescription", e.target.value)}
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label required>Agreed price</Label>
            <Input
              inputMode="decimal"
              leading="₵"
              value={form.productCedis}
              onChange={(e) => set("productCedis", e.target.value)}
            />
          </div>
          <div>
            <Label>Delivery fee</Label>
            <Input
              inputMode="decimal"
              leading="₵"
              value={form.deliveryCedis}
              onChange={(e) => set("deliveryCedis", e.target.value)}
            />
          </div>
        </div>

        <Button onClick={submit} loading={isPending} disabled={!valid()} size="lg">
          Generate payment link
        </Button>
      </Card>

      <aside className="lg:col-span-4">
        <Card className="p-6 lg:sticky lg:top-24 bg-[var(--primary)] text-[var(--primary-foreground)] border-0">
          <Badge tone="accent">Buyer sees</Badge>
          <p className="mt-4 text-sm text-white/75">Total payable</p>
          <p className="font-display text-4xl font-bold mt-1">
            {formatGhs(fees.totalCharged)}
          </p>
          <hr className="my-5 border-white/15" />
          <p className="text-sm text-white/75">You receive after release</p>
          <p className="font-display text-2xl font-bold mt-1">
            {formatGhs(fees.sellerPayout)}
          </p>
          {fees.riderPayout > 0 && (
            <>
              <p className="text-sm text-white/75 mt-4">Rider receives</p>
              <p className="font-display text-2xl font-bold mt-1">
                {formatGhs(fees.riderPayout)}
              </p>
            </>
          )}
        </Card>
      </aside>
    </div>
  );
}
