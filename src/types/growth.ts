export interface PromoCodeRow {
  id: string;
  code: string;
  type: "percent" | "fixed" | string;
  value: number;
  minSubtotal: number;
  maxDiscount: number | null;
  usageLimit: number | null;
  usedCount: number;
  perUserLimit: number;
  isActive: boolean;
  storeId: string | null;
  startsAt: string | null;
  endsAt: string | null;
}

export interface PromoPreview {
  code: string;
  discount: number;
  allocations: Array<{ storeId: string; discount: number }>;
}

export interface ReferralSummary {
  code: string;
  signups: number;
}

export interface GrowthInsight {
  type: string;
  title: string;
  detail: string;
  productId?: string;
}

export interface LoyaltySummary {
  points: number;
  nairaValue: number;
  earnPerNaira: number;
  pointValue: number;
}

export interface SearchSuggestion {
  id?: string;
  name: string;
  slug: string;
  image?: string | null;
}

export interface SearchSuggestResult {
  products: SearchSuggestion[];
  brands: SearchSuggestion[];
  stores: SearchSuggestion[];
}
