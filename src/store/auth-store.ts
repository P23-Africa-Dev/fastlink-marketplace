import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import type { User } from "@/types/user";
import { clearAuthCookies, writeAuthCookies } from "@/lib/auth-session";

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;

  setUser: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  setHasHydrated: (value: boolean) => void;
}

function syncSession(token: string, role: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("auth_token", token);
  writeAuthCookies(token, role);
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      hasHydrated: false,

      setUser: (user, token) => {
        syncSession(token, user.role);
        set({ user, token, isAuthenticated: true });
      },

      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth_token");
          clearAuthCookies();
        }
        set({ user: null, token: null, isAuthenticated: false });
      },

      updateUser: (updates) =>
        set((state) => {
          const user = state.user ? { ...state.user, ...updates } : null;
          if (user && state.token) {
            syncSession(state.token, user.role);
          }
          return { user };
        }),

      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "marketplace-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (!error && state?.token && state.user?.role) {
          syncSession(state.token, state.user.role);
        }
      },
    },
  ),
);
