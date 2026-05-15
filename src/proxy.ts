import { NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";


const appProtectedRoutes = ["/wallet", "/transactions", "/analytics", "/settings"];
const adminRoutes = ["/admin"];
const authRoutes = ["/sign-in", "/sign-up", "/auth", "/admin/login"];

export default async function middleware(request: Request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const host = request.headers.get("host") || "";
  const protocol = url.protocol;

  // Subdomain routing
  if (host.startsWith("finance.") && pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  if (host.startsWith("dev.") && pathname === "/") {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const isAppProtected = appProtectedRoutes.some((r) => pathname.startsWith(r));
  const isAdminRoute = adminRoutes.some((r) => pathname === r || pathname.startsWith(r + "/"));
  const isAuthRoute = authRoutes.some((r) => pathname === r || pathname.startsWith(r + "/"));

  const { supabaseResponse, user } = await updateSession(request as any);

  if (!user && !isAuthRoute) {
    if (isAdminRoute) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    if (isAppProtected) {
      const redirectUrl = new URL("/sign-in", request.url);
      redirectUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  if (user && isAuthRoute) {
    if (pathname === "/admin/login") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    // Root domain: redirect to finance subdomain when logged in
    if (!host.startsWith("finance.") && !host.startsWith("dev.") && !host.startsWith("www.")) {
      const financeUrl = protocol + "//" + "finance." + host.split(":")[0] + "/dashboard";
      return NextResponse.redirect(new URL(financeUrl));
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
