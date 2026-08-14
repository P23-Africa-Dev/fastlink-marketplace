import axios from "axios";

import type { PaginatedResponse, ApiResponse } from "@/types/api";
import type { Dispute } from "@/types/disputes";
import type { ProductFilter, Product } from "@/types/product";
import type { DashboardStats, ProductReview, SellerCustomer, SellerSettings, SellerStoreProfile } from "@/types/seller";
import type { Address, User } from "@/types/user";
import type { AddressPayload, ApiOrder, CheckoutQuote, CheckoutResult } from "@/types/order";
import type {
  ApiPayment,
  ApiPayout,
  CheckoutInitializeResult,
  PaymentListResult,
  PayoutAccount,
  PayoutListResult,
} from "@/types/payment";
import type {
  AdminAuditLog,
  AdminBrand,
  AdminCategory,
  AdminMall,
  AdminMallDetail,
  AdminOverview,
  AdminStoreRow,
  AdminTrustReportsResponse,
  AdminUserRow,
  AdminVerificationQueue,
  AdminWebhooksResponse,
  AdminChargebacksResponse,
  ChargebackRow,
  AdminDisputesResponse,
  DisputeRow,
  LedgerEntryRow,
  MarketplaceConfig,
  TrustReportRow,
  DeliveryZoneRow,
  KycDocumentRow,
  InventoryMovementRow,
} from "@/types/admin";
import type {
  ApiCampaign,
  ApiConversation,
  ApiRider,
  ApiSupportTicket,
  SellerAnalytics,
} from "@/types/inbox";
import type { NotificationListResult } from "@/types/notifications";
import type { ApiReturnRequest } from "@/types/returns";
import type { GrowthInsight, LoyaltySummary, PromoCodeRow, PromoPreview, ReferralSummary, SearchSuggestResult, StoreTeam, StoreStaffMember } from "@/types/growth";
import type {
  BrandPartner,
  DealProduct,
  EmergingVendor,
  Mall,
  NationwideBrand,
  ShopCategoryItem,
  LocalStoreItem,
} from "@/mocks/stores-data";
import { clearAuthCookies, isLoginRequiredPath } from "@/lib/auth-session";

// ---------------------------------------------------------------------------
// Axios instance — swap baseURL for your real API when ready
// ---------------------------------------------------------------------------
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "/api",
  headers: { "Content-Type": "application/json" },
  // Remote Supabase + php artisan serve can exceed 10s under parallel homepage load.
  timeout: 30_000,
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    const url = String(error.config?.url ?? "");
    const isPublicAuth = /\/auth\/(login|register|forgot-password|reset-password)/.test(url);

    // Stale/missing tokens must not bounce shoppers off the homepage.
    // Only force login on seller dashboard / admin routes.
    if (status === 401 && !isPublicAuth && typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("marketplace-auth");
      clearAuthCookies();
      const pathname = window.location.pathname;
      if (isLoginRequiredPath(pathname) && !pathname.startsWith("/login")) {
        const next = `${pathname}${window.location.search}`;
        window.location.href = `/login?next=${encodeURIComponent(next)}`;
      }
    }
    return Promise.reject(error);
  },
);

export function apiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string" && message.trim()) return message;
    const errors = error.response?.data?.errors;
    if (errors && typeof errors === "object") {
      const first = Object.values(errors).flat()[0];
      if (typeof first === "string") return first;
    }
  }
  return fallback;
}

// ---------------------------------------------------------------------------
// Mock API functions — replace with real axios calls when your API is ready
// ---------------------------------------------------------------------------

function compactParams(params: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== "" && value !== false),
  );
}

export type SellerProductPayload = {
  name: string;
  sku?: string;
  description?: string;
  price: number;
  compare_at_price?: number | null;
  cost_price?: number | null;
  stock?: number;
  status?: "draft" | "active" | "archived";
  category?: string;
  brand?: string;
  subcategory?: string;
  tags?: string[];
  image_urls?: string[];
  is_featured?: boolean;
};

export const productsApi = {
  getAll: async (
    filters: ProductFilter = {},
    page = 1,
    limit = 12,
  ): Promise<PaginatedResponse<Product>> => {
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<Product>>>("/products", {
      params: compactParams({
        page,
        limit,
        category: filters.category,
        store: filters.store,
        brand: filters.brand,
        q: filters.q,
        featured: filters.featured ? 1 : undefined,
        min_price: filters.minPrice,
        max_price: filters.maxPrice,
        in_stock: filters.inStock ? 1 : undefined,
        sort: filters.sortBy,
      }),
    });
    return data.data;
  },

  getById: async (id: string): Promise<ApiResponse<Product>> => {
    const { data } = await apiClient.get<ApiResponse<Product>>(`/products/${id}`);
    return data;
  },

  getFeatured: async (): Promise<ApiResponse<Product[]>> => {
    const result = await productsApi.getAll({ featured: true }, 1, 24);
    return { data: result.data, success: true };
  },

  search: async (query: string): Promise<ApiResponse<Product[]>> => {
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<Product>>>("/search", {
      params: { q: query, limit: 24 },
    });
    return { data: data.data.data, success: data.success };
  },

  suggest: async (query: string) => {
    const { data } = await apiClient.get<ApiResponse<SearchSuggestResult>>("/search/suggest", {
      params: { q: query },
    });
    return data.data;
  },

  recommendations: async (limit = 8) => {
    const { data } = await apiClient.get<ApiResponse<{ forYou: Product[]; recentlyViewed: Product[] }>>(
      "/recommendations",
      { params: { limit } },
    );
    return data.data;
  },
};

