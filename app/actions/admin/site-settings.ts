"use server";

import { revalidatePath } from "next/cache";
import { verifyAdmin } from "@/app/actions/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { presignUpload } from "@/lib/r2/presign";

const INTRO_VIDEO_KEY = "site/intro.mp4";

export async function getSiteSettingsAdmin(): Promise<{
  introVideoR2Key: string | null;
  introPosterPath: string | null;
  error?: string;
}> {
  try {
    await verifyAdmin();
    const admin = createAdminClient();
    const { data, error } = await admin.from("site_settings").select("key, value");
    if (error) return { introVideoR2Key: null, introPosterPath: null, error: error.message };

    const map = new Map((data ?? []).map((r) => [r.key, r.value]));
    const introVideoR2Key = map.get("intro_video_r2_key")?.trim() || null;
    const introPosterPath = map.get("intro_poster_path")?.trim() || null;
    return { introVideoR2Key, introPosterPath };
  } catch (err) {
    return {
      introVideoR2Key: null,
      introPosterPath: null,
      error: err instanceof Error ? err.message : "Unexpected error.",
    };
  }
}

export async function presignIntroVideoUpload(
  contentType: string,
): Promise<{ key?: string; uploadUrl?: string; error?: string }> {
  try {
    await verifyAdmin();
    const allowed = ["video/mp4", "video/webm", "video/quicktime"];
    if (!allowed.includes(contentType)) {
      return { error: "Зөвхөн MP4 эсвэл WebM видео." };
    }
    const uploadUrl = await presignUpload({ key: INTRO_VIDEO_KEY, contentType });
    return { key: INTRO_VIDEO_KEY, uploadUrl };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unexpected error." };
  }
}

export async function saveIntroVideoKey(): Promise<{ error?: string }> {
  try {
    await verifyAdmin();
    const admin = createAdminClient();
    const { error } = await admin
      .from("site_settings")
      .upsert({ key: "intro_video_r2_key", value: INTRO_VIDEO_KEY });
    if (error) return { error: error.message };
    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unexpected error." };
  }
}

export async function saveIntroPosterPath(path: string): Promise<{ error?: string }> {
  try {
    await verifyAdmin();
    const admin = createAdminClient();
    const { error } = await admin
      .from("site_settings")
      .upsert({ key: "intro_poster_path", value: path.trim() });
    if (error) return { error: error.message };
    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unexpected error." };
  }
}
