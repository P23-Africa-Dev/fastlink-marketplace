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
    reviews: (id: string) => [...QUERY_KEYS.products.all, "reviews", id] as const,
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
    customers: () => [...QUERY_KEYS.seller.all, "customers"] as const,
    customer: (id: string) => [...QUERY_KEYS.seller.all, "customers", id] as const,
    store: () => [...QUERY_KEYS.seller.all, "store"] as const,
    settings: () => [...QUERY_KEYS.seller.all, "settings"] as const,
    reviews: () => [...QUERY_KEYS.seller.all, "reviews"] as const,
    payments: () => [...QUERY_KEYS.seller.all, "payments"] as const,
    payouts: () => [...QUERY_KEYS.seller.all, "payouts"] as const,
    payoutAccount: () => [...QUERY_KEYS.seller.all, "payout-account"] as const,
    analytics: (range: string) => [...QUERY_KEYS.seller.all, "analytics", range] as const,
    campaigns: () => [...QUERY_KEYS.seller.all, "campaigns"] as const,
    tickets: () => [...QUERY_KEYS.seller.all, "tickets"] as const,
    ticket: (id: string) => [...QUERY_KEYS.seller.all, "tickets", id] as const,
    returns: (filters: Record<string, unknown> = {}) =>
      [...QUERY_KEYS.seller.all, "returns", filters] as const,
    disputes: (filters: Record<string, unknown> = {}) =>
      [...QUERY_KEYS.seller.all, "disputes", filters] as const,
    inventory: (filters: Record<string, unknown> = {}) =>
      [...QUERY_KEYS.seller.all, "inventory", filters] as const,
    documents: () => [...QUERY_KEYS.seller.all, "documents"] as const,
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
  admin: {
    all: ["admin"] as const,
    overview: () => [...QUERY_KEYS.admin.all, "overview"] as const,
    users: (filters: Record<string, unknown> = {}) => [...QUERY_KEYS.admin.all, "users", filters] as const,
    stores: (filters: Record<string, unknown> = {}) => [...QUERY_KEYS.admin.all, "stores", filters] as const,
    products: (filters: Record<string, unknown> = {}) => [...QUERY_KEYS.admin.all, "products", filters] as const,
    orders: (filters: Record<string, unknown> = {}) => [...QUERY_KEYS.admin.all, "orders", filters] as const,
    payments: (filters: Record<string, unknown> = {}) => [...QUERY_KEYS.admin.all, "payments", filters] as const,
    payouts: (filters: Record<string, unknown> = {}) => [...QUERY_KEYS.admin.all, "payouts", filters] as const,
    malls: () => [...QUERY_KEYS.admin.all, "malls"] as const,
    categories: () => [...QUERY_KEYS.admin.all, "categories"] as const,
    brands: () => [...QUERY_KEYS.admin.all, "brands"] as const,
    commission: () => [...QUERY_KEYS.admin.all, "commission"] as const,
    audit: (filters: Record<string, unknown> = {}) => [...QUERY_KEYS.admin.all, "audit", filters] as const,
    tickets: () => [...QUERY_KEYS.admin.all, "tickets"] as const,
    riders: (filters: Record<string, unknown> = {}) => [...QUERY_KEYS.admin.all, "riders", filters] as const,
    analytics: () => [...QUERY_KEYS.admin.all, "analytics"] as const,
    returns: (filters: Record<string, unknown> = {}) => [...QUERY_KEYS.admin.all, "returns", filters] as const,
    verification: () => [...QUERY_KEYS.admin.all, "verification"] as const,
    mall: (id: string) => [...QUERY_KEYS.admin.all, "malls", id] as const,
    settings: () => [...QUERY_KEYS.admin.all, "settings"] as const,
    ledger: (filters: Record<string, unknown> = {}) => [...QUERY_KEYS.admin.all, "ledger", filters] as const,
    trustReports: (filters: Record<string, unknown> = {}) =>
      [...QUERY_KEYS.admin.all, "trust-reports", filters] as const,
    disputes: (filters: Record<string, unknown> = {}) =>
      [...QUERY_KEYS.admin.all, "disputes", filters] as const,
    moderation: () => [...QUERY_KEYS.admin.all, "moderation"] as const,
    webhooks: (filters: Record<string, unknown> = {}) =>
      [...QUERY_KEYS.admin.all, "webhooks", filters] as const,
    chargebacks: (filters: Record<string, unknown> = {}) =>
      [...QUERY_KEYS.admin.all, "chargebacks", filters] as const,
    deliveryZones: () => [...QUERY_KEYS.admin.all, "delivery-zones"] as const,
  },
  conversations: {
    all: ["conversations"] as const,
    list: () => [...QUERY_KEYS.conversations.all, "list"] as const,
    detail: (id: string) => [...QUERY_KEYS.conversations.all, id] as const,
  },
  wishlist: {
    all: ["wishlist"] as const,
  },
  rider: {
    me: () => ["rider", "me"] as const,
    orders: () => ["rider", "orders"] as const,
  },
  returns: {
    all: ["returns"] as const,
    order: (orderId: string) => [...QUERY_KEYS.returns.all, "order", orderId] as const,
  },
  disputes: {
    all: ["disputes"] as const,
    order: (orderId: string) => [...QUERY_KEYS.disputes.all, "order", orderId] as const,
    list: () => [...QUERY_KEYS.disputes.all, "list"] as const,
  },
  notifications: {
    all: ["notifications"] as const,
    list: (params: Record<string, unknown> = {}) => [...QUERY_KEYS.notifications.all, "list", params] as const,
  },
} as const;
