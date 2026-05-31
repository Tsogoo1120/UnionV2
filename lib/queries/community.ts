import type { SupabaseClient } from "@supabase/supabase-js";
import type { Comment, CommunityPost } from "@/lib/types";

export interface ListFeedOpts {
  limit?: number;
  offset?: number;
  cursor?: string;
}

export async function listFeed(
  supabase: SupabaseClient,
  opts: ListFeedOpts = {},
): Promise<CommunityPost[]> {
  const limit = opts.limit ?? 50;

  let query = supabase
    .from("community_posts")
    .select("*")
    .eq("is_hidden", false)
    .order("created_at", { ascending: false });

  if (opts.cursor) {
    query = query.lt("created_at", opts.cursor);
  }

  if (opts.cursor) {
    const { data, error } = await query.limit(limit);
    if (error) throw new Error(error.message);
    return data ?? [];
  }

  const from = opts.offset ?? 0;
  const { data, error } = await query.range(from, from + limit - 1);
  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getPost(
  supabase: SupabaseClient,
  id: string,
): Promise<{ post: CommunityPost; comments: Comment[] } | null> {
  const { data: post, error: postError } = await supabase
    .from("community_posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (postError) {
    throw new Error(postError.message);
  }

  if (!post) {
    return null;
  }

  const { data: comments, error: commentsError } = await supabase
    .from("comments")
    .select("*")
    .eq("post_id", id)
    .order("created_at", { ascending: true });

  if (commentsError) {
    throw new Error(commentsError.message);
  }

  return { post, comments: comments ?? [] };
}

/**
 * Moderation queue: posts hidden by admins plus posts that have at least one
 * hidden comment (no separate “report” table in v2 schema).
 *
 * Prefer `verifyAdmin()` + `createAdminClient()` when integrating admin UIs.
 */
export async function listPendingForAdmin(
  supabase: SupabaseClient,
): Promise<CommunityPost[]> {
  const { data: hiddenPosts, error: hiddenErr } = await supabase
    .from("community_posts")
    .select("*")
    .eq("is_hidden", true)
    .order("created_at", { ascending: false });

  if (hiddenErr) throw new Error(hiddenErr.message);

  const { data: flaggedComments, error: commentErr } = await supabase
    .from("comments")
    .select("post_id")
    .eq("is_hidden", true);

  if (commentErr) throw new Error(commentErr.message);

  const postIdsFromComments = Array.from(
    new Set((flaggedComments ?? []).map((c) => c.post_id)),
  );

  let postsFromHiddenComments: CommunityPost[] = [];
  if (postIdsFromComments.length > 0) {
    const { data: extra, error: extraErr } = await supabase
      .from("community_posts")
      .select("*")
      .in("id", postIdsFromComments)
      .order("created_at", { ascending: false });

    if (extraErr) throw new Error(extraErr.message);
    postsFromHiddenComments = extra ?? [];
  }

  const byId = new Map<string, CommunityPost>();
  for (const p of hiddenPosts ?? []) byId.set(p.id, p);
  for (const p of postsFromHiddenComments) byId.set(p.id, p);

  return Array.from(byId.values()).sort((a, b) =>
    b.created_at.localeCompare(a.created_at),
  );
}

/** Comment counts for a set of post ids (public comments only — same rows RLS allows). */
export async function countCommentsByPostIds(
  supabase: SupabaseClient,
  postIds: string[],
): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};
  if (postIds.length === 0) return counts;

  const { data, error } = await supabase
    .from("comments")
    .select("post_id")
    .in("post_id", postIds)
    .eq("is_hidden", false);

  if (error) throw new Error(error.message);
  for (const row of data ?? []) {
    const id = row.post_id as string;
    counts[id] = (counts[id] ?? 0) + 1;
  }
  return counts;
}
