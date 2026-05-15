import { NextResponse, NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

function isSubdomainOf(host: string, prefix: string): boolean {
  return host === prefix || host.endsWith("." + prefix);
}

function buildRedirect(url: URL, subdomain: string, path: string): URL {
  return new URL(path, url.protocol + "//" + subdomain + "." + url.hostname.replace(/^[^.]+\./, ""));
}

export default async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);
  const { pathname } = new URL(request.url);
  const host = request.headers.get("host") || "";

  if (!host) return supabaseResponse;

  if (isSubdomainOf(host, "finance")) {
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(buildRedirect(new URL(request.url), "dev", pathname));
    }
    const protectedRoutes = ["/wallet", "/transactions", "/analytics", "/settings", "/budget", "/ai-chat", "/calendar", "/profile"];
    const authRoutes = ["/sign-in", "/sign-up", "/auth"];
    const isProtected = protectedRoutes.some((r) => pathname.startsWith(r));
    const isAuth = authRoutes.some((r) => pathname === r || pathname.startsWith(r + "/"));
    if (!user && !isAuth && isProtected) {
      const redirectUrl = buildRedirect(new URL(request.url), "finance", "/sign-in");
      redirectUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(redirectUrl);
    }
    if (user && isAuth) {
      return NextResponse.redirect(buildRedirect(new URL(request.url), "finance", "/dashboard"));
    }
    return supabaseResponse;
  }

  if (isSubdomainOf(host, "dev")) {
    if (pathname === "/admin/login") {
      return supabaseResponse;
    }
    if (!pathname.startsWith("/admin") && !pathname.startsWith("/_next") && !pathname.startsWith("/api") && !pathname.startsWith("/trpc") && pathname !== "/") {
      return NextResponse.redirect(buildRedirect(new URL(request.url), "finance", pathname));
    }
    if (pathname.startsWith("/admin")) {
      if (!user) {
        return NextResponse.redirect(buildRedirect(new URL(request.url), "dev", "/admin/login"));
      }
      if (pathname === "/admin/login") {
        return NextResponse.redirect(buildRedirect(new URL(request.url), "dev", "/admin"));
      }
    }
    if (pathname === "/") {
      if (user) return NextResponse.redirect(buildRedirect(new URL(request.url), "dev", "/admin"));
      return NextResponse.redirect(buildRedirect(new URL(request.url), "dev", "/admin/login"));
    }
    return supabaseResponse;
  }

  const rootAuthRoutes = ["/sign-in", "/sign-up", "/auth"];
  const rootProtected = ["/wallet", "/transactions", "/analytics", "/settings", "/budget", "/ai-chat", "/calendar", "/profile"];
  const rootAdminRoutes = ["/admin"];
  const isRootAuth = rootAuthRoutes.some((r) => pathname === r || pathname.startsWith(r + "/"));
  const isRootProtected = rootProtected.some((r) => pathname.startsWith(r));
  const isRootAdmin = rootAdminRoutes.some((r) => pathname === r || pathname.startsWith(r + "/"));

  if (pathname === "/") {
    if (user) return NextResponse.redirect(buildRedirect(new URL(request.url), "finance", "/dashboard"));
    return supabaseResponse;
  }
  if (isRootAuth) {
    if (isRootAdmin) return NextResponse.redirect(buildRedirect(new URL(request.url), "dev", pathname));
    return NextResponse.redirect(buildRedirect(new URL(request.url), "finance", pathname));
  }
  if (isRootProtected && !user) {
    const redirectUrl = buildRedirect(new URL(request.url), "finance", "/sign-in");
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }
  if (isRootAdmin && !user) {
    return NextResponse.redirect(buildRedirect(new URL(request.url), "dev", "/admin/login"));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};