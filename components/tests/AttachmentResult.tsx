import type {
  PsychologyTest,
  TestResult,
  CategoryCountTestScoringRules,
} from "@/lib/types";

function pickWinner(
  score: Record<string, number>,
  categoryOrder: string[],
): string | null {
  let winner: string | null = null;
  let max = -1;
  for (const key of categoryOrder) {
    if ((score[key] ?? 0) > max) {
      max = score[key] ?? 0;
      winner = key;
    }
  }
  return winner;
}

export function AttachmentResult({
  test,
  result,
}: {
  test: PsychologyTest;
  result: TestResult;
}) {
  const rules = test.scoring_rules as CategoryCountTestScoringRules;
  const score = result.score as Record<string, number> | null;

  if (!score || rules.type !== "category_count") return null;

  const winnerKey = pickWinner(score, rules.categoryOrder);
  const winnerInfo = winnerKey ? rules.categories[winnerKey] : null;
  const totalAnswered = rules.categoryOrder.reduce(
    (sum, key) => sum + (score[key] ?? 0),
    0,
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {winnerInfo ? (
        <section
          style={{
            background: "var(--u-surface-2)",
            border: "1px solid var(--u-rule)",
            borderRadius: "var(--u-r-3)",
            padding: 22,
          }}
        >
          <div className="u-eyebrow" style={{ marginBottom: 6 }}>
            {winnerInfo.shortLabel}
          </div>
          <h2
            style={{
              font: "var(--u-h2)",
              color: "var(--u-ink)",
              margin: "0 0 4px",
            }}
          >
            {winnerInfo.title}
          </h2>
          <p
            style={{
              font: "var(--u-body)",
              color: "var(--u-ink-2)",
              fontStyle: "italic",
              margin: "0 0 14px",
            }}
          >
            {winnerInfo.subtitle}
          </p>
          <p style={{ font: "var(--u-body-s)", color: "var(--u-ink)", margin: 0 }}>
            {winnerInfo.meaning}
          </p>
        </section>
      ) : null}

      <section>
        <div className="u-eyebrow" style={{ marginBottom: 12 }}>
          Your answer breakdown
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {rules.categoryOrder.map((key) => {
            const info = rules.categories[key];
            const count = score[key] ?? 0;
            const isWinner = key === winnerKey;
            const pct =
              totalAnswered > 0
                ? Math.round((count / totalAnswered) * 100)
                : 0;
            const barColor = isWinner ? "var(--u-ember)" : "var(--u-rule-2)";

            return (
              <div
                key={key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 14px",
                  background: "var(--u-surface-2)",
                  border: "1px solid var(--u-rule)",
                  borderRadius: "var(--u-r-2)",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      font: "var(--u-body-s)",
                      fontWeight: isWinner ? 600 : 400,
                      color: "var(--u-ink)",
                    }}
                  >
                    {info?.title ?? key}
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    flexShrink: 0,
                    minWidth: 120,
                  }}
                >
                  <div
                    style={{
                      width: 72,
                      height: 6,
                      borderRadius: 3,
                      background: "var(--u-rule)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${pct}%`,
                        height: "100%",
                        background: barColor,
                        transition: "width 400ms ease",
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontFamily: "var(--u-mono)",
                      fontWeight: 600,
                      fontSize: 14,
                      color: isWinner ? "var(--u-ember)" : "var(--u-ink-2)",
                      minWidth: 20,
                      textAlign: "right",
                    }}
                  >
                    {count}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}