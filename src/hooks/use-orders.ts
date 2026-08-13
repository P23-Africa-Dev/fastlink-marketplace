"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { addressesApi, checkoutApi, ordersApi, sellerOrdersApi } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-client";
import type { AddressPayload } from "@/types/order";

export function useAddresses() {
  return useQuery({
    queryKey: QUERY_KEYS.addresses.list(),
    queryFn: addressesApi.list,
  });
}

export function useCreateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddressPayload) => addressesApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.addresses.all });
    },
  });
}

export function useCheckout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: checkoutApi.place,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.seller.orders() });
    },
  });
}

export function useInitializeCheckout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (groupId: string) => checkoutApi.initialize(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders.all });
    },
  });
}

export function useVerifyCheckout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reference: string) => checkoutApi.verify(reference),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.seller.orders() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products.all });
    },
  });
}

export function useMyOrders() {
  return useQuery({
    queryKey: QUERY_KEYS.orders.list(),
    queryFn: () => ordersApi.getMyOrders(),
  });
}

export function useMyOrder(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.orders.detail(id),
    queryFn: () => ordersApi.getMyOrder(id),
    enabled: Boolean(id),
    retry: false,
  });
}

export function useTrackOrder(id: string, email?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.orders.track(id, email),
    queryFn: () => ordersApi.track(id, email),
    enabled: Boolean(id),
    retry: false,
  });
}

export function useSellerOrders() {
  return useQuery({
    queryKey: QUERY_KEYS.seller.orders(),
    queryFn: () => sellerOrdersApi.list({ limit: 100 }),
  });
}

export function useSellerOrder(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.seller.order(id),
    queryFn: () => sellerOrdersApi.getById(id),
    enabled: Boolean(id),
    retry: false,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      sellerOrdersApi.updateStatus(id, status),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.seller.orders() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.seller.order(variables.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders.all });
    },
  });
}
