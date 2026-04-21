import type { Metadata } from "next";
import { Sora, Plus_Jakarta_Sans, IBM_Plex_Mono, Fraunces } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-editorial",
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: "Sell-Safe Buy-Safe — Ghana's protected checkout",
    template: "%s · SBBS",
  },
  description:
    "SBBS holds the buyer's money safely until the goods arrive as promised. The trusted middleman for Instagram, WhatsApp, TikTok and informal commerce in Ghana.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://sbbs.gh"),
  openGraph: {
    title: "Sell-Safe Buy-Safe",
    description:
      "Escrow + Trust Badge + Dispute Court for Ghanaian social commerce.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${jakarta.variable} ${plexMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
        <Toaster
          position="top-center"
          richColors
          closeButton
          toastOptions={{
            style: {
              fontFamily: "var(--font-sans)",
            },
          }}
        />
      </body>
    </html>
  );
}
