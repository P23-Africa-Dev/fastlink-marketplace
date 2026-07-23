"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Star, ShoppingBag } from "lucide-react";
import { useState } from "react";

import type { Product } from "@/types/product";
import { useCartStore } from "@/store/cart-store";
import { cn, formatPrice, calculateDiscount } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  className?: string;
  priority?: boolean;
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
        "product-card-hover group relative flex flex-col overflow-hidden rounded bg-card",
        className,
      )}
    >
      {/* Image */}
      <Link href={`/products/${product.slug}`} className="relative block aspect-[3/4] overflow-hidden bg-muted">
        {!imageLoaded && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-muted to-muted/50" />
        )}
        {primaryImage && (
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt}
            fill
            priority={priority}
            className={cn(
              "object-cover transition-all duration-700 group-hover:scale-105",
              imageLoaded ? "opacity-100" : "opacity-0",
            )}
            onLoad={() => setImageLoaded(true)}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        )}

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.isNew && (
            <span className="rounded-none bg-foreground px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-background">
              New
            </span>
          )}
          {product.isBestseller && (
            <span className="rounded-none bg-primary px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-primary-foreground">
              Bestseller
            </span>
          )}
          {discount && (
            <span className="rounded-none bg-destructive px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-destructive-foreground">
              -{discount}%
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={(e) => {
            e.preventDefault();
            setIsWishlisted((prev) => !prev);
          }}
          className={cn(
            "absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition-all duration-300",
            "opacity-0 group-hover:opacity-100",
            isWishlisted
              ? "bg-primary text-primary-foreground"
              : "bg-background/60 text-foreground",
          )}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart size={14} fill={isWishlisted ? "currentColor" : "none"} />
        </button>

        {/* Quick add */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full bg-background/90 backdrop-blur-sm transition-transform duration-300 group-hover:translate-y-0">
          <button
            onClick={(e) => {
              e.preventDefault();
              addItem(product);
            }}
            className="flex w-full items-center justify-center gap-2 py-3 text-xs font-medium uppercase tracking-widest transition-colors hover:text-primary"
            disabled={product.stock === 0}
          >
            <ShoppingBag size={13} />
            {product.stock === 0 ? "Sold Out" : "Quick Add"}
          </button>
        </div>
      </Link>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
          {product.seller.name}
        </p>
        <Link
          href={`/products/${product.slug}`}
          className="font-display text-base font-light leading-tight text-foreground hover:text-primary"
        >
          {product.name}
        </Link>
        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-medium text-primary">{formatPrice(product.price)}</span>
            {product.compareAtPrice && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Star size={11} className="fill-primary text-primary" />
            <span className="text-xs text-muted-foreground">
              {product.rating} ({product.reviewCount})
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
