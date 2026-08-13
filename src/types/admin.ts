export interface AdminOverview {
  gmv: number;
  orders: number;
  users: number;
  buyers: number;
  sellers: number;
  pendingStores: number;
  pendingRiders?: number;
  pendingApplications?: number;
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
  role: "buyer" | "seller" | "admin" | "rider";
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
  owner?: { id: string; name: string; email: string; phone?: string | null } | null;
  bankName?: string | null;
  bankAccountNumber?: string | null;
  bankAccountName?: string | null;
  createdAt?: string;
}

export interface AdminMallDetail {
  mall: AdminMall & { storeCount?: number };
  gmv: number;
  pendingStores: number;
  stores: AdminStoreRow[];
}

export interface AdminVerificationQueue {
  pendingStores: AdminStoreRow[];
  pendingRiders: Array<{
    id: string;
    status: string;
    phone: string;
    vehicleType: string;
    city?: string | null;
    user?: { id: string; name: string; email: string } | null;
    createdAt: string;
  }>;
  counts: { stores: number; riders: number; total: number };
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
  city?: string | null;
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

export interface MarketplaceConfig {
  commissionRate: number;
  returnWindowDays: number;
  minOrderAmount: number;
  defaultShippingFee: number;
  maintenanceMode: boolean;
}

export interface LedgerEntryRow {
  id: string;
  type: string;
  direction: "credit" | "debit";
  amount: number;
  currency: string;
  referenceType?: string | null;
  referenceId?: string | null;
  storeId?: string | null;
  orderId?: string | null;
  meta?: Record<string, unknown> | null;
  createdAt: string;
}

export interface TrustReportRow {
  id: string;
  reason: string;
  details?: string | null;
  status: string;
  adminNote?: string | null;
  subjectType: string;
  subjectId: string;
  subjectLabel: string;
  reporter?: { id: string; name: string; email: string } | null;
  resolvedAt?: string | null;
  createdAt: string;
}

export interface AdminTrustReportsResponse {
  data: TrustReportRow[];
  total: number;
  page: number;
  limit: number;
  openCount: number;
}

export interface DisputeRow {
  id: string;
  type: string;
  status: string;
  displayStatus: string;
  reason: string;
  buyerEvidence?: string | null;
  sellerResponse?: string | null;
  resolution?: string | null;
  adminNote?: string | null;
  refundAmount?: number | null;
  order?: { id: string; reference: string; total: number; status: string } | null;
  store?: { id: string; name: string } | null;
  buyer?: { id: string; name: string; email: string } | null;
  createdAt: string;
  resolvedAt?: string | null;
}

export interface AdminDisputesResponse {
  data: DisputeRow[];
  total: number;
  page: number;
  limit: number;
  openCount: number;
}

export interface WebhookEventRow {
  id: string;
  event?: string | null;
  reference?: string | null;
  status: string;
  error?: string | null;
  createdAt: string;
}

export interface AdminWebhooksResponse {
  data: WebhookEventRow[];
  total: number;
  page: number;
  limit: number;
  failedCount: number;
}

export interface ChargebackRow {
  id: string;
  amount: number;
  providerReference?: string | null;
  reason: string;
  status: string;
  displayStatus: string;
  adminNote?: string | null;
  order?: { id: string; reference: string; total: number } | null;
  store?: { id: string; name: string } | null;
  payment?: { id: string; reference: string; amount: number; status: string } | null;
  createdAt: string;
  resolvedAt?: string | null;
}

export interface AdminChargebacksResponse {
  data: ChargebackRow[];
  total: number;
  page: number;
  limit: number;
  openCount: number;
}

export interface StoreReputation {
  score: number;
  badge: string | null;
  metrics: {
    averageRating: number;
    reviewCount: number;
    fulfillmentRate: number;
    cancellationRate: number;
    totalOrders: number;
  };
}
