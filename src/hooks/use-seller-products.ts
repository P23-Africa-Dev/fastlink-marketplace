"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { sellerProductsApi, type SellerProductPayload } from "@/lib/api";
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