export const catalogApi = {
  getMalls: async (params: { q?: string; city?: string; page?: number; limit?: number } = {}) => {
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<Mall>>>("/malls", {
      params: compactParams(params),
    });
    return data.data;
  },

  getMall: async (slug: string) => {
    const { data } = await apiClient.get<ApiResponse<Mall>>(`/malls/${slug}`);
    return data;
  },

  getMallStores: async (slug: string, category?: string) => {
    const { data } = await apiClient.get<ApiResponse<LocalStoreItem[]>>(`/malls/${slug}/stores`, {
      params: compactParams({ category: category && category !== "all" ? category : undefined }),
    });
    return data;
  },

  getStore: async (slug: string) => {
    const { data } = await apiClient.get<ApiResponse<LocalStoreItem>>(`/stores/${slug}`);
    return data;
  },

  getStoreProducts: async (slug: string, filters: ProductFilter = {}, page = 1, limit = 24) => {
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<Product>>>(
      `/stores/${slug}/products`,
      {
        params: compactParams({
          page,
          limit,
          category: filters.category,
        }),
      },
    );
    return data.data;
  },

  getCategories: async () => {
    const { data } = await apiClient.get<ApiResponse<ShopCategoryItem[]>>("/categories");
    return data;
  },

  getBrands: async () => {
    const { data } = await apiClient.get<ApiResponse<BrandPartner[]>>("/brands");
    return data;
  },

  getBrand: async (slug: string) => {
    const { data } = await apiClient.get<ApiResponse<BrandPartner>>(`/brands/${slug}`);
    return data;
  },

  getBrandCategories: async (slug: string) => {
    const { data } = await apiClient.get<ApiResponse<ShopCategoryItem[]>>(`/brands/${slug}/categories`);
    return data;
  },

  getDeals: async () => {
    const { data } = await apiClient.get<ApiResponse<DealProduct[]>>("/deals");
    return data;
  },

  getEmergingVendors: async () => {
    const { data } = await apiClient.get<ApiResponse<EmergingVendor[]>>("/vendors/emerging");
    return data;
  },

  getNationwideStores: async () => {
    const { data } = await apiClient.get<ApiResponse<NationwideBrand[]>>("/stores/nationwide");
    return data;
  },
};

export const sellerProductsApi = {
  getAll: async (page = 1, limit = 100) => {
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<Product>>>("/seller/products", {
      params: { page, limit },
    });
    return data.data;
  },

  create: async (payload: SellerProductPayload) => {
    const { data } = await apiClient.post<ApiResponse<Product>>("/seller/products", payload);
    return data;
  },

  update: async (id: string, payload: Partial<SellerProductPayload>) => {
    const { data } = await apiClient.patch<ApiResponse<Product>>(`/seller/products/${id}`, payload);
    return data;
  },

  remove: async (id: string) => {
    const { data } = await apiClient.delete<ApiResponse<null>>(`/seller/products/${id}`);
    return data;
  },

  submitForReview: async (id: string) => {
    const { data } = await apiClient.post<ApiResponse<Product>>(`/seller/products/${id}/submit`);
    return data.data;
  },

  adjustStock: async (
    id: string,
    payload: { stock?: number; quantity_delta?: number; type?: string; note?: string },
  ) => {
    const { data } = await apiClient.patch<ApiResponse<Product>>(`/seller/products/${id}/stock`, payload);
    return data.data;
  },
};

export const authApi = {
  login: async (email: string, password: string) => {
    const { data } = await apiClient.post<ApiResponse<{ user: User; token: string }>>(
      "/auth/login",
      { email, password },
    );
    return data;
  },

  register: async (
    name: string,
    email: string,
    password: string,
    options?: { passwordConfirmation?: string; role?: "buyer" | "seller"; referralCode?: string },
  ) => {
    const { data } = await apiClient.post<ApiResponse<{ user: User; token: string }>>(
      "/auth/register",
      {
        name,
        email,
        password,
        password_confirmation: options?.passwordConfirmation ?? password,
        role: options?.role ?? "buyer",
        referral_code: options?.referralCode || undefined,
      },
    );
    return data;
  },

  logout: async () => {
    const { data } = await apiClient.post<ApiResponse<null>>("/auth/logout");
    return data;
  },

  getMe: async () => {
    const { data } = await apiClient.get<ApiResponse<User>>("/auth/me");
    return data;
  },

  updateProfile: async (payload: { name?: string; phone?: string; avatar?: string }) => {
    const { data } = await apiClient.patch<ApiResponse<User>>("/auth/profile", payload);
    return data;
  },

  forgotPassword: async (email: string) => {
    const { data } = await apiClient.post<ApiResponse<null>>("/auth/forgot-password", { email });
    return data;
  },

  resetPassword: async (payload: {
    email: string;
    token: string;
    password: string;
    passwordConfirmation: string;
  }) => {
    const { data } = await apiClient.post<ApiResponse<null>>("/auth/reset-password", {
      email: payload.email,
      token: payload.token,
      password: payload.password,
      password_confirmation: payload.passwordConfirmation,
    });
    return data;
  },
};

