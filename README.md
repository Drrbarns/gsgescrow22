# Sell-Safe Buy-Safe (SBBS)

Ghana's protected checkout for informal social commerce. One Next.js app, one Vercel project, one Supabase database, one Paystack account.

> **What is SBBS?** A trusted middleman that sits between buyers and sellers in informal Ghanaian online commerce, holding the buyer's money safely until the buyer confirms the goods arrived as promised — and only then releasing payment to the seller.

## Architecture in one breath

- **Framework**: Next.js 16 (App Router, RSC, Server Actions) + TypeScript
- **DB / Auth / Storage**: Supabase (Postgres + Auth + Storage)
- **ORM**: Drizzle
- **Payments**: Paystack (with adapter pattern; Hubtel/Moolre/Flutterwave can drop in)
- **SMS**: Hubtel (Ghana-local sender ID; `SmsAdapter` interface for swapouts)
- **Email**: Resend
- **PDF**: `@react-pdf/renderer` for receipts
- **Cron**: Vercel Cron (72-hour auto-release, payout sweep)
- **UI**: Tailwind v4 + custom design system (Sora + Plus Jakarta Sans + IBM Plex Mono)
- **State machine**: Hand-rolled discriminated unions in `src/lib/state/transaction.ts`

## Repo shape

```
src/
  app/
    (marketing)/         home, how-it-works, calculator, track, reviews, badge, public seller profile, legal pages
    (auth)/              login, signup, admin-login
    (buyer)/buy          three-step buyer wizard + payment return page
    (seller)/sell        seller wizard
    (hub)/hub            unified buyer+seller dashboard, transactions list, detail, disputes, profile
    (admin)/admin        full control plane: dashboard, users, transactions, disputes, payouts, approvals, KYC, fraud, riders, reports, settings
    api/
      health             liveness probe
      stats              public counter
      webhooks/paystack  PSP webhook handler
      cron/auto-release  72h sweep
      cron/payout-sweep  retry stuck transfers
      badge/[handle]     SVG Trust Badge endpoint
      receipt/[ref]      PDF receipt
  components/            UI primitives + brand + marketing + buyer + seller + hub + admin + auth
  lib/
    auth/                Supabase server/client + role guards
    audit/               audit log writer used by every server action
    db/                  drizzle schema + client + seed
    payments/            PSP interface + Paystack + Hubtel + stub adapters + fee math
    sms/                 SMS adapter + Hubtel impl + stub
    state/               transaction state machine
    actions/             server actions for transactions, disputes, KYC, reviews, profile
```

## Setup

### 1. Install

```bash
npm install
cp .env.example .env.local
```

### 2. Supabase

Create a free Supabase project at https://supabase.com.

In your project settings:
- Copy the **URL** to `NEXT_PUBLIC_SUPABASE_URL`
- Copy the **anon public key** to `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Copy the **service role key** to `SUPABASE_SERVICE_ROLE_KEY`
- From **Database → Connection string → URI** (use the **Pooler** URL for serverless), copy to `DATABASE_URL`

Apply schema:

```bash
npm run db:push
npm run db:seed
```

Enable Auth (Email + OTP) in **Authentication → Providers**.

Optionally apply Row-Level Security (RLS) policies. The schema is designed for RLS; example policies you may want:

```sql
alter table profiles enable row level security;
create policy "users see their own profile"
  on profiles for select using (auth.uid() = id);

alter table transactions enable row level security;
create policy "parties read their own transactions"
  on transactions for select using (auth.uid() = buyer_id or auth.uid() = seller_id);
```

Server actions use the service role behind `getDb()` and never expose it to the client.

### 3. Paystack (Ghana MoMo + cards)

- Create a Ghana business account at https://paystack.com
- Copy the secret key to `PAYSTACK_SECRET_KEY`
- Copy the public key to `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` (used client-side)
- In Paystack dashboard, set the webhook URL to `https://your-domain.vercel.app/api/webhooks/paystack`

Until live keys are in, the app uses an internal stub PSP that simulates a successful payment so you can demo the full flow.

### 4. Hubtel SMS (optional but recommended for Ghana)

Register a sender ID with Hubtel and set:

```
HUBTEL_CLIENT_ID=...
HUBTEL_CLIENT_SECRET=...
HUBTEL_SENDER_ID=SBBS
```

Without these, SMS logs to the server console as a no-op.

### 5. Resend (transactional email)

```
RESEND_API_KEY=re_...
RESEND_FROM="SBBS <hello@your-domain>"
```

### 6. Cron secret

```
CRON_SECRET=<random hex string>
```

`vercel.json` already declares two cron jobs:

```json
{
  "crons": [
    { "path": "/api/cron/auto-release", "schedule": "*/15 * * * *" },
    { "path": "/api/cron/payout-sweep",  "schedule": "0 * * * *" }
  ]
}
```

The cron handlers reject requests without `Authorization: Bearer ${CRON_SECRET}`.

### 7. Run locally

```bash
npm run dev
```

Open http://localhost:3000.

## Deploy to Vercel

1. Push to GitHub.
2. Import the repo in Vercel.
3. Add all environment variables from `.env.example`.
4. Deploy.
5. In Paystack, set the webhook URL to `https://<your-vercel-domain>/api/webhooks/paystack`.

The single Vercel project hosts marketing, buyer/seller flows, the Hub, the admin control plane, the PSP webhook, the cron handlers, the badge endpoint, the PDF receipt, and the public tracker.

## Phased build summary

The codebase ships in five phases that each leave a deployable system:

| Phase | What's in it |
|---|---|
| 0 | Foundation: Next, Tailwind, Drizzle schema, Supabase auth, RLS-ready, PSP/SMS adapters, audit log, deploy skeleton |
| 1 | Public marketing: home with live counter, how-it-works, calculator, public tracking, badge, public seller profile, legal pages |
| 2 | Core escrow happy path: buyer wizard, seller wizard, Paystack init + webhook, Hub, delivery code, auto-release cron, admin payout approval queue, SMS + email + PDF receipt |
| 3 | Trust & safety: KYC submission, disputes, dispute evidence vault, three-way resolution, Paystack refund API, reviews + trust score, auto-release pause when disputed |
| 4 | Admin control plane: KPI dashboard, users, transactions, disputes review, payouts, payout approvals, KYC verifications, fraud rules + alerts, reports with monthly GMV chart, platform settings, /admin-login |
| 5 | Riders & expansion: rider directory, rider payout bucket released on dispatch, Hubtel PSP adapter behind the same interface, listing-fee plumbing in `platform_settings` |

## Compliance guardrails baked in

- Funds always sit with a licensed PSP (Paystack), never in a personal account, never with SBBS staff.
- Every money-touching server action writes to `audit_log` with actor, ip, user-agent, and reason.
- The Supabase service role key is only used inside server actions, never on the client.
- PSP webhooks are HMAC-SHA512 verified and idempotency-keyed against `webhooks_log`.
- Platform caps are enforced server-side from environment variables and `platform_settings`.
- Phone numbers are redacted on every public surface (`***1234`).
- Two-approver mode is a flag in `platform_settings` (Phase 4) for high-value payouts.
- Soft-delete + 7-year retention is the design intent for financial records.

## Daily ops

```bash
npm run dev          # start local dev server
npm run build        # production build
npm run start        # production server
npm run db:generate  # generate drizzle migration files
npm run db:push      # push schema to Supabase (dev)
npm run db:migrate   # run migrations (production)
npm run db:studio    # open Drizzle Studio
npm run db:seed      # seed default platform settings
```

## License

Proprietary © GSG Brands.
