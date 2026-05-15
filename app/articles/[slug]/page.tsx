import { ArticleReader } from "@/components/articles/ArticleReader";
import { requireActive } from "@/lib/auth/requireSession";
import { getArticleBySlug } from "@/lib/queries/articles";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = await createClient();
  await requireActive();

  const article = await getArticleBySlug(supabase, params.slug);
  if (!article) {
    redirect("/status/inactive");
  }

  return (
    <ArticleReader title={article.title} bodyMd={article.body} readingMinutes={article.reading_minutes} />
  );
}
