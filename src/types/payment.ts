export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type PaymentDisplayStatus = "Successful" | "Pending" | "Failed" | "Refunded";

export interface ApiPayment {
  id: string;
  reference: string;
  orderId: string;
  orderReference?: string | null;
  store?: { id: string; name: string; slug: string } | null;
  buyer?: { id: string; name: string; email: string } | null;
  provider: string;
  gateway: string;
  amount: number;
  fees: number;
  net: number;
  status: PaymentStatus;
  displayStatus: PaymentDisplayStatus;
  paidAt: string | null;
  createdAt: string;
}

export type PayoutStatus = "pending" | "approved" | "rejected" | "transferred";
export type PayoutDisplayStatus = "Transferred" | "Processing" | "Failed";

export interface ApiPayout {
  id: string;
  store?: { id: string; name: string; slug: string } | null;
  amount: number;
  bankName: string | null;
  bankCode: string | null;
  accountNumber: string;
  accountName: string | null;
  status: PayoutStatus;
  displayStatus: PayoutDisplayStatus;
  providerReference: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentListResult {
  data: ApiPayment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  summary: {
    volume: number;
    fees: number;
    net: number;
    pending: number;
    average: number;
  };
  chart: Array<{ name: string; volume: number }>;
}

export interface PayoutListResult {
  data: ApiPayout[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  summary: {
    available: number;
    pending: number;
    transferred: number;
    held: number;
  };
}

export interface CheckoutInitializeResult {
  alreadyPaid: boolean;
  groupId: string;
  reference: string | null;
  authorizationUrl: string | null;
  accessCode: string | null;
  mode: "paystack" | "demo";
}

export interface PayoutAccount {
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountName: string | null;
}
