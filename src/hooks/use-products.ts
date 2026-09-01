"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { ProductFilter } from "@/types/product";
import { productsApi, reviewsApi } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-client";

export function useProducts(filters: ProductFilter = {}, page = 1, limit = 12) {
  return useQuery({
    queryKey: QUERY_KEYS.products.list({ ...filters, page, limit }),
    queryFn: () => productsApi.getAll(filters, page, limit),
    placeholderData: (prev) => prev,
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.products.detail(id),
    queryFn: () => productsApi.getById(id),
    enabled: Boolean(id),
  });
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: QUERY_KEYS.products.featured(),
    queryFn: productsApi.getFeatured,
    staleTime: 1000 * 60 * 15,
  });
}

export function useProductSearch(query: string) {
  return useQuery({
    queryKey: QUERY_KEYS.products.search(query),
    queryFn: () => productsApi.search(query),
    enabled: query.trim().length >= 2,
    staleTime: 1000 * 60 * 2,
  });
}

export function useSearchSuggest(query: string) {
  return useQuery({
    queryKey: QUERY_KEYS.products.suggest(query),
    queryFn: () => productsApi.suggest(query),
    enabled: query.trim().length >= 2,
    staleTime: 1000 * 30,
  });
}

export function useRecommendations() {
  return useQuery({
    queryKey: QUERY_KEYS.products.recommendations(),
    queryFn: () => productsApi.recommendations(8),
    staleTime: 1000 * 60 * 5,
  });
}

export function useProductReviews(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.products.reviews(id),
    queryFn: () => reviewsApi.listForProduct(id),
    enabled: Boolean(id),
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reviewsApi.create,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products.reviews(variables.product_id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products.detail(variables.product_id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products.all });
    },
  });
}
