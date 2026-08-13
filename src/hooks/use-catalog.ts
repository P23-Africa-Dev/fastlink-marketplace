"use client";

import { useQuery } from "@tanstack/react-query";

import { catalogApi } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-client";
import type { ProductFilter } from "@/types/product";

export function useMalls(params: { q?: string; limit?: number; page?: number } = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.malls.list(params),
    queryFn: () => catalogApi.getMalls(params),
  });
}

export function useMall(slug: string) {
  return useQuery({
    queryKey: QUERY_KEYS.malls.detail(slug),
    queryFn: () => catalogApi.getMall(slug),
    enabled: Boolean(slug),
    retry: false,
  });
}

export function useMallStores(slug: string, category?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.malls.stores(slug, category),
    queryFn: () => catalogApi.getMallStores(slug, category),
    enabled: Boolean(slug),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: QUERY_KEYS.categories.all,
    queryFn: catalogApi.getCategories,
  });
}

export function useBrands() {
  return useQuery({
    queryKey: QUERY_KEYS.brands.list(),
    queryFn: catalogApi.getBrands,
  });
}

export function useBrand(slug: string) {
  return useQuery({
    queryKey: QUERY_KEYS.brands.detail(slug),
    queryFn: () => catalogApi.getBrand(slug),
    enabled: Boolean(slug),
    retry: false,
  });
}

export function useBrandCategories(slug: string) {
  return useQuery({
    queryKey: QUERY_KEYS.brands.categories(slug),
    queryFn: () => catalogApi.getBrandCategories(slug),
    enabled: Boolean(slug),
  });
}

export function useStore(slug: string, enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.stores.detail(slug),
    queryFn: () => catalogApi.getStore(slug),
    enabled: Boolean(slug) && enabled,
    retry: false,
  });
}

export function useStoreProducts(slug: string, filters: ProductFilter = {}, enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.stores.products(slug, { ...filters }),
    queryFn: () => catalogApi.getStoreProducts(slug, filters),
    enabled: Boolean(slug) && enabled,
  });
}

export function useDeals() {
  return useQuery({
    queryKey: QUERY_KEYS.deals.all,
    queryFn: catalogApi.getDeals,
  });
}

export function useEmergingVendors() {
  return useQuery({
    queryKey: QUERY_KEYS.vendors.emerging(),
    queryFn: catalogApi.getEmergingVendors,
  });
}

export function useNationwideStores() {
  return useQuery({
    queryKey: QUERY_KEYS.stores.nationwide(),
    queryFn: catalogApi.getNationwideStores,
  });
}
