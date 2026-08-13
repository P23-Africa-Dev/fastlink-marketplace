export interface AdminOverview {
  gmv: number;
  orders: number;
  users: number;
  buyers: number;
  sellers: number;
  pendingStores: number;
  pendingPayouts: number;
  pendingPayoutAmount: number;
  products: number;
  payments: number;
  take: number;
}

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  role: "buyer" | "seller" | "admin";
  status: "active" | "pending" | "suspended";
  phone?: string | null;
  createdAt: string;
  store?: { id: string; name: string; status: string } | null;
}

export interface AdminStoreRow {
  id: string;
  name: string;
  slug: string;
  status: string;
  type?: string;
  location?: string;
  mallId?: string | null;
  owner?: { id: string; name: string; email: string } | null;
}

export interface AdminAuditLog {
  id: string;
  action: string;
  actor?: { id: string; name: string; email: string } | null;
  subjectType: string;
  subjectId: string;
  meta?: Record<string, unknown> | null;
  createdAt: string;
}

export interface AdminMall {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  location?: string | null;
  storeCount?: number;
}

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  itemCount?: string | number;
}

export interface AdminBrand {
  id: string;
  name: string;
  slug: string;
  productBrand?: string;
  style?: string;
}
