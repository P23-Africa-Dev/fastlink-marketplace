"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { sellerPaymentsApi, sellerPayoutsApi } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-client";

export function useSellerPayments() {
  return useQuery({
    queryKey: QUERY_KEYS.seller.payments(),
    queryFn: () => sellerPaymentsApi.list({ limit: 50 }),
  });
}

export function useSellerPayouts() {
  return useQuery({
    queryKey: QUERY_KEYS.seller.payouts(),
    queryFn: () => sellerPayoutsApi.list({ limit: 50 }),
  });
}

export function usePayoutAccount() {
  return useQuery({
    queryKey: QUERY_KEYS.seller.payoutAccount(),
    queryFn: () => sellerPayoutsApi.account(),
  });
}

export function useRequestPayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (amount: number) => sellerPayoutsApi.request(amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.seller.payouts() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.seller.payments() });
    },
  });
}

export function useSavePayoutAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      bank_name: string;
      bank_account_number: string;
      bank_account_name: string;
    }) => sellerPayoutsApi.saveAccount(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.seller.payoutAccount() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.seller.settings() });
    },
  });
}
