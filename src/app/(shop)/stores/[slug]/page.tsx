import Link from "next/link";
import { redirect } from "next/navigation";
import { Clock, MapPin, Store as StoreIcon } from "lucide-react";
import { ShopProductCard } from "@/components/product/shop-product-card";
import {
  getMallBySlug,
  getMallForStore,
  getProductsByStoreSlug,
  getStoreBySlug,
} from "@/lib/marketplace";
import { DynamicHero } from "@/components/marketplace/dynamic-hero";

interface PageProps {
  params: { slug: string };
  searchParams: { category?: string };
}

export default function StoreProductsPage({ params, searchParams }: PageProps) {
  const mallMatch = getMallBySlug(params.slug);
  if (mallMatch) {
    redirect(`/malls/${params.slug}`);
  }

  const store = getStoreBySlug(params.slug);
  const selectedCategory = searchParams?.category;

  if (!store) {
    const displayName = params.slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    const products = getProductsByStoreSlug(params.slug, selectedCategory);

    return (
      <div className="bg-[#EADBF8] min-h-screen pb-16">
        <DynamicHero
          title={displayName}
          backgroundImage={products[0]?.images?.[0] || "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=1600&auto=format&fit=crop"}
          backLink="/malls"
          backLabel="Back to Malls"
        />

        <div className="container-wide py-10">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {products.map((product) => (
              <ShopProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const mall = getMallForStore(store);
  const products = getProductsByStoreSlug(store.slug, selectedCategory);

  return (
    <div className="bg-[#EADBF8] min-h-screen pb-16">
      <DynamicHero
        title={store.name}
        subtitle={
          <>
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <div className="inline-flex items-center gap-2 rounded-xl bg-white/20 backdrop-blur-md px-4 py-2 text-xs font-semibold text-white border border-white/30">
                <MapPin size={16} />
                <span>{store.location}</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-xl bg-white/20 backdrop-blur-md px-4 py-2 text-xs font-semibold text-white border border-white/30">
                <Clock size={16} />
                <span>{store.deliveryTag}</span>
              </div>
            </div>
          </>
        }
        backgroundImage={store.image}
        backLink={mall ? `/malls/${mall.slug}` : "/malls"}
        backLabel={`Back to ${mall?.name ?? "Mall"}`}
      >
        {mall && (
          <div className="w-full">
            <div className="flex items-center gap-2 text-xs text-purple-200">
              <Link href={`/malls/${mall.slug}`} className="hover:underline">
                {mall.name}
              </Link>
              <span>/</span>
              <span className="font-semibold text-white">{store.name}</span>
            </div>
          </div>
        )}
      </DynamicHero>

      <div className="container-wide py-10 space-y-6">
        <div className="flex items-center gap-2.5 border-b border-[#D8C2EF] pb-3">
          <StoreIcon size={22} className="text-[#6D349F] shrink-0" />
          <h2 className="text-xl sm:text-2xl font-bold text-[#6D349F] font-montserrat">
            Products from {store.name}
          </h2>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {products.map((product) => (
              <ShopProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-[#F2E7FC] rounded-2xl p-10 text-center border border-white/60">
            <p className="text-base font-bold text-[#6D349F]">No products available yet</p>
            <p className="text-xs text-[#8A79A5] mt-2">
              Check back soon for new items from this store.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
