import { NextRequest, NextResponse } from "next/server";

const ROLE_HOME: Record<string, string> = {
  ADMIN: "/dashboard/admin",
  LANDLORD: "/dashboard/landlord",
  TENANT: "/dashboard/tenant",
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("rentnest_token")?.value;
  const role = request.cookies.get("rentnest_role")?.value;

  // No session cookie: redirect to login.
  if (!token) {
    const url = new URL("/auth/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  const requiredRole = pathname.startsWith("/dashboard/admin")
    ? "ADMIN"
    : pathname.startsWith("/dashboard/landlord")
      ? "LANDLORD"
      : pathname.startsWith("/dashboard/tenant")
        ? "TENANT"
        : null;

  // Only role-specific dashboard routes need role checks.
  if (requiredRole && role !== requiredRole) {
    const ownDashboard = role ? ROLE_HOME[role] : undefined;

    if (ownDashboard) {
      return NextResponse.redirect(
        new URL(ownDashboard, request.url),
      );
    }

    // Missing or invalid role: ask the user to sign in again.
    const url = new URL("/auth/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};