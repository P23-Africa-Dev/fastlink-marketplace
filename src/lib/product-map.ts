import type { Product as ShopProduct } from "@/types/product";
import type { DashboardProduct } from "@/types/seller-dashboard-product";

function inventoryStatus(product: ShopProduct): DashboardProduct["status"] {
  if (product.status === "draft") return "Draft";
  if (product.stock === 0) return "Out of Stock";
  if (product.stock <= 5) return "Low Stock";
  return "Active";
}

export function toDashboardProduct(product: ShopProduct): DashboardProduct {
  const image = product.images.find((item) => item.isPrimary)?.url ?? product.images[0]?.url ?? "";

  return {
    id: product.id,
    sku: product.sku,
    name: product.name,
    brand: product.brand ?? "",
    condition: "New",
    description: product.description,
    category: product.category,
    categoryPath: product.category ? [product.category] : [],
    stock: product.stock,
    basePrice: product.price,
    costPrice: product.costPrice ?? 0,
    comparePrice: product.compareAtPrice ?? 0,
    price: product.price,
    image,
    images: product.images.map((item) => ({
      id: item.id,
      url: item.url,
      name: item.alt,
    })),
    tags: product.tags ?? [],
    weight: 0,
    length: 0,
    width: 0,
    height: 0,
    shippingClass: "Standard",
    specialHandling: false,
    hasVariants: Boolean(product.variants && Object.keys(product.variants).length > 0),
    variantTypes: [],
    variants: [],
    status: inventoryStatus(product),
  };
}
