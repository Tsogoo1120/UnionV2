import Link from "next/link";
import { TestRunner } from "@/components/tests/TestRunner";
import { requireActive } from "@/lib/auth/requireSession";
import { getTestBySlug, getLatestTestResultForSlug } from "@/lib/queries/tests";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/format";

export default async function TestPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { retake?: string };
}) {
  const supabase = await createClient();
  await requireActive();

  const test = await getTestBySlug(supabase, params.slug);
  if (!test) {
    redirect("/status/inactive");
  }

  const getUrl = (p: string | null | undefined) =>
    p ? supabase.storage.from("media-thumbnails").getPublicUrl(p).data.publicUrl : null;

  const retake = searchParams.retake === "1";

  if (!retake) {
    const bundle = await getLatestTestResultForSlug(supabase, params.slug);
    if (bundle) {
      const heroUrl = getUrl(test.hero_image_path);
      return (
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "32px 16px 80px" }}>
          {heroUrl ? (
            <div
              style={{
                width: "100%",
                borderRadius: "var(--u-r-3)",
                overflow: "hidden",
                marginBottom: 20,
                aspectRatio: "16 / 7",
              }}
            >
              <img src={heroUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </div>
          ) : null}
          <h1 style={{ fontFamily: "var(--u-display)", fontWeight: 700, fontSize: 34, margin: "0 0 8px" }}>
            {test.title}
          </h1>
          <p style={{ font: "var(--u-body-s)", color: "var(--u-ink-3)", margin: "0 0 24px" }}>
            Last taken: {formatDate(bundle.result.created_at, { withTime: true })}
          </p>

          {bundle.result.result_summary ? (
            <div
              style={{
                background: "var(--u-surface-2)",
                border: "1px solid var(--u-rule)",
                borderRadius: "var(--u-r-3)",
                padding: "16px 18px",
                marginBottom: 20,
                font: "var(--u-body-s)",
                color: "var(--u-ink-2)",
              }}
            >
              {bundle.result.result_summary}
            </div>
          ) : null}

          <Link
            href="/tests"
            style={{
              display: "inline-flex",
              alignItems: "center",
              minHeight: 44,
              font: "var(--u-body-s)",
              fontWeight: 600,
              color: "var(--u-ember)",
              textDecoration: "none",
              marginBottom: 16,
            }}
          >
            &larr; Tests
          </Link>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Link
              href={`/tests/${params.slug}/result`}
              style={{
                display: "block",
                textAlign: "center",
                padding: "14px 18px",
                borderRadius: "var(--u-r-2)",
                background: "var(--u-ember)",
                color: "var(--u-ember-ink)",
                font: "var(--u-body-s)",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              View result
            </Link>
            <Link
              href={`/tests/${params.slug}?retake=1`}
              style={{
                display: "block",
                textAlign: "center",
                padding: "14px 18px",
                borderRadius: "var(--u-r-2)",
                border: "1px solid var(--u-rule-2)",
                background: "transparent",
                color: "var(--u-ink-2)",
                font: "var(--u-body-s)",
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              Retake
            </Link>
          </div>
        </div>
      );
    }
  }

  return (
    <TestRunner
      testId={test.id}
      slug={test.slug}
      title={test.title}
      description={test.description}
      heroImageUrl={getUrl(test.hero_image_path)}
      descriptionImageUrl={getUrl(test.description_image_path)}
      questions={test.questions}
    />
  );
}