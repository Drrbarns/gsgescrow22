import { Container, Section, Eyebrow } from "@/components/ui/container";
import { SellerWizard } from "@/components/seller/seller-wizard";
import { MarketingNav } from "@/components/marketing/nav";

export const metadata = { title: "Create a payment link" };

export default function SellPage() {
  return (
    <>
      <MarketingNav />
      <Section className="bg-paper min-h-[80vh]">
        <Container size="lg">
          <Eyebrow>Seller wizard</Eyebrow>
          <h1 className="font-display text-4xl sm:text-5xl font-bold mt-4 tracking-tight">
            Create a protected payment link.
          </h1>
          <p className="mt-4 text-lg text-[var(--muted)] max-w-2xl">
            Enter the buyer&rsquo;s details and the agreed price. We&rsquo;ll
            generate a link you can drop in WhatsApp, Instagram or SMS.
          </p>
          <div className="mt-10">
            <SellerWizard />
          </div>
        </Container>
      </Section>
    </>
  );
}
