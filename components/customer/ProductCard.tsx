"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";
import { useCartStore } from "@/lib/stores/cart-store";
import { toast } from "sonner";
import { Star } from "lucide-react";

export interface ProductCardProps {
  product: Product;
  aspectRatio?: string;
}

export function ProductCard({ product, aspectRatio = "aspect-square" }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    toast.success(`${product.name} added to cart!`);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    toast.success(`Processing purchase for ${product.name}!`);
  };

  return (
    <Link href={`/products/${product.id}`} className="flex flex-col gap-2.5 sm:gap-3 group w-full cursor-pointer">
      {/* Image container with rounded corners and category badge */}
      <div className={`relative w-full ${aspectRatio} rounded-[20px] sm:rounded-[32px] overflow-hidden bg-gray-100 shadow-sm border border-surface-light/40`}>
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-primary font-semibold text-xs sm:text-sm">
            No Image
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4 bg-white/90 backdrop-blur-md text-gray-700 text-[9px] sm:text-[10px] font-bold px-2 py-1 sm:px-3.5 sm:py-1.5 rounded-full shadow-sm max-w-[85%] truncate">
          {product.category}
        </div>
      </div>

      {/* Product Details */}
      <div className="flex flex-col gap-1 sm:gap-1.5 px-1">
        {/* Product Name */}
        <h3 className="text-sm sm:text-base md:text-lg font-bold text-primary-dark tracking-tight line-clamp-1 group-hover:text-primary transition-colors duration-300">
          {product.name}
        </h3>

        {/* Rating and Price row */}
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-0.5 sm:gap-1 min-w-0">
            <Star className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5 fill-yellow-400 text-yellow-400 border-none stroke-none flex-shrink-0" />
            <span className="text-[10px] sm:text-[12px] font-semibold text-gray-500 flex items-center gap-1 min-w-0">
              <span className="flex-shrink-0">{product.rating?.toFixed(1) || "5.0"}</span>
              <span className="text-gray-400 font-medium hidden sm:inline">(1.3k Reviews)</span>
            </span>
          </div>
          <span className="text-sm sm:text-base md:text-[19px] font-extrabold text-primary-dark flex-shrink-0">
            ${product.price.toFixed(2)}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2 mt-1.5 sm:mt-2">
          <button
            onClick={handleAddToCart}
            className="w-full sm:flex-1 bg-transparent hover:bg-primary border border-primary text-primary hover:text-white text-[10px] sm:text-xs font-bold py-1.5 sm:py-2.5 rounded-full transition-all duration-300 active:scale-95"
          >
            Add to Cart
          </button>
          <button
            onClick={handleBuyNow}
            className="w-full sm:flex-1 bg-primary hover:bg-primary-dark text-white text-[10px] sm:text-xs font-bold py-1.5 sm:py-2.5 rounded-full transition-all duration-300 shadow-sm hover:shadow active:scale-95"
          >
            Buy Now
          </button>
        </div>
      </div>
    </Link>
  );
}

export default ProductCard;
