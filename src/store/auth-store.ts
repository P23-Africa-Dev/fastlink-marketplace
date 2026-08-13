import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import type { User } from "@/types/user";
import { clearAuthCookies, writeAuthCookies } from "@/lib/auth-session";

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;

  setUser: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setUser: (user, token) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("auth_token", token);
          writeAuthCookies(token, user.role);
        }
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
            writeAuthCookies(state.token, user.role);
          }
          return { user };
        }),
    }),
    {
      name: "marketplace-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
