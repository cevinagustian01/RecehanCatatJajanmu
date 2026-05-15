import { NextResponse, NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

function getSubdomainAndBase(host: string): { subdomain: string; base: string } {
  const clean = host.split(":")[0];
  const parts = clean.split(".");
  if (parts.length <= 2) {
    return { subdomain: "", base: clean };
  }
  // e.g., dev.finance.localhost -> subdomain=dev, base=finance.localhost
  return { subdomain: parts[0], base: parts.slice(-2).join(".") };
}

export default async function middleware(req: NextRequest) {
  const { supabaseResponse, user } = await updateSession(req);
  const { pathname } = new URL(req.url);
  const host = req.headers.get("host") || "";

  if (!host) return supabaseResponse;

  const { subdomain, base } = getSubdomainAndBase(host);
  const url = new URL(req.url);
  const protocol = url.protocol;

  if (subdomain === "dev") {
    if (pathname === "/admin/login") return supabaseResponse;
    if (pathname.startsWith("/admin") && !user) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    if (pathname === "/") {
      if (user) return NextResponse.redirect(new URL("/admin", req.url));
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    return supabaseResponse;
  }

  if (subdomain === "finance" || subdomain === "") {
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(`${protocol}//dev.${base}${pathname}`);
    }
    const protectedRoutes = ["/wallet", "/transactions", "/analytics", "/settings", "/budget", "/ai-chat", "/calendar", "/profile"];
    const authRoutes = ["/sign-in", "/sign-up", "/auth"];
    const isProtected = protectedRoutes.some((r) => pathname.startsWith(r));
    const isAuth = authRoutes.some((r) => pathname === r || pathname.startsWith(r + "/"));
    if (!user && !isAuth && isProtected) {
      const u = new URL("/sign-in", req.url);
      u.searchParams.set("redirect", pathname);
      return NextResponse.redirect(u);
    }
    if (user && isAuth) return NextResponse.redirect(new URL("/dashboard", req.url));
    return supabaseResponse;
  }

  if (subdomain && subdomain !== "finance" && subdomain !== "dev") {
    return NextResponse.redirect(`${protocol}//finance.${base}${pathname}`);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};