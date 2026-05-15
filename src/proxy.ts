import { NextResponse, NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

function isFinance(req: NextRequest): boolean {
  const host = req.headers.get("host")?.toLowerCase() || "";
  return host.startsWith("finance.") || host === "finance.localhost" || host.startsWith("finance-");
}

function isDev(req: NextRequest): boolean {
  const host = req.headers.get("host")?.toLowerCase() || "";
  return host.startsWith("dev.") || host === "dev.localhost" || host.startsWith("dev-");
}

function getBaseDomain(req: NextRequest): string {
  const host = req.headers.get("host") || "";
  const clean = host.split(":")[0];
  const parts = clean.split(".");
  return parts.length > 2 ? parts.slice(-2).join(".") : clean;
}

export default async function middleware(req: NextRequest) {
  const { supabaseResponse, user } = await updateSession(req);
  const { pathname } = new URL(req.url);

  if (pathname === "/admin/login") return supabaseResponse;

  const baseDomain = getBaseDomain(req);
  const protocol = new URL(req.url).protocol;

  if (isFinance(req)) {
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(`${protocol}//dev.${baseDomain}${pathname}`);
    }
    if (!user) {
      const protectedRoutes = ["/wallet", "/transactions", "/analytics", "/settings", "/budget", "/ai-chat", "/calendar", "/profile"];
      const authRoutes = ["/sign-in", "/sign-up", "/auth"];
      const isProtected = protectedRoutes.some((r) => pathname.startsWith(r));
      const isAuth = authRoutes.some((r) => pathname === r || pathname.startsWith(r + "/"));
      if (!isAuth && isProtected) {
        const u = new URL("/sign-in", req.url);
        u.searchParams.set("redirect", pathname);
        return NextResponse.redirect(u);
      }
    }
    if (user && ["/sign-in", "/sign-up", "/auth"].some((r) => pathname === r || pathname.startsWith(r + "/"))) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return supabaseResponse;
  }

  if (isDev(req)) {
    if (!pathname.startsWith("/admin") && !pathname.startsWith("/_next") && !pathname.startsWith("/api") && !pathname.startsWith("/trpc") && pathname !== "/") {
      return NextResponse.redirect(`${protocol}//finance.${baseDomain}${pathname}`);
    }
    if (pathname.startsWith("/admin") && !user) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    if (pathname === "/" && !user) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    return supabaseResponse;
  }

  if (pathname === "/") {
    if (user) return NextResponse.redirect(new URL("/dashboard", req.url));
    return supabaseResponse;
  }
  if (["/sign-in", "/sign-up", "/auth"].some((r) => pathname === r || pathname.startsWith(r + "/"))) {
    const u = new URL(pathname, req.url);
    u.host = pathname.startsWith("/admin") ? `dev.${u.host}` : `finance.${u.host}`;
    return NextResponse.redirect(u);
  }
  if (["/wallet", "/transactions", "/analytics", "/settings", "/budget", "/ai-chat", "/calendar", "/profile"].some((r) => pathname.startsWith(r)) && !user) {
    const u = new URL("/sign-in", req.url);
    u.host = `finance.${u.host}`;
    u.searchParams.set("redirect", pathname);
    return NextResponse.redirect(u);
  }
  if (["/admin"].some((r) => pathname === r || pathname.startsWith(r + "/")) && !user) {
    const u = new URL("/admin/login", req.url);
    u.host = `dev.${u.host}`;
    return NextResponse.redirect(u);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};