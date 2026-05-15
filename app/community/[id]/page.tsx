import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CommunityPostImage } from "@/components/community/CommunityPostImage";
import { getPost } from "@/lib/queries/community";
import { requireActive } from "@/lib/auth/requireSession";
import { createClient } from "@/lib/supabase/server";

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
      ? profile.full_name?.trim() || profile.email || "Та"
      : "Гишүүн";

  return (
    <article style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px 64px" }}>
      <Link href="/community" style={{ font: "var(--u-body-s)", color: "var(--u-ember)", fontWeight: 600 }}>
        ← Нийгэмлэг
      </Link>
      <header style={{ marginTop: 16 }}>
        <p style={{ font: "var(--u-body-s)", color: "var(--u-ink-3)" }}>
          {authorLabel} · {new Date(post.created_at).toLocaleString("mn-MN")}
        </p>
        <h1 style={{ fontFamily: "var(--u-display)", fontWeight: 700, fontSize: 34, margin: "8px 0 16px" }}>
          {post.title}
        </h1>
      </header>
      {imageUrl ? <CommunityPostImage src={imageUrl} title={post.title} /> : null}
      <div style={{ font: "var(--u-body)", lineHeight: 1.65, color: "var(--u-ink)" }}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.body}</ReactMarkdown>
      </div>

      <section style={{ marginTop: 40, borderTop: "1px solid var(--u-rule)", paddingTop: 24 }}>
        <h2 className="u-eyebrow" style={{ marginBottom: 16 }}>
          Сэтгэгдэл ({comments.length})
        </h2>
        {comments.length === 0 ? (
          <div
            style={{
              padding: "20px 16px",
              borderRadius: "var(--u-r-2)",
              background: "var(--u-surface-2)",
              border: "1px dashed var(--u-rule-2)",
              textAlign: "center",
            }}
          >
            <p style={{ color: "var(--u-ink-2)", font: "var(--u-body)", margin: "0 0 8px" }}>Одоогоор сэтгэгдэл алга.</p>
            <p style={{ color: "var(--u-ink-3)", font: "var(--u-body-s)", margin: 0 }}>
              Эхний сэтгэгдлийг та үлдээж болно (удагдах функц удах оноонд нэмэгдэнэ).
            </p>
          </div>
        ) : (
          comments.map((c) => (
            <div
              key={c.id}
              style={{
                padding: "12px 0",
                borderBottom: "1px solid var(--u-rule)",
                font: "var(--u-body-s)",
                color: "var(--u-ink-2)",
              }}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{c.body}</ReactMarkdown>
            </div>
          ))
        )}
      </section>
    </article>
  );
}
