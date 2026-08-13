"use client";

import { useMe } from "@/hooks/use-auth";

/** Revalidates `/auth/me` when a persisted token exists. */
export function SessionHydrator() {
  useMe();
  return null;
}
