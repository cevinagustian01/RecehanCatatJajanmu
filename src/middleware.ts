import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// 1. Tentukan rute mana saja yang harus login
const isProtectedRoute = createRouteMatcher([
  "/",
  "/wallet(.*)",
  "/transactions(.*)",
  "/analytics(.*)",
  "/settings(.*)",
  "/admin(.*)", // Tambahkan admin ke rute yang diproteksi
]);

// 2. Tentukan rute khusus Admin
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  // Jika rute membutuhkan login
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  // Logika khusus untuk rute /admin
  if (isAdminRoute(req)) {
    const { sessionClaims } = await auth();
    
    // Cek role dari metadata Clerk (jika lu set di dashboard Clerk)
    // Atau jika lu pakai pengecekan via database di dalam page/layout admin
    // Untuk saat ini, kita biarkan lewat dulu ke halaman admin
    // karena pengecekan role yang lebih akurat biasanya ada di server component (layout.tsx admin)
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};