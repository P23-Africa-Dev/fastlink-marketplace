"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Star, ShoppingBag, Store } from "lucide-react";
import { useState } from "react";

import type { Product } from "@/types/product";
import { useCartStore } from "@/store/cart-store";
import { cn, calculateDiscount } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  className?: string;
  priority?: boolean;
}

function formatNaira(price: number): string {
  return `N${(price * 1500).toLocaleString("en-NG")}`;
}

export function ProductCard({ product, className, priority = false }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { addItem } = useCartStore();

  const primaryImage = product.images.find((img) => img.isPrimary) ?? product.images[0];
  const discount = product.compareAtPrice
    ? calculateDiscount(product.price, product.compareAtPrice)
    : null;

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl bg-[#F6EFFD] shadow-sm border border-white/60 hover:shadow-md transition-all duration-300 hover:-translate-y-1 font-montserrat",
        className,
      )}
    >
      {/* Image Container */}
      <Link href={`/products/${product.slug}`} className="relative block aspect-square overflow-hidden bg-purple-100">
        {!imageLoaded && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-purple-100 to-purple-200" />
        )}
        {primaryImage && (
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt}
            fill
            priority={priority}
            className={cn(
              "object-cover transition-all duration-500 group-hover:scale-105",
              imageLoaded ? "opacity-100" : "opacity-0",
            )}
            onLoad={() => setImageLoaded(true)}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        )}

        {/* Badges */}
        <div className="absolute left-2.5 top-2.5 flex flex-col gap-1">
          {product.isNew && (
            <span className="rounded-lg bg-[#6D349F] px-2.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
              New
            </span>
          )}
          {product.isBestseller && (
            <span className="rounded-lg bg-[#7E37C9] px-2.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
              Bestseller
            </span>
          )}
          {discount && (
            <span className="rounded-lg bg-rose-600 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
              -{discount}%
            </span>
          )}
        </div>

        {/* Seller badge — top right */}
        <span className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-lg bg-[#3B1C5A]/80 backdrop-blur-md px-2 py-1 shadow-xs max-w-[100px]">
          <Store size={10} className="text-purple-200 shrink-0" />
          <span className="text-[9px] font-bold text-white leading-none truncate">
            {product.seller.name}
          </span>
        </span>

        {/* Wishlist */}
        <button
          onClick={(e) => {
            e.preventDefault();
            setIsWishlisted((prev) => !prev);
          }}
          className={cn(
            "absolute right-2.5 bottom-2.5 flex h-7 w-7 items-center justify-center rounded-full backdrop-blur-md transition-all duration-300 shadow-xs",
            "opacity-0 group-hover:opacity-100",
            isWishlisted
              ? "bg-[#6D349F] text-white"
              : "bg-white/80 text-[#6D349F] hover:bg-white",
          )}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart size={13} fill={isWishlisted ? "currentColor" : "none"} />
        </button>
      </Link>

      {/* Info */}
      <div className="flex flex-1 flex-col justify-between gap-2.5 p-4">
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A79A5]">
            {product.seller.name}
          </p>
          <Link
            href={`/products/${product.slug}`}
            className="text-sm font-bold text-[#6D349F] leading-snug line-clamp-1 group-hover:text-[#52237A] transition-colors font-montserrat"
          >
            {product.name}
          </Link>
        </div>

        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-extrabold text-[#6D349F] font-montserrat">
                {formatNaira(product.price)}
              </span>
              {product.compareAtPrice && (
                <span className="text-xs text-[#8A79A5] line-through font-medium">
                  {formatNaira(product.compareAtPrice)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <Star size={11} className="fill-amber-400 text-amber-400" />
              <span className="text-xs font-bold text-[#6D349F]">
                {product.rating}
              </span>
            </div>
          </div>

          <button
            onClick={() => addItem(product)}
            disabled={product.stock === 0}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#7E37C9] hover:bg-[#6C2CB5] active:scale-95 py-2.5 text-xs font-bold text-white transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingBag size={13} />
            <span>{product.stock === 0 ? "Out of Stock" : "Add to Cart"}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
