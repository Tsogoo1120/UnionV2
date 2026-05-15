/**
 * SERVER-ONLY MODULE — Resend SDK wrapper.
 * ─────────────────────────────────────────────────────────────
 * RESEND_API_KEY is a secret. Importing this file from a Client
 * Component would embed the key in the browser bundle.
 *
 * Safe usage: Server Actions, Route Handlers, Server Components.
 * ─────────────────────────────────────────────────────────────
 */
import "server-only";
import { Resend } from "resend";

let cached: Resend | null = null;

export function getResendClient(): Resend {
  if (cached) return cached;
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error(
      "Missing RESEND_API_KEY. Sign up at https://resend.com, " +
        "create an API key, and add it to .env.local.",
    );
  }
  cached = new Resend(key);
  return cached;
}

/**
 * The "From" header for outgoing email.
 *
 *   - Development / sandbox: Resend lets you send from
 *     `onboarding@resend.dev` without verifying a domain, but ONLY
 *     to the email address you signed up with.
 *   - Production: set EMAIL_FROM to a verified domain you control,
 *     e.g. `Union <noreply@yourdomain.mn>`.
 */
export const EMAIL_FROM =
  process.env.EMAIL_FROM ?? "Union <onboarding@resend.dev>";

/**
 * Base URL used to build absolute links inside emails. Falls back
 * to localhost for development. At launch this becomes the
 * production domain (see plan §18.3).
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
