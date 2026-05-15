"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { signInWithGoogle } from "@/lib/auth/sign-in-with-google";
import { useToast } from "@/components/shell/Toast";

function AuthInner() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const toast = useToast();

  async function onGoogle() {
    setErr(null);
    setBusy(true);
    const supabase = createClient();
    const { error } = await signInWithGoogle(supabase, { next });
    setBusy(false);
    if (error) {
      setErr(error.message);
      toast(error.message, "error");
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "var(--u-bg)",
      }}
    >
      <div style={{ maxWidth: 400, width: "100%", textAlign: "center" }}>
        <h1 style={{ font: "var(--u-display-s)", margin: "0 0 12px" }}>Нэвтрэх</h1>
        <p style={{ font: "var(--u-body)", color: "var(--u-ink-2)", margin: "0 0 28px" }}>
          Union үйлчилгээ ашиглахын тулд Google-ээр нэвтэрнэ үү.
        </p>
        {err ? (
          <p style={{ color: "var(--u-danger)", font: "var(--u-body-s)", marginBottom: 16 }}>{err}</p>
        ) : null}
        <button
          type="button"
          onClick={onGoogle}
          disabled={busy}
          style={{
            width: "100%",
            minHeight: 52,
            borderRadius: "var(--u-r-2)",
            border: "1px solid var(--u-rule-2)",
            background: "var(--u-surface-2)",
            font: "var(--u-body)",
            fontWeight: 600,
            cursor: busy ? "wait" : "pointer",
          }}
        >
          {busy ? "Уншиж байна…" : "Google-ээр нэвтрэх"}
        </button>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
          Ачааллаж байна…
        </div>
      }
    >
      <AuthInner />
    </Suspense>
  );
}
