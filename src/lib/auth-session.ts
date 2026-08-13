export const AUTH_TOKEN_COOKIE = "auth_token";
export const AUTH_ROLE_COOKIE = "auth_role";

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

export function homeForRole(role?: string | null): string {
  if (role === "seller" || role === "admin") return "/dashboard";
  return "/";
}

export function accountHref(isAuthenticated: boolean, role?: string | null): string {
  if (!isAuthenticated) return "/login";
  return homeForRole(role);
}
