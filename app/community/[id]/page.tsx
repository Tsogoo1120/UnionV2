import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CommunityPostImage } from "@/components/community/CommunityPostImage";
import { CommentSection } from "@/components/community/CommentSection";
import { getPost } from "@/lib/queries/community";
import { requireActive } from "@/lib/auth/requireSession";
import { createClient } from "@/lib/supabase/server";

function fmtDateTime(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default async function CommunityPostPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const profile = await requireActive();

  const bundle = await getPost(supabase, params.id);
  if (!bundle) notFound();

  const { post, comments } = bundle;
  let imageUrl: string | null = null;
  if (post.image_path) {
    const { data } = await supabase.storage
      .from("community-images")
      .createSignedUrl(post.image_path, 3600);
    imageUrl = data?.signedUrl ?? null;
  }

  const authorLabel =
    post.user_id === profile.id
      ? profile.full_name?.trim() || profile.email || "You"
      : "Member";

  return (
    <article style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px 64px" }}>
      <Link href="/community" style={{ font: "var(--u-body-s)", color: "var(--u-ember)", fontWeight: 600 }}>
        ← Community
      </Link>
      <header style={{ marginTop: 16 }}>
        <p style={{ font: "var(--u-body-s)", color: "var(--u-ink-3)" }}>
          {authorLabel} · {fmtDateTime(post.created_at)}
        </p>
        <h1 style={{ fontFamily: "var(--u-display)", fontWeight: 700, fontSize: 34, margin: "8px 0 16px" }}>
          {post.title}
        </h1>
      </header>
      {imageUrl ? <CommunityPostImage src={imageUrl} title={post.title} /> : null}
      <div style={{ font: "var(--u-body)", lineHeight: 1.65, color: "var(--u-ink)" }}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.body}</ReactMarkdown>
      </div>

      <CommentSection
        postId={post.id}
        initialComments={comments}
        currentUserId={profile.id}
      />
    </article>
  );
}