export const sellerApi = {
  onboard: async (payload: {
    business_name: string;
    phone: string;
    bank_name: string;
    bank_account_number: string;
    bank_account_name: string;
    type?: "mall_store" | "independent" | "nationwide" | "emerging";
    mall_id?: number;
    category_id?: number;
    location?: string;
    description?: string;
  }) => {
    const { data } = await apiClient.post<
      ApiResponse<{
        store: { id: string; name: string; slug: string; status: string };
        user: { id: string; role: string };
      }>
    >("/seller/onboard", payload);
    return data;
  },
};

export const sellerDocumentsApi = {
  list: async () => {
    const { data } = await apiClient.get<ApiResponse<KycDocumentRow[]>>("/seller/documents");
    return data.data;
  },

  upload: async (type: string, file: File) => {
    const form = new FormData();
    form.append("type", type);
    form.append("document", file);
    const { data } = await apiClient.post<ApiResponse<KycDocumentRow>>("/seller/documents", form);
    return data.data;
  },
};

export const sellerInventoryApi = {
  movements: async (params: { product_id?: string; page?: number; limit?: number } = {}) => {
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<InventoryMovementRow>>>(
      "/seller/inventory/movements",
      { params: compactParams(params) },
    );
    return data.data;
  },
};

export const dashboardApi = {
  getStats: async (range = "30d"): Promise<ApiResponse<DashboardStats>> => {
    const { data } = await apiClient.get<ApiResponse<DashboardStats>>("/seller/dashboard", {
      params: { range },
    });
    return data;
  },
};

export const sellerStoreApi = {
  get: async () => {
    const { data } = await apiClient.get<ApiResponse<SellerStoreProfile>>("/seller/store");
    return data;
  },
  update: async (payload: Partial<{
    name: string;
    description: string;
    logo: string;
    location: string;
    headline: string;
    delivery_tag: string;
    phone: string;
  }>) => {
    const { data } = await apiClient.patch<ApiResponse<SellerStoreProfile>>("/seller/store", payload);
    return data;
  },
};

export const sellerSettingsApi = {
  get: async () => {
    const { data } = await apiClient.get<ApiResponse<SellerSettings>>("/seller/settings");
    return data;
  },
  update: async (payload: {
    bank_name?: string;
    bank_account_number?: string;
    bank_account_name?: string;
    notifications?: Record<string, { email: boolean; push: boolean }>;
  }) => {
    const { data } = await apiClient.patch<ApiResponse<SellerSettings>>("/seller/settings", payload);
    return data;
  },
};

export const sellerCustomersApi = {
  list: async (q?: string) => {
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<SellerCustomer>>>("/seller/customers", {
      params: compactParams({ q, limit: 100 }),
    });
    return data.data;
  },
};

export const reviewsApi = {
  listForProduct: async (id: string) => {
    const { data } = await apiClient.get<ApiResponse<ProductReview[]>>(`/products/${id}/reviews`);
    return data;
  },
  create: async (payload: { product_id: string; rating: number; body?: string; order_item_id?: number }) => {
    const { data } = await apiClient.post<ApiResponse<ProductReview>>("/reviews", payload);
    return data;
  },
};

export const sellerReviewsApi = {
  list: async (params: { status?: string; q?: string } = {}) => {
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<ProductReview>>>("/seller/reviews", {
      params: compactParams({ ...params, limit: 100 }),
    });
    return data.data;
  },
  reply: async (id: string, body: string) => {
    const { data } = await apiClient.post<ApiResponse<ProductReview>>(`/seller/reviews/${id}/reply`, { body });
    return data;
  },
  updateStatus: async (id: string, status: string) => {
    const { data } = await apiClient.patch<ApiResponse<ProductReview>>(`/seller/reviews/${id}`, { status });
    return data;
  },
};

export const addressesApi = {
  list: async () => {
    const { data } = await apiClient.get<ApiResponse<Address[]>>("/addresses");
    return data;
  },

  create: async (payload: AddressPayload) => {
    const { data } = await apiClient.post<ApiResponse<Address>>("/addresses", {
      label: payload.label,
      street: payload.street,
      city: payload.city,
      state: payload.state,
      postal_code: payload.postalCode,
      country: payload.country,
      phone: payload.phone,
      is_default: payload.isDefault,
    });
    return data;
  },
};

export const checkoutApi = {
  place: async (payload: {
    address_id: number;
    delivery_method?: string;
    payment_method?: string;
    coupon_code?: string;
    redeem_points?: number;
    items: Array<{ product_id: string; quantity: number; variants?: Record<string, unknown> }>;
  }) => {
    const { data } = await apiClient.post<ApiResponse<CheckoutResult>>("/checkout", payload);
    return data;
  },

  confirm: async (groupId: string) => {
    const { data } = await apiClient.post<ApiResponse<CheckoutResult>>("/checkout/confirm", {
      group_id: groupId,
    });
    return data;
  },

  initialize: async (groupId: string) => {
    const { data } = await apiClient.post<ApiResponse<CheckoutInitializeResult>>("/checkout/initialize", {
      group_id: groupId,
    });
    return data;
  },

  verify: async (reference: string) => {
    const { data } = await apiClient.post<ApiResponse<CheckoutResult>>("/checkout/verify", {
      reference,
    });
    return data;
  },

  quote: async (payload: {
    address_id: number;
    coupon_code?: string;
    redeem_points?: number;
    items: Array<{ product_id: string; quantity: number; variants?: Record<string, unknown> }>;
  }) => {
    const { data } = await apiClient.post<ApiResponse<CheckoutQuote>>("/checkout/quote", payload);
    return data.data;
  },
};

