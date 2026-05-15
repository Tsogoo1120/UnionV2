import type { SupabaseClient } from "@supabase/supabase-js";
import type { PsychologyTest, TestResult } from "@/lib/types";

export async function listPublishedTests(
  supabase: SupabaseClient,
  opts: { limit?: number; offset?: number } = {},
): Promise<PsychologyTest[]> {
  const { data, error } = await supabase
    .from("psychology_tests")
    .select("*")
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .range(opts.offset ?? 0, (opts.offset ?? 0) + (opts.limit ?? 50) - 1);

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getTestBySlug(
  supabase: SupabaseClient,
  slug: string,
): Promise<PsychologyTest | null> {
  const { data, error } = await supabase
    .from("psychology_tests")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function listMyTestResults(
  supabase: SupabaseClient,
): Promise<TestResult[]> {
  const { data, error } = await supabase
    .from("test_results")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

/** Latest attempt for the current user on a published test (by slug). */
export async function getLatestTestResultForSlug(
  supabase: SupabaseClient,
  slug: string,
): Promise<{ test: PsychologyTest; result: TestResult } | null> {
  const test = await getTestBySlug(supabase, slug);
  if (!test) return null;

  const { data, error } = await supabase
    .from("test_results")
    .select("*")
    .eq("test_id", test.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  return { test, result: data };
}
