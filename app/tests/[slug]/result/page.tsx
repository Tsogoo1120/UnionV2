import Link from "next/link";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/format";
import { requireActive } from "@/lib/auth/requireSession";
import { getLatestTestResultForSlug } from "@/lib/queries/tests";
import { createClient } from "@/lib/supabase/server";

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
  const scoreVal = result.score && typeof result.score === "object" && "value" in result.score
    ? Number((result.score as { value: number }).value)
    : null;

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "32px 16px 80px" }}>
      <h1 style={{ fontFamily: "var(--u-display)", fontWeight: 700, fontSize: 34, margin: "0 0 8px" }}>
        {test.title}
      </h1>
      <p style={{ font: "var(--u-body-s)", color: "var(--u-ink-3)", margin: "0 0 24px" }}>
        {formatDate(result.created_at, { withTime: true })}
      </p>

      <section
        style={{
          background: "var(--u-surface-2)",
          border: "1px solid var(--u-rule)",
          borderRadius: "var(--u-r-3)",
          padding: 22,
          marginBottom: 20,
        }}
      >
        <div className="u-eyebrow">Үр дүн</div>
        <div style={{ font: "var(--u-h2)", marginTop: 8 }}>{result.result_summary ?? "—"}</div>
        {scoreVal != null && !Number.isNaN(scoreVal) ? (
          <div style={{ font: "var(--u-body)", color: "var(--u-ink-2)", marginTop: 8 }}>
            Нийт оноо: <span style={{ fontFamily: "var(--u-mono)", fontWeight: 600 }}>{scoreVal}</span>
          </div>
        ) : null}
      </section>

      <section style={{ marginBottom: 24 }}>
        <div className="u-eyebrow" style={{ marginBottom: 10 }}>
          Онооны завсар
        </div>
        <div style={{ border: "1px solid var(--u-rule)", borderRadius: "var(--u-r-2)", overflow: "hidden" }}>
          {(test.scoring_rules?.ranges ?? []).map((r, i) => (
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
                {r.min}–{r.max}
              </span>
              <span style={{ color: "var(--u-ink-2)" }}>оноо</span>
              <span style={{ fontWeight: 500 }}>{r.result}</span>
            </div>
          ))}
        </div>
      </section>

      <Link href="/dashboard" style={{ font: "var(--u-body-s)", color: "var(--u-ember)", fontWeight: 600 }}>
        ← Самбар руу
      </Link>
    </div>
  );
}
