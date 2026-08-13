export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
}

export interface ProductVariant {
  id: string;
  name: string;
  value: string;
  stock: number;
  priceModifier: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  longDescription?: string;
  price: number;
  compareAtPrice?: number;
  discountPercentage?: number;
  brand?: string;
  images: ProductImage[];
  category: string;
  subcategory?: string;
  storeId?: string;
  tags: string[];
  seller: {
    id: string;
    name: string;
    avatar?: string;
    rating: number;
    totalSales: number;
  };
  rating: number;
  reviewCount: number;
  stock: number;
  sku: string;
  variants?: {
    sizes?: ProductVariant[];
    colors?: ProductVariant[];
    memory?: ProductVariant[];
    storage?: ProductVariant[];
  };
  isFeatured: boolean;
  isNew: boolean;
  isBestseller: boolean;
  status?: string;
  costPrice?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilter {
  category?: string;
  subcategory?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  tags?: string[];
  sortBy?: "price_asc" | "price_desc" | "rating" | "newest" | "bestseller";
  inStock?: boolean;
  featured?: boolean;
  store?: string;
  brand?: string;
  q?: string;
}