export const promoApi = {
  preview: async (payload: {
    coupon_code: string;
    items: Array<{ product_id: string; quantity: number }>;
  }) => {
    const { data } = await apiClient.post<ApiResponse<PromoPreview>>("/promo/preview", payload);
    return data.data;
  },
};

export const cartApi = {
  sync: async (payload: {
    items: Array<{ product_id: string; quantity: number }>;
    coupon_code?: string;
  }) => {
    const { data } = await apiClient.post<ApiResponse<{ itemCount: number; couponCode: string | null }>>(
      "/cart/sync",
      payload,
    );
    return data.data;
  },
};

export const referralsApi = {
  me: async () => {
    const { data } = await apiClient.get<ApiResponse<ReferralSummary>>("/referrals/me");
    return data.data;
  },
};

export const loyaltyApi = {
  me: async () => {
    const { data } = await apiClient.get<ApiResponse<LoyaltySummary>>("/loyalty/me");
    return data.data;
  },
};

export const ordersApi = {
  getMyOrders: async (page = 1, limit = 50) => {
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<ApiOrder>>>("/orders", {
      params: { page, limit },
    });
    return data.data;
  },

  getMyOrder: async (id: string) => {
    const { data } = await apiClient.get<ApiResponse<ApiOrder>>(`/orders/${id}`);
    return data;
  },

  track: async (id: string, email?: string) => {
    const { data } = await apiClient.get<ApiResponse<ApiOrder>>(`/orders/${id}/track`, {
      params: compactParams({ email }),
    });
    return data;
  },

  invoice: async (id: string) => {
    const { data } = await apiClient.get<ApiResponse<{ reference: string; html: string }>>(`/orders/${id}/invoice`);
    return data.data;
  },
};

export const trustApi = {
  report: async (payload: {
    subject_type: "product" | "store";
    subject_id: number;
    reason: string;
    details?: string;
  }) => {
    const { data } = await apiClient.post<ApiResponse<TrustReportRow>>("/trust-reports", payload);
    return data;
  },
};

export const sellerOrdersApi = {
  list: async (params: { q?: string; status?: string; page?: number; limit?: number } = {}) => {
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<ApiOrder>>>("/seller/orders", {
      params: compactParams(params),
    });
    return data.data;
  },

  getById: async (id: string) => {
    const { data } = await apiClient.get<ApiResponse<ApiOrder>>(`/seller/orders/${id}`);
    return data;
  },

  updateStatus: async (id: string, status: string) => {
    const { data } = await apiClient.patch<ApiResponse<ApiOrder>>(`/seller/orders/${id}/status`, {
      status,
    });
    return data;
  },
};

export const sellerPaymentsApi = {
  list: async (params: { q?: string; status?: string; page?: number; limit?: number } = {}) => {
    const { data } = await apiClient.get<ApiResponse<PaymentListResult>>("/seller/payments", {
      params: compactParams(params),
    });
    return data.data;
  },
};

export const sellerPayoutsApi = {
  list: async (params: { status?: string; page?: number; limit?: number } = {}) => {
    const { data } = await apiClient.get<ApiResponse<PayoutListResult>>("/seller/payouts", {
      params: compactParams(params),
    });
    return data.data;
  },

  request: async (amount: number) => {
    const { data } = await apiClient.post<ApiResponse<ApiPayout>>("/seller/payouts", { amount });
    return data;
  },

  account: async () => {
    const { data } = await apiClient.get<ApiResponse<PayoutAccount>>("/seller/payout-accounts");
    return data;
  },

  saveAccount: async (payload: {
    bank_name: string;
    bank_account_number: string;
    bank_account_name: string;
  }) => {
    const { data } = await apiClient.post<ApiResponse<PayoutAccount>>("/seller/payout-accounts", payload);
    return data;
  },
};

