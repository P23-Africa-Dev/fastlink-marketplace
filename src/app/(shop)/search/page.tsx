"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, X, Sparkles } from "lucide-react";

import { useProductSearch } from "@/hooks/use-products";
import { useDebounce } from "@/hooks/use-debounce";
import { ProductGrid } from "@/components/product/product-grid";

const POPULAR_SEARCHES = [
  "Electronics",
  "Samsung",
  "Sneakers",
  "Groceries",
  "Gaming",
  "Smart TV",
  "Fashion",
  "Beauty",
];

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  const { data, isLoading } = useProductSearch(debouncedQuery);
  const results = data?.data ?? [];

  return (
    <div className="min-h-screen bg-[#EADBF8] font-montserrat py-10">
      <div className="container-wide">
        {/* Search header & input */}
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#6D349F] mb-3">
            Search Marketplace
          </h1>
          <p className="text-sm text-[#8A79A5] mb-6">
            Find items across local stores, verified merchants, and nationwide brands.
          </p>

          <div className="relative flex items-center">
            <Search
              size={20}
              className="absolute left-5 text-[#6D349F] pointer-events-none"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products, brands, or stores..."
              autoFocus
              className="w-full h-14 pl-14 pr-12 rounded-2xl bg-white text-gray-900 placeholder:text-gray-400 text-sm sm:text-base shadow-md border border-purple-200 focus:outline-none focus:ring-4 focus:ring-purple-300/50 transition-all font-medium"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-4 flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-[#6D349F] hover:bg-purple-200 transition-colors"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Popular searches */}
          <div className="mt-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#8A79A5] flex items-center justify-center gap-1.5">
              <Sparkles size={14} className="text-[#7E37C9]" /> Popular Searches
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {POPULAR_SEARCHES.map((term) => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                    query.toLowerCase() === term.toLowerCase()
                      ? "bg-[#6D349F] text-white shadow-sm"
                      : "bg-[#F6EFFD] text-[#6D349F] hover:bg-white border border-purple-200/80"
                  }`}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results section */}
        <div className="max-w-6xl mx-auto">
          {debouncedQuery.trim() !== "" && (
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm font-semibold text-[#6D349F]">
                {!isLoading && (
                  <>
                    {results.length > 0
                      ? `Found ${results.length} product${results.length !== 1 ? "s" : ""} for "${debouncedQuery}"`
                      : `No products found for "${debouncedQuery}"`}
                  </>
                )}
              </p>
            </div>
          )}

          <ProductGrid products={results} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#EADBF8] font-montserrat py-12 flex justify-center items-center">
        <p className="text-[#6D349F] font-bold">Loading Search...</p>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
