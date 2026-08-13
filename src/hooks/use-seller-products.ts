"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { sellerProductsApi, sellerInventoryApi, type SellerProductPayload } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-client";

export function useSellerProducts() {
  return useQuery({
    queryKey: QUERY_KEYS.seller.products(),
    queryFn: () => sellerProductsApi.getAll(),
  });
}

export function useCreateSellerProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SellerProductPayload) => sellerProductsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.seller.products() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products.all });
    },
  });
}

export function useUpdateSellerProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<SellerProductPayload> }) =>
      sellerProductsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.seller.products() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products.all });
    },
  });
}

export function useDeleteSellerProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => sellerProductsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.seller.products() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products.all });
    },
  });
}

export function useSubmitSellerProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => sellerProductsApi.submitForReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.seller.products() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.moderation() });
    },
  });
}

export function useAdjustSellerStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      ...payload
    }: {
      id: string;
      stock?: number;
      quantity_delta?: number;
      type?: string;
      note?: string;
    }) => sellerProductsApi.adjustStock(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.seller.products() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.seller.inventory() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products.all });
    },
  });
}

export function useSellerInventory(filters: { product_id?: string } = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.seller.inventory(filters),
    queryFn: () => sellerInventoryApi.movements({ ...filters, limit: 40 }),
  });
}
