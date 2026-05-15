import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getEffectiveStatus } from "@/lib/auth/getEffectiveStatus";
import { pathForEffectiveStatus } from "@/lib/auth/redirectByEffectiveStatus";
import type { GateProfile } from "@/lib/subscription";
import { supabaseUrl, supabaseAnonKey } from "./env";

const REQUEST_PATH_HEADER = "x-union-request-path";

function nextWithRequestPath(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const pathWithQuery =
    request.nextUrl.pathname +
    (request.nextUrl.searchParams.toString()
      ? `?${request.nextUrl.searchParams.toString()}`
      : "");
  requestHeaders.set(REQUEST_PATH_HEADER, pathWithQuery);
  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

function isAdminRoute(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

function isDevRoute(pathname: string) {
  return pathname === "/dev" || pathname.startsWith("/dev/");
}

function isCoachingBookSurface(pathname: string) {
  return pathname.startsWith("/coaching/book/");
}

function isActiveSubscriberSurface(pathname: string) {
  if (pathname.startsWith("/lessons/")) return true;
  if (pathname.startsWith("/readings/")) return true;
  if (pathname.startsWith("/articles/")) return true;
  if (pathname.startsWith("/tests/")) return true;
  if (pathname === "/community" || pathname.startsWith("/community/")) {
    return true;
  }
  return false;
}

function isSessionOnlySurface(pathname: string) {
  if (pathname === "/payment" || pathname.startsWith("/payment/")) {
    return true;
  }
  if (pathname === "/transactions" || pathname.startsWith("/transactions/")) {
    return true;
  }
  if (pathname === "/status" || pathname.startsWith("/status/")) return true;
  return false;
}

/**
 * Refreshes the Supabase session cookie and enforces route guards (plan §5.2).
 * Edge-safe: anon client only; effective status from getEffectiveStatus().
 */
export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isDevRoute(pathname) && process.env.NODE_ENV !== "development") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    url.hash = "";
    return NextResponse.redirect(url);
  }

  let supabaseResponse = nextWithRequestPath(request);

  const supabase = createServerClient(supabaseUrl(), supabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = nextWithRequestPath(request);
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.searchParams.set(
      "next",
      pathname +
        (request.nextUrl.searchParams.toString()
          ? `?${request.nextUrl.searchParams.toString()}`
          : ""),
    );
    url.hash = "";
    return NextResponse.redirect(url);
  }

  const needsProfile =
    isAdminRoute(pathname) ||
    isDevRoute(pathname) ||
    isActiveSubscriberSurface(pathname);

  let profile: GateProfile | null = null;

  if (needsProfile) {
    const { data } = await supabase
      .from("profiles")
      .select("role, subscription_status, subscription_expires_at")
      .eq("id", user.id)
      .maybeSingle();
    profile = data as GateProfile | null;
  }

  if (isAdminRoute(pathname)) {
    const status = getEffectiveStatus(profile);
    if (status !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      url.search = "";
      url.hash = "";
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  if (isDevRoute(pathname)) {
    const status = getEffectiveStatus(profile);
    if (status !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      url.search = "";
      url.hash = "";
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  if (isActiveSubscriberSurface(pathname)) {
    const status = getEffectiveStatus(profile);
    if (status === "active" || status === "admin") {
      return supabaseResponse;
    }
    const url = request.nextUrl.clone();
    url.pathname = pathForEffectiveStatus(status);
    url.search = "";
    url.hash = "";
    return NextResponse.redirect(url);
  }

  if (isSessionOnlySurface(pathname) || isCoachingBookSurface(pathname)) {
    return supabaseResponse;
  }

  return supabaseResponse;
}
