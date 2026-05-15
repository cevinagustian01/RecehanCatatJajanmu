import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  
  if (hostname.startsWith("finance.") && request.nextUrl.pathname === "/") {
    return NextResponse.redirect(request.nextUrl.origin + "/dashboard");
  }
  
  if (hostname.startsWith("dev.") && request.nextUrl.pathname === "/") {
    return NextResponse.redirect(request.nextUrl.origin + "/admin/login");
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
