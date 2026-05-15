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
  const { supabaseResponse, user } = await updateSession(request as any);
  const isFinanceHost = host.startsWith("finance.");
  const isDevHost = host.startsWith("dev.");
  const isRootOrWww = !isFinanceHost && !isDevHost;

  if (isFinanceHost && pathname.startsWith("/admin")) {
    const devUrl = protocol + "//" + "dev." + host.split(":")[0] + pathname;
    return NextResponse.redirect(new URL(devUrl, request.url));
  }

  if (isDevHost && !pathname.startsWith("/admin") && !pathname.startsWith("/_next")) {
    const finUrl = protocol + "//" + "finance." + host.split(":")[0] + pathname;
    return NextResponse.redirect(new URL(finUrl, request.url));
  }

  if (isRootOrWww && user && pathname === "/") {
    const finUrl = protocol + "//" + "finance." + host.split(":")[0] + "/dashboard";
    return NextResponse.redirect(new URL(finUrl, request.url));
  }

  const isAppProtected = appProtectedRoutes.some((r) => pathname.startsWith(r));
  const isAdminRoute = adminRoutes.some((r) => pathname === r || pathname.startsWith(r + "/"));
  const isAuthRoute = authRoutes.some((r) => pathname === r || pathname.startsWith(r + "/"));

  if (!user && !isAuthRoute) {
    if (isAdminRoute) return NextResponse.redirect(new URL("/admin/login", request.url));
    if (isAppProtected) {
      const redirectUrl = new URL("/sign-in", request.url);
      redirectUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  if (user && isAuthRoute) {
    if (pathname === "/admin/login") return NextResponse.redirect(new URL("/admin", request.url));
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
