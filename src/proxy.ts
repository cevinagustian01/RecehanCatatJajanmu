import { NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const appProtectedRoutes = ["/wallet", "/transactions", "/analytics", "/settings"];
const adminRoutes = ["/admin"];
const authRoutes = ["/sign-in", "/sign-up", "/auth", "/admin/login"];

export default async function middleware(request: Request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  const isAppProtected = appProtectedRoutes.some((r) => pathname.startsWith(r));
  const isAdminRoute = adminRoutes.some((r) => pathname === r || pathname.startsWith(r + "/"));
  const isAuthRoute = authRoutes.some((r) => pathname === r || pathname.startsWith(r + "/"));

  const { supabaseResponse, user } = await updateSession(request as any);

  if (!user && !isAuthRoute) {
    // Admin routes -> redirect to admin login
    if (isAdminRoute) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    // App protected routes -> redirect to sign-in
    if (isAppProtected) {
      const redirectUrl = new URL("/sign-in", request.url);
      redirectUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  if (user && isAuthRoute) {
    // If already logged in and visiting admin login -> go to admin
    if (pathname === "/admin/login") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    // If already logged in and visiting app auth pages -> go to dashboard
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
