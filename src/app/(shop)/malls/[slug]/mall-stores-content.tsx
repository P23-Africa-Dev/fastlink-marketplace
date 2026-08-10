"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, RotateCcw, Search, Store as StoreIcon } from "lucide-react";
import { CategoryTabs } from "@/components/marketplace/category-tabs";
import { StoreCard } from "@/components/marketplace/store-card";
import {
  getCategoriesForMall,
  getMallBySlug,
  getStoresByMallId,
} from "@/lib/marketplace";

interface MallStoresPageProps {
  params: { slug: string };
}

export default function MallStoresPage({ params }: MallStoresPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mall = getMallBySlug(params.slug);
  const categoryFromUrl = searchParams.get("category") ?? "all";
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(categoryFromUrl);

  const categories = mall ? getCategoriesForMall(mall.id) : [];

  useEffect(() => {
    setActiveCategory(categoryFromUrl);
  }, [categoryFromUrl]);

  const categoryTabs = useMemo(() => {
    if (!mall) return [];
    const allStores = getStoresByMallId(mall.id);
    return [
      { slug: "all", label: "All", count: allStores.length },
      ...categories.map((cat) => ({
        slug: cat.slug,
        label: cat.name,
        count: getStoresByMallId(mall.id, cat.slug).length,
      })),
    ];
  }, [mall, categories]);

  const filteredStores = useMemo(() => {
    if (!mall) return [];
    const stores = getStoresByMallId(mall.id, activeCategory);
    const q = searchQuery.toLowerCase().trim();
    if (!q) return stores;
    return stores.filter(
      (store) =>
        store.name.toLowerCase().includes(q) ||
        store.category.toLowerCase().includes(q) ||
        store.location.toLowerCase().includes(q)
    );
  }, [mall, activeCategory, searchQuery]);

  const handleCategoryChange = (slug: string) => {
    setActiveCategory(slug);
    const url =
      slug === "all"
        ? `/malls/${params.slug}`
        : `/malls/${params.slug}?category=${encodeURIComponent(slug)}`;
    router.replace(url, { scroll: false });
  };

  if (!mall) {
    return (
      <div className="bg-[#EADBF8] min-h-screen pb-16">
        <div className="container-wide py-20 text-center space-y-4">
          <h1 className="text-2xl font-bold text-[#6D349F] font-montserrat">Mall not found</h1>
          <Link href="/malls" className="text-sm font-semibold text-[#6D349F] hover:underline">
            Back to all malls
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#EADBF8] min-h-screen pb-16">
      <section className="relative w-full overflow-hidden bg-gradient-to-r from-[#8836DB] via-[#7E37C9] to-[#60259E] py-10 sm:py-14 text-white shadow-md">
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />

        <div className="container-wide relative z-10">
          <div className="mb-4">
            <Link
              href="/malls"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-200 hover:text-white transition-colors bg-white/10 px-3 py-1.5 rounded-lg border border-white/20"
            >
              <ArrowLeft size={14} />
              <span>Back to All Malls</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight font-montserrat mb-3">
                Stores in {mall.name}
              </h1>
              <p className="text-sm sm:text-base text-purple-100 font-medium mb-2">
                {mall.location ?? "Kano, Nigeria"}
              </p>
              <p className="text-xs sm:text-sm text-purple-200/90 max-w-lg">
                Browse stores in this mall. Filter by category to find what you need, then select a store to view products.
              </p>
            </div>

            <div className="relative aspect-[16/9] md:aspect-[4/3] w-full max-w-md mx-auto md:ml-auto overflow-hidden rounded-xl">
              <Image
                src={mall.image}
                alt={mall.name}
                fill
                priority
                className="object-cover rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="container-wide py-10 space-y-8">
        <div className="space-y-4">
          <CategoryTabs
            tabs={categoryTabs}
            activeSlug={activeCategory}
            onChange={handleCategoryChange}
          />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#F2E7FC] p-4 sm:p-5 rounded-2xl border border-white/60 shadow-sm">
            <div className="flex items-center gap-3">
              <StoreIcon size={24} className="text-[#6D349F] shrink-0" />
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#6D349F] font-montserrat">
                  {filteredStores.length} Store{filteredStores.length !== 1 ? "s" : ""}
                </h2>
                <p className="text-xs text-[#8A79A5]">
                  {activeCategory === "all"
                    ? "Showing all stores in this mall"
                    : `Filtered by ${categories.find((c) => c.slug === activeCategory)?.name ?? activeCategory}`}
                </p>
              </div>
            </div>

            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex items-center rounded-xl bg-white p-1 border border-[#E4D1F7] shadow-2xs w-full md:w-auto"
            >
              <div className="flex items-center flex-1 px-3 py-1 gap-2">
                <Search size={16} className="text-[#8A79A5] shrink-0" />
                <input
                  type="text"
                  placeholder="Search stores..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full md:w-56 bg-transparent text-xs sm:text-sm text-[#411266] placeholder:text-[#C5B5DF] focus:outline-none font-medium"
                />
              </div>
              <button
                type="submit"
                className="rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold text-xs px-5 py-2 transition-all shadow-2xs active:scale-95 cursor-pointer shrink-0"
              >
                Search
              </button>
            </form>
          </div>
        </div>

        {filteredStores.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {filteredStores.map((store) => (
              <StoreCard key={store.id} store={store} />
            ))}
          </div>
        ) : (
          <div className="bg-[#F2E7FC] rounded-2xl p-10 text-center space-y-3 border border-white/60">
            <p className="text-base font-bold text-[#6D349F]">No stores found</p>
            <p className="text-xs text-[#8A79A5]">
              {searchQuery
                ? `No stores match "${searchQuery}" in this category.`
                : "There are no stores in this category for this mall yet."}
            </p>
            {(searchQuery || activeCategory !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  handleCategoryChange("all");
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-[#6D349F] text-white px-4 py-2 text-xs font-bold shadow-sm hover:bg-[#572783] transition-all cursor-pointer"
              >
                <RotateCcw size={14} />
                <span>Clear Filters</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
