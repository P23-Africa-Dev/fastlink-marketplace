"use client";

import { useEffect } from "react";

import { useMe } from "@/hooks/use-auth";
import { useMergeWishlistOnLogin } from "@/hooks/use-wishlist";
import { useAuthStore } from "@/store/auth-store";

/** Revalidates `/auth/me` when a persisted token exists. */
export function SessionHydrator() {
  const setHasHydrated = useAuthStore((s) => s.setHasHydrated);

  useEffect(() => {
    const finish = () => setHasHydrated(true);

    if (useAuthStore.persist.hasHydrated()) {
      finish();
    }

    return useAuthStore.persist.onFinishHydration(finish);
  }, [setHasHydrated]);

  useMe();
  useMergeWishlistOnLogin();
  return null;
}
