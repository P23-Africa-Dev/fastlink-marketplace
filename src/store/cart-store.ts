import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import type { CartItem, Cart } from "@/types/order";
import type { Product } from "@/types/product";

const TAX_RATE = 0.09;
const FREE_SHIPPING_THRESHOLD = 150;
const SHIPPING_COST = 9.99;

function calculateCart(items: CartItem[]): Omit<Cart, "items"> {
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : items.length > 0 ? SHIPPING_COST : 0;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + shipping + tax;
  return { subtotal, shipping, tax, total };
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;

  // derived values
  itemCount: number;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;

  // actions
  addItem: (product: Product, quantity?: number, variants?: CartItem["selectedVariants"]) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    immer((set) => ({
      items: [],
      isOpen: false,
      itemCount: 0,
      subtotal: 0,
      shipping: 0,
      tax: 0,
      total: 0,

      addItem: (product, quantity = 1, variants) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === product.id);
          if (existing) {
            existing.quantity = Math.min(existing.quantity + quantity, product.stock);
          } else {
            state.items.push({ productId: product.id, product, quantity, selectedVariants: variants });
          }
          const totals = calculateCart(state.items);
          state.subtotal = totals.subtotal;
          state.shipping = totals.shipping;
          state.tax = totals.tax;
          state.total = totals.total;
          state.itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);
          state.isOpen = true;
        }),

      removeItem: (productId) =>
        set((state) => {
          state.items = state.items.filter((i) => i.productId !== productId);
          const totals = calculateCart(state.items);
          state.subtotal = totals.subtotal;
          state.shipping = totals.shipping;
          state.tax = totals.tax;
          state.total = totals.total;
          state.itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);
        }),

      updateQuantity: (productId, quantity) =>
        set((state) => {
          const item = state.items.find((i) => i.productId === productId);
          if (!item) return;
          if (quantity <= 0) {
            state.items = state.items.filter((i) => i.productId !== productId);
          } else {
            item.quantity = Math.min(quantity, item.product.stock);
          }
          const totals = calculateCart(state.items);
          state.subtotal = totals.subtotal;
          state.shipping = totals.shipping;
          state.tax = totals.tax;
          state.total = totals.total;
          state.itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);
        }),

      clearCart: () =>
        set((state) => {
          state.items = [];
          state.itemCount = 0;
          state.subtotal = 0;
          state.shipping = 0;
          state.tax = 0;
          state.total = 0;
        }),

      openCart: () => set((state) => { state.isOpen = true; }),
      closeCart: () => set((state) => { state.isOpen = false; }),
      toggleCart: () => set((state) => { state.isOpen = !state.isOpen; }),
    })),
    {
      name: "marketplace-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const totals = calculateCart(state.items);
          state.subtotal = totals.subtotal;
          state.shipping = totals.shipping;
          state.tax = totals.tax;
          state.total = totals.total;
          state.itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);
        }
      },
    },
  ),
);