export const adminApi = {
  overview: async () => {
    const { data } = await apiClient.get<ApiResponse<AdminOverview>>("/admin/dashboard");
    return data.data;
  },

  users: async (params: { q?: string; role?: string; status?: string; page?: number; limit?: number } = {}) => {
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<AdminUserRow>>>("/admin/users", {
      params: compactParams(params),
    });
    return data.data;
  },

  updateUser: async (id: string, payload: { status?: string }) => {
    const { data } = await apiClient.patch<ApiResponse<AdminUserRow>>(`/admin/users/${id}`, payload);
    return data;
  },

  stores: async (params: { q?: string; status?: string; page?: number; limit?: number } = {}) => {
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<AdminStoreRow>>>("/admin/stores", {
      params: compactParams(params),
    });
    return data.data;
  },

  store: async (id: string) => {
    const { data } = await apiClient.get<ApiResponse<AdminStoreRow>>(`/admin/stores/${id}`);
    return data;
  },

  verification: async () => {
    const { data } = await apiClient.get<ApiResponse<AdminVerificationQueue>>("/admin/verification");
    return data.data;
  },

  approveStore: async (id: string, mallId?: string) => {
    const { data } = await apiClient.post<ApiResponse<AdminStoreRow>>(`/admin/stores/${id}/approve`, {
      mall_id: mallId ? Number(mallId) : undefined,
    });
    return data;
  },

  rejectStore: async (id: string, reason?: string) => {
    const { data } = await apiClient.post<ApiResponse<AdminStoreRow>>(`/admin/stores/${id}/reject`, { reason });
    return data;
  },

  suspendStore: async (id: string) => {
    const { data } = await apiClient.post<ApiResponse<AdminStoreRow>>(`/admin/stores/${id}/suspend`);
    return data;
  },

  products: async (params: { q?: string; status?: string; page?: number; limit?: number } = {}) => {
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<Product>>>("/admin/products", {
      params: compactParams(params),
    });
    return data.data;
  },

  unpublishProduct: async (id: string) => {
    const { data } = await apiClient.patch<ApiResponse<Product>>(`/admin/products/${id}/unpublish`);
    return data;
  },

  orders: async (params: { q?: string; status?: string; page?: number; limit?: number } = {}) => {
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<ApiOrder>>>("/admin/orders", {
      params: compactParams(params),
    });
    return data.data;
  },

  payments: async (params: { q?: string; status?: string; page?: number; limit?: number } = {}) => {
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<ApiPayment>>>("/admin/payments", {
      params: compactParams(params),
    });
    return data.data;
  },

  payouts: async (params: { status?: string; page?: number; limit?: number } = {}) => {
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<ApiPayout>>>("/admin/payouts", {
      params: compactParams(params),
    });
    return data.data;
  },

  approvePayout: async (id: string) => {
    const { data } = await apiClient.post<ApiResponse<ApiPayout>>(`/admin/payouts/${id}/approve`);
    return data;
  },

  rejectPayout: async (id: string, reason?: string) => {
    const { data } = await apiClient.post<ApiResponse<ApiPayout>>(`/admin/payouts/${id}/reject`, { reason });
    return data;
  },

  commission: async () => {
    const { data } = await apiClient.get<ApiResponse<{ rate: number }>>("/admin/settings/commission");
    return data.data;
  },

  updateCommission: async (rate: number) => {
    const { data } = await apiClient.patch<ApiResponse<{ rate: number }>>("/admin/settings/commission", { rate });
    return data;
  },

  settings: async () => {
    const { data } = await apiClient.get<ApiResponse<MarketplaceConfig>>("/admin/settings");
    return data.data;
  },

  updateSettings: async (payload: Partial<MarketplaceConfig>) => {
    const { data } = await apiClient.patch<ApiResponse<MarketplaceConfig>>("/admin/settings", payload);
    return data.data;
  },

  ledger: async (params: { type?: string; store_id?: string; page?: number; limit?: number } = {}) => {
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<LedgerEntryRow>>>("/admin/ledger", {
      params: compactParams(params),
    });
    return data.data;
  },

  trustReports: async (params: { status?: string; page?: number; limit?: number } = {}) => {
    const { data } = await apiClient.get<ApiResponse<AdminTrustReportsResponse>>("/admin/trust-reports", {
      params: compactParams(params),
    });
    return data.data;
  },

  updateTrustReport: async (id: string, payload: { status: string; admin_note?: string }) => {
    const { data } = await apiClient.patch<ApiResponse<TrustReportRow>>(`/admin/trust-reports/${id}`, payload);
    return data.data;
  },

  disputes: async (params: { status?: string; page?: number; limit?: number } = {}) => {
    const { data } = await apiClient.get<ApiResponse<AdminDisputesResponse>>("/admin/disputes", {
      params: compactParams(params),
    });
    return data.data;
  },

  updateDispute: async (
    id: string,
    payload: { action: "review" | "resolve"; resolution?: string; admin_note?: string; refund_amount?: number },
  ) => {
    const { data } = await apiClient.patch<ApiResponse<DisputeRow>>(`/admin/disputes/${id}`, payload);
    return data.data;
  },

  moderationQueue: async () => {
    const { data } = await apiClient.get<
      ApiResponse<{ data: Product[]; total: number; pendingCount: number }>
    >("/admin/products/moderation");
    return data.data;
  },

  approveProduct: async (id: string) => {
    const { data } = await apiClient.post<ApiResponse<Product>>(`/admin/products/${id}/approve`);
    return data.data;
  },

  rejectProduct: async (id: string, note?: string) => {
    const { data } = await apiClient.post<ApiResponse<Product>>(`/admin/products/${id}/reject`, { note });
    return data.data;
  },

  webhooks: async (params: { status?: string; page?: number; limit?: number } = {}) => {
    const { data } = await apiClient.get<ApiResponse<AdminWebhooksResponse>>("/admin/webhooks/paystack", {
      params: compactParams(params),
    });
    return data.data;
  },

  chargebacks: async (params: { status?: string; page?: number; limit?: number } = {}) => {
    const { data } = await apiClient.get<ApiResponse<AdminChargebacksResponse>>("/admin/chargebacks", {
      params: compactParams(params),
    });
    return data.data;
  },

  recordChargeback: async (payload: {
    payment_id: number;
    amount: number;
    reason: string;
    provider_reference?: string;
  }) => {
    const { data } = await apiClient.post<ApiResponse<ChargebackRow>>("/admin/chargebacks", payload);
    return data.data;
  },

  updateChargeback: async (id: string, payload: { status: "won" | "lost"; admin_note?: string }) => {
    const { data } = await apiClient.patch<ApiResponse<ChargebackRow>>(`/admin/chargebacks/${id}`, payload);
    return data.data;
  },

  deliveryZones: async () => {
    const { data } = await apiClient.get<ApiResponse<DeliveryZoneRow[]>>("/admin/delivery-zones");
    return data.data;
  },

  createDeliveryZone: async (payload: {
    name: string;
    state?: string;
    city?: string;
    fee: number;
    free_above?: number | null;
    is_active?: boolean;
    sort_order?: number;
  }) => {
    const { data } = await apiClient.post<ApiResponse<{ id: string }>>("/admin/delivery-zones", payload);
    return data.data;
  },

  promoCodes: async () => {
    const { data } = await apiClient.get<ApiResponse<PromoCodeRow[]>>("/admin/promo-codes");
    return data.data;
  },

  createPromoCode: async (payload: {
    code: string;
    type: "percent" | "fixed";
    value: number;
    min_subtotal?: number;
    max_discount?: number | null;
    usage_limit?: number | null;
    per_user_limit?: number;
    store_id?: number | null;
    ends_at?: string | null;
  }) => {
    const { data } = await apiClient.post<ApiResponse<PromoCodeRow>>("/admin/promo-codes", payload);
    return data.data;
  },

  updatePromoCode: async (id: string, payload: Partial<{ is_active: boolean; value: number; ends_at: string | null }>) => {
    const { data } = await apiClient.patch<ApiResponse<PromoCodeRow>>(`/admin/promo-codes/${id}`, payload);
    return data.data;
  },

  updateDeliveryZone: async (
    id: string,
    payload: Partial<{
      name: string;
      state: string | null;
      city: string | null;
      fee: number;
      free_above: number | null;
      is_active: boolean;
      sort_order: number;
    }>,
  ) => {
    const { data } = await apiClient.patch<ApiResponse<null>>(`/admin/delivery-zones/${id}`, payload);
    return data;
  },

  malls: async () => {
    const { data } = await apiClient.get<ApiResponse<AdminMall[]>>("/admin/malls");
    return data.data;
  },

  mall: async (id: string) => {
    const { data } = await apiClient.get<ApiResponse<AdminMallDetail>>(`/admin/malls/${id}`);
    return data.data;
  },

  createMall: async (payload: { name: string; city?: string; location?: string; image?: string }) => {
    const { data } = await apiClient.post<ApiResponse<AdminMall>>("/admin/malls", payload);
    return data;
  },

  updateMall: async (id: string, payload: { name?: string; city?: string; location?: string }) => {
    const { data } = await apiClient.patch<ApiResponse<AdminMall>>(`/admin/malls/${id}`, payload);
    return data;
  },

  deleteMall: async (id: string) => {
    const { data } = await apiClient.delete<ApiResponse<null>>(`/admin/malls/${id}`);
    return data;
  },

  categories: async () => {
    const { data } = await apiClient.get<ApiResponse<AdminCategory[]>>("/admin/categories");
    return data.data;
  },

  createCategory: async (payload: { name: string }) => {
    const { data } = await apiClient.post<ApiResponse<AdminCategory>>("/admin/categories", payload);
    return data;
  },

  updateCategory: async (id: string, payload: { name?: string }) => {
    const { data } = await apiClient.patch<ApiResponse<AdminCategory>>(`/admin/categories/${id}`, payload);
    return data;
  },

  deleteCategory: async (id: string) => {
    const { data } = await apiClient.delete<ApiResponse<null>>(`/admin/categories/${id}`);
    return data;
  },

  brands: async () => {
    const { data } = await apiClient.get<ApiResponse<AdminBrand[]>>("/admin/brands");
    return data.data;
  },

  createBrand: async (payload: { name: string; product_brand?: string }) => {
    const { data } = await apiClient.post<ApiResponse<AdminBrand>>("/admin/brands", payload);
    return data;
  },

  updateBrand: async (id: string, payload: { name?: string; product_brand?: string }) => {
    const { data } = await apiClient.patch<ApiResponse<AdminBrand>>(`/admin/brands/${id}`, payload);
    return data;
  },

  deleteBrand: async (id: string) => {
    const { data } = await apiClient.delete<ApiResponse<null>>(`/admin/brands/${id}`);
    return data;
  },

  auditLogs: async (params: { q?: string; action?: string; page?: number; limit?: number } = {}) => {
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<AdminAuditLog>>>("/admin/audit-logs", {
      params: compactParams(params),
    });
    return data.data;
  },

  tickets: async (params: { q?: string; status?: string; page?: number; limit?: number } = {}) => {
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<ApiSupportTicket>>>("/admin/support/tickets", {
      params: compactParams(params),
    });
    return data.data;
  },

  ticket: async (id: string) => {
    const { data } = await apiClient.get<ApiResponse<ApiSupportTicket>>(`/admin/support/tickets/${id}`);
    return data;
  },

  replyTicket: async (id: string, body: string) => {
    const { data } = await apiClient.post<ApiResponse<ApiSupportTicket>>(`/admin/support/tickets/${id}/messages`, { body });
    return data;
  },

  updateTicket: async (id: string, payload: { status?: string }) => {
    const { data } = await apiClient.patch<ApiResponse<ApiSupportTicket>>(`/admin/support/tickets/${id}`, payload);
    return data;
  },

  riders: async (params: { status?: string; page?: number; limit?: number } = {}) => {
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<ApiRider>>>("/admin/riders", {
      params: compactParams(params),
    });
    return data.data;
  },

  approveRider: async (id: string) => {
    const { data } = await apiClient.post<ApiResponse<ApiRider>>(`/admin/riders/${id}/approve`);
    return data;
  },

  rejectRider: async (id: string, reason?: string) => {
    const { data } = await apiClient.post<ApiResponse<ApiRider>>(`/admin/riders/${id}/reject`, { reason });
    return data;
  },

  assignRider: async (orderId: string, riderId: string) => {
    const { data } = await apiClient.patch<ApiResponse<ApiOrder>>(`/admin/orders/${orderId}/assign-rider`, {
      rider_id: Number(riderId),
    });
    return data;
  },

  analytics: async () => {
    const { data } = await apiClient.get<ApiResponse<{
      gmv: number;
      take: number;
      takeRate: number;
      orders: number;
      buyers: number;
      sellers: number;
      growth30d: number;
      chart: Array<{ name: string; gmv: number }>;
    }>>("/admin/analytics");
    return data.data;
  },

  returns: async (params: { status?: string; page?: number; limit?: number } = {}) => {
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<ApiReturnRequest>>>("/admin/returns", {
      params: compactParams(params),
    });
    return data.data;
  },

  updateReturn: async (id: string, action: "approve" | "reject", note?: string) => {
    const { data } = await apiClient.patch<ApiResponse<ApiReturnRequest>>(`/admin/returns/${id}`, {
      action,
      note,
    });
    return data;
  },
};

