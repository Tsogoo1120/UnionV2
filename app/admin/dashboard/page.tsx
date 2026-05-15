import { requireAdmin } from "@/lib/auth/requireSession";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminExperience } from "@/components/admin/AdminExperience";
import {
  countProfilesForAdminSearch,
  getAdminOverviewKpis,
  listArticlesAdmin,
  listCoachingBookingsAdminDetail,
  listCoachingSlotsAdmin,
  listCollectiveReadingsAdmin,
  listPendingPaymentsWithProfiles,
  listPsychologyTestsAdmin,
  listVideoLessonsAdmin,
  searchProfilesForAdmin,
} from "@/lib/queries/admin";
import { listPendingForAdmin } from "@/lib/queries/community";

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: { q?: string; usersPage?: string; tab?: string };
}) {
  const profile = await requireAdmin();
  const adminId = profile.id;

  const supabase = await createClient();
  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("email, full_name")
    .eq("id", adminId)
    .single();

  const admin = createAdminClient();
  const page = Math.max(0, Number.parseInt(searchParams.usersPage ?? "0", 10) || 0);
  const q = searchParams.q ?? "";

  const [
    kpis,
    pendingPayments,
    slots,
    videoLessons,
    collectiveReadings,
    articles,
    tests,
    bookings,
    moderationPosts,
    users,
    userTotal,
  ] = await Promise.all([
    getAdminOverviewKpis(admin),
    listPendingPaymentsWithProfiles(admin, 50),
    listCoachingSlotsAdmin(admin, 50),
    listVideoLessonsAdmin(admin, 50),
    listCollectiveReadingsAdmin(admin, 50),
    listArticlesAdmin(admin, 50),
    listPsychologyTestsAdmin(admin, 50),
    listCoachingBookingsAdminDetail(admin, { limit: 50 }),
    listPendingForAdmin(admin),
    searchProfilesForAdmin(admin, { q, limit: 25, offset: page * 25 }),
    countProfilesForAdminSearch(admin, q),
  ]);

  const tabParam = searchParams.tab;
  const initialTab =
    tabParam === "payments" ||
    tabParam === "slots" ||
    tabParam === "bookings" ||
    tabParam === "lessons" ||
    tabParam === "readings" ||
    tabParam === "articles" ||
    tabParam === "tests" ||
    tabParam === "community" ||
    tabParam === "users" ||
    tabParam === "settings" ||
    tabParam === "overview"
      ? tabParam
      : "overview";

  return (
    <AdminExperience
      initialTab={initialTab}
      adminEmail={adminProfile?.email ?? ""}
      adminName={adminProfile?.full_name?.trim() ?? ""}
      kpis={kpis}
      pendingPayments={pendingPayments}
      slots={slots}
      videoLessons={videoLessons}
      collectiveReadings={collectiveReadings}
      articles={articles}
      tests={tests}
      bookings={bookings}
      moderationPosts={moderationPosts}
      users={users}
      usersTotal={userTotal}
      usersPage={page}
      usersQuery={q}
    />
  );
}
