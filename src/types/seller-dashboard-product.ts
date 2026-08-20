export interface ProductVariant {
  sku: string;
  price: number;
  stock: number;
  options: Record<string, string>;
}

export interface ProductImage {
  id: string;
  url: string;
  name: string;
  size?: string;
}

export interface DashboardProduct {
  id: string;
  sku: string;
  name: string;
  brand: string;
  condition: string;
  description: string;
  category: string;
  categoryPath: string[];
  stock: number;
  basePrice: number;
  costPrice: number;
  comparePrice: number;
  price: number;
  image: string;
  images: ProductImage[];
  tags: string[];
  weight: number;
  length: number;
  width: number;
  height: number;
  shippingClass: string;
  specialHandling: boolean;
  hasVariants: boolean;
  variantTypes: { name: string; values: string[] }[];
  variants: ProductVariant[];
  status: "Active" | "Low Stock" | "Out of Stock" | "Draft";
}
