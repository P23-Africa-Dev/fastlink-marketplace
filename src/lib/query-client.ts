import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,        // data stays fresh for 5 minutes
      gcTime: 1000 * 60 * 10,           // cache retained for 10 minutes after unmount
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0,
    },
  },
});

export const QUERY_KEYS = {
  products: {
    all: ["products"] as const,
    lists: () => [...QUERY_KEYS.products.all, "list"] as const,
    list: (filters: Record<string, unknown>) =>
      [...QUERY_KEYS.products.lists(), filters] as const,
    details: () => [...QUERY_KEYS.products.all, "detail"] as const,
    detail: (id: string) => [...QUERY_KEYS.products.details(), id] as const,
    featured: () => [...QUERY_KEYS.products.all, "featured"] as const,
    search: (query: string) => [...QUERY_KEYS.products.all, "search", query] as const,
  },
  cart: {
    all: ["cart"] as const,
  },
  auth: {
    all: ["auth"] as const,
    user: () => [...QUERY_KEYS.auth.all, "user"] as const,
  },
  seller: {
    all: ["seller"] as const,
    dashboard: () => [...QUERY_KEYS.seller.all, "dashboard"] as const,
    orders: () => [...QUERY_KEYS.seller.all, "orders"] as const,
    products: () => [...QUERY_KEYS.seller.all, "products"] as const,
  },
  orders: {
    all: ["orders"] as const,
    list: () => [...QUERY_KEYS.orders.all, "list"] as const,
    detail: (id: string) => [...QUERY_KEYS.orders.all, id] as const,
  },
} as const;
