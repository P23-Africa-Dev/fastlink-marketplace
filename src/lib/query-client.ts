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
    order: (id: string) => [...QUERY_KEYS.seller.all, "orders", id] as const,
    products: () => [...QUERY_KEYS.seller.all, "products"] as const,
  },
  orders: {
    all: ["orders"] as const,
    list: () => [...QUERY_KEYS.orders.all, "list"] as const,
    detail: (id: string) => [...QUERY_KEYS.orders.all, id] as const,
    track: (id: string, email?: string) =>
      [...QUERY_KEYS.orders.all, "track", id, email ?? ""] as const,
  },
  addresses: {
    all: ["addresses"] as const,
    list: () => [...QUERY_KEYS.addresses.all, "list"] as const,
  },
  malls: {
    all: ["malls"] as const,
    list: (filters: Record<string, unknown> = {}) => [...QUERY_KEYS.malls.all, "list", filters] as const,
    detail: (slug: string) => [...QUERY_KEYS.malls.all, "detail", slug] as const,
    stores: (slug: string, category?: string) =>
      [...QUERY_KEYS.malls.all, "stores", slug, category ?? "all"] as const,
  },
  categories: {
    all: ["categories"] as const,
  },
  brands: {
    all: ["brands"] as const,
    list: () => [...QUERY_KEYS.brands.all, "list"] as const,
    detail: (slug: string) => [...QUERY_KEYS.brands.all, "detail", slug] as const,
    categories: (slug: string) => [...QUERY_KEYS.brands.all, "categories", slug] as const,
  },
  stores: {
    all: ["stores"] as const,
    detail: (slug: string) => [...QUERY_KEYS.stores.all, "detail", slug] as const,
    products: (slug: string, filters: Record<string, unknown> = {}) =>
      [...QUERY_KEYS.stores.all, "products", slug, filters] as const,
    nationwide: () => [...QUERY_KEYS.stores.all, "nationwide"] as const,
  },
  deals: {
    all: ["deals"] as const,
  },
  vendors: {
    emerging: () => ["vendors", "emerging"] as const,
  },
} as const;
