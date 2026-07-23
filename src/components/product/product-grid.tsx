"use client";

import type { Product } from "@/types/product";
import { cn } from "@/lib/utils";

import { ProductCard } from "./product-card";

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  className?: string;
}

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded bg-card">
      <div className="aspect-[3/4] animate-pulse bg-muted" />
      <div className="space-y-2 p-3">
        <div className="h-2.5 w-20 animate-pulse rounded bg-muted" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-3.5 w-16 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

export function ProductGrid({ products, isLoading = false, className }: ProductGridProps) {
  if (isLoading) {
    return (
      <div
        className={cn(
          "grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4",
          className,
        )}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
        <p className="font-display text-2xl font-light text-muted-foreground">No products found</p>
        <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4",
        className,
      )}
    >
      {products.map((product, i) => (
        <ProductCard
          key={product.id}
          product={product}
          priority={i < 4}
          className={cn(
            "animate-on-load opacity-0",
            i === 0 && "stagger-1",
            i === 1 && "stagger-2",
            i === 2 && "stagger-3",
            i === 3 && "stagger-4",
          )}
        />
      ))}
    </div>
  );
}
