import { NextRequest, NextResponse } from "next/server";

/**
 * UX-level route gate only. Cookies set by client code can be modified by users.
 * The backend must enforce authentication and role authorization on every API.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("rentnest_token")?.value;
  const role = request.cookies.get("rentnest_role")?.value;

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

  if (requiredRole && role && role !== requiredRole) {
    const destination = role === "ADMIN"
      ? "/dashboard/admin"
      : role === "LANDLORD"
        ? "/dashboard/landlord"
        : "/dashboard/tenant";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
