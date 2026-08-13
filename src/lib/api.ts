import axios from "axios";

import type { PaginatedResponse, ApiResponse } from "@/types/api";
import type { ProductFilter, Product } from "@/types/product";
import type { DashboardStats } from "@/types/seller";
import type { User } from "@/types/user";
import {
  MOCK_PRODUCTS,
  MOCK_DASHBOARD_STATS,
  MOCK_ORDERS,
} from "@/mocks/data";
import { delay } from "@/lib/utils";
import { productMatchesCategoryFilter } from "@/lib/category-mapping";

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
        window.location.href = "/login";
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

export const productsApi = {
  getAll: async (
    filters: ProductFilter = {},
    page = 1,
    limit = 12,
  ): Promise<PaginatedResponse<Product>> => {
    await delay(400);

    let results = [...MOCK_PRODUCTS];

    if (filters.featured) {
      results = results.filter((p) => p.isFeatured);
    }

    if (filters.category) {
      results = results.filter((p) =>
        productMatchesCategoryFilter(p.category, filters.category)
      );
    }
    if (filters.minPrice !== undefined) {
      results = results.filter((p) => p.price >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      results = results.filter((p) => p.price <= filters.maxPrice!);
    }
    if (filters.inStock) {
      results = results.filter((p) => p.stock > 0);
    }
    if (filters.sortBy === "price_asc") results.sort((a, b) => a.price - b.price);
    if (filters.sortBy === "price_desc") results.sort((a, b) => b.price - a.price);
    if (filters.sortBy === "rating") results.sort((a, b) => b.rating - a.rating);
    if (filters.sortBy === "newest")
      results.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    if (filters.sortBy === "bestseller")
      results.sort((a, b) => Number(b.isBestseller) - Number(a.isBestseller));

    if (!filters.sortBy && filters.featured) {
      results.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }

    const total = results.length;
    const start = (page - 1) * limit;
    const data = results.slice(start, start + limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: start + limit < total,
      hasPrevPage: page > 1,
    };
  },

  getById: async (id: string): Promise<ApiResponse<Product>> => {
    await delay(300);
    const product = MOCK_PRODUCTS.find((p) => p.id === id || p.slug === id);
    if (!product) throw new Error("Product not found");
    return { data: product, success: true };
  },

  getFeatured: async (): Promise<ApiResponse<Product[]>> => {
    await delay(350);
    return {
      data: MOCK_PRODUCTS.filter((p) => p.isFeatured),
      success: true,
    };
  },

  search: async (query: string): Promise<ApiResponse<Product[]>> => {
    await delay(300);
    const q = query.toLowerCase();
    const results = MOCK_PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        p.category.toLowerCase().includes(q),
    );
    return { data: results, success: true };
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
  getStats: async (): Promise<ApiResponse<DashboardStats>> => {
    await delay(500);
    return { data: MOCK_DASHBOARD_STATS, success: true };
  },
};

export const ordersApi = {
  getMyOrders: async () => {
    await delay(400);
    return { data: MOCK_ORDERS, success: true };
  },
};
