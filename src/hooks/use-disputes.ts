"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { disputesApi } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-client";

export function useOrderDispute(orderId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.disputes.order(orderId),
    queryFn: () => disputesApi.getForOrder(orderId),
    enabled: Boolean(orderId),
  });
}

export function useOpenDispute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      orderId,
      reason,
      type,
      buyer_evidence,
    }: {
      orderId: string;
      reason: string;
      type?: "refund" | "replacement" | "other";
      buyer_evidence?: string;
    }) => disputesApi.open(orderId, { reason, type, buyer_evidence }),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.disputes.order(vars.orderId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.disputes.list() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders.detail(vars.orderId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.seller.disputes() });
    },
  });
}

export function useMyDisputes() {
  return useQuery({
    queryKey: QUERY_KEYS.disputes.list(),
    queryFn: () => disputesApi.list(),
  });
}

export function useSellerDisputes(filters: { status?: string } = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.seller.disputes(filters),
    queryFn: () => disputesApi.sellerList(filters),
  });
}

export function useSellerDisputeRespond() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, response }: { id: string; response: string }) =>
      disputesApi.sellerRespond(id, response),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.seller.disputes() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.disputes.all });
    },
  });
}
