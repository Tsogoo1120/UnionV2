/**
 * Shared bearer-token authentication for cron endpoints.
 *
 * Vercel Cron sends `Authorization: Bearer <CRON_SECRET>` automatically
 * when CRON_SECRET is configured as an env var. Each cron route calls
 * authorizeCron(req) before doing any work.
 */
import { NextResponse } from "next/server";

export function authorizeCron(req: Request):
  | { ok: true }
  | { ok: false; response: NextResponse } {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("[cron] CRON_SECRET is not set — refusing to run");
    return {
      ok: false,
      response: NextResponse.json(
        { error: "CRON_SECRET not configured" },
        { status: 500 },
      ),
    };
  }

  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${secret}`) {
    return {
      ok: false,
      response: NextResponse.json({ error: "unauthorized" }, { status: 401 }),
    };
  }

  return { ok: true };
}
