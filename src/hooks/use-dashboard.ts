"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  dashboardApi,
  sellerCustomersApi,
  sellerReviewsApi,
  sellerSettingsApi,
  sellerStoreApi,
} from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-client";

export function useDashboardStats(range = "30d") {
  return useQuery({
    queryKey: [...QUERY_KEYS.seller.dashboard(), range],
    queryFn: () => dashboardApi.getStats(range),
    staleTime: 1000 * 60,
  });
}

export { useMyOrders } from "@/hooks/use-orders";

export function useSellerCustomers(q?: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.seller.customers(), q ?? ""],
    queryFn: () => sellerCustomersApi.list(q),
  });
}

export function useSellerCustomer(id?: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.seller.customers(), "detail", id ?? ""],
    queryFn: () => sellerCustomersApi.get(id!),
    enabled: Boolean(id),
  });
}

export function useSellerStore() {
  return useQuery({
    queryKey: QUERY_KEYS.seller.store(),
    queryFn: sellerStoreApi.get,
    retry: false,
  });
}

export function useUpdateSellerStore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sellerStoreApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.seller.store() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.seller.settings() });
    },
  });
}

export function useSellerSettings() {
  return useQuery({
    queryKey: QUERY_KEYS.seller.settings(),
    queryFn: sellerSettingsApi.get,
  });
}

export function useUpdateSellerSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sellerSettingsApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.seller.settings() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.seller.store() });
    },
  });
}

export function useSellerReviews(params: { status?: string; q?: string } = {}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.seller.reviews(), params],
    queryFn: () => sellerReviewsApi.list(params),
  });
}

export function useReplyToReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: string }) => sellerReviewsApi.reply(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.seller.reviews() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products.all });
    },
  });
}

export function useUpdateReviewStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      sellerReviewsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.seller.reviews() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products.all });
    },
  });
}
