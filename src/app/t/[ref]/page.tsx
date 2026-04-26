import { redirect } from "next/navigation";

/**
 * Short alias for /track/{ref}. We SMS customers a lot of URLs and every
 * byte saved keeps us inside the 160-char GSM-7 limit. This route is a
 * permanent redirect so crawlers (and anyone who already has an old SMS
 * on their phone) always land on the public tracking page.
 */
export const dynamic = "force-dynamic";

export default async function TShortLinkPage({
  params,
}: {
  params: Promise<{ ref: string }>;
}) {
  const { ref } = await params;
  redirect(`/track/${encodeURIComponent(ref)}`);
}
