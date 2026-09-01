"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { cartApi, loyaltyApi, promoApi, referralsApi, sellerGrowthApi, sellerPromoCodesApi, sellerStaffApi } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-client";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";

export function usePromoPreview() {
  return useMutation({
    mutationFn: promoApi.preview,
  });
}

export function useCartSync() {
  const token = useAuthStore((s) => s.token);
  const items = useCartStore((s) => s.items);
  const couponCode = useCartStore((s) => s.couponCode);

  useEffect(() => {
    if (!token) return;
    const handle = window.setTimeout(() => {
      cartApi
        .sync({
          items: items.map((item) => ({ product_id: item.productId, quantity: item.quantity })),
          coupon_code: couponCode || undefined,
        })
        .catch(() => undefined);
    }, 800);
    return () => window.clearTimeout(handle);
  }, [token, items, couponCode]);
}

export function useMyReferral() {
  return useQuery({
    queryKey: QUERY_KEYS.referrals.me(),
    queryFn: referralsApi.me,
  });
}

export function useMyLoyalty() {
  return useQuery({
    queryKey: QUERY_KEYS.loyalty.me(),
    queryFn: loyaltyApi.me,
  });
}

export function useSellerGrowth() {
  return useQuery({
    queryKey: QUERY_KEYS.seller.growth(),
    queryFn: sellerGrowthApi.insights,
  });
}

export function useSellerPromoCodes() {
  return useQuery({
    queryKey: QUERY_KEYS.seller.promoCodes(),
    queryFn: sellerPromoCodesApi.list,
  });
}

export function useSellerStaff() {
  return useQuery({
    queryKey: QUERY_KEYS.seller.staff(),
    queryFn: sellerStaffApi.list,
  });
}

export function useSellerStaffActions() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.seller.staff() });
  return {
    invite: useMutation({
      mutationFn: sellerStaffApi.invite,
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ id, ...payload }: { id: string; role?: string; status?: string }) =>
        sellerStaffApi.update(id, payload),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: sellerStaffApi.remove,
      onSuccess: invalidate,
    }),
  };
}

export function useSellerPromoCodeActions() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.seller.promoCodes() });
  return {
    create: useMutation({
      mutationFn: sellerPromoCodesApi.create,
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ id, ...payload }: { id: string; is_active?: boolean; value?: number }) =>
        sellerPromoCodesApi.update(id, payload),
      onSuccess: invalidate,
    }),
  };
}
