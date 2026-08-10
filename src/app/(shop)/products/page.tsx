"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { LayoutGrid, List, ChevronDown, SlidersHorizontal, X, BookOpen } from "lucide-react";
import groupsImg from "@/assets/Groups.png";

import type { ProductFilter } from "@/types/product";
import { ShopProductCard } from "@/components/product/shop-product-card";
import { ProductFilters } from "@/components/product/product-filters";
import { useProducts } from "@/hooks/use-products";
import { useUIStore } from "@/store/ui-store";
import { cn } from "@/lib/utils";
import { DynamicHero } from "@/components/marketplace/dynamic-hero";

// ── Category-specific hero content ─────────────────────────────

const CATEGORY_HERO: Record<
  string,
  { title: string; subtitle: string; bg: string; images?: string[]; singleImage?: any; buttons?: { label: string; icon: React.ReactNode }[] }
> = {
  Fashion: {
    title: "Home of Fashion",
    subtitle: "Fester access and easiest way to shop E & bay in",
    bg: "bg-[#8A56AC]",
    singleImage: groupsImg,
    buttons: [
      { label: "Write Subea", icon: <LayoutGrid size={16} /> },
      { label: "35 Days", icon: <BookOpen size={16} /> },
    ],
  },
  Electronics: {
    title: "Your Tech Universe",
    subtitle: "Latest gadgets and electronics delivered to your door",
    bg: "from-[#1d4ed8] to-[#7c3aed]",
    images: [
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=320&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=220&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=220&auto=format&fit=crop",
    ],
  },
  "Home & Kitchen": {
    title: "Home Living Made Easy",
    subtitle: "Premium home essentials at the best prices nationwide",
    bg: "from-[#047857] to-[#0d9488]",
    images: [
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=320&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=220&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=220&auto=format&fit=crop",
    ],
  },
  Stationery: {
    title: "Write Your Story",
    subtitle: "Premium stationery and journals for every occasion",
    bg: "from-[#92400e] to-[#d97706]",
    images: [
      "https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=320&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?w=220&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1456735190827-3f19344be0df?w=220&auto=format&fit=crop",
    ],
  },
  "Art & Prints": {
    title: "Art for Everyone",
    subtitle: "Discover unique prints and original artworks from local artists",
    bg: "from-[#be185d] to-[#9333ea]",
    images: [
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=320&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1578926375605-eaf7559b1458?w=220&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1461344577544-4e5dc9487184?w=220&auto=format&fit=crop",
    ],
  },
  Jewelry: {
    title: "Shine Bright",
    subtitle: "Exquisite jewelry crafted for every style and occasion",
    bg: "from-[#b45309] to-[#d97706]",
    images: [
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=320&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=220&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=220&auto=format&fit=crop",
    ],
  },
};

const DEFAULT_HERO = {
  title: "Featured Products",
  subtitle: "Discover featured and recently added products from verified local and nationwide sellers",
  bg: "from-[#7c3aed] to-[#4f46e5]",
  images: [
    "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=320&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=220&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=220&auto=format&fit=crop",
  ],
};

