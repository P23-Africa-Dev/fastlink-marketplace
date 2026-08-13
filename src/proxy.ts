import { NextRequest, NextResponse } from "next/server";

import { isLoginRequiredPath, isSellerDashboardPath } from "@/lib/auth-session";

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
  if (role === "buyer" && isSellerDashboardPath(pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
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
    "/products/:id/add-new-product",
  ],
};
