import { MarketingArticleRow } from "./MarketingArticleRow";
import { MarketingCoachingStrip } from "./MarketingCoachingStrip";
import { MarketingFooter } from "./MarketingFooter";
import { MarketingHero } from "./MarketingHero";
import { MarketingIntroVideo } from "./MarketingIntroVideo";
import { MarketingNav } from "./MarketingNav";
import { MarketingServiceList } from "./MarketingServiceList";
import type {
  ServiceId,
  ServicePreviewItem,
} from "@/lib/queries/service-previews";
import type { CoachingSlot } from "@/lib/types";

type MarketingHomeProps = {
  /** After sign-in, return here (e.g. from middleware `/?next=`). */
  authReturnTo?: string;
  coachingSlots?: CoachingSlot[];
  introVideoUrl?: string | null;
  introPosterUrl?: string | null;
  servicePreviews?: Record<ServiceId, ServicePreviewItem[]>;
  signedIn?: boolean;
};

export function MarketingHome({
  authReturnTo,
  coachingSlots = [],
  introVideoUrl = null,
  introPosterUrl = null,
  servicePreviews,
  signedIn = false,
}: MarketingHomeProps = {}) {
  const returnTo =
    typeof authReturnTo === "string" &&
    authReturnTo.startsWith("/") &&
    !authReturnTo.startsWith("//")
      ? authReturnTo
      : "/dashboard";
  const signInHref = `/auth?next=${encodeURIComponent(returnTo)}`;
  const memberHref = `/auth?next=${encodeURIComponent("/payment")}`;

  return (
    <>
      <MarketingNav signInHref={signInHref} memberHref={memberHref} />
      <MarketingHero memberCtaHref={memberHref} />
      <MarketingIntroVideo introVideoUrl={introVideoUrl} posterUrl={introPosterUrl} />
      <MarketingServiceList previews={servicePreviews} />
      <MarketingCoachingStrip slots={coachingSlots} signedIn={signedIn} />
      <MarketingArticleRow items={servicePreviews?.articles} />
      <MarketingFooter />
    </>
  );
}
