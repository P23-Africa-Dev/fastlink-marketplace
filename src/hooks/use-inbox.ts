"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { sellerAnalyticsApi, sellerCampaignsApi, sellerSupportApi } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-client";

export function useSellerTickets() {
  return useQuery({
    queryKey: QUERY_KEYS.seller.tickets(),
    queryFn: sellerSupportApi.list,
  });
}

export function useCreateTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sellerSupportApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.seller.tickets() }),
  });
}

export function useSellerTicket(id: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.seller.ticket(id ?? ""),
    queryFn: () => sellerSupportApi.get(id!),
    enabled: Boolean(id),
  });
}

export function useReplyTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: string }) => sellerSupportApi.reply(id, body),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.seller.tickets() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.seller.ticket(vars.id) });
    },
  });
}

export function useSellerAnalytics(range: string) {
  return useQuery({
    queryKey: QUERY_KEYS.seller.analytics(range),
    queryFn: () => sellerAnalyticsApi.get(range),
  });
}

export function useCampaigns() {
  return useQuery({
    queryKey: QUERY_KEYS.seller.campaigns(),
    queryFn: sellerCampaignsApi.list,
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sellerCampaignsApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.seller.campaigns() }),
  });
}

export function useUpdateCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...payload
    }: { id: string } & Partial<{ name: string; channel: string; spend: number; conversions: number; status: string }>) =>
      sellerCampaignsApi.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.seller.campaigns() }),
  });
}
