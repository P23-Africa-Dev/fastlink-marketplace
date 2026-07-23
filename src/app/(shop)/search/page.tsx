"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";

import { useProductSearch } from "@/hooks/use-products";
import { useDebounce } from "@/hooks/use-debounce";
import { ProductGrid } from "@/components/product/product-grid";

const POPULAR_SEARCHES = ["ceramic", "linen", "leather", "brass", "candle", "wool"];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 350);

  const { data, isLoading } = useProductSearch(debouncedQuery);
  const results = data?.data ?? [];

  return (
    <div className="container-wide py-10">
      {/* Search bar */}
      <div className="mx-auto mb-12 max-w-2xl">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for handcrafted goods…"
            autoFocus
            className="w-full rounded-none border-b-2 border-border bg-transparent py-4 pl-12 pr-10 text-lg text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {!query && (
          <div className="mt-8 text-center">
            <p className="mb-4 text-xs uppercase tracking-widest text-muted-foreground">
              Popular Searches
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {POPULAR_SEARCHES.map((term) => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="rounded-full border border-border px-4 py-1.5 text-sm text-muted-foreground transition-all hover:border-primary hover:text-primary"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {debouncedQuery.length >= 2 && (
        <div>
          {!isLoading && (
            <p className="mb-6 text-sm text-muted-foreground">
              {results.length > 0
                ? `${results.length} result${results.length !== 1 ? "s" : ""} for "${debouncedQuery}"`
                : `No results for "${debouncedQuery}"`}
            </p>
          )}
          <ProductGrid products={results} isLoading={isLoading} />
        </div>
      )}
    </div>
  );
}
