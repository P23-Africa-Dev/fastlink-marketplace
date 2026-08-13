import type { SellerPermission, User } from "@/types/user";

const ALL: SellerPermission[] = ["inventory", "orders", "finance", "support", "manage"];

export function sellerPermissions(user?: User | null): SellerPermission[] {
  if (!user) return [];
  if (user.role === "admin") return ALL;
  if (user.sellerAccess?.permissions?.length) return user.sellerAccess.permissions;
  if (user.role === "seller") return ALL;
  return [];
}

export function canSeller(user: User | null | undefined, permission: SellerPermission): boolean {
  const permissions = sellerPermissions(user);
  return permissions.includes("manage") || permissions.includes(permission);
}
