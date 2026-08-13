"use client";

import { ShopProductCard } from "@/components/product/shop-product-card";
import { useRecommendations } from "@/hooks/use-products";

export function ForYouSection() {
  const { data, isLoading } = useRecommendations();
  const forYou = data?.forYou ?? [];
  const recent = data?.recentlyViewed ?? [];

  if (isLoading || (forYou.length === 0 && recent.length === 0)) {
    return null;
  }

  return (
    <section className="bg-[#EADBF8] py-10 font-montserrat">
      <div className="container-wide space-y-10">
        {forYou.length > 0 && (
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#6D349F] mb-5">For you</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {forYou.slice(0, 8).map((product) => (
                <ShopProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
        {recent.length > 0 && (
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#6D349F] mb-5">Recently viewed</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {recent.slice(0, 4).map((product) => (
                <ShopProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
