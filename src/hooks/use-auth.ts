"use client";

import { useQuery } from "@tanstack/react-query";

import { authApi } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-client";
import { useAuthStore } from "@/store/auth-store";

export function useMe() {
  const token = useAuthStore((s) => s.token);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);

  return useQuery({
    queryKey: QUERY_KEYS.auth.user(),
    queryFn: async () => {
      try {
        const { data } = await authApi.getMe();
        if (token) setUser(data, token);
        return data;
      } catch (error) {
        // Invalid/expired token: clear session, stay on public pages.
        logout();
        throw error;
      }
    },
    enabled: Boolean(token),
    retry: false,
  });
}
