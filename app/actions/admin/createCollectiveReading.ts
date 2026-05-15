"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { verifyAdmin } from "@/app/actions/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendCollectiveReadingPublishedEmail } from "@/lib/email/send";

const schema = z.object({
  title: z.string().trim().min(1, "Гарчиг оруулна уу.").max(200, "Гарчиг хэт урт байна."),
  slug: z
    .string()
    .trim()
    .min(1, "Slug оруулна уу.")
    .max(80, "Slug хэт урт байна.")
    .regex(/^[a-z0-9-]+$/, "Slug зөвхөн жижиг үсэг, тоо, зураас агуулна."),
  description: z.string().max(1000).optional().nullable(),
  body: z.string().optional().nullable(),
  cover_image_path: z.string().optional().nullable(),
  hero_image_path: z.string().optional().nullable(),
  description_image_path: z.string().optional().nullable(),
  video_r2_key: z.string().min(1, "Видео байршуулаагүй байна."),
  publish_immediately: z.boolean().default(false),
});

function mapDbError(message: string): string {
  if (message.includes("collective_readings_slug_key") || message.includes("duplicate key")) {
    return "Энэ slug аль хэдийн бий болсон байна";
  }
  return message;
}

export async function createCollectiveReading(
  formData: FormData,
): Promise<{ id?: string; slug?: string; error?: string }> {
  try {
    await verifyAdmin();

    const parsed = schema.safeParse({
      title: formData.get("title"),
      slug: formData.get("slug"),
      description: emptyToNull(formData.get("description")),
      body: emptyToNull(formData.get("body")),
      cover_image_path: emptyToNull(formData.get("cover_image_path")),
      hero_image_path: emptyToNull(formData.get("hero_image_path")),
      description_image_path: emptyToNull(formData.get("description_image_path")),
      video_r2_key: formData.get("video_r2_key"),
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
      .from("collective_readings")
      .insert({
        slug: data.slug,
        title: data.title,
        description: data.description ?? null,
        body: data.body ?? null,
        cover_image_path: data.cover_image_path ?? null,
        hero_image_path: data.hero_image_path ?? null,
        description_image_path: data.description_image_path ?? null,
        video_r2_key: data.video_r2_key,
        is_published: published,
        published_at: published ? now : null,
      })
      .select("id, slug")
      .single();

    if (error) return { error: mapDbError(error.message) };

    if (published && row?.id) {
      await sendCollectiveReadingPublishedEmail({ readingId: row.id });
    }

    revalidatePath("/admin/dashboard");
    revalidatePath("/dashboard/collective-readings");
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
