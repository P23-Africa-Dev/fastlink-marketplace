"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { homeForRole, safePostLoginPath } from "@/lib/auth-session";
import { useAuthStore } from "@/store/auth-store";

/**
 * Keeps /login, /register, etc. off-limits once a session exists.
 * Waits for Zustand persist rehydration so a hard refresh doesn't flash the form
 * then bounce, and so we don't redirect away before cookies are restored.
 */
export function GuestOnly({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!hasHydrated) return;

    if (isAuthenticated && user) {
      const next = searchParams.get("next");
      router.replace(safePostLoginPath(next, user.role));
      return;
    }

    setReady(true);
  }, [hasHydrated, isAuthenticated, user, router, searchParams]);

  if (!hasHydrated || (isAuthenticated && user) || !ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4ebfc] text-[#6D349F] font-semibold text-sm">
        {isAuthenticated ? `Taking you to ${homeForRole(user?.role)}…` : "Loading…"}
      </div>
    );
  }

  return <>{children}</>;
}
