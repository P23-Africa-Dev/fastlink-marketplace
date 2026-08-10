/** Maps shop category slugs/names to product.category values in mock/API data */
export const SHOP_CATEGORY_SLUG_TO_PRODUCT_CATEGORIES: Record<string, string[]> = {
  electronics: ["Electronics"],
  fashion: ["Fashion"],
  groceries: ["Groceries"],
  beauty: ["Beauty"],
  health: ["Health", "Beauty"],
  "home-living": ["Home & Kitchen", "Home & Living"],
  books: ["Stationery"],
};

export const SHOP_CATEGORY_NAME_TO_PRODUCT_CATEGORIES: Record<string, string[]> = {
  Electronics: ["Electronics"],
  Fashion: ["Fashion"],
  Groceries: ["Groceries"],
  Beauty: ["Beauty"],
  Health: ["Health", "Beauty"],
  "Home & Living": ["Home & Kitchen", "Home & Living"],
  "Home & Kitchen": ["Home & Kitchen", "Home & Living"],
};

export function productMatchesShopCategory(
  productCategory: string,
  shopCategorySlug?: string,
  shopCategoryName?: string
): boolean {
  if (!shopCategorySlug && !shopCategoryName) return true;

  if (shopCategorySlug && shopCategorySlug !== "all") {
    const allowed = SHOP_CATEGORY_SLUG_TO_PRODUCT_CATEGORIES[shopCategorySlug];
    if (allowed) {
      return allowed.some((cat) => cat.toLowerCase() === productCategory.toLowerCase());
    }
  }

  if (shopCategoryName) {
    const allowed = SHOP_CATEGORY_NAME_TO_PRODUCT_CATEGORIES[shopCategoryName];
    if (allowed) {
      return allowed.some((cat) => cat.toLowerCase() === productCategory.toLowerCase());
    }
  }

  return productCategory.toLowerCase() === (shopCategoryName ?? shopCategorySlug ?? "").toLowerCase();
}

export function productMatchesCategoryFilter(
  productCategory: string,
  filterCategory?: string
): boolean {
  if (!filterCategory) return true;

  const byName = SHOP_CATEGORY_NAME_TO_PRODUCT_CATEGORIES[filterCategory];
  if (byName) {
    return byName.some((cat) => cat.toLowerCase() === productCategory.toLowerCase());
  }

  const bySlug = SHOP_CATEGORY_SLUG_TO_PRODUCT_CATEGORIES[filterCategory];
  if (bySlug) {
    return bySlug.some((cat) => cat.toLowerCase() === productCategory.toLowerCase());
  }

  return productCategory.toLowerCase() === filterCategory.toLowerCase();
}
