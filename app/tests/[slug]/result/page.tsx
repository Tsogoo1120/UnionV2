import Link from "next/link";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/format";
import { requireActive } from "@/lib/auth/requireSession";
import { getLatestTestResultForSlug } from "@/lib/queries/tests";
import { createClient } from "@/lib/supabase/server";
import { BigFiveResult } from "@/components/tests/BigFiveResult";
import { AttachmentResult } from "@/components/tests/AttachmentResult";

export default async function TestResultPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = await createClient();
  await requireActive();

  const bundle = await getLatestTestResultForSlug(supabase, params.slug);
  if (!bundle) {
    redirect(`/tests/${params.slug}`);
  }

  const { test, result } = bundle;
  const scoringType = test.scoring_rules?.type;
  const isBigFive = scoringType === "big_five";
  const isCategoryCount = scoringType === "category_count";
  const scoreVal =
    !isBigFive &&
    !isCategoryCount &&
    result.score &&
    "value" in result.score
      ? Number(result.score.value)
      : null;
  const simpleRanges =
    !isBigFive &&
    !isCategoryCount &&
    test.scoring_rules &&
    "ranges" in test.scoring_rules
      ? (test.scoring_rules.ranges ?? [])
      : [];

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "32px 16px 80px" }}>
      <h1 style={{ fontFamily: "var(--u-display)", fontWeight: 700, fontSize: 34, margin: "0 0 8px" }}>
        {test.title}
      </h1>
      <p style={{ font: "var(--u-body-s)", color: "var(--u-ink-3)", margin: "0 0 24px" }}>
        {formatDate(result.created_at, { withTime: true })}
      </p>

      {isBigFive ? (
        <section style={{ marginBottom: 24 }}>
          <BigFiveResult test={test} result={result} />
        </section>
      ) : isCategoryCount ? (
        <section style={{ marginBottom: 24 }}>
          <AttachmentResult test={test} result={result} />
        </section>
      ) : (
        <>
          <section
            style={{
              background: "var(--u-surface-2)",
              border: "1px solid var(--u-rule)",
              borderRadius: "var(--u-r-3)",
              padding: 22,
              marginBottom: 20,
            }}
          >
            <div className="u-eyebrow">Result</div>
            <div style={{ font: "var(--u-h2)", marginTop: 8 }}>{result.result_summary ?? "\u2014"}</div>
            {scoreVal != null && !Number.isNaN(scoreVal) ? (
              <div style={{ font: "var(--u-body)", color: "var(--u-ink-2)", marginTop: 8 }}>
                Total score:{" "}
                <span style={{ fontFamily: "var(--u-mono)", fontWeight: 600 }}>{scoreVal}</span>
              </div>
            ) : null}
          </section>

          {simpleRanges.length > 0 ? (
            <section style={{ marginBottom: 24 }}>
              <div className="u-eyebrow" style={{ marginBottom: 10 }}>
                Score ranges
              </div>
              <div style={{ border: "1px solid var(--u-rule)", borderRadius: "var(--u-r-2)", overflow: "hidden" }}>
                {simpleRanges.map((r, i) => (
                  <div
                    key={`${r.min}-${r.max}-${i}`}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1.4fr",
                      gap: 8,
                      padding: "10px 14px",
                      borderTop: i === 0 ? "none" : "1px solid var(--u-rule)",
                      font: "var(--u-body-s)",
                    }}
                  >
                    <span style={{ fontFamily: "var(--u-mono)" }}>
                      {r.min}&ndash;{r.max}
                    </span>
                    <span style={{ color: "var(--u-ink-2)" }}>points</span>
                    <span style={{ fontWeight: 500 }}>{r.result}</span>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </>
      )}

      {test.questions.length > 0 ? (
        <section style={{ marginBottom: 32 }}>
          <div className="u-eyebrow" style={{ marginBottom: 12 }}>
            Your answers
          </div>
          <div
            style={{
              border: "1px solid var(--u-rule)",
              borderRadius: "var(--u-r-3)",
              overflow: "hidden",
            }}
          >
            {test.questions.map((q, qi) => {
              const selectedOptionId = result.answers?.[q.id];
              const selectedOption = q.options.find(
                (o) => String(o.id) === String(selectedOptionId),
              );
              return (
                <div
                  key={q.id}
                  style={{
                    padding: "14px 18px",
                    borderTop:
                      qi === 0 ? "none" : "1px solid var(--u-rule)",
                  }}
                >
                  <div
                    style={{
                      font: "var(--u-body-s)",
                      color: "var(--u-ink-3)",
                      marginBottom: 4,
                    }}
                  >
                    {qi + 1}. {q.text}
                  </div>
                  <div
                    style={{
                      font: "var(--u-body-s)",
                      fontWeight: 500,
                      color: "var(--u-ink)",
                      borderLeft: "3px solid var(--u-ember)",
                      paddingLeft: 10,
                    }}
                  >
                    {selectedOption?.text ?? "\u2014"}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      <Link
        href="/tests"
        style={{
          font: "var(--u-body-s)",
          color: "var(--u-ember)",
          fontWeight: 600,
        }}
      >
        &larr; Tests
      </Link>
    </div>
  );
}