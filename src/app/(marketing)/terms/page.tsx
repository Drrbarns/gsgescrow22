import { LegalShell } from "@/components/marketing/legal-shell";

export const metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <LegalShell eyebrow="Legal" title="Terms of Service" effective="20 April 2026">
      <p>
        Sell-Safe Buy-Safe (&ldquo;SBBS&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) is a service operated by GSG Brands, registered in Ghana. By using SBBS you agree to these terms.
      </p>

      <h2>1. What SBBS does</h2>
      <p>
        SBBS holds buyer payments with a licensed Payment Service Provider (PSP) and releases them to sellers only after the buyer has confirmed delivery, or after the auto-release timer expires. SBBS does not custody funds itself.
      </p>

      <h2>2. Eligibility</h2>
      <ul>
        <li>You must be at least 18 years old.</li>
        <li>You must provide accurate identification information when required.</li>
        <li>Sellers must complete KYC before receiving payouts.</li>
      </ul>

      <h2>3. Fees</h2>
      <p>
        Fees are displayed before any payment is confirmed. Provider fees (Moolre and similar) are passed through and not marked up.
      </p>

      <h2>4. Disputes</h2>
      <p>
        Either party may open a dispute from their Hub. The transaction is paused. Both sides upload evidence. SBBS reviews and decides within five business days. Refunds are issued to the original payment method.
      </p>

      <h2>5. Prohibited use</h2>
      <ul>
        <li>Money laundering or fraud.</li>
        <li>Sale of goods or services prohibited under Ghanaian law.</li>
        <li>Misrepresentation of identity or location.</li>
      </ul>

      <h2>6. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, SBBS&rsquo;s aggregate liability for any claim relating to a transaction is limited to the amount of that transaction.
      </p>

      <h2>7. Governing law</h2>
      <p>
        These terms are governed by the laws of Ghana. Disputes are subject to the jurisdiction of the courts of Accra.
      </p>

      <h2>8. Changes</h2>
      <p>
        We may update these terms from time to time. Material changes will be notified by email and SMS at least 14 days before they take effect.
      </p>
    </LegalShell>
  );
}
