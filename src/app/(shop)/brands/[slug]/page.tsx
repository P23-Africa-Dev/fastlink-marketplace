import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Store } from "lucide-react";
import { ShopProductCard } from "@/components/product/shop-product-card";
import { TargetIcon } from "@/components/marketplace/target-icon";
import {
  getBrandBySlug,
  getBrandCategories,
  getBrandProductName,
  getProductsByBrandSlug,
} from "@/lib/brands";

interface PageProps {
  params: { slug: string };
  searchParams: { category?: string };
}

export default function BrandDetailPage({ params, searchParams }: PageProps) {
  const brand = getBrandBySlug(params.slug);
  const selectedCategory = searchParams?.category;

  if (!brand) {
    return (
      <div className="bg-[#EADBF8] min-h-screen pb-16">
        <div className="container-wide py-20 text-center space-y-4">
          <h1 className="text-2xl font-bold text-[#6D349F] font-montserrat">Brand not found</h1>
          <Link href="/brands" className="text-sm font-semibold text-[#6D349F] hover:underline">
            Back to all brands
          </Link>
        </div>
      </div>
    );
  }

  const categories = getBrandCategories(params.slug);
  const products = getProductsByBrandSlug(params.slug, selectedCategory);
  const brandLabel = getBrandProductName(brand);

  return (
    <div className="bg-[#EADBF8] min-h-screen pb-16">
      <section className="relative w-full overflow-hidden bg-gradient-to-r from-[#8836DB] via-[#7E37C9] to-[#60259E] py-10 sm:py-14 text-white shadow-md">
        <div className="container-wide relative z-10">
          <div className="mb-4">
            <Link
              href="/brands"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-200 hover:text-white transition-colors bg-white/10 px-3 py-1.5 rounded-lg border border-white/20"
            >
              <ArrowLeft size={14} />
              <span>Back to Brand Partners</span>
            </Link>
          </div>

          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight font-montserrat mb-3">
              {brandLabel}
            </h1>
            <p className="text-sm sm:text-base text-purple-100 font-medium">
              Official retail partner — shop by category
            </p>
          </div>
        </div>
      </section>

      <div className="container-wide py-10">
        {!selectedCategory ? (
          <section className="space-y-6">
            <div className="flex items-center gap-2.5 border-b border-[#D8C2EF] pb-3">
              <Store size={22} className="text-[#6D349F] shrink-0" />
              <h2 className="text-xl sm:text-2xl font-bold text-[#6D349F] font-montserrat">
                Shop {brandLabel} by Category
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3.5 md:grid-cols-4 lg:grid-cols-6">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/brands/${params.slug}?category=${encodeURIComponent(cat.slug)}`}
                  className="group overflow-hidden rounded-2xl border border-white/60 bg-[#F2E7FC] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-purple-100">
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 16vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex items-center justify-between bg-[#F2E7FC] px-3.5 py-3 border-t border-[#E4D1F7]">
                    <div className="flex items-center gap-2 min-w-0">
                      <TargetIcon />
                      <span className="truncate text-sm font-bold text-[#6D349F] font-montserrat">
                        {cat.name}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : (
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#D8C2EF] pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-[#8A79A5] mb-1">
                  <Link href={`/brands/${params.slug}`} className="hover:underline">
                    {brandLabel}
                  </Link>
                  <span>/</span>
                  <span className="font-semibold text-[#6D349F]">
                    {categories.find((c) => c.slug === selectedCategory)?.name ?? selectedCategory}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#6D349F] font-montserrat">
                  Products in{" "}
                  {categories.find((c) => c.slug === selectedCategory)?.name ?? selectedCategory}
                </h2>
              </div>

              <Link
                href={`/brands/${params.slug}`}
                className="text-xs font-semibold text-[#6D349F] hover:underline"
              >
                View All Categories
              </Link>
            </div>

            {products.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {products.map((product) => (
                  <ShopProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="bg-[#F2E7FC] rounded-2xl p-10 text-center border border-white/60">
                <p className="text-base font-bold text-[#6D349F]">No products in this category yet</p>
                <p className="text-xs text-[#8A79A5] mt-2">
                  Browse other categories from {brandLabel}.
                </p>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
