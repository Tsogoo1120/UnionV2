import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

/**
 * Protected surfaces only (session + subscription gates in updateSession).
 * /dev is blocked outside NODE_ENV=development and requires admin in dev.
 * Does not run on /api, /auth, /_next, or static assets.
 */
export const config = {
  matcher: [
    "/(dashboard|payment|transactions|admin|lessons|readings|articles|tests|community|status|dev)(/.*)?",
    "/coaching/book(/.*)?"
  ],
};
