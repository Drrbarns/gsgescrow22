import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppTopbar } from "@/components/app-shell/topbar";
import { getCurrentProfile, getSessionUser } from "@/lib/auth/session";
import { ProfileForm } from "@/components/hub/profile-form";
import { KycForm } from "@/components/hub/kyc-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Profile & KYC" };

export default async function HubProfilePage() {
  const user = await getSessionUser();
  const profile = await getCurrentProfile();

  return (
    <>
      <AppTopbar title="Profile & KYC" subtitle="Identity, MoMo payout, and Trust Badge eligibility" />
      <main className="flex-1">
        <Container size="wide" className="py-8 grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="font-display text-lg font-semibold">Your identity</h2>
              <ProfileForm
                initial={{
                  displayName: profile?.displayName ?? user?.email?.split("@")[0] ?? "",
                  handle: profile?.handle ?? "",
                  bio: profile?.bio ?? "",
                  location: profile?.location ?? "",
                  momoNumber: profile?.momoNumber ?? "",
                  momoNetwork: profile?.momoNetwork ?? "MTN",
                }}
              />
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="font-display text-lg font-semibold">KYC verification</h2>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    Upload your ID documents. Required for payouts above the soft-launch cap and for the Trust Badge.
                  </p>
                </div>
                <Badge
                  tone={
                    profile?.kycStatus === "approved"
                      ? "success"
                      : profile?.kycStatus === "pending"
                        ? "warning"
                        : profile?.kycStatus === "rejected"
                          ? "danger"
                          : "neutral"
                  }
                  dot
                >
                  {profile?.kycStatus ?? "none"}
                </Badge>
              </div>
              <div className="mt-6">
                <KycForm current={{ kycStatus: profile?.kycStatus ?? "none", legalName: profile?.displayName ?? "" }} />
              </div>
            </Card>
          </div>
          <aside>
            <Card className="p-6 lg:sticky lg:top-24">
              <h3 className="font-display font-semibold">Account</h3>
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="text-xs uppercase tracking-[0.14em] text-[var(--muted)] font-semibold">Email</dt>
                  <dd className="mt-1">{user?.email ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.14em] text-[var(--muted)] font-semibold">Role</dt>
                  <dd className="mt-1 capitalize">{profile?.role ?? "buyer"}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.14em] text-[var(--muted)] font-semibold">Trust score</dt>
                  <dd className="mt-1 font-mono">{profile?.trustScore?.toFixed(2) ?? "0.00"}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.14em] text-[var(--muted)] font-semibold">Trust Badge</dt>
                  <dd className="mt-1">
                    {profile?.badgeEnabled ? (
                      <Badge tone="success" dot>Enabled</Badge>
                    ) : (
                      <Badge tone="neutral">Unlocks after KYC</Badge>
                    )}
                  </dd>
                </div>
              </dl>
            </Card>
          </aside>
        </Container>
      </main>
    </>
  );
}
