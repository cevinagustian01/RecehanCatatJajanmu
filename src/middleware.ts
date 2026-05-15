import { NextResponse, NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export default async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);
  const { pathname } = new URL(request.url);
  const host = request.headers.get("host") || "";

  if (!host) return supabaseResponse;

  const hostLower = host.toLowerCase();
  const isFinance = hostLower.startsWith("finance.");
  const isDev = hostLower.startsWith("dev.");

  if (isFinance) {
    if (pathname.startsWith("/admin")) {
      const baseHost = hostLower.replace(/^finance\./, "");
      return NextResponse.redirect(`${request.url.protocol}//dev.${baseHost}${pathname}`);
    }
    const protectedRoutes = ["/wallet", "/transactions", "/analytics", "/settings", "/budget", "/ai-chat", "/calendar", "/profile"];
    const authRoutes = ["/sign-in", "/sign-up", "/auth"];
    const isProtected = protectedRoutes.some((r) => pathname.startsWith(r));
    const isAuth = authRoutes.some((r) => pathname === r || pathname.startsWith(r + "/"));
    if (!user && !isAuth && isProtected) {
      const u = new URL(`/sign-in?redirect=${pathname}`, request.url);
      return NextResponse.redirect(u);
    }
    if (user && isAuth) return NextResponse.redirect(new URL("/dashboard", request.url));
    return supabaseResponse;
  }

  if (isDev) {
    if (pathname === "/admin/login") return supabaseResponse;
    if (!pathname.startsWith("/admin") && !pathname.startsWith("/_next") && !pathname.startsWith("/api") && !pathname.startsWith("/trpc") && pathname !== "/") {
      const baseHost = hostLower.replace(/^dev\./, "");
      return NextResponse.redirect(`${request.url.protocol}//finance.${baseHost}${pathname}`);
    }
    if (pathname.startsWith("/admin")) {
      if (!user) return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    if (pathname === "/") {
      if (user) return NextResponse.redirect(new URL("/admin", request.url));
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return supabaseResponse;
  }

  const isRootAuth = ["/sign-in", "/sign-up", "/auth"].some((r) => pathname === r || pathname.startsWith(r + "/"));
  const isRootProtected = ["/wallet", "/transactions", "/analytics", "/settings", "/budget", "/ai-chat", "/calendar", "/profile"].some((r) => pathname.startsWith(r));
  const isRootAdmin = ["/admin"].some((r) => pathname === r || pathname.startsWith(r + "/"));

  if (pathname === "/") {
    if (user) return NextResponse.redirect(new URL("/dashboard", request.url));
    return supabaseResponse;
  }
  if (isRootAuth) {
    const u = new URL(pathname, request.url);
    u.host = pathname.startsWith("/admin") ? `dev.${u.host}` : `finance.${u.host}`;
    return NextResponse.redirect(u);
  }
  if (isRootProtected && !user) {
    const u = new URL("/sign-in", request.url);
    u.host = `finance.${u.host}`;
    u.searchParams.set("redirect", pathname);
    return NextResponse.redirect(u);
  }
  if (isRootAdmin && !user) {
    const u = new URL("/admin/login", request.url);
    u.host = `dev.${u.host}`;
    return NextResponse.redirect(u);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};