import { Container } from "@/components/ui/container";
import { AppTopbar } from "@/components/app-shell/topbar";
import { ListingForm } from "@/components/hub/listing-form";

export const metadata = { title: "New listing" };

export default function NewListingPage() {
  return (
    <>
      <AppTopbar
        title="New listing"
        subtitle="Create a product or service for the marketplace"
      />
      <main className="flex-1">
        <Container size="wide" className="py-8">
          <ListingForm />
        </Container>
      </main>
    </>
  );
}
