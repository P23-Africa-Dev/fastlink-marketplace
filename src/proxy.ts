import { NextRequest, NextResponse } from "next/server";

import { homeForRole, isAdminPath, isLoginRequiredPath, isRiderPath, isSellerDashboardPath } from "@/lib/auth-session";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isLoginRequiredPath(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get("auth_token")?.value;
  if (!token) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  const role = request.cookies.get("auth_role")?.value;
  if (isAdminPath(pathname) && role !== "admin") {
    const dest = role === "seller" ? "/dashboard" : role === "rider" ? "/rider" : "/";
    return NextResponse.redirect(new URL(dest, request.url));
  }
  if (isRiderPath(pathname) && pathname !== "/rider/register" && role !== "rider" && role !== "admin") {
    return NextResponse.redirect(new URL(homeForRole(role), request.url));
  }
  if (role === "buyer" && isSellerDashboardPath(pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  if (role === "rider" && isSellerDashboardPath(pathname)) {
    return NextResponse.redirect(new URL("/rider", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/checkout",
    "/checkout/:path*",
    "/account",
    "/account/:path*",
    "/dashboard",
    "/dashboard/:path*",
    "/orders",
    "/orders/:path*",
    "/all-products",
    "/all-products/:path*",
    "/customers",
    "/customers/:path*",
    "/messages",
    "/messages/:path*",
    "/payments",
    "/payments/:path*",
    "/payouts",
    "/payouts/:path*",
    "/analytics",
    "/analytics/:path*",
    "/marketing",
    "/marketing/:path*",
    "/reviews",
    "/reviews/:path*",
    "/settings",
    "/settings/:path*",
    "/support",
    "/support/:path*",
    "/admin",
    "/admin/:path*",
    "/rider",
    "/rider/:path*",
    "/products/:id/add-new-product",
  ],
};
