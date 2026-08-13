export interface Seller {
  id: string;
  userId: string;
  storeName: string;
  storeSlug: string;
  description: string;
  logo?: string;
  banner?: string;
  categories: string[];
  rating: number;
  totalSales: number;
  totalProducts: number;
  joinedAt: string;
  isVerified: boolean;
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    website?: string;
  };
}

export interface StorePage {
  seller: Seller;
  featuredProducts: string[];
  policies: {
    returns: string;
    shipping: string;
    payment: string;
  };
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  revenueChange: number;
  ordersChange: number;
  recentOrders: RecentOrder[];
  topProducts: TopProduct[];
  chart?: { name: string; value: number }[];
}

export interface SellerCustomer {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  address?: string;
  orders: number;
  spent: number;
  status: "Active" | "Inactive";
  joinDate: string;
  tier: "VIP" | "Gold" | "Silver" | "Bronze";
  preferredCategory?: string;
}

export interface SellerStoreProfile {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logo?: string | null;
  banner?: string | null;
  location?: string | null;
  deliveryTag?: string | null;
  headline?: string | null;
  phone?: string | null;
  type?: string;
  status: string;
  bankName?: string | null;
  bankAccountNumber?: string | null;
  bankAccountName?: string | null;
}

export interface SellerSettings {
  store: SellerStoreProfile;
  notifications: Record<string, { email: boolean; push: boolean }>;
}

export interface ProductReview {
  id: string;
  productId: string;
  productName?: string;
  rating: number;
  body: string | null;
  status: string;
  displayStatus: string;
  buyer: { id: string; name: string };
  reply?: { body: string; createdAt: string | null } | null;
  createdAt: string;
}

export interface RecentOrder {
  id: string;
  reference?: string;
  customerName: string;
  amount: number;
  status: string;
  displayStatus?: string;
  date: string;
  title?: string;
  sku?: string;
  image?: string;
  quantity?: number;
  delivery?: string;
}

export interface TopProduct {
  id: string;
  name: string;
  image: string;
  sales: number;
  revenue: number;
}
