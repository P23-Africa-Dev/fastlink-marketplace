import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Clock, MapPin, Store as StoreIcon } from "lucide-react";
import { ShopProductCard } from "@/components/product/shop-product-card";
import {
  getMallBySlug,
  getMallForStore,
  getProductsByStoreSlug,
  getStoreBySlug,
} from "@/lib/marketplace";

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
        <section className="relative w-full overflow-hidden bg-gradient-to-r from-[#8836DB] via-[#7E37C9] to-[#60259E] py-10 sm:py-14 text-white shadow-md">
          <div className="container-wide relative z-10">
            <div className="mb-4">
              <Link
                href="/malls"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-200 hover:text-white transition-colors bg-white/10 px-3 py-1.5 rounded-lg border border-white/20"
              >
                <ArrowLeft size={14} />
                <span>Back to Malls</span>
              </Link>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-montserrat">
              {displayName}
            </h1>
          </div>
        </section>

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
      <section className="relative w-full overflow-hidden bg-gradient-to-r from-[#8836DB] via-[#7E37C9] to-[#60259E] py-10 sm:py-14 text-white shadow-md">
        <div className="container-wide relative z-10">
          <div className="mb-4">
            <Link
              href={mall ? `/malls/${mall.slug}` : "/malls"}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-200 hover:text-white transition-colors bg-white/10 px-3 py-1.5 rounded-lg border border-white/20"
            >
              <ArrowLeft size={14} />
              <span>Back to {mall?.name ?? "Mall"}</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              {mall && (
                <div className="flex items-center gap-2 text-xs text-purple-200 mb-2">
                  <Link href={`/malls/${mall.slug}`} className="hover:underline">
                    {mall.name}
                  </Link>
                  <span>/</span>
                  <span className="font-semibold text-white">{store.name}</span>
                </div>
              )}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight font-montserrat mb-3">
                {store.name}
              </h1>
              <p className="text-sm text-purple-100 font-medium mb-4">{store.category}</p>

              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 rounded-xl bg-white/20 backdrop-blur-md px-4 py-2 text-xs font-semibold text-white border border-white/30">
                  <MapPin size={16} />
                  <span>{store.location}</span>
                </div>
                <div className="inline-flex items-center gap-2 rounded-xl bg-white/20 backdrop-blur-md px-4 py-2 text-xs font-semibold text-white border border-white/30">
                  <Clock size={16} />
                  <span>{store.deliveryTag}</span>
                </div>
              </div>
            </div>

            <div className="relative aspect-[16/9] md:aspect-[4/3] w-full max-w-md mx-auto md:ml-auto overflow-hidden rounded-xl">
              <Image
                src={store.image}
                alt={store.name}
                fill
                priority
                className="object-cover rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

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
