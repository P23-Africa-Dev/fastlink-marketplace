"use client";

import { useMe } from "@/hooks/use-auth";
import { useMergeWishlistOnLogin } from "@/hooks/use-wishlist";

/** Revalidates `/auth/me` when a persisted token exists. */
export function SessionHydrator() {
  useMe();
  useMergeWishlistOnLogin();
  return null;
}
