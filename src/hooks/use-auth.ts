"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { authApi } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-client";
import { useAuthStore } from "@/store/auth-store";

export function useMe() {
  const token = useAuthStore((s) => s.token);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);

  return useQuery({
    queryKey: QUERY_KEYS.auth.user(),
    queryFn: async () => {
      try {
        const { data } = await authApi.getMe();
        const currentToken = useAuthStore.getState().token;
        if (currentToken) setUser(data, currentToken);
        return data;
      } catch (error) {
        // Only clear the session on a real auth failure — not network/timeouts.
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          logout();
        }
        throw error;
      }
    },
    enabled: hasHydrated && Boolean(token),
    retry: false,
  });
}
