"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, CheckCircle, Store } from "lucide-react";
import { useState } from "react";

import type { Product } from "@/types/product";
import { useCartStore } from "@/store/cart-store";
import { cn } from "@/lib/utils";

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

  const primaryImage = product.images.find((img) => img.isPrimary) ?? product.images[0];
  const deliveryType = getDeliveryType(product);
  const deliveryLabel = getDeliveryLabel(product);

  return (
    <article className="flex flex-col overflow-hidden rounded-xl bg-white shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-200">
      {/* Image */}
      <Link href={`/products/${product.slug}`} className="relative block aspect-square overflow-hidden bg-slate-100">
        {!imageLoaded && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-slate-100 to-slate-200" />
        )}
        {primaryImage && (
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt}
            fill
            priority={priority}
            className={cn(
              "object-cover transition-transform duration-500 hover:scale-105",
              imageLoaded ? "opacity-100" : "opacity-0",
            )}
            onLoad={() => setImageLoaded(true)}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        )}

        {/* Delivery badge — top left */}
        <span
          className={cn(
            "absolute left-2.5 top-2.5 rounded-md px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm",
            deliveryType === "local" ? "bg-[#2a9d8f]" : "bg-[#7a5af8]",
          )}
        >
          {deliveryType === "local" ? "Local Delivery" : "Ships Nationwide"}
        </span>

        {/* Seller badge — top right */}
        <span className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-md bg-black/50 px-2 py-1 backdrop-blur-sm">
          <Store size={9} className="text-white" />
          <span className="text-[9px] font-semibold text-white leading-none truncate max-w-[70px]">
            {product.seller.name}
          </span>
        </span>
      </Link>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-2 p-3">
        <Link
          href={`/products/${product.slug}`}
          className="text-sm font-bold text-slate-800 leading-snug line-clamp-2 hover:text-[#7a3dbf] transition-colors"
        >
          {product.name}
        </Link>

        {/* Delivery info */}
        <div className="flex items-center gap-1.5">
          <CheckCircle size={13} className="text-[#2a9d8f] shrink-0" fill="#2a9d8f" strokeWidth={0} />
          <span className="text-[11px] font-medium text-slate-500">{deliveryLabel}</span>
        </div>

        {/* Price */}
        <p className="text-base font-extrabold text-slate-900 mt-auto">
          {formatNaira(product.price)}
        </p>

        {/* Add to cart */}
        <button
          onClick={() => addItem(product)}
          disabled={product.stock === 0}
          className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-[#7a3dbf] py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#682fad] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ShoppingCart size={13} />
          {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </article>
  );
}
