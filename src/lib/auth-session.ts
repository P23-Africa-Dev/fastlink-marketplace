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
  "/returns",
  "/settings",
  "/support",
  "/growth",
  "/promos",
  "/inventory",
  "/disputes",
  "/team",
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

export function isAdminPath(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export function isRiderPath(pathname: string): boolean {
  return pathname === "/rider" || pathname.startsWith("/rider/");
}

export function isLoginRequiredPath(pathname: string): boolean {
  // Public shop (homepage, catalog, account, checkout, etc.) stays open without a token.
  // Only seller dashboard + admin control tower require authentication.
  if (isAdminPath(pathname)) return true;
  return isSellerDashboardPath(pathname);
}

export function homeForRole(role?: string | null): string {
  if (role === "admin") return "/admin";
  if (role === "seller") return "/dashboard";
  if (role === "rider") return "/rider";
  return "/";
}

export function accountHref(isAuthenticated: boolean, role?: string | null): string {
  if (!isAuthenticated) return "/login";
  if (role === "admin") return "/admin";
  if (role === "seller") return "/dashboard";
  if (role === "rider") return "/rider";
  return "/account/orders";
}

export function safePostLoginPath(next: string | null, role?: string | null): string {
  const fallback = homeForRole(role);
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("://")) {
    return fallback;
  }

  const pathname = next.split("?")[0] ?? next;

  // Role isolation: never send a user into another role's control surface.
  if (role === "admin") {
    return isAdminPath(pathname) ? next : fallback;
  }

  if (role === "seller") {
    if (isAdminPath(pathname) || isRiderPath(pathname)) return fallback;
    return next;
  }

  if (role === "rider") {
    if (isSellerDashboardPath(pathname) || isAdminPath(pathname)) return fallback;
    return next;
  }

  // buyer / unknown
  if (isSellerDashboardPath(pathname) || isAdminPath(pathname) || isRiderPath(pathname)) {
    return fallback;
  }

  return next;
}
