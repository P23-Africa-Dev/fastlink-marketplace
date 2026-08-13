export const AUTH_TOKEN_COOKIE = "auth_token";
export const AUTH_ROLE_COOKIE = "auth_role";

export const SELLER_PATH_PREFIXES = [
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

export function writeAuthCookies(token: string, role: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_TOKEN_COOKIE}=${encodeURIComponent(token)}; Path=/; SameSite=Lax`;
  document.cookie = `${AUTH_ROLE_COOKIE}=${encodeURIComponent(role)}; Path=/; SameSite=Lax`;
}

export function clearAuthCookies(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_TOKEN_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
  document.cookie = `${AUTH_ROLE_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function isSellerDashboardPath(pathname: string): boolean {
  if (/^\/products\/[^/]+\/add-new-product/.test(pathname)) return true;
  return SELLER_PATH_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function isLoginRequiredPath(pathname: string): boolean {
  if (pathname === "/checkout" || pathname.startsWith("/checkout/")) return true;
  if (pathname === "/account" || pathname.startsWith("/account/")) return true;
  return isSellerDashboardPath(pathname);
}

export function homeForRole(role?: string | null): string {
  if (role === "seller" || role === "admin") return "/dashboard";
  return "/";
}

export function accountHref(isAuthenticated: boolean, role?: string | null): string {
  if (!isAuthenticated) return "/login";
  if (role === "seller" || role === "admin") return "/dashboard";
  return "/account/orders";
}

export function safePostLoginPath(next: string | null, role?: string | null): string {
  const fallback = homeForRole(role);
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("://")) {
    return fallback;
  }

  const pathname = next.split("?")[0] ?? next;
  if (role === "buyer" && isSellerDashboardPath(pathname)) {
    return fallback;
  }

  return next;
}
