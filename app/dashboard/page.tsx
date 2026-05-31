import { redirect } from "next/navigation";
import { DashboardExperience } from "@/components/dashboard/DashboardExperience";
import { requireSession } from "@/lib/auth/requireSession";
import { createClient } from "@/lib/supabase/server";
import { listTransactions } from "@/lib/queries/transactions";
import {
  listPublishedLessons,
  listPublishedVideoCategories,
} from "@/lib/queries/lessons";
import { listAvailableSlots, listMyBookings } from "@/lib/queries/coaching";
import { listPublishedArticles } from "@/lib/queries/articles";
import { listPublishedTests } from "@/lib/queries/tests";

type Tab = "hub" | "lessons" | "coaching" | "profile";

function parseTab(raw: string | undefined): Tab {
  if (raw === "lessons" || raw === "coaching" || raw === "profile" || raw === "hub") {
    return raw;
  }
  return "hub";
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { tab?: string; level?: string };
}) {
  const supabase = await createClient();
  const profile = await requireSession();

  if (!profile.phone || profile.phone.trim().length === 0) {
    redirect("/auth/onboarding");
  }

  const levelRaw = searchParams.level;
  const levelFilter =
    levelRaw && levelRaw !== "all" ? decodeURIComponent(levelRaw) : null;

  const [
    recentTransactions,
    continueLessons,
    lessonGrid,
    upcomingSlots,
    myBookings,
    lessonCategories,
    collectiveFirst,
    articlesFirst,
    testsFirst,
    videoCountRes,
    collectiveCountRes,
    articlesCountRes,
    testsCountRes,
    communityWeekRes,
  ] = await Promise.all([
    listTransactions(supabase, {
      userId: profile.id,
      kind: "all",
      limit: 5,
      offset: 0,
    }),
    listPublishedLessons(supabase, "video", { limit: 3 }),
    listPublishedLessons(supabase, "video", {
      limit: 12,
      category: levelFilter ?? undefined,
    }),
    listAvailableSlots(supabase, { limit: 5 }),
    listMyBookings(supabase, { limit: 5 }),
    listPublishedVideoCategories(supabase),
    listPublishedLessons(supabase, "collective", { limit: 1 }),
    listPublishedArticles(supabase, { limit: 1 }),
    listPublishedTests(supabase, { limit: 1 }),
    supabase
      .from("video_lessons")
      .select("id", { count: "exact", head: true })
      .eq("is_published", true),
    supabase
      .from("collective_readings")
      .select("id", { count: "exact", head: true })
      .eq("is_published", true),
    supabase.from("articles").select("id", { count: "exact", head: true }).eq("is_published", true),
    supabase
      .from("psychology_tests")
      .select("id", { count: "exact", head: true })
      .eq("is_published", true),
    supabase
      .from("community_posts")
      .select("id", { count: "exact", head: true })
      .eq("is_hidden", false)
      .gte(
        "created_at",
        new Date(Date.now() - 7 * 86400000).toISOString(),
      ),
  ]);

  const collectiveArr = collectiveFirst as import("@/lib/types").CollectiveReading[];
  const firstReadingSlug = collectiveArr[0]?.slug ?? null;
  const firstArticleSlug = articlesFirst[0]?.slug ?? null;
  void testsFirst;

  return (
    <DashboardExperience
      profile={profile}
      recentTransactions={recentTransactions}
      continueLessons={continueLessons as import("@/lib/types").VideoLesson[]}
      lessonGrid={lessonGrid as import("@/lib/types").VideoLesson[]}
      lessonCategories={lessonCategories}
      levelFilter={levelFilter}
      upcomingSlots={upcomingSlots}
      myBookings={myBookings}
      initialTab={parseTab(searchParams.tab)}
      hubStats={{
        videoLessons: videoCountRes.count ?? 0,
        collectiveReadings: collectiveCountRes.count ?? 0,
        articles: articlesCountRes.count ?? 0,
        tests: testsCountRes.count ?? 0,
        communityPostsWeek: communityWeekRes.count ?? 0,
      }}
      firstReadingSlug={firstReadingSlug}
      firstArticleSlug={firstArticleSlug}
    />
  );
}
