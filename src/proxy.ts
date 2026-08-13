import { NextRequest, NextResponse } from "next/server";

const SELLER_PREFIXES = [
  "/dashboard",
  "/orders",
  "/all-products",
  "/customers",
  "/messages",
  "/payments",
  "/payouts",
  "/analytics",
  "/marketing",
  "/reviews",
  "/settings",
  "/support",
];

function isSellerPath(pathname: string): boolean {
  if (/^\/products\/[^/]+\/add-new-product/.test(pathname)) return true;
  return SELLER_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isSellerPath(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get("auth_token")?.value;
  if (!token) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  const role = request.cookies.get("auth_role")?.value;
  if (role === "buyer") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
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
