import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import type { Product } from "@/types/product";

interface WishlistItem {
  productId: string;
  product: Product;
  addedAt: string;
}

interface WishlistStore {
  items: WishlistItem[];
  itemCount: number;

  // actions
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    immer((set, get) => ({
      items: [],
      itemCount: 0,

      addItem: (product) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === product.id);
          if (!existing) {
            state.items.push({
              productId: product.id,
              product,
              addedAt: new Date().toISOString(),
            });
            state.itemCount = state.items.length;
          }
        }),

      removeItem: (productId) =>
        set((state) => {
          state.items = state.items.filter((i) => i.productId !== productId);
          state.itemCount = state.items.length;
        }),

      toggleWishlist: (product) =>
        set((state) => {
          const index = state.items.findIndex((i) => i.productId === product.id);
          if (index >= 0) {
            state.items.splice(index, 1);
          } else {
            state.items.push({
              productId: product.id,
              product,
              addedAt: new Date().toISOString(),
            });
          }
          state.itemCount = state.items.length;
        }),

      isInWishlist: (productId) => {
        return get().items.some((i) => i.productId === productId);
      },

      clearWishlist: () =>
        set((state) => {
          state.items = [];
          state.itemCount = 0;
        }),
    })),
    {
      name: "marketplace-wishlist",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.itemCount = state.items.length;
        }
      },
    },
  ),
);
