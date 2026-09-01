"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { returnsApi } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-client";

export function useOrderReturn(orderId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.returns.order(orderId),
    queryFn: () => returnsApi.getForOrder(orderId),
    enabled: Boolean(orderId),
  });
}

export function useRequestReturn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason: string }) =>
      returnsApi.request(orderId, reason),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.returns.order(vars.orderId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders.detail(vars.orderId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.seller.returns() });
    },
  });
}

export function useSellerReturns(filters: { status?: string } = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.seller.returns(filters),
    queryFn: () => returnsApi.sellerList(filters),
  });
}

export function useSellerReturnAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      action,
      note,
    }: {
      id: string;
      action: "approve" | "reject";
      note?: string;
    }) => returnsApi.sellerUpdate(id, action, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.seller.returns() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders.all });
    },
  });
}
