import { MOCK_PRODUCTS } from "@/mocks/data";
import {
  ALL_SHOP_CATEGORIES,
  KANO_MALLS,
  LOCAL_STORES_NEAR_YOU,
  type LocalStoreItem,
  type Mall,
  type ShopCategoryItem,
} from "@/mocks/stores-data";
import type { Product } from "@/types/product";

const STORE_CATEGORY_TO_PRODUCT_CATEGORIES: Record<string, string[]> = {
  Electronics: ["Electronics"],
  Fashion: ["Fashion"],
  Groceries: ["Groceries"],
  "Health & Beauty": ["Beauty", "Health"],
  Health: ["Health", "Beauty"],
  "Home Living": ["Home & Kitchen", "Home & Living"],
  "Books & Stationeries": ["Stationery"],
};

const STORE_CATEGORY_SLUGS: Record<string, string> = {
  Electronics: "electronics",
  Fashion: "fashion",
  Groceries: "groceries",
  "Health & Beauty": "beauty",
  Health: "health",
  "Home Living": "home-living",
  "Books & Stationeries": "books",
};

export function getMallBySlug(slug: string): Mall | undefined {
  return KANO_MALLS.find((mall) => mall.slug === slug);
}

export function getStoreBySlug(slug: string): LocalStoreItem | undefined {
  return LOCAL_STORES_NEAR_YOU.find((store) => store.slug === slug);
}

export function getMallForStore(store: LocalStoreItem): Mall | undefined {
  return KANO_MALLS.find((mall) => mall.id === store.mallId);
}

export function getStoresByMallId(
  mallId: string,
  categorySlug?: string
): LocalStoreItem[] {
  return LOCAL_STORES_NEAR_YOU.filter((store) => {
    if (store.mallId !== mallId) return false;
    if (!categorySlug || categorySlug === "all") return true;
    return store.categorySlug === categorySlug;
  });
}

export function getCategoriesForMall(_mallId: string): ShopCategoryItem[] {
  return ALL_SHOP_CATEGORIES;
}

export function getProductsByStoreId(
  storeId: string,
  category?: string
): Product[] {
  const store = LOCAL_STORES_NEAR_YOU.find((s) => s.id === storeId);
  if (!store) return [];

  const allowedCategories =
    STORE_CATEGORY_TO_PRODUCT_CATEGORIES[store.category] ?? [store.category];

  return MOCK_PRODUCTS.filter((product) => {
    const matchesStore =
      product.storeId === storeId ||
      allowedCategories.some(
        (cat) => cat.toLowerCase() === product.category.toLowerCase()
      );

    if (!matchesStore) return false;
    if (!category) return true;
    return product.category.toLowerCase() === category.toLowerCase();
  });
}

export function getProductsByStoreSlug(
  slug: string,
  category?: string
): Product[] {
  const store = getStoreBySlug(slug);
  if (!store) return MOCK_PRODUCTS;
  return getProductsByStoreId(store.id, category);
}

export function getStoreCategorySlug(category: string): string {
  return STORE_CATEGORY_SLUGS[category] ?? category.toLowerCase().replace(/\s+/g, "-");
}

export function enrichStoreWithRelations(
  store: LocalStoreItem
): LocalStoreItem & { mall?: Mall } {
  return { ...store, mall: getMallForStore(store) };
}
