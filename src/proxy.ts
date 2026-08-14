import { NextRequest, NextResponse } from "next/server";

import { homeForRole, isAdminPath, isLoginRequiredPath, isSellerDashboardPath } from "@/lib/auth-session";

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

  // Vendors (and everyone else) cannot enter the admin control tower.
  if (isAdminPath(pathname) && role !== "admin") {
    return NextResponse.redirect(new URL(homeForRole(role), request.url));
  }

  // Admins cannot enter the vendor dashboard.
  if (isSellerDashboardPath(pathname) && role !== "seller") {
    return NextResponse.redirect(new URL(homeForRole(role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Seller dashboard (src/app/(dashboard))
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
    "/returns",
    "/returns/:path*",
    "/settings",
    "/settings/:path*",
    "/support",
    "/support/:path*",
    "/growth",
    "/growth/:path*",
    "/promos",
    "/promos/:path*",
    "/inventory",
    "/inventory/:path*",
    "/disputes",
    "/disputes/:path*",
    "/team",
    "/team/:path*",
    "/notifications",
    "/notifications/:path*",
    "/products/:id/add-new-product",
    // Admin control tower (src/app/(admin))
    "/admin",
    "/admin/:path*",
  ],
};
