"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { wishlistApi } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-client";
import { useAuthStore } from "@/store/auth-store";
import { useWishlistStore } from "@/store/wishlist-store";
import type { Product } from "@/types/product";

export function useWishlist() {
  const token = useAuthStore((s) => s.token);
  const localItems = useWishlistStore((s) => s.items);
  const localToggle = useWishlistStore((s) => s.toggleWishlist);
  const localRemove = useWishlistStore((s) => s.removeItem);
  const localClear = useWishlistStore((s) => s.clearWishlist);
  const isLocal = useWishlistStore((s) => s.isInWishlist);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: QUERY_KEYS.wishlist.all,
    queryFn: wishlistApi.list,
    enabled: Boolean(token),
  });

  const add = useMutation({
    mutationFn: wishlistApi.add,
    onSuccess: (products) => queryClient.setQueryData(QUERY_KEYS.wishlist.all, products),
  });
  const remove = useMutation({
    mutationFn: wishlistApi.remove,
    onSuccess: (products) => queryClient.setQueryData(QUERY_KEYS.wishlist.all, products),
  });

  const products: Product[] = token ? (query.data ?? []) : localItems.map((item) => item.product);

  function isInWishlist(productId: string) {
    if (token) return products.some((product) => product.id === productId);
    return isLocal(productId);
  }

  function toggleWishlist(product: Product) {
    if (!token) {
      localToggle(product);
      return;
    }
    if (isInWishlist(product.id)) {
      remove.mutate(product.id);
    } else {
      add.mutate(product.id);
    }
  }

  function removeItem(productId: string) {
    if (!token) {
      localRemove(productId);
      return;
    }
    remove.mutate(productId);
  }

  function clearWishlist() {
    if (!token) {
      localClear();
      return;
    }
    products.forEach((product) => remove.mutate(product.id));
  }

  return {
    products,
    itemCount: products.length,
    isLoading: Boolean(token) && query.isLoading,
    isInWishlist,
    toggleWishlist,
    removeItem,
    clearWishlist,
  };
}

export function useMergeWishlistOnLogin() {
  const token = useAuthStore((s) => s.token);
  const items = useWishlistStore((s) => s.items);
  const clear = useWishlistStore((s) => s.clearWishlist);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!token || items.length === 0) return;
    let cancelled = false;
    const snapshot = [...items];
    (async () => {
      for (const item of snapshot) {
        try {
          await wishlistApi.add(item.productId);
        } catch {
          /* skip missing products */
        }
      }
      if (!cancelled) {
        clear();
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.wishlist.all });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, items, clear, queryClient]);
}
