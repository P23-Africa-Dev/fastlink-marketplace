import { MOCK_PRODUCTS } from "@/mocks/data";
import { ALL_BRAND_PARTNERS, ALL_SHOP_CATEGORIES } from "@/mocks/stores-data";
import type { BrandPartner, ShopCategoryItem } from "@/mocks/stores-data";
import type { Product } from "@/types/product";
import { productMatchesShopCategory } from "@/lib/category-mapping";

function normalizeBrand(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function getBrandProductName(brand: BrandPartner): string {
  return brand.productBrand ?? brand.name;
}

export function getBrandBySlug(slug: string): BrandPartner | undefined {
  return ALL_BRAND_PARTNERS.find((brand) => brand.href === `/brands/${slug}` || brand.href.endsWith(`/${slug}`));
}

export function getProductsByBrandSlug(
  slug: string,
  categorySlug?: string
): Product[] {
  const brand = getBrandBySlug(slug);
  if (!brand) return [];

  const productBrand = getBrandProductName(brand);
  const normalized = normalizeBrand(productBrand);

  return MOCK_PRODUCTS.filter((product) => {
    const matchesBrand =
      (product.brand && normalizeBrand(product.brand) === normalized) ||
      normalizeBrand(product.seller.name).includes(normalized);

    if (!matchesBrand) return false;

    const category = ALL_SHOP_CATEGORIES.find((cat) => cat.slug === categorySlug);
    return productMatchesShopCategory(
      product.category,
      categorySlug,
      category?.name
    );
  });
}

export function getBrandCategories(_slug: string): ShopCategoryItem[] {
  return ALL_SHOP_CATEGORIES;
}

export function getBrandCategoryProductCount(slug: string, categorySlug: string): number {
  return getProductsByBrandSlug(slug, categorySlug).length;
}

export function getBrandProductCount(slug: string): number {
  return getProductsByBrandSlug(slug).length;
}
