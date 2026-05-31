"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { signInWithGoogle } from "@/lib/auth/sign-in-with-google";
import { useToast } from "@/components/shell/Toast";

type Mode = "signin" | "signup" | "check-email";

const inputStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 48,
  padding: "0 14px",
  borderRadius: "var(--u-r-2)",
  border: "1px solid var(--u-rule-2)",
  background: "var(--u-surface-2)",
  font: "var(--u-body)",
  color: "var(--u-ink)",
  boxSizing: "border-box",
  outline: "none",
};

function translateError(msg: string): string {
  if (msg.includes("Invalid login credentials"))
    return "Invalid email or password";
  if (msg.includes("Email not confirmed"))
    return "Email not confirmed. Please check your email.";
  if (msg.includes("User already registered"))
    return "This email is already registered";
  if (msg.includes("Password should be at least"))
    return "Password must be at least 6 characters";
  if (msg.includes("Unable to validate email address"))
    return "Invalid email address";
  return msg;
}

function AuthInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const next = searchParams.get("next") || "/";

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      const msg = translateError(error.message);
      setErr(msg);
      toast(msg, "error");
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    const supabase = createClient();

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({ email, password });
      setBusy(false);
      if (error) {
        setErr(translateError(error.message));
        return;
      }
      if (data.session) {
        router.replace("/auth/onboarding");
      } else {
        setMode("check-email");
      }
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      setErr(translateError(error.message));
      return;
    }
    router.replace(next);
  }

  function switchMode(m: Mode) {
    setMode(m);
    setErr(null);
  }

  if (mode === "check-email") {
    return (
      <div style={wrapStyle}>
        <div style={{ maxWidth: 400, width: "100%", textAlign: "center" }}>
          <h1 style={{ font: "var(--u-display-s)", margin: "0 0 12px" }}>
            Check your email
          </h1>
          <p style={{ font: "var(--u-body)", color: "var(--u-ink-2)", margin: "0 0 28px" }}>
            We sent a confirmation link to <strong>{email}</strong>.
            Click the link in your email to activate your account.
          </p>
          <button
            type="button"
            onClick={() => switchMode("signin")}
            style={{ font: "var(--u-body-s)", color: "var(--u-ink-2)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
          >
            &larr; Back to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={wrapStyle}>
      <div style={{ maxWidth: 400, width: "100%" }}>

        {/* Notice for returning users */}
        <div style={{
          marginBottom: 24,
          padding: "14px 16px",
          borderRadius: "var(--u-r-2)",
          border: "1px solid var(--u-ember)",
          background: "color-mix(in srgb, var(--u-ember) 8%, var(--u-bg))",
          font: "var(--u-body-s)",
          color: "var(--u-ink)",
          lineHeight: 1.6,
        }}>
          <strong style={{ display: "block", marginBottom: 4 }}>&#9888; Notice</strong>
          Since the site has been updated, users who previously registered and paid, as well as members of the Podcast group, <strong>do not need to pay again.</strong>
          {" "}Please sign up again and upload a screenshot of your Facebook, YMU, or Instagram profile in the screenshot section. I&apos;ll confirm your account myself once it is added.
        </div>

        <h1 style={{ font: "var(--u-display-s)", margin: "0 0 8px", textAlign: "center" }}>
          {mode === "signin" ? "Sign in" : "Sign up"}
        </h1>
        <p style={{ font: "var(--u-body)", color: "var(--u-ink-2)", margin: "0 0 24px", textAlign: "center" }}>
          {mode === "signin"
            ? "Sign in to use Union services."
            : "Create a new account."}
        </p>

        {err ? (
          <p style={{ color: "var(--u-danger)", font: "var(--u-body-s)", marginBottom: 16, textAlign: "center" }}>
            {err}
          </p>
        ) : null}

        {/* Google button */}
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
            marginBottom: 20,
          }}
        >
          {busy ? "Processing\u2026" : "Continue with Google"}
        </button>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: "var(--u-rule)" }} />
          <span style={{ font: "var(--u-body-s)", color: "var(--u-ink-3)" }}>or</span>
          <div style={{ flex: 1, height: 1, background: "var(--u-rule)" }} />
        </div>

        {/* Email + password form */}
        <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            style={inputStyle}
          />
          <button
            type="submit"
            disabled={busy}
            style={{
              width: "100%",
              minHeight: 52,
              borderRadius: "var(--u-r-2)",
              border: "none",
              background: "var(--u-ember)",
              color: "#fff",
              font: "var(--u-body)",
              fontWeight: 600,
              cursor: busy ? "wait" : "pointer",
              marginTop: 4,
              boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
            }}
          >
            {busy
              ? "Processing\u2026"
              : mode === "signin"
              ? "Sign in"
              : "Sign up"}
          </button>
        </form>

        {/* Toggle between sign-in and sign-up */}
        <p style={{ font: "var(--u-body-s)", color: "var(--u-ink-2)", textAlign: "center", marginTop: 20 }}>
          {mode === "signin" ? (
            <>
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => switchMode("signup")}
                style={{ color: "var(--u-ember)", background: "none", border: "none", cursor: "pointer", font: "var(--u-body-s)", fontWeight: 600, padding: 0 }}
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => switchMode("signin")}
                style={{ color: "var(--u-ember)", background: "none", border: "none", cursor: "pointer", font: "var(--u-body-s)", fontWeight: 600, padding: 0 }}
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

const wrapStyle: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
  background: "var(--u-bg)",
};

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
          Loading&hellip;
        </div>
      }
    >
      <AuthInner />
    </Suspense>
  );
}