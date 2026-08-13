export interface Dispute {
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
