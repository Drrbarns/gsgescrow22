import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { ShieldCheck } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-paper">
      <div className="flex flex-col">
        <header className="px-6 sm:px-10 py-6 border-b border-[var(--border)]">
          <Logo />
        </header>
        <main className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">{children}</div>
        </main>
        <footer className="px-6 sm:px-10 py-6 border-t border-[var(--border)] text-xs text-[var(--muted)] flex flex-wrap justify-between gap-2">
          <p>© {new Date().getFullYear()} GSG Brands</p>
          <Link href="/" className="hover:text-[var(--foreground)]">
            Back to sbbs.gh
          </Link>
        </footer>
      </div>
      <div className="hidden lg:flex bg-[var(--primary)] text-[var(--primary-foreground)] items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-grain opacity-20 pointer-events-none" />
        <div className="relative max-w-md">
          <ShieldCheck size={36} className="text-[var(--accent)]" />
          <h2 className="font-display text-3xl font-bold mt-6">
            Pay only when the goods arrive.
          </h2>
          <p className="mt-4 text-white/75 leading-relaxed">
            SBBS holds your money safely until you confirm the item is what
            was promised. Built for the way Ghanaians actually shop.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-white/85">
            <li>· Funds held by Moolre — never by SBBS</li>
            <li>· KYC&rsquo;d sellers with reputation history</li>
            <li>· Real human dispute review within 5 business days</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
