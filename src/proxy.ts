import { NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const appProtectedRoutes = ["/wallet", "/transactions", "/analytics", "/settings", "/budget", "/ai-chat", "/calendar", "/profile"];
const adminRoutes = ["/admin"];
const authRoutes = ["/sign-in", "/sign-up", "/auth"];

export default async function middleware(request: Request) {
  const { supabaseResponse, user } = await updateSession(request);
  const url = new URL(request.url);
  const pathname = url.pathname;
  const host = request.headers.get("host") || "";
  const protocol = url.protocol;

  var hostClean = host.split(":")[0];
  var hostParts = hostClean.split(".");
  var baseDomain = hostParts.length > 2 ? hostParts.slice(-2).join(".") : hostClean;

  const isFinanceHost = hostClean.startsWith("finance.");
  const isDevHost = hostClean.startsWith("dev.");
  const isRootDomain = !isFinanceHost && !isDevHost;

  const isAppProtected = appProtectedRoutes.some((r) => pathname.startsWith(r));
  const isAdminRoute = adminRoutes.some((r) => pathname === r || pathname.startsWith(r + "/"));
  const isAuthRoute = authRoutes.some((r) => pathname === r || pathname.startsWith(r + "/"));

  // FINANCE SUBDOMAIN
  if (isFinanceHost) {
    if (pathname.startsWith("/admin")) return NextResponse.redirect(protocol + "//dev." + baseDomain + pathname);
    if (!user && !isAuthRoute && isAppProtected) {
      var ru = new URL(protocol + "//finance." + baseDomain + "/sign-in", request.url);
      ru.searchParams.set("redirect", pathname);
      return NextResponse.redirect(ru);
    }
    if (user && isAuthRoute) return NextResponse.redirect(protocol + "//finance." + baseDomain + "/dashboard");
    return supabaseResponse;
  }

  // DEV SUBDOMAIN
  if (isDevHost) {
    if (!pathname.startsWith("/admin") && !pathname.startsWith("/_next") && pathname !== "/") {
      return NextResponse.redirect(protocol + "//finance." + baseDomain + pathname);
    }
    if (!user && isAdminRoute && pathname !== "/admin/login") {
      return NextResponse.redirect(protocol + "//dev." + baseDomain + "/admin/login");
    }
    if (user && pathname === "/admin/login") return NextResponse.redirect(protocol + "//dev." + baseDomain + "/admin");
    return supabaseResponse;
  }

  // ROOT DOMAIN
  if (isRootDomain) {
    if (pathname === "/") {
      if (user) return NextResponse.redirect(protocol + "//finance." + baseDomain + "/dashboard");
      return supabaseResponse;
    }
    if (!user) {
      if (isAppProtected) return NextResponse.redirect(protocol + "//finance." + baseDomain + "/sign-in?redirect=" + pathname);
      if (isAdminRoute) return NextResponse.redirect(protocol + "//dev." + baseDomain + "/admin/login");
    }
    return supabaseResponse;
  }

  return supabaseResponse;
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|api|trpc).*)"] };