export const conversationsApi = {
  list: async (params: { q?: string; status?: string; page?: number; limit?: number } = {}) => {
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<ApiConversation>>>("/conversations", {
      params: compactParams(params),
    });
    return data.data;
  },

  get: async (id: string) => {
    const { data } = await apiClient.get<ApiResponse<ApiConversation>>(`/conversations/${id}`);
    return data;
  },

  start: async (payload: { store_id: string | number; product_id?: string; order_id?: number; body: string }) => {
    const { data } = await apiClient.post<ApiResponse<ApiConversation>>("/conversations", payload);
    return data;
  },

  reply: async (id: string, body: string) => {
    const { data } = await apiClient.post<ApiResponse<ApiConversation>>(`/conversations/${id}/messages`, { body });
    return data;
  },

  read: async (id: string) => {
    const { data } = await apiClient.patch<ApiResponse<ApiConversation>>(`/conversations/${id}/read`);
    return data;
  },

  update: async (id: string, status: string) => {
    const { data } = await apiClient.patch<ApiResponse<ApiConversation>>(`/conversations/${id}`, { status });
    return data;
  },

  remove: async (id: string) => {
    const { data } = await apiClient.delete<ApiResponse<null>>(`/conversations/${id}`);
    return data;
  },
};

export const sellerSupportApi = {
  list: async () => {
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<ApiSupportTicket>>>("/seller/support/tickets");
    return data.data;
  },

  create: async (payload: { subject: string; category?: string; priority?: string; body: string }) => {
    const { data } = await apiClient.post<ApiResponse<ApiSupportTicket>>("/seller/support/tickets", payload);
    return data;
  },

  get: async (id: string) => {
    const { data } = await apiClient.get<ApiResponse<ApiSupportTicket>>(`/seller/support/tickets/${id}`);
    return data;
  },

  reply: async (id: string, body: string) => {
    const { data } = await apiClient.post<ApiResponse<ApiSupportTicket>>(`/seller/support/tickets/${id}/messages`, { body });
    return data;
  },
};

