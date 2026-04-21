import { LegalShell } from "@/components/marketing/legal-shell";

export const metadata = { title: "Security" };

export default function SecurityPage() {
  return (
    <LegalShell eyebrow="Trust" title="Security at SBBS" effective="20 April 2026">
      <p>
        SBBS treats safety as the product. These are the technical and operational guardrails we run.
      </p>

      <h2>Funds</h2>
      <ul>
        <li>Funds always sit with a licensed PSP (Moolre), never in a personal account, never with SBBS staff.</li>
        <li>Every payout requires a human approver click before money leaves the platform.</li>
        <li>High-value payouts trigger a two-approver requirement.</li>
      </ul>

      <h2>Access control</h2>
      <ul>
        <li>Role-based access (buyer, seller, rider, approver, admin, superadmin).</li>
        <li>Admin impersonation requires a written reason and is fully audit-logged.</li>
        <li>The service-role database key is only ever used inside server actions, never in client code.</li>
      </ul>

      <h2>Data</h2>
      <ul>
        <li>Postgres at rest with row-level security; private buckets for KYC and dispute evidence.</li>
        <li>SHA-256 hashes recorded for every uploaded evidence file.</li>
        <li>Phone numbers redacted on every public surface.</li>
      </ul>

      <h2>Webhooks</h2>
      <ul>
        <li>Moolre webhooks verified with HMAC-SHA256 signature and idempotency keys.</li>
        <li>Idempotency keys recorded so a replayed webhook never causes a double action.</li>
      </ul>

      <h2>Compliance</h2>
      <ul>
        <li>Bank of Ghana PSP due-diligence letter on file.</li>
        <li>Data Protection Commission registration in progress.</li>
        <li>Annual penetration test by an external firm.</li>
      </ul>

      <h2>Reporting issues</h2>
      <p>
        If you discover a vulnerability, please email <a href="mailto:security@sbbs.gh">security@sbbs.gh</a>. We acknowledge within 24 hours.
      </p>
    </LegalShell>
  );
}
