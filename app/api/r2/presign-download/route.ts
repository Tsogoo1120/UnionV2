/**
 * GET /api/r2/presign-download?lessonId=...&kind=video-lessons
 *
 * Subscriber/admin-only. Returns `{ url }` — a 1-hour R2 GET URL the
 * <video> element can stream from.
 *
 * Auth model:
 *   - Caller must be authenticated.
 *   - Caller must pass canAccessSubscriberContent() (active or admin).
 *
 * The endpoint resolves the R2 key from the DB row identified by `kind`
 * and `lessonId` (or `readingId`); it never trusts a client-supplied
 * R2 key directly — that would let any subscriber stream any private
 * object in the bucket.
 */
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { canAccessSubscriberContent } from "@/lib/subscription";
import { presignDownload } from "@/lib/r2/presign";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_KINDS = ["video-lessons", "collective-readings"] as const;
type Kind = (typeof ALLOWED_KINDS)[number];

export async function GET(req: Request): Promise<NextResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Profile gate.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, subscription_status, subscription_expires_at")
    .eq("id", user.id)
    .single();

  if (!canAccessSubscriberContent(profile)) {
    return NextResponse.json(
      { error: "Subscription required" },
      { status: 403 },
    );
  }

  const url = new URL(req.url);
  const kind = url.searchParams.get("kind") ?? "video-lessons";
  const lessonId = url.searchParams.get("lessonId");

  if (!ALLOWED_KINDS.includes(kind as Kind)) {
    return NextResponse.json(
      { error: `kind must be one of: ${ALLOWED_KINDS.join(", ")}` },
      { status: 400 },
    );
  }
  if (!lessonId) {
    return NextResponse.json({ error: "Missing lessonId" }, { status: 400 });
  }

  // Resolve the R2 key from the DB. RLS will hide unpublished rows from
  // regular users automatically.
  const table = kind === "video-lessons" ? "video_lessons" : "collective_readings";
  const { data: row } = await supabase
    .from(table)
    .select("video_r2_key, is_published")
    .eq("id", lessonId)
    .maybeSingle();

  if (!row?.video_r2_key) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Belt-and-suspenders: if the user isn't an admin, ensure the row is published.
  if (profile?.role !== "admin" && !row.is_published) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const signedUrl = await presignDownload({ key: row.video_r2_key });
  return NextResponse.json({ url: signedUrl });
}
