import type { SupabaseClient } from "@supabase/supabase-js";
import type { CollectiveReading, ShortsFeedCursor, VideoLesson } from "@/lib/types";

export async function listPublishedLessons(
  supabase: SupabaseClient,
  kind: "video" | "collective",
  opts: { limit?: number; offset?: number; category?: string | null } = {},
): Promise<VideoLesson[] | CollectiveReading[]> {
  const table = kind === "video" ? "video_lessons" : "collective_readings";
  let q = supabase
    .from(table)
    .select("*")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  if (kind === "video" && opts.category) {
    q = q.eq("category", opts.category);
  }

  const { data, error } = await q.range(
    opts.offset ?? 0,
    (opts.offset ?? 0) + (opts.limit ?? 50) - 1,
  );

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

/** Distinct non-null categories from published video lessons (RLS applies). */
export async function listPublishedVideoCategories(
  supabase: SupabaseClient,
): Promise<string[]> {
  const { data, error } = await supabase
    .from("video_lessons")
    .select("category")
    .eq("is_published", true)
    .not("category", "is", null);

  if (error) throw new Error(error.message);
  const set = new Set<string>();
  for (const row of data ?? []) {
    const c = row.category as string | null;
    if (c) set.add(c);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, "mn"));
}

export async function getLessonBySlug(
  supabase: SupabaseClient,
  slug: string,
  kind: "video" | "collective",
): Promise<VideoLesson | CollectiveReading | null> {
  const table = kind === "video" ? "video_lessons" : "collective_readings";
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function listPublishedShorts(
  supabase: SupabaseClient,
  opts: { limit?: number; cursor?: ShortsFeedCursor } = {},
): Promise<VideoLesson[]> {
  let q = supabase
    .from("video_lessons")
    .select("*")
    .eq("is_published", true)
    .eq("format", "short")
    .order("published_at", { ascending: false })
    .order("id", { ascending: false });

  if (opts.cursor) {
    q = q.or(
      `published_at.lt.${opts.cursor.published_at},and(published_at.eq.${opts.cursor.published_at},id.lt.${opts.cursor.id})`,
    );
  }

  const { data, error } = await q.limit(opts.limit ?? 10);
  if (error) throw new Error(error.message);
  return (data ?? []) as VideoLesson[];
}

export async function getShortByIdForFeed(
  supabase: SupabaseClient,
  id: string,
): Promise<VideoLesson | null> {
  const { data, error } = await supabase
    .from("video_lessons")
    .select("*")
    .eq("id", id)
    .eq("is_published", true)
    .eq("format", "short")
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as VideoLesson | null;
}

