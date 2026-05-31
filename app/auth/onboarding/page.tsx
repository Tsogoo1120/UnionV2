import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/auth/OnboardingForm";
import { requireSession } from "@/lib/auth/requireSession";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  const profile = await requireSession();

  // Validate next param — only allow same-origin paths.
  const rawNext = searchParams.next ?? "";
  const safeNext =
    rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "";

  // Already onboarded — send them on their way.
  if (profile.phone && profile.phone.trim().length > 0) {
    // Coaching clients bypass the subscription payment flow.
    if (safeNext.startsWith("/coaching/")) {
      redirect(safeNext);
    }
    redirect("/payment");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--u-bg)",
        padding: "24px 16px 48px",
      }}
    >
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <div className="u-eyebrow">Бүртгэл</div>
        <h1
          style={{
            font: "var(--u-display-s)",
            margin: "8px 0 12px",
            letterSpacing: "-0.02em",
          }}
        >
          Бүртгэлээ дуусгана уу
        </h1>
        <p
          style={{
            font: "var(--u-body)",
            color: "var(--u-ink-2)",
            margin: "0 0 28px",
          }}
        >
          Үргэлжлүүлэхийн тулд овог нэр болон холбоо барих утасны дугаараа
          бөглөнө үү.
        </p>
        <div
          style={{
            padding: 20,
            borderRadius: "var(--u-r-3)",
            border: "1px solid var(--u-rule)",
            background: "var(--u-surface-2)",
          }}
        >
          <OnboardingForm
            defaultFullName={profile.full_name}
            defaultPhone={profile.phone}
            redirectTo={safeNext || undefined}
          />
        </div>
      </div>
    </div>
  );
}
