"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { calculateFees } from "@/lib/payments";
import { formatGhs, ghsToPesewas } from "@/lib/utils";

const BUYER_BPS = 150;
const SELLER_BPS = 150;
const RIDER_FEE = 200;
const SELLER_RELEASE_FEE = 200;

export function CalculatorWidget() {
  const [productCedis, setProductCedis] = useState("420");
  const [deliveryCedis, setDeliveryCedis] = useState("35");

  const fees = useMemo(() => {
    const product = ghsToPesewas(productCedis || "0");
    const delivery = ghsToPesewas(deliveryCedis || "0");
    return calculateFees({
      productAmount: product,
      deliveryAmount: delivery,
      buyerFeeBps: BUYER_BPS,
      sellerFeeBps: SELLER_BPS,
      riderReleaseFee: RIDER_FEE,
      sellerReleaseFee: SELLER_RELEASE_FEE,
    });
  }, [productCedis, deliveryCedis]);

  return (
    <div className="grid lg:grid-cols-12 gap-6">
      <Card className="p-6 lg:col-span-5">
        <h3 className="font-display text-lg font-semibold">Order details</h3>
        <p className="text-sm text-[var(--muted)] mt-1">
          Enter the agreed price and delivery fee.
        </p>
        <div className="mt-6 space-y-5">
          <div>
            <Label htmlFor="product">Product price</Label>
            <Input
              id="product"
              inputMode="decimal"
              value={productCedis}
              onChange={(e) => setProductCedis(e.target.value)}
              leading="₵"
            />
          </div>
          <div>
            <Label htmlFor="delivery">Delivery fee</Label>
            <Input
              id="delivery"
              inputMode="decimal"
              value={deliveryCedis}
              onChange={(e) => setDeliveryCedis(e.target.value)}
              leading="₵"
            />
          </div>
        </div>
      </Card>

      <Card className="p-6 lg:p-8 lg:col-span-7 bg-[var(--primary)] text-[var(--primary-foreground)] border-0 shadow-[var(--shadow-pop)]">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h3 className="font-display text-xl font-bold">What everyone pays</h3>
          <Badge tone="accent">Live preview</Badge>
        </div>

        <div className="mt-6 space-y-4">
          <Block title="Buyer pays SBBS">
            <Row label="Product" value={formatGhs(ghsToPesewas(productCedis || "0"))} />
            <Row label="Delivery" value={formatGhs(ghsToPesewas(deliveryCedis || "0"))} />
            <Row label={`Buyer fee (${BUYER_BPS / 100}%)`} value={formatGhs(fees.buyerFee)} />
            {fees.riderReleaseFee > 0 && (
              <Row label="Rider release fee" value={formatGhs(fees.riderReleaseFee)} />
            )}
            {fees.sellerReleaseFee > 0 && (
              <Row label="Seller release fee" value={formatGhs(fees.sellerReleaseFee)} />
            )}
            <Row total label="Total" value={formatGhs(fees.totalCharged)} />
          </Block>

          <Block title="Seller receives" tone="accent">
            <Row label="Product" value={formatGhs(ghsToPesewas(productCedis || "0"))} />
            <Row
              label={`Seller fee (${SELLER_BPS / 100}%)`}
              value={`- ${formatGhs(fees.sellerFee)}`}
            />
            <Row total label="Net to MoMo" value={formatGhs(fees.sellerPayout)} />
          </Block>

          {fees.riderPayout > 0 && (
            <Block title="Rider receives">
              <Row total label="Net to MoMo" value={formatGhs(fees.riderPayout)} />
            </Block>
          )}
        </div>

        <p className="text-xs text-white/60 mt-6">
          Provider fees (Moolre) are passed through and never marked up.
          Final figures shown to the buyer at checkout.
        </p>
      </Card>
    </div>
  );
}

function Block({
  title,
  children,
  tone = "default",
}: {
  title: string;
  children: React.ReactNode;
  tone?: "default" | "accent";
}) {
  return (
    <div
      className={
        "rounded-[var(--radius-md)] p-4 border " +
        (tone === "accent"
          ? "border-[var(--accent)]/40 bg-[var(--accent)]/10"
          : "border-white/15 bg-white/5")
      }
    >
      <p className="text-xs uppercase tracking-[0.14em] font-semibold text-white/70">
        {title}
      </p>
      <div className="mt-3 space-y-1.5">{children}</div>
    </div>
  );
}

function Row({
  label,
  value,
  total,
}: {
  label: string;
  value: string;
  total?: boolean;
}) {
  return (
    <div
      className={
        total
          ? "flex justify-between items-baseline mt-3 pt-3 border-t border-white/15 font-display font-bold text-lg"
          : "flex justify-between items-baseline text-sm"
      }
    >
      <span className={total ? "" : "text-white/75"}>{label}</span>
      <span>{value}</span>
    </div>
  );
}
