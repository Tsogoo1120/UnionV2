"use server";

/**
 * Server actions for the community service.
 *
 * Posts and comments are subscriber-only (RLS enforces this on every
 * read and write). Admin moderation hides via `is_hidden`; the row stays
 * so the audit trail is preserved and admins can unhide later.
 *
 * Image uploads (optional on posts) go to the `community-images` bucket
 * under {user_id}/{filename}, scoped by the bucket RLS policy.
 */

import { revalidatePath } from "next/cache";
import { verifyAdmin } from "./admin";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  MAX_COMMUNITY_IMAGE_BYTES,
  ALLOWED_SCREENSHOT_TYPES,
} from "@/lib/constants";

// ─── User: create post ──────────────────────────────────────────────────────

export async function createPost(
  formData: FormData,
): Promise<{ postId?: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const title = ((formData.get("title") as string) ?? "").trim();
  const body = ((formData.get("body") as string) ?? "").trim();
  if (!title) return { error: "Title is required." };
  if (!body) return { error: "Body is required." };

  // Optional image upload.
  const file = formData.get("image") as File | null;
  let imagePath: string | null = null;
  if (file && file.size > 0) {
    if (!ALLOWED_SCREENSHOT_TYPES.includes(file.type as never)) {
      return { error: "Image must be JPEG, PNG, or WebP." };
    }
    if (file.size > MAX_COMMUNITY_IMAGE_BYTES) {
      return { error: "Image must be under 3 MB." };
    }
    const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase();
    const path = `${user.id}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
    const { error: uploadErr } = await supabase.storage
      .from("community-images")
      .upload(path, file, { contentType: file.type, upsert: false });
    if (uploadErr) return { error: `Image upload failed: ${uploadErr.message}` };
    imagePath = path;
  }

  const { data: post, error: insertErr } = await supabase
    .from("community_posts")
    .insert({
      user_id: user.id,
      title,
      body,
      image_path: imagePath,
    })
    .select("id")
    .single();

  if (insertErr) {
    // Roll back the uploaded image so storage doesn't accumulate orphans.
    if (imagePath) {
      await supabase.storage.from("community-images").remove([imagePath]);
    }
    return { error: insertErr.message };
  }

  revalidatePath("/dashboard/community");
  revalidatePath("/community");
  return { postId: post.id };
}

// ─── User: create comment ───────────────────────────────────────────────────

export async function createComment(
  postId: string,
  body: string,
): Promise<{ commentId?: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const trimmed = body.trim();
  if (!trimmed) return { error: "Comment cannot be empty." };

  const { data: comment, error } = await supabase
    .from("comments")
    .insert({ post_id: postId, user_id: user.id, body: trimmed })
    .select("id")
    .single();

  if (error) return { error: error.message };
  revalidatePath(`/dashboard/community/${postId}`);
  revalidatePath("/dashboard/community");
  return { commentId: comment.id };
}

// ─── User: delete own ───────────────────────────────────────────────────────

export async function deleteOwnPost(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  // RLS limits deletes to own_posts or admin, so this is safe.
  const { error } = await supabase
    .from("community_posts")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/community");
  return {};
}

export async function deleteOwnComment(
  id: string,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/community");
  return {};
}

// ─── Admin: hide / unhide ───────────────────────────────────────────────────

export async function adminHidePost(
  id: string,
  hide: boolean = true,
): Promise<{ error?: string }> {
  try {
    await verifyAdmin();
    const admin = createAdminClient();
    const { error } = await admin
      .from("community_posts")
      .update({ is_hidden: hide })
      .eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/dashboard/community");
    revalidatePath("/admin/community");
    revalidatePath("/admin/dashboard");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unexpected error." };
  }
}

export async function adminHideComment(
  id: string,
  hide: boolean = true,
): Promise<{ error?: string }> {
  try {
    await verifyAdmin();
    const admin = createAdminClient();
    const { error } = await admin
      .from("comments")
      .update({ is_hidden: hide })
      .eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/dashboard/community");
    revalidatePath("/admin/community");
    revalidatePath("/admin/dashboard");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unexpected error." };
  }
}

// ─── Admin: hard-delete (when hide isn't enough) ────────────────────────────

export async function adminDeletePost(
  id: string,
): Promise<{ error?: string }> {
  try {
    await verifyAdmin();
    const admin = createAdminClient();
    const { error } = await admin
      .from("community_posts")
      .delete()
      .eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/dashboard/community");
    revalidatePath("/admin/community");
    revalidatePath("/admin/dashboard");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unexpected error." };
  }
}

export async function adminDeleteComment(
  id: string,
): Promise<{ error?: string }> {
  try {
    await verifyAdmin();
    const admin = createAdminClient();
    const { error } = await admin.from("comments").delete().eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/dashboard/community");
    revalidatePath("/admin/community");
    revalidatePath("/admin/dashboard");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unexpected error." };
  }
}
