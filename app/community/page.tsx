import { CommunityComposerFab } from "@/components/community/CommunityComposerFab";
import { CommunityFeed, type CommunityFeedPost } from "@/components/community/CommunityFeed";
import { requireActive } from "@/lib/auth/requireSession";
import { countCommentsByPostIds, listFeed } from "@/lib/queries/community";
import { createClient } from "@/lib/supabase/server";

export default async function CommunityPage() {
  const supabase = await createClient();
  const profile = await requireActive();

  const posts = await listFeed(supabase, { limit: 20 });
  const ids = posts.map((p) => p.id);
  const counts = await countCommentsByPostIds(supabase, ids);

  const enriched: CommunityFeedPost[] = await Promise.all(
    posts.map(async (p) => {
      let imageUrl: string | null = null;
      if (p.image_path) {
        const { data } = await supabase.storage
          .from("community-images")
          .createSignedUrl(p.image_path, 3600);
        imageUrl = data?.signedUrl ?? null;
      }
      const authorLabel =
        p.user_id === profile.id
          ? profile.full_name?.trim() || profile.email || "You"
          : "Member";
      return {
        id: p.id,
        title: p.title,
        body: p.body,
        created_at: p.created_at,
        authorLabel,
        commentCount: counts[p.id] ?? 0,
        imageUrl,
      };
    }),
  );

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px 48px" }}>
      <h1 style={{ fontFamily: "var(--u-display)", fontWeight: 700, fontSize: 36, margin: "0 0 20px" }}>
        Community
      </h1>
      <CommunityFeed posts={enriched} />
      <CommunityComposerFab />
    </div>
  );
}
