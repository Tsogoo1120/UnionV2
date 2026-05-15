import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/auth/OnboardingForm";
import { requireSession } from "@/lib/auth/requireSession";

export default async function OnboardingPage() {
  const profile = await requireSession();

  // Already onboarded — skip straight to the payment step.
  if (profile.phone && profile.phone.trim().length > 0) {
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
          />
        </div>
      </div>
    </div>
  );
}
