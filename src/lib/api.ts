import axios from "axios";

import type { PaginatedResponse, ApiResponse } from "@/types/api";
import type { ProductFilter, Product } from "@/types/product";
import type { DashboardStats, ProductReview, SellerCustomer, SellerSettings, SellerStoreProfile } from "@/types/seller";
import type { Address, User } from "@/types/user";
import type { AddressPayload, ApiOrder, CheckoutResult } from "@/types/order";
import type {
  BrandPartner,
  DealProduct,
  EmergingVendor,
  Mall,
  NationwideBrand,
  ShopCategoryItem,
  LocalStoreItem,
} from "@/mocks/stores-data";

// ---------------------------------------------------------------------------
// Axios instance — swap baseURL for your real API when ready
// ---------------------------------------------------------------------------
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "/api",
  headers: { "Content-Type": "application/json" },
  timeout: 10_000,
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    const url = String(error.config?.url ?? "");
    const isPublicAuth = /\/auth\/(login|register|forgot-password|reset-password)/.test(url);

    if (status === 401 && !isPublicAuth && typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      document.cookie = "auth_token=; Path=/; Max-Age=0; SameSite=Lax";
      document.cookie = "auth_role=; Path=/; Max-Age=0; SameSite=Lax";
      if (!window.location.pathname.startsWith("/login")) {
        const next = `${window.location.pathname}${window.location.search}`;
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
    options?: { passwordConfirmation?: string; role?: "buyer" | "seller" },
  ) => {
    const { data } = await apiClient.post<ApiResponse<{ user: User; token: string }>>(
      "/auth/register",
      {
        name,
        email,
        password,
        password_confirmation: options?.passwordConfirmation ?? password,
        role: options?.role ?? "buyer",
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
