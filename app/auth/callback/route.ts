import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createAdminClient } from "@/lib/supabase/admin";
import { getEffectiveStatus } from "@/lib/auth/getEffectiveStatus";
import { pathForEffectiveStatus } from "@/lib/auth/redirectByEffectiveStatus";
import { exchangeCodeForSessionWithRetries } from "@/lib/auth/exchange-session-with-retries";
import { authDebug } from "@/lib/auth/auth-debug";
import { sendWelcomeEmail } from "@/lib/email/send";

/**
 * OAuth callback. Supabase redirects here after Google sign-in completes.
 *
 * Flow:
 *   1. Validate the request — if Supabase passed back an error, redirect to /login.
 *   2. Exchange the code for a session (with retry on transient failures).
 *   3. Ensure a profiles row exists (the trigger should have done this, but
 *      we re-check defensively in case the trigger was disabled).
 *   4. Read effective subscription status and route accordingly.
 *
 * On first-ever sign-in for a new user, plan §17.3 calls for a welcome
 * email to fire from here. That hook is wired in B6 (email layer); a
 * TODO marker is left at the right spot below.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/auth/onboarding";
  const error = searchParams.get("error");
  const errorCode = searchParams.get("error_code");
  const errorDescription = searchParams.get("error_description");
  type StatusProfile = Parameters<typeof getEffectiveStatus>[0];

  authDebug("callback.hit", {
    path: new URL(request.url).pathname,
    hasCode: !!code,
    codeLen: code?.length ?? 0,
    hasNext: searchParams.has("next"),
  });

  // Supabase can redirect with error params (e.g. redirect URL not allowlisted).
  if (error || errorCode || errorDescription) {
    const url = new URL("/login", origin);
    url.searchParams.set("error", error ?? errorCode ?? "auth_callback_error");
    if (errorDescription)
      url.searchParams.set("error_description", errorDescription);
    return NextResponse.redirect(url);
  }

  if (code) {
    // Never blindly trust `next`; keep redirects same-origin + path-only.
    const safeNext =
      typeof next === "string" && next.startsWith("/") && !next.startsWith("//")
        ? next
        : "/auth/onboarding";

    const response = NextResponse.redirect(`${origin}${safeNext}`);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return (
              request.headers
                .get("cookie")
                ?.split("; ")
                .map((c) => {
                  const [name, ...rest] = c.split("=");
                  return { name, value: rest.join("=") };
                }) ?? []
            );
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      },
    );

    const { error: exchangeError } = await exchangeCodeForSessionWithRetries(
      supabase,
      code,
    );

    if (!exchangeError) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return NextResponse.redirect(`${origin}/login?error=auth_user_missing`);
      }

      // Defensively ensure a profile row exists. The handle_new_user() trigger
      // creates it on auth.users INSERT, but if a misconfigured project ever
      // disables the trigger, this upsert prevents the user from being stuck
      // without a profile.
      const { data: profile } = await supabase
        .from("profiles")
        .select(
          "id, email, role, subscription_status, subscription_expires_at, phone, created_at",
        )
        .eq("id", user.id)
        .maybeSingle();

      let wasJustCreated = false;
      if (!profile) {
        const admin = createAdminClient();
        await admin.from("profiles").upsert(
          {
            id: user.id,
            email: user.email ?? "",
            role: "user",
            subscription_status: "inactive",
          },
          { onConflict: "id" },
        );
        wasJustCreated = true;
      } else {
        // Heuristic: if the profile is fresh (< 30s old), this is the
        // user's first sign-in. The trigger created it just before
        // exchangeCodeForSession returned.
        const createdAt = new Date(profile.created_at).getTime();
        wasJustCreated = Date.now() - createdAt < 30_000;
      }

      // First-time signup → fire welcome email (best-effort; never throws).
      if (wasJustCreated) {
        await sendWelcomeEmail({ userId: user.id });
      }

      // Route by effective status (single source of truth — see plan §6).
      const statusProfile: StatusProfile = profile
        ? {
            role: profile.role,
            subscription_status: profile.subscription_status,
            subscription_expires_at: profile.subscription_expires_at,
          }
        : {
            role: "user",
            subscription_status: "inactive",
            subscription_expires_at: null,
          };

      const status = getEffectiveStatus(statusProfile);
      // inactive — route based on whether the profile has been onboarded
      // (phone captured during /auth/onboarding). Skip onboarding when it's
      // already complete; otherwise honor the default `safeNext`.
      if (status === "inactive") {
        const hasPhone =
          typeof profile?.phone === "string" && profile.phone.trim().length > 0;
        if (hasPhone) {
          // Coaching clients coming from a booking link bypass the subscription
          // payment flow — coaching is a separate service from subscription.
          if (safeNext.startsWith("/coaching/")) {
            return NextResponse.redirect(`${origin}${safeNext}`);
          }
          return NextResponse.redirect(`${origin}/payment`);
        }
        return response;
      }
      return NextResponse.redirect(`${origin}${pathForEffectiveStatus(status)}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