export const sellerAnalyticsApi = {
  get: async (range: string) => {
    const { data } = await apiClient.get<ApiResponse<SellerAnalytics>>("/seller/analytics", { params: { range } });
    return data.data;
  },
};

export const sellerGrowthApi = {
  insights: async () => {
    const { data } = await apiClient.get<ApiResponse<GrowthInsight[]>>("/seller/growth");
    return data.data;
  },
};

export const sellerPromoCodesApi = {
  list: async () => {
    const { data } = await apiClient.get<ApiResponse<PromoCodeRow[]>>("/seller/promo-codes");
    return data.data;
  },
  create: async (payload: {
    code: string;
    type: "percent" | "fixed";
    value: number;
    min_subtotal?: number;
    max_discount?: number | null;
    usage_limit?: number | null;
    per_user_limit?: number;
    ends_at?: string | null;
  }) => {
    const { data } = await apiClient.post<ApiResponse<PromoCodeRow>>("/seller/promo-codes", payload);
    return data.data;
  },
  update: async (id: string, payload: Partial<{ is_active: boolean; value: number; ends_at: string | null }>) => {
    const { data } = await apiClient.patch<ApiResponse<PromoCodeRow>>(`/seller/promo-codes/${id}`, payload);
    return data.data;
  },
};

export const sellerStaffApi = {
  list: async () => {
    const { data } = await apiClient.get<ApiResponse<StoreTeam>>("/seller/staff");
    return data.data;
  },
  invite: async (payload: { email: string; role: "inventory" | "orders" | "finance" | "support" }) => {
    const { data } = await apiClient.post<ApiResponse<StoreStaffMember>>("/seller/staff", payload);
    return data.data;
  },
  update: async (id: string, payload: { role?: string; status?: string }) => {
    const { data } = await apiClient.patch<ApiResponse<StoreStaffMember>>(`/seller/staff/${id}`, payload);
    return data.data;
  },
  remove: async (id: string) => {
    const { data } = await apiClient.delete<ApiResponse<null>>(`/seller/staff/${id}`);
    return data;
  },
};

