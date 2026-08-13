"use client";

import { useQuery } from "@tanstack/react-query";

import { dashboardApi } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-client";

export function useDashboardStats() {
  return useQuery({
    queryKey: QUERY_KEYS.seller.dashboard(),
    queryFn: dashboardApi.getStats,
    staleTime: 1000 * 60 * 5,
  });
}

export { useMyOrders } from "@/hooks/use-orders";
