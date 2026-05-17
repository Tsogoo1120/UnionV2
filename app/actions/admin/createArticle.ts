"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { verifyAdmin } from "@/app/actions/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendArticlePublishedEmail } from "@/lib/email/send";

const schema = z.object({
  title: z.string().trim().min(1, "Гарчиг оруулна уу.").max(200, "Гарчиг хэт урт байна."),
  slug: z
    .string()
    .trim()
    .min(1, "Slug оруулна уу.")
    .max(80, "Slug хэт урт байна.")
    .regex(/^[a-z0-9-]+$/, "Slug зөвхөн жижиг үсэг, тоо, зураас агуулна."),
  excerpt: z.string().trim().min(1, "Товч тайлбар оруулна уу.").max(500, "Товч тайлбар хэт урт байна."),
  description: z.string().trim().optional().nullable(),
  body: z.string().trim().min(1, "Агуулга оруулна уу."),
  cover_image_path: z.string().optional().nullable(),
  hero_image_path: z.string().optional().nullable(),
  description_image_path: z.string().optional().nullable(),
  reading_minutes: z.coerce.number().int().min(1, "Унших цаг 1-ээс багагүй байх ёстой."),
  publish_immediately: z.boolean().default(false),
});

function mapDbError(message: string): string {
  if (message.includes("articles_slug_key") || message.includes("duplicate key")) {
    return "Энэ slug аль хэдийн бий болсон байна";
  }
  return message;
}

export async function createArticle(
  formData: FormData,
): Promise<{ id?: string; slug?: string; error?: string }> {
  try {
    const adminUserId = await verifyAdmin();

    const parsed = schema.safeParse({
      title: formData.get("title"),
      slug: formData.get("slug"),
      excerpt: formData.get("excerpt"),
      description: emptyToNull(formData.get("description")),
      body: formData.get("body"),
      cover_image_path: emptyToNull(formData.get("cover_image_path")),
      hero_image_path: emptyToNull(formData.get("hero_image_path")),
      description_image_path: emptyToNull(formData.get("description_image_path")),
      reading_minutes: formData.get("reading_minutes"),
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
      .from("articles")
      .insert({
        slug: data.slug,
        title: data.title,
        excerpt: data.excerpt,
        description: data.description ?? null,
        body: data.body,
        cover_image_path: data.cover_image_path ?? null,
        hero_image_path: data.hero_image_path ?? null,
        description_image_path: data.description_image_path ?? null,
        author_id: adminUserId,
        reading_minutes: data.reading_minutes,
        is_published: published,
        published_at: published ? now : null,
      })
      .select("id, slug")
      .single();

    if (error) return { error: mapDbError(error.message) };

    if (published && row?.id) {
      await sendArticlePublishedEmail({ articleId: row.id });
    }

    revalidatePath("/admin/dashboard");
    revalidatePath("/dashboard/articles");
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
