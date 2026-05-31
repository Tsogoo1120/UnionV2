import type { PsychologyTest, TestResult, BigFiveTestScoringRules } from "@/lib/types";

const TRAIT_ORDER = ["E", "A", "C", "N", "O"] as const;

export function BigFiveResult({
  test,
  result,
}: {
  test: PsychologyTest;
  result: TestResult;
}) {
  const rules = test.scoring_rules as BigFiveTestScoringRules;
  const score = result.score as Record<string, number> | null;

  if (!score || !rules.traitInfo) return null;

  function getLevel(s: number) {
    return rules.resultLevels.find((l) => s >= l.min && s <= l.max);
  }

  const highLevel = rules.resultLevels.reduce(
    (best, l) => (l.min > best.min ? l : best),
    rules.resultLevels[0],
  );
  const lowLevel = rules.resultLevels.reduce(
    (worst, l) => (l.min < worst.min ? l : worst),
    rules.resultLevels[0],
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {TRAIT_ORDER.map((traitKey) => {
        const traitScore = score[traitKey] ?? 0;
        const info = rules.traitInfo[traitKey];
        const level = getLevel(traitScore);
        const isHigh = traitScore >= 20;
        const detail = isHigh ? info?.highScoreMeaning : info?.lowScoreMeaning;
        const pct = Math.min(100, Math.round((traitScore / 40) * 100));

        const levelColor =
          !level ? "var(--u-ink-3)" :
          level === highLevel ? "var(--u-ember)" :
          level === lowLevel ? "var(--u-ink-3)" :
          "var(--u-ink-2)";

        return (
          <div
            key={traitKey}
            style={{
              background: "var(--u-surface-2)",
              border: "1px solid var(--u-rule)",
              borderRadius: "var(--u-r-3)",
              padding: 18,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 10,
                gap: 12,
              }}
            >
              <div>
                <div className="u-eyebrow" style={{ marginBottom: 2 }}>{traitKey}</div>
                <div style={{ font: "var(--u-h3)", color: "var(--u-ink)" }}>
                  {info?.title ?? traitKey}
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div
                  style={{
                    fontFamily: "var(--u-mono)",
                    fontWeight: 700,
                    fontSize: 22,
                    color: levelColor,
                    lineHeight: 1,
                  }}
                >
                  {traitScore}
                </div>
                <div
                  style={{
                    font: "var(--u-body-s)",
                    fontWeight: 600,
                    color: levelColor,
                    marginTop: 2,
                  }}
                >
                  {level?.level ?? "\u2014"}
                </div>
              </div>
            </div>

            <div
              style={{
                height: 6,
                borderRadius: 3,
                background: "var(--u-rule)",
                overflow: "hidden",
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  width: `${pct}%`,
                  height: "100%",
                  background: levelColor,
                  transition: "width 400ms ease",
                }}
              />
            </div>

            {info?.shortDescription ? (
              <p
                style={{
                  font: "var(--u-body-s)",
                  color: "var(--u-ink-2)",
                  margin: "0 0 6px",
                }}
              >
                {info.shortDescription}
              </p>
            ) : null}

            {detail ? (
              <p style={{ font: "var(--u-body-s)", color: "var(--u-ink)", margin: 0 }}>
                {detail}
              </p>
            ) : null}

            {level?.meaning ? (
              <p
                style={{
                  font: "var(--u-body-s)",
                  color: "var(--u-ink-3)",
                  margin: "6px 0 0",
                  fontStyle: "italic",
                }}
              >
                {level.meaning}
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}