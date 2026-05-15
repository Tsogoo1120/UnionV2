import { redirect } from "next/navigation";
import { MarketingHome } from "@/components/marketing/MarketingHome";
import { getEffectiveStatus } from "@/lib/auth/getEffectiveStatus";
import { pathForEffectiveStatus } from "@/lib/auth/redirectByEffectiveStatus";
import { getCurrentProfile } from "@/lib/queries/profile";
import { listAvailableSlots } from "@/lib/queries/coaching";
import { getServicePreviews } from "@/lib/queries/service-previews";
import { getIntroVideoSettings } from "@/lib/queries/site-settings";
import { presignDownload } from "@/lib/r2/presign";
import { createClient } from "@/lib/supabase/server";

export default async function Home({
  searchParams,
}: {
  searchParams: { next?: string | string[]; landing?: string | string[] };
}) {
  const supabase = await createClient();
  const profile = await getCurrentProfile(supabase);
  const landingParam = searchParams.landing;
  const showLanding =
    landingParam === "1" ||
    landingParam === "true" ||
    (Array.isArray(landingParam) &&
      (landingParam[0] === "1" || landingParam[0] === "true"));

  if (profile && !showLanding) {
    redirect(pathForEffectiveStatus(getEffectiveStatus(profile)));
  }

  const raw = searchParams.next;
  const authReturnTo =
    typeof raw === "string" && raw.startsWith("/") && !raw.startsWith("//")
      ? raw
      : undefined;

  const [coachingSlots, introSettings, servicePreviews] = await Promise.all([
    listAvailableSlots(supabase, { limit: 4 }),
    getIntroVideoSettings(supabase),
    getServicePreviews(supabase),
  ]);

  let introVideoUrl: string | null = null;
  if (introSettings.introVideoR2Key) {
    try {
      introVideoUrl = await presignDownload({ key: introSettings.introVideoR2Key });
    } catch {
      introVideoUrl = null;
    }
  }

  const introPosterUrl = introSettings.introPosterPath
    ? supabase.storage.from("media-thumbnails").getPublicUrl(introSettings.introPosterPath).data
        .publicUrl
    : null;

  return (
    <MarketingHome
      authReturnTo={authReturnTo}
      coachingSlots={coachingSlots}
      introVideoUrl={introVideoUrl}
      introPosterUrl={introPosterUrl}
      servicePreviews={servicePreviews}
      signedIn={Boolean(profile)}
    />
  );
}
