import { create } from "zustand";

interface UiState {
  isCartOpen: boolean;
  isSidebarOpen: boolean;
  isVendorSidebarOpen: boolean;
  toggleCart: () => void;
  setCartOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleVendorSidebar: () => void;
  setVendorSidebarOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  isCartOpen: false,
  isSidebarOpen: false,
  isVendorSidebarOpen: true,
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
  setCartOpen: (open) => set({ isCartOpen: open }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  toggleVendorSidebar: () =>
    set((state) => ({ isVendorSidebarOpen: !state.isVendorSidebarOpen })),
  setVendorSidebarOpen: (open) => set({ isVendorSidebarOpen: open }),
}));
