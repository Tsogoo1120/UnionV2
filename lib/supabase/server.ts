import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseUrl, supabaseAnonKey } from "./env";

/**
 * Server-side Supabase client bound to the request's cookies.
 * Uses the anon key — respects RLS, acts as the signed-in user.
 *
 * Use from Server Components, Server Actions, and Route Handlers.
 * Do NOT use the service-role admin client unless you specifically need to
 * bypass RLS for an admin operation (see lib/supabase/admin.ts).
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl(), supabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // setAll called from a Server Component — cookies are read-only.
          // Middleware handles refreshing the session.
        }
      },
    },
  });
}
