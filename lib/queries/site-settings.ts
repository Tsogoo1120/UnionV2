import type { SupabaseClient } from "@supabase/supabase-js";

export async function getSiteSetting(
  supabase: SupabaseClient,
  key: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();

  if (error) {
    // Table may not exist yet (migration pending) — treat as no value
    if (error.message.includes("schema cache") || error.code === "42P01") {
      return null;
    }
    throw new Error(error.message);
  }
  const v = data?.value;
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

export async function getIntroVideoSettings(supabase: SupabaseClient): Promise<{
  introVideoR2Key: string | null;
  introPosterPath: string | null;
}> {
  const [introVideoR2Key, introPosterPath] = await Promise.all([
    getSiteSetting(supabase, "intro_video_r2_key"),
    getSiteSetting(supabase, "intro_poster_path"),
  ]);
  return { introVideoR2Key, introPosterPath };
}
