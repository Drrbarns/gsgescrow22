import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { AppTopbar } from "@/components/app-shell/topbar";
import { Bell } from "lucide-react";

export const metadata = { title: "Notifications" };

export default function HubNotificationsPage() {
  return (
    <>
      <AppTopbar title="Notifications" subtitle="SMS and email events for your transactions" />
      <main className="flex-1">
        <Container size="wide" className="py-8">
          <Card className="p-14 text-center">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary-soft)] text-[var(--primary)] mx-auto">
              <Bell size={20} />
            </span>
            <h3 className="font-display text-xl font-semibold mt-4">Quiet for now</h3>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Important alerts about your transactions will land here. We also
              SMS you and email your receipt automatically.
            </p>
          </Card>
        </Container>
      </main>
    </>
  );
}
