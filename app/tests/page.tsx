import { requireActive } from "@/lib/auth/requireSession";
import { listPublishedTests, listMyTestResults } from "@/lib/queries/tests";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatDate } from "@/lib/format";

export default async function TestsPage() {
  const supabase = await createClient();
  await requireActive();

  const [tests, myResults] = await Promise.all([
    listPublishedTests(supabase),
    listMyTestResults(supabase),
  ]);

  const latestResultByTestId = new Map<string, (typeof myResults)[0]>();
  for (const r of myResults) {
    if (!latestResultByTestId.has(r.test_id)) {
      latestResultByTestId.set(r.test_id, r);
    }
  }

  const getThumbUrl = (p: string | null | undefined) =>
    p
      ? supabase.storage.from("media-thumbnails").getPublicUrl(p).data.publicUrl
      : null;

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 16px 80px" }}>
      <Link
        href="/dashboard"
        style={{
          display: "inline-flex",
          alignItems: "center",
          minHeight: 44,
          font: "var(--u-body-s)",
          fontWeight: 600,
          color: "var(--u-ember)",
          textDecoration: "none",
          marginBottom: "var(--u-s-4)",
        }}
      >
        &larr; Dashboard
      </Link>
      <div className="u-eyebrow" style={{ marginBottom: 8 }}>
        Tests &middot; 04
      </div>
      <h1
        style={{
          fontFamily: "var(--u-display)",
          fontWeight: 700,
          fontSize: "clamp(36px, 7vw, 56px)",
          letterSpacing: "-0.02em",
          margin: "0 0 32px",
        }}
      >
        Tests<span style={{ color: "var(--u-ember)" }}>.</span>
      </h1>

      {tests.length === 0 ? (
        <p style={{ color: "var(--u-ink-3)", font: "var(--u-body)" }}>
          No published tests yet.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {tests.map((test) => {
            const result = latestResultByTestId.get(test.id);
            const coverUrl =
              getThumbUrl(test.cover_image_path) ??
              getThumbUrl(test.hero_image_path);
            return (
              <div
                key={test.id}
                style={{
                  background: "var(--u-surface-2)",
                  border: "1px solid var(--u-rule)",
                  borderRadius: "var(--u-r-3)",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {coverUrl ? (
                  <div
                    style={{
                      aspectRatio: "16 / 6",
                      overflow: "hidden",
                    }}
                  >
                    <img
                      src={coverUrl}
                      alt=""
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  </div>
                ) : null}
                <div
                  style={{
                    padding: "20px 22px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                  }}
                >
                  <div>
                    <h2
                      style={{
                        fontFamily: "var(--u-display)",
                        fontWeight: 700,
                        fontSize: 24,
                        letterSpacing: "-0.015em",
                        margin: "0 0 6px",
                      }}
                    >
                      {test.title}
                    </h2>
                    {test.description ? (
                      <p
                        style={{
                          font: "var(--u-body-s)",
                          color: "var(--u-ink-3)",
                          margin: 0,
                        }}
                      >
                        {test.description}
                      </p>
                    ) : null}
                  </div>

                  {result ? (
                    <div
                      style={{
                        background: "var(--u-bg)",
                        border: "1px solid var(--u-rule)",
                        borderRadius: "var(--u-r-2)",
                        padding: "10px 14px",
                      }}
                    >
                      <div
                        style={{
                          font: "var(--u-body-s)",
                          color: "var(--u-ink-3)",
                        }}
                      >
                        Last taken:{" "}
                        {formatDate(result.created_at, { withTime: true })}
                      </div>
                      {result.result_summary ? (
                        <div
                          style={{
                            font: "var(--u-body-s)",
                            fontWeight: 500,
                            color: "var(--u-ink)",
                            marginTop: 4,
                          }}
                        >
                          {result.result_summary}
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  <div style={{ display: "flex", gap: 10 }}>
                    {result ? (
                      <>
                        <Link
                          href={`/tests/${test.slug}/result`}
                          style={{
                            flex: 1,
                            textAlign: "center",
                            padding: "12px 16px",
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
                          href={`/tests/${test.slug}?retake=1`}
                          style={{
                            flex: 1,
                            textAlign: "center",
                            padding: "12px 16px",
                            borderRadius: "var(--u-r-2)",
                            border: "1px solid var(--u-rule-2)",
                            color: "var(--u-ink-2)",
                            font: "var(--u-body-s)",
                            fontWeight: 500,
                            textDecoration: "none",
                          }}
                        >
                          Retake
                        </Link>
                      </>
                    ) : (
                      <Link
                        href={`/tests/${test.slug}`}
                        style={{
                          flex: 1,
                          textAlign: "center",
                          padding: "12px 16px",
                          borderRadius: "var(--u-r-2)",
                          background: "var(--u-ember)",
                          color: "var(--u-ember-ink)",
                          font: "var(--u-body-s)",
                          fontWeight: 600,
                          textDecoration: "none",
                        }}
                      >
                        Take test &rarr;
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}