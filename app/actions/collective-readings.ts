"use server";

/**
 * Server actions for the collective-readings service. Mirror of
 * video-lessons with the `collective_readings` table and a different
 * R2 key prefix.
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
import { sendCollectiveReadingPublishedEmail } from "@/lib/email/send";

const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

export type CollectiveReadingInput = {
  slug: string;
  title: string;
  description?: string | null;
  body?: string | null;
  cover_image_path?: string | null;
  hero_image_path?: string | null;
  description_image_path?: string | null;
  video_r2_key: string;
};

export async function requestCollectiveReadingUploadUrl(opts: {
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

  const key = generateR2Key("collective-readings", opts.filename);
  const uploadUrl = await presignUpload({ key, contentType: opts.contentType });
  return { key, uploadUrl };
}

export async function createCollectiveReading(
  input: CollectiveReadingInput,
): Promise<{ id?: string; error?: string }> {
  try {
    await verifyAdmin();
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("collective_readings")
      .insert({
        slug: input.slug,
        title: input.title,
        description: input.description ?? null,
        body: input.body ?? null,
        cover_image_path: input.cover_image_path ?? null,
        video_r2_key: input.video_r2_key,
        is_published: false,
      })
      .select("id")
      .single();

    if (error) return { error: error.message };
    revalidatePath("/admin/collective-readings");
    return { id: data.id };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unexpected error." };
  }
}

export async function updateCollectiveReading(
  id: string,
  input: Partial<CollectiveReadingInput>,
): Promise<{ error?: string }> {
  try {
    await verifyAdmin();
    const admin = createAdminClient();
    const { error } = await admin
      .from("collective_readings")
      .update(input)
      .eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/admin/collective-readings");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unexpected error." };
  }
}

export async function deleteCollectiveReading(
  id: string,
): Promise<{ error?: string }> {
  try {
    await verifyAdmin();
    const admin = createAdminClient();

    const { data: reading } = await admin
      .from("collective_readings")
      .select("video_r2_key")
      .eq("id", id)
      .single();

    const { error } = await admin
      .from("collective_readings")
      .delete()
      .eq("id", id);
    if (error) return { error: error.message };

    if (reading?.video_r2_key) {
      try {
        await deleteR2Object({ key: reading.video_r2_key });
      } catch (err) {
        console.error(
          "[deleteCollectiveReading] R2 cleanup failed:",
          err,
          reading.video_r2_key,
        );
      }
    }

    revalidatePath("/admin/collective-readings");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unexpected error." };
  }
}

export async function toggleCollectiveReadingPublished(
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
      .from("collective_readings")
      .update(patch)
      .eq("id", id);

    if (error) return { error: error.message };
    if (publish) {
      await sendCollectiveReadingPublishedEmail({ readingId: id });
    }

    revalidatePath("/admin/collective-readings");
    revalidatePath("/dashboard/collective-readings");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unexpected error." };
  }
}

export async function getCollectiveReadingStreamUrl(
  readingId: string,
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

  const { data: reading } = await supabase
    .from("collective_readings")
    .select("video_r2_key, is_published")
    .eq("id", readingId)
    .maybeSingle();

  if (!reading?.video_r2_key) return { error: "Not found." };
  if (profile?.role !== "admin" && !reading.is_published) {
    return { error: "Not found." };
  }

  const url = await presignDownload({ key: reading.video_r2_key });
  return { url };
}
