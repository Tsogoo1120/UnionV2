"use server";

/**
 * Server actions for the articles service.
 *
 * Articles are Markdown bodies + Supabase Storage cover images
 * (no R2 — text is small and cover images don't have egress concerns).
 *
 * uploadArticleImage() returns the storage path, which the admin form
 * stores in `articles.cover_image_path` via create/update.
 */

import { revalidatePath } from "next/cache";
import { verifyAdmin } from "./admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendArticlePublishedEmail } from "@/lib/email/send";

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];
const MAX_COVER_BYTES = 10 * 1024 * 1024; // matches the bucket limit

export type ArticleInput = {
  slug: string;
  title: string;
  excerpt?: string | null;
  description?: string | null;
  body: string;
  cover_image_path?: string | null;
  hero_image_path?: string | null;
  description_image_path?: string | null;
  author_id?: string | null;
  reading_minutes?: number | null;
};

export async function createArticle(
  input: ArticleInput,
): Promise<{ id?: string; error?: string }> {
  try {
    const adminId = await verifyAdmin();
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("articles")
      .insert({
        slug: input.slug,
        title: input.title,
        excerpt: input.excerpt ?? null,
        description: input.description ?? null,
        body: input.body,
        cover_image_path: input.cover_image_path ?? null,
        author_id: input.author_id ?? adminId,
        reading_minutes:
          input.reading_minutes ?? estimateReadingMinutes(input.body),
        is_published: false,
      })
      .select("id")
      .single();

    if (error) return { error: error.message };
    revalidatePath("/admin/articles");
    return { id: data.id };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unexpected error." };
  }
}

export async function updateArticle(
  id: string,
  input: Partial<ArticleInput>,
): Promise<{ error?: string }> {
  try {
    await verifyAdmin();
    const admin = createAdminClient();

    const patch: Record<string, unknown> = { ...input };
    // If the body changed and reading_minutes wasn't explicitly set, recompute.
    if (typeof input.body === "string" && input.reading_minutes === undefined) {
      patch.reading_minutes = estimateReadingMinutes(input.body);
    }

    const { error } = await admin.from("articles").update(patch).eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/admin/articles");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unexpected error." };
  }
}

export async function deleteArticle(id: string): Promise<{ error?: string }> {
  try {
    await verifyAdmin();
    const admin = createAdminClient();
    const { error } = await admin.from("articles").delete().eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/admin/articles");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unexpected error." };
  }
}

export async function toggleArticlePublished(
  id: string,
  publish: boolean,
): Promise<{ error?: string }> {
  try {
    await verifyAdmin();
    const admin = createAdminClient();

    const patch: Record<string, unknown> = { is_published: publish };
    if (publish) patch.published_at = new Date().toISOString();
    else patch.published_at = null;

    const { error } = await admin.from("articles").update(patch).eq("id", id);
    if (error) return { error: error.message };

    if (publish) {
      await sendArticlePublishedEmail({ articleId: id });
    }

    revalidatePath("/admin/articles");
    revalidatePath("/dashboard/articles");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unexpected error." };
  }
}

/**
 * Uploads a cover image to the article-images bucket and returns its path.
 * Bucket is public-read, so the storage path can be served directly.
 */
export async function uploadArticleImage(
  formData: FormData,
): Promise<{ path?: string; error?: string }> {
  try {
    await verifyAdmin();
    const file = formData.get("image") as File | null;
    if (!file || file.size === 0) return { error: "No file." };
    if (!ALLOWED_IMAGE_TYPES.includes(file.type))
      return { error: "Only JPEG/PNG/WebP allowed." };
    if (file.size > MAX_COVER_BYTES)
      return { error: "File must be under 10 MB." };

    const admin = createAdminClient();
    const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase();
    const path = `${Date.now()}-${crypto.randomUUID()}.${ext}`;

    const { error } = await admin.storage
      .from("article-images")
      .upload(path, file, { contentType: file.type, upsert: false });

    if (error) return { error: error.message };
    return { path };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unexpected error." };
  }
}

/** Rough English-style WPM estimate; good enough for a "X min read" badge. */
function estimateReadingMinutes(body: string): number {
  const words = body.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}
