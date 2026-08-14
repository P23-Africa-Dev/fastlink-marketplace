import { NextRequest, NextResponse } from "next/server";

import { isAdminPath, isLoginRequiredPath, isSellerDashboardPath } from "@/lib/auth-session";

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
    "/products/:id/add-new-product",
    // Admin control tower (src/app/(admin))
    "/admin",
    "/admin/:path*",
  ],
};
