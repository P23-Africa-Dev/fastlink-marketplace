export interface ApiReturnRequest {
  id: string;
  status: "pending" | "approved" | "rejected" | "refunded";
  displayStatus: string;
  reason: string;
  refundAmount: number | null;
  order?: {
    id: string;
    reference: string;
    total: number;
    status: string;
  } | null;
  store?: { id: string; name: string } | null;
  buyer?: { id: string; name: string; email: string } | null;
  createdAt: string;
  resolvedAt: string | null;
}
