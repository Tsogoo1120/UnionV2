import type { SupabaseClient } from "@supabase/supabase-js";
import type { Article } from "@/lib/types";

export async function listPublishedArticles(
  supabase: SupabaseClient,
  opts: { limit?: number; offset?: number } = {},
): Promise<Article[]> {
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .range(opts.offset ?? 0, (opts.offset ?? 0) + (opts.limit ?? 50) - 1);

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getArticleBySlug(
  supabase: SupabaseClient,
  slug: string,
): Promise<Article | null> {
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
