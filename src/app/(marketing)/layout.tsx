import { MarketingNav } from "@/components/marketing/nav";
import { MarketingFooter } from "@/components/marketing/footer";
import { AnnouncementBar } from "@/components/marketing/announcement-bar";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <AnnouncementBar />
      <MarketingNav />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}