export const sellerCampaignsApi = {
  list: async () => {
    const { data } = await apiClient.get<ApiResponse<ApiCampaign[]>>("/seller/marketing/campaigns");
    return data.data;
  },

  create: async (payload: { name: string; channel: string; spend?: number; conversions?: number }) => {
    const { data } = await apiClient.post<ApiResponse<ApiCampaign>>("/seller/marketing/campaigns", payload);
    return data;
  },

  update: async (id: string, payload: Partial<{ name: string; channel: string; spend: number; conversions: number; status: string }>) => {
    const { data } = await apiClient.patch<ApiResponse<ApiCampaign>>(`/seller/marketing/campaigns/${id}`, payload);
    return data;
  },
};

export const wishlistApi = {
  list: async () => {
    const { data } = await apiClient.get<ApiResponse<Product[]>>("/wishlist");
    return data.data;
  },

  add: async (productId: string) => {
    const { data } = await apiClient.post<ApiResponse<Product[]>>("/wishlist", { product_id: productId });
    return data.data;
  },

  remove: async (productId: string) => {
    const { data } = await apiClient.delete<ApiResponse<Product[]>>(`/wishlist/${productId}`);
    return data.data;
  },
};

export const riderApi = {
  register: async (payload: { phone: string; vehicle_type?: string; city?: string }) => {
    const { data } = await apiClient.post<
      ApiResponse<{ rider: ApiRider; user: { id: string; role: string } }>
    >("/rider/register", payload);
    return data;
  },

  me: async () => {
    const { data } = await apiClient.get<ApiResponse<ApiRider>>("/rider/me");
    return data.data;
  },

  orders: async () => {
    const { data } = await apiClient.get<ApiResponse<ApiOrder[]>>("/rider/orders");
    return data.data;
  },
};

export const returnsApi = {
  getForOrder: async (orderId: string) => {
    const { data } = await apiClient.get<ApiResponse<ApiReturnRequest | null>>(`/orders/${orderId}/returns`);
    return data.data;
  },

  request: async (orderId: string, reason: string) => {
    const { data } = await apiClient.post<ApiResponse<ApiReturnRequest>>(`/orders/${orderId}/returns`, {
      reason,
    });
    return data;
  },

  sellerList: async (params: { status?: string; page?: number; limit?: number } = {}) => {
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<ApiReturnRequest>>>("/seller/returns", {
      params: compactParams(params),
    });
    return data.data;
  },

  sellerUpdate: async (id: string, action: "approve" | "reject", note?: string) => {
    const { data } = await apiClient.patch<ApiResponse<ApiReturnRequest>>(`/seller/returns/${id}`, {
      action,
      note,
    });
    return data;
  },

  adminList: async (params: { status?: string; page?: number; limit?: number } = {}) => {
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<ApiReturnRequest>>>("/admin/returns", {
      params: compactParams(params),
    });
    return data.data;
  },

  adminUpdate: async (id: string, action: "approve" | "reject", note?: string) => {
    const { data } = await apiClient.patch<ApiResponse<ApiReturnRequest>>(`/admin/returns/${id}`, {
      action,
      note,
    });
    return data;
  },
};

export const disputesApi = {
  getForOrder: async (orderId: string) => {
    const { data } = await apiClient.get<ApiResponse<Dispute | null>>(`/orders/${orderId}/disputes`);
    return data.data;
  },

  open: async (
    orderId: string,
    payload: { reason: string; type?: string; buyer_evidence?: string },
  ) => {
    const { data } = await apiClient.post<ApiResponse<Dispute>>(`/orders/${orderId}/disputes`, payload);
    return data.data;
  },

  list: async (params: { status?: string; page?: number; limit?: number } = {}) => {
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<Dispute>>>("/disputes", {
      params: compactParams(params),
    });
    return data.data;
  },

  sellerList: async (params: { status?: string; page?: number; limit?: number } = {}) => {
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<Dispute>>>("/seller/disputes", {
      params: compactParams(params),
    });
    return data.data;
  },

  sellerRespond: async (id: string, response: string) => {
    const { data } = await apiClient.post<ApiResponse<Dispute>>(`/seller/disputes/${id}/respond`, {
      response,
    });
    return data.data;
  },
};

export const notificationsApi = {
  list: async (params: { unread?: boolean; page?: number; limit?: number } = {}) => {
    const { data } = await apiClient.get<ApiResponse<NotificationListResult>>("/notifications", {
      params: compactParams({
        ...params,
        unread: params.unread ? true : undefined,
      }),
    });
    return data.data;
  },

  markRead: async (id: string) => {
    const { data } = await apiClient.patch<ApiResponse<unknown>>(`/notifications/${id}/read`);
    return data;
  },

  markAllRead: async () => {
    const { data } = await apiClient.post<ApiResponse<null>>("/notifications/read-all");
    return data;
  },
};

