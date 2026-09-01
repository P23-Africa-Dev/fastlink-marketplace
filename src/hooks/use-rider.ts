"use client";

import { useQuery } from "@tanstack/react-query";

import { riderApi } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-client";

export function useRiderMe() {
  return useQuery({
    queryKey: QUERY_KEYS.rider.me(),
    queryFn: riderApi.me,
  });
}

export function useRiderOrders() {
  return useQuery({
    queryKey: QUERY_KEYS.rider.orders(),
    queryFn: riderApi.orders,
  });
}
