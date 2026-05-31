"use server";

/**
 * Server actions for the video-lessons service.
 *
 * Admin actions (create/update/delete/publish/upload-url) all funnel
 * through verifyAdmin() before touching the admin client.
 *
 * Subscriber action getVideoStreamUrl() gates on
 * canAccessSubscriberContent(), then returns a fresh 1-hour R2 GET URL.
 */

import { revalidatePath } from "next/cache";
import { verifyAdmin } from "./admin";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { canAccessSubscriberContent } from "@/lib/subscription";
import {
  generateR2Key,
  presignUpload,
  presignDownload,
  deleteR2Object,
} from "@/lib/r2/presign";
import { sendVideoLessonPublishedEmail } from "@/lib/email/send";

const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

export type VideoLessonInput = {
  slug: string;
  title: string;
  description?: string | null;
  body?: string | null;
  category?: string | null;
  thumbnail_path?: string | null;
  hero_image_path?: string | null;
  description_image_path?: string | null;
  video_r2_key: string;
  duration_seconds?: number | null;
  sort_order?: number;
};

// ─── Admin: request R2 upload URL ───────────────────────────────────────────

export async function requestVideoUploadUrl(opts: {
  filename: string;
  contentType: string;
}): Promise<{ key?: string; uploadUrl?: string; error?: string }> {
  try {
    await verifyAdmin();
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Not authorized." };
  }

  if (!ALLOWED_VIDEO_TYPES.includes(opts.contentType)) {
    return {
      error: `Content-Type must be one of: ${ALLOWED_VIDEO_TYPES.join(", ")}`,
    };
  }

  const key = generateR2Key("video-lessons", opts.filename);
  const uploadUrl = await presignUpload({ key, contentType: opts.contentType });
  return { key, uploadUrl };
}

// ─── Admin: create / update / delete / publish ──────────────────────────────

export async function createVideoLesson(
  input: VideoLessonInput,
): Promise<{ id?: string; error?: string }> {
  try {
    await verifyAdmin();
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("video_lessons")
      .insert({
        slug: input.slug,
        title: input.title,
        description: input.description ?? null,
        body: input.body ?? null,
        category: input.category ?? null,
        thumbnail_path: input.thumbnail_path ?? null,
        video_r2_key: input.video_r2_key,
        duration_seconds: input.duration_seconds ?? null,
        sort_order: input.sort_order ?? 0,
        is_published: false,
      })
      .select("id")
      .single();

    if (error) return { error: error.message };
    revalidatePath("/admin/video-lessons");
    return { id: data.id };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unexpected error." };
  }
}

export async function updateVideoLesson(
  id: string,
  input: Partial<VideoLessonInput>,
): Promise<{ error?: string }> {
  try {
    await verifyAdmin();
    const admin = createAdminClient();
    const { error } = await admin
      .from("video_lessons")
      .update(input)
      .eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/admin/video-lessons");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unexpected error." };
  }
}

export async function deleteVideoLesson(
  id: string,
): Promise<{ error?: string }> {
  try {
    await verifyAdmin();
    const admin = createAdminClient();

    // Fetch the R2 key before deleting the row so we can clean up storage.
    const { data: lesson } = await admin
      .from("video_lessons")
      .select("video_r2_key")
      .eq("id", id)
      .single();

    const { error } = await admin.from("video_lessons").delete().eq("id", id);
    if (error) return { error: error.message };

    if (lesson?.video_r2_key) {
      try {
        await deleteR2Object({ key: lesson.video_r2_key });
      } catch (err) {
        // Best-effort. The row is already gone; orphaned R2 objects can be
        // cleaned up later.
        console.error(
          "[deleteVideoLesson] R2 cleanup failed:",
          err,
          lesson.video_r2_key,
        );
      }
    }

    revalidatePath("/admin/video-lessons");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unexpected error." };
  }
}

export async function toggleVideoLessonPublished(
  id: string,
  publish: boolean,
): Promise<{ error?: string }> {
  try {
    await verifyAdmin();
    const admin = createAdminClient();

    const patch: Record<string, unknown> = { is_published: publish };
    if (publish) patch.published_at = new Date().toISOString();
    else patch.published_at = null;

    const { error } = await admin
      .from("video_lessons")
      .update(patch)
      .eq("id", id);

    if (error) return { error: error.message };

    // Fan out the "new lesson" email only on the transition to published.
    if (publish) {
      await sendVideoLessonPublishedEmail({ lessonId: id });
    }

    revalidatePath("/admin/video-lessons");
    revalidatePath("/dashboard/video-lessons");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unexpected error." };
  }
}

// ─── Subscriber: get playback URL ───────────────────────────────────────────

export async function getVideoStreamUrl(
  lessonId: string,
): Promise<{ url?: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, subscription_status, subscription_expires_at")
    .eq("id", user.id)
    .single();

  if (!canAccessSubscriberContent(profile)) {
    return { error: "Subscription required." };
  }

  const { data: lesson } = await supabase
    .from("video_lessons")
    .select("video_r2_key, is_published")
    .eq("id", lessonId)
    .maybeSingle();

  if (!lesson?.video_r2_key) return { error: "Not found." };
  if (profile?.role !== "admin" && !lesson.is_published) {
    return { error: "Not found." };
  }

  const url = await presignDownload({ key: lesson.video_r2_key });
  return { url };
}