const SORT_OPTIONS = [
  { value: "bestseller", label: "Best Selling" },
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

// ── Inner page (needs useSearchParams) ────────────────────────

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isFilterOpen, openFilters, closeFilters } = useUIStore();

  const categoryParam = searchParams.get("category") ?? undefined;
  const featuredParam = searchParams.get("featured");
  const showFeatured = featuredParam === "true" || (!categoryParam && featuredParam !== "false");

  const [filters, setFilters] = useState<ProductFilter>({
    category: categoryParam,
    featured: showFeatured ? true : undefined,
    sortBy: showFeatured && !categoryParam ? "newest" : undefined,
  });
  const [page, setPage] = useState(1);
  const [view, setView] = useState<"grid" | "list">("grid");

  useEffect(() => {
    const showFeatured = featuredParam === "true" || (!categoryParam && featuredParam !== "false");
    setFilters({
      category: categoryParam,
      featured: showFeatured ? true : undefined,
      sortBy: showFeatured && !categoryParam ? "newest" : undefined,
    });
    setPage(1);
  }, [categoryParam, featuredParam]);

  const { data, isLoading } = useProducts(filters, page);
  const products = data?.data ?? [];
  const total = data?.total ?? 0;

  const hero = CATEGORY_HERO[filters.category ?? ""] ?? DEFAULT_HERO;

  function handleFiltersChange(next: ProductFilter) {
    setFilters(next);
    setPage(1);
    if (next.category !== filters.category) {
      const params = new URLSearchParams(searchParams.toString());
      if (next.category) {
        params.set("category", next.category);
      } else {
        params.delete("category");
      }
      router.push(`/products?${params.toString()}`);
    }
  }

  return (
    <div className="min-h-screen bg-[#EADBF8] font-montserrat">

      {/* ── Hero Banner ────────────────────────────────────────── */}
      <DynamicHero
        title={hero.title}
        subtitle={hero.subtitle}
        backgroundImage={products[0]?.image || hero.images?.[0] || hero.singleImage || "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600&auto=format&fit=crop"}
        backLink="/"
        backLabel="Back to Homepage"
      >
        {hero.buttons ? (
          <div className="mt-4 flex items-center bg-[#f3eafb] rounded-[10px] w-fit shadow-sm">
            <button className="flex items-center gap-2 px-5 py-3 text-sm font-semibold text-[#7a3dbf] hover:bg-white/50 transition-colors rounded-l-[10px]">
              {hero.buttons[0].icon}
              {hero.buttons[0].label}
            </button>
            <div className="w-[1px] h-5 bg-[#7a3dbf]/20"></div>
            <button className="flex items-center gap-2 px-5 py-3 text-sm font-semibold text-[#7a3dbf] hover:bg-white/50 transition-colors rounded-r-[10px]">
              {hero.buttons[1].icon}
              {hero.buttons[1].label}
            </button>
          </div>
        ) : (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button className="flex items-center gap-2 rounded-xl bg-white/20 px-5 py-2.5 text-sm font-bold text-white backdrop-blur-md hover:bg-white/30 transition-colors border border-white/30 shadow-sm">
              <LayoutGrid size={15} />
              Browse Collection
            </button>
            <button className="flex items-center gap-2 rounded-xl bg-white/10 px-5 py-2.5 text-sm font-bold text-white backdrop-blur-md hover:bg-white/20 transition-colors border border-white/20 shadow-sm">
              <span className="text-base">📦</span>
              Free Returns
            </button>
          </div>
        )}
      </DynamicHero>

      {/* ── Main Layout ────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 font-montserrat">
        <div className="flex gap-6 items-start">

          {/* Sidebar — desktop */}
          <aside className="hidden w-60 flex-shrink-0 lg:block">
            <div className="rounded-2xl bg-[#F6EFFD] p-4 shadow-xs border border-white/80">
              <ProductFilters filters={filters} onFiltersChange={handleFiltersChange} />
            </div>
          </aside>

          {/* Content */}
          <div className="flex-1 min-w-0">

            {/* Content header */}
            <div className="mb-4 flex items-center justify-between rounded-2xl bg-[#F6EFFD] px-5 py-3.5 shadow-xs border border-white/80">
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-extrabold text-[#6D349F]">
                  {filters.category ?? (filters.featured ? "Featured Products" : "All Products")}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-[#8A79A5]">
                  - Local &amp; Nationwide
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Mobile filter toggle */}
                <button
                  onClick={openFilters}
                  className="flex items-center gap-1.5 rounded-xl border border-purple-200 bg-white px-3 py-1.5 text-xs font-bold text-[#6D349F] hover:bg-[#6D349F] hover:text-white transition-colors lg:hidden"
                >
                  <SlidersHorizontal size={13} />
                  Filters
                </button>

                {/* Sort dropdown */}
                <div className="relative flex items-center gap-2">
                  <span className="text-xs text-[#8A79A5] font-semibold hidden sm:block">Sort by:</span>
                  <div className="relative">
                    <select
                      value={filters.sortBy ?? ""}
                      onChange={(e) =>
                        handleFiltersChange({
                          ...filters,
                          sortBy: (e.target.value as ProductFilter["sortBy"]) || undefined,
                        })
                      }
                      className="appearance-none rounded-xl bg-white border border-purple-200 py-1.5 pl-3 pr-8 text-xs font-bold text-[#6D349F] focus:outline-none focus:ring-2 focus:ring-[#6D349F]/30 cursor-pointer shadow-2xs"
                    >
                      {SORT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={12} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6D349F]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile filters drawer */}
            {isFilterOpen && (
              <div className="fixed inset-0 z-50 lg:hidden">
                <div className="absolute inset-0 bg-black/50" onClick={closeFilters} />
                <div className="absolute inset-y-0 left-0 w-72 overflow-y-auto bg-white p-5 shadow-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-bold text-slate-800">Filters</span>
                    <button onClick={closeFilters} className="text-slate-400 hover:text-slate-600">
                      <X size={18} />
                    </button>
                  </div>
                  <ProductFilters filters={filters} onFiltersChange={handleFiltersChange} />
                </div>
              </div>
            )}

            {/* Product grid */}
            {isLoading ? (
              <div
                className={cn(
                  "grid gap-4",
                  view === "list"
                    ? "grid-cols-1 sm:grid-cols-2"
                    : "grid-cols-2 sm:grid-cols-2 md:grid-cols-3",
                )}
              >
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="aspect-square animate-pulse rounded-xl bg-white/80 shadow-sm" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-20 text-center shadow-sm border border-[#e8d5fa]">
                <span className="text-5xl mb-4">🛍️</span>
                <p className="text-lg font-bold text-slate-700">No products found</p>
                <p className="text-sm text-slate-400 mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              <div
                className={cn(
                  "grid gap-4",
                  view === "list"
                    ? "grid-cols-1 sm:grid-cols-2"
                    : "grid-cols-2 sm:grid-cols-2 md:grid-cols-3",
                )}
              >
                {products.map((product, i) => (
                  <ShopProductCard key={product.id} product={product} priority={i < 3} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {data && data.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!data.hasPrevPage}
                  className="rounded-lg border border-[#e8d5fa] bg-white px-5 py-2 text-xs font-bold text-slate-600 hover:border-[#7a3dbf] hover:text-[#7a3dbf] transition-colors disabled:opacity-40"
                >
                  Prev
                </button>
                <span className="px-4 text-sm font-semibold text-slate-500">
                  {page} / {data.totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!data.hasNextPage}
                  className="rounded-lg border border-[#e8d5fa] bg-white px-5 py-2 text-xs font-bold text-slate-600 hover:border-[#7a3dbf] hover:text-[#7a3dbf] transition-colors disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page export (Suspense wrapper for useSearchParams) ─────────

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f0ebff] animate-pulse">
          <div className="h-52 w-full bg-[#9333ea]/30 rounded-b-2xl" />
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
