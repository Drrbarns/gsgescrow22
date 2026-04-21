import { LegalShell } from "@/components/marketing/legal-shell";

export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <LegalShell eyebrow="Legal" title="Privacy Policy" effective="20 April 2026">
      <p>
        SBBS is committed to protecting your personal information. This policy explains what we collect, why, and your rights as a Ghanaian data subject under the Data Protection Act (Act 843).
      </p>

      <h2>1. Information we collect</h2>
      <ul>
        <li>Identity: name, phone, email, KYC documents (sellers only).</li>
        <li>Transaction: items, parties, addresses, amounts, timestamps.</li>
        <li>Device: IP, user agent, audit log of money-touching actions.</li>
      </ul>

      <h2>2. How we use it</h2>
      <ul>
        <li>To process and protect your transactions.</li>
        <li>To resolve disputes fairly with documented evidence.</li>
        <li>To meet our legal obligations under Bank of Ghana and DPC rules.</li>
      </ul>

      <h2>3. Public information</h2>
      <p>
        Public tracking pages and Trust Badges show only the order reference, status, item description, redacted phone numbers, and seller display name. Full names and full phone numbers are never public.
      </p>

      <h2>4. Sharing</h2>
      <p>
        We share data only with payment providers (Moolre), SMS providers (Hubtel), and law enforcement when legally compelled. We do not sell your information.
      </p>

      <h2>5. Retention</h2>
      <p>
        Financial records are retained for seven years to meet regulatory obligations. Other personal data is retained while your account is active and deleted on request, subject to legal exceptions.
      </p>

      <h2>6. Your rights</h2>
      <p>
        You may access, correct, or delete your data by writing to <a href="mailto:privacy@sbbs.gh">privacy@sbbs.gh</a>. You may also lodge a complaint with the Data Protection Commission of Ghana.
      </p>
    </LegalShell>
  );
}
