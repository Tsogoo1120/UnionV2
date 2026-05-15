import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { CollectiveReading, VideoLesson } from "@/lib/types";

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

/**
 * Resolves a short-lived stream URL via `GET /api/r2/presign-download`.
 * Forwards the request session cookie so the route handler can authorize.
 *
 * `supabase` is part of the public API for consistency with other query helpers.
 */
export async function getLessonStreamUrl(
  _supabase: SupabaseClient,
  lessonId: string,
  kind: "video" | "collective",
): Promise<string> {
  const kindParam = kind === "video" ? "video-lessons" : "collective-readings";
  const cookieStore = cookies();
  const url = new URL(
    "/api/r2/presign-download",
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  );

  url.searchParams.set("kind", kindParam);
  url.searchParams.set("lessonId", lessonId);

  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      cookie: cookieHeader,
    },
    cache: "no-store",
  });

  const payload = (await response.json()) as { url?: string; error?: string };

  if (!response.ok || !payload?.url) {
    throw new Error(payload?.error ?? "Unable to get lesson stream URL.");
  }

  return payload.url;
}
