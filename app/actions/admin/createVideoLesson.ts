"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { verifyAdmin } from "@/app/actions/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendVideoLessonPublishedEmail } from "@/lib/email/send";

const schema = z.object({
  title: z.string().trim().min(1, "Гарчиг оруулна уу.").max(200, "Гарчиг хэт урт байна."),
  slug: z
    .string()
    .trim()
    .min(1, "Slug оруулна уу.")
    .max(80, "Slug хэт урт байна.")
    .regex(/^[a-z0-9-]+$/, "Slug зөвхөн жижиг үсэг, тоо, зураас агуулна."),
  category: z.string().trim().min(1, "Ангилал оруулна уу.").max(100),
  description: z.string().max(1000).optional().nullable(),
  body: z.string().optional().nullable(),
  sort_order: z.coerce.number().int().min(0).default(0),
  thumbnail_path: z.string().optional().nullable(),
  hero_image_path: z.string().optional().nullable(),
  description_image_path: z.string().optional().nullable(),
  video_r2_key: z.string().min(1, "Видео байршуулаагүй байна."),
  duration_seconds: z.coerce.number().int().min(0).optional().nullable(),
  publish_immediately: z.boolean().default(false),
});

function mapDbError(message: string): string {
  if (message.includes("video_lessons_slug_key") || message.includes("duplicate key")) {
    return "Энэ slug аль хэдийн бий болсон байна";
  }
  return message;
}

export async function createVideoLesson(
  formData: FormData,
): Promise<{ id?: string; slug?: string; error?: string }> {
  try {
    await verifyAdmin();

    const parsed = schema.safeParse({
      title: formData.get("title"),
      slug: formData.get("slug"),
      category: formData.get("category"),
      description: emptyToNull(formData.get("description")),
      body: emptyToNull(formData.get("body")),
      sort_order: formData.get("sort_order") ?? "0",
      thumbnail_path: emptyToNull(formData.get("thumbnail_path")),
      hero_image_path: emptyToNull(formData.get("hero_image_path")),
      description_image_path: emptyToNull(formData.get("description_image_path")),
      video_r2_key: formData.get("video_r2_key"),
      duration_seconds: emptyToNull(formData.get("duration_seconds")),
      publish_immediately: formData.get("publish_immediately") === "true",
    });

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Мэдээллээ шалгана уу." };
    }

    const data = parsed.data;
    const published = data.publish_immediately;
    const now = new Date().toISOString();

    const admin = createAdminClient();
    const { data: row, error } = await admin
      .from("video_lessons")
      .insert({
        slug: data.slug,
        title: data.title,
        category: data.category,
        description: data.description ?? null,
        body: data.body ?? null,
        thumbnail_path: data.thumbnail_path ?? null,
        hero_image_path: data.hero_image_path ?? null,
        description_image_path: data.description_image_path ?? null,
        video_r2_key: data.video_r2_key,
        duration_seconds: data.duration_seconds ?? null,
        sort_order: data.sort_order,
        is_published: published,
        published_at: published ? now : null,
      })
      .select("id, slug")
      .single();

    if (error) return { error: mapDbError(error.message) };

    if (published && row?.id) {
      await sendVideoLessonPublishedEmail({ lessonId: row.id });
    }

    revalidatePath("/admin/dashboard");
    revalidatePath("/dashboard/video-lessons");
    return { id: row.id, slug: row.slug };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unexpected error." };
  }
}

function emptyToNull(v: FormDataEntryValue | null): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length > 0 ? t : null;
}
