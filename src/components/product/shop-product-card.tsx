"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, CheckCircle, Store, Heart } from "lucide-react";
import { useState } from "react";

import type { Product } from "@/types/product";
import { useCartStore } from "@/store/cart-store";
import { useWishlist } from "@/hooks/use-wishlist";
import { cn, formatPrice } from "@/lib/utils";

interface ShopProductCardProps {
  product: Product;
  priority?: boolean;
}

function getDeliveryType(product: Product): "local" | "nationwide" {
  const sum = product.slug.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return sum % 2 === 0 ? "local" : "nationwide";
}

function getDeliveryLabel(product: Product): string {
  const type = getDeliveryType(product);
  if (type === "local") return "Delivered Today";
  const days = (product.slug.charCodeAt(0) % 3) + 2;
  return `${days}-${days + 1} Days`;
}

function formatNaira(price: number): string {
  return `N${(price * 1500).toLocaleString("en-NG")}`;
}

export function ShopProductCard({ product, priority = false }: ShopProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const { addItem } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const primaryImage = product.images.find((img) => img.isPrimary) ?? product.images[0];
  const deliveryType = getDeliveryType(product);
  const deliveryLabel = getDeliveryLabel(product);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-[#F6EFFD] shadow-sm border border-white/60 hover:shadow-md transition-all duration-300 hover:-translate-y-1 font-montserrat">
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
              "object-cover transition-transform duration-500 group-hover:scale-105",
              imageLoaded ? "opacity-100" : "opacity-0",
            )}
            onLoad={() => setImageLoaded(true)}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        )}

        {/* Badges container — stacked vertically on top-left */}
        <div className="absolute left-2.5 top-2.5 flex flex-col items-start gap-1.5 z-10">
          <span
            className={cn(
              "rounded-lg px-2.5 py-1 text-[10px] font-bold text-white shadow-xs",
              deliveryType === "local" ? "bg-[#2a9d8f]" : "bg-[#7E37C9]",
            )}
          >
            {deliveryType === "local" ? "Local Delivery" : "Ships Nationwide"}
          </span>
        </div>

        {/* Wishlist toggle button — top-right */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className="absolute right-2.5 top-2.5 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-[#6D349F] hover:bg-white shadow-xs transition-transform active:scale-90"
          title="Save to wishlist"
        >
          <Heart size={14} fill={isInWishlist(product.id) ? "#6D349F" : "none"} />
        </button>
      </Link>

      {/* Product Info */}
      <div className="flex flex-1 flex-col justify-between gap-2.5 p-4">
         <span className="flex items-center gap-1 rounded-lg bg-[#3B1C5A]/80 backdrop-blur-md px-2 py-1 shadow-xs max-w-[130px]">
            <Store size={10} className="text-purple-200 shrink-0" />
            <span className="text-[9px] font-bold text-white leading-none truncate">
              {product.seller.name}
            </span>
          </span>
        <div className="space-y-1.5">
          <Link
            href={`/products/${product.slug}`}
            className="text-sm font-bold text-[#6D349F] leading-snug line-clamp-1 group-hover:text-[#52237A] transition-colors font-montserrat"
          >
            {product.name}
          </Link>

          {/* Delivery info */}
          <div className="flex items-center gap-1.5">
            <CheckCircle size={13} className="text-[#2a9d8f] shrink-0" fill="#2a9d8f" strokeWidth={0} />
            <span className="text-[11px] font-medium text-[#8A79A5]">{deliveryLabel}</span>
          </div>
        </div>

        {/* Price & Add to Cart */}
        <div className="space-y-2.5 pt-1">
          <p className="text-base font-extrabold text-[#6D349F] font-montserrat">
            {formatPrice(product.price)}
          </p>

          <button
            onClick={() => addItem(product)}
            disabled={product.stock === 0}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#7E37C9] hover:bg-[#6C2CB5] active:scale-95 py-2.5 text-xs font-bold text-white transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart size={13} />
            <span>{product.stock === 0 ? "Out of Stock" : "Add to Cart"}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
