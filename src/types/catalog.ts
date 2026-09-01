export interface Mall {
  id: string;
  name: string;
  slug: string;
  image: string;
  location?: string;
  storeCount?: number;
}

export interface LocalStoreItem {
  id: string;
  name: string;
  slug: string;
  mallId: string;
  categorySlug: string;
  category: string;
  location: string;
  deliveryTag: string;
  image: string;
  mall?: Mall;
}

export interface ShopCategoryItem {
  id: string;
  name: string;
  slug: string;
  image: string;
  itemCount?: string;
}

export interface BrandPartner {
  id: string;
  name: string;
  productBrand?: string;
  logo?: string;
  href: string;
  style?: "blue-bold" | "black" | "orange" | "default";
}

export interface NationwideBrand {
  id: string;
  name: string;
  tagline: string;
  logo?: string;
  href: string;
}

export interface EmergingVendor {
  id: string;
  name: string;
  category: string;
  image: string;
  href: string;
}

export interface DealProduct {
  id: string;
  name: string;
  category: string;
  discount: number;
  image: string;
  href: string;
  rating: number;
  reviews: string;
}
