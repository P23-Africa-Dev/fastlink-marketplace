"use client";

import Link from "next/link";
import Image from "next/image";
import { Trash2, Heart, ShoppingBag, ArrowRight, ArrowLeft, Check, Store } from "lucide-react";
import { useState } from "react";

import { useWishlistStore } from "@/store/wishlist-store";
import { useCartStore } from "@/store/cart-store";
import { formatPrice, cn } from "@/lib/utils";
import { ShopProductCard } from "@/components/product/shop-product-card";
import { MOCK_PRODUCTS } from "@/mocks/data";

const RECOMMENDED = MOCK_PRODUCTS.filter((p) => p.isFeatured || p.isBestseller).slice(0, 4);

export default function WishlistPage() {
  const { items, removeItem, clearWishlist } = useWishlistStore();
  const { addItem } = useCartStore();
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});

  function handleMoveToCart(product: typeof MOCK_PRODUCTS[0]) {
    addItem(product, 1);
    setAddedItems((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [product.id]: false }));
    }, 2000);
  }

  if (items.length === 0) {
    return (
      <div className="bg-[#EADBF8] min-h-screen py-10 font-montserrat">
        <div className="container-narrow text-center py-12">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#F2E7FC] border border-white/80 shadow-xs">
            <Heart size={32} className="text-[#6D349F] fill-[#6D349F]/20" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#6D349F] mb-3 font-montserrat">
            Your Wishlist is Empty
          </h1>
          <p className="mb-8 text-sm text-[#8A79A5] font-medium max-w-md mx-auto">
            Save your favorite items here so you can easily find them later and add them to your shopping bag.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-xl bg-[#6D349F] hover:bg-[#52237A] text-white font-bold px-8 py-3.5 shadow-md transition-all duration-200"
          >
            <span>Explore Products</span>
            <ArrowRight size={16} />
          </Link>

          <div className="mt-16 text-left">
            <div className="border-b border-[#D8C2EF] pb-3 mb-6">
              <h2 className="text-lg font-bold text-[#6D349F] font-montserrat">
                Recommended For You
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {RECOMMENDED.map((p) => (
                <ShopProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#EADBF8] min-h-screen py-10 font-montserrat text-[#4A2574]">
      <div className="container-wide space-y-8">
        
        {/* Back Link & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D8C2EF] pb-5">
          <div>
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6D349F] hover:text-[#52237A] transition-colors mb-2"
            >
              <ArrowLeft size={14} />
              <span>Continue Shopping</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#6D349F] font-montserrat flex items-center gap-3">
              <span>My Wishlist</span>
              <span className="rounded-full bg-[#E4D1F7] px-3 py-1 text-xs font-bold text-[#6D349F]">
                {items.length} {items.length === 1 ? "item" : "items"}
              </span>
            </h1>
          </div>

          <button
            onClick={clearWishlist}
            className="text-xs font-bold text-[#8A79A5] transition-colors hover:text-red-600 underline self-start sm:self-auto cursor-pointer"
          >
            Clear all wishlist items
          </button>
        </div>

        {/* Wishlist Items Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(({ productId, product }) => {
            const isAdded = addedItems[product.id];
            return (
              <div
                key={productId}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl bg-[#F6EFFD] border border-white/60 shadow-xs hover:shadow-md transition-all duration-300 p-4 font-montserrat"
              >
                <div>
                  {/* Image & Remove button */}
                  <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-purple-100 mb-3">
                    <Image
                      src={product.images[0]?.url ?? ""}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <button
                      onClick={() => removeItem(productId)}
                      className="absolute top-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#8A79A5] hover:text-rose-600 hover:bg-white transition-all shadow-xs"
                      title="Remove from wishlist"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  {/* Details */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#8A79A5] uppercase tracking-wider">
                      <Store size={12} className="text-[#6D349F]" />
                      <span>{product.seller.name}</span>
                    </div>

                    <Link
                      href={`/products/${product.slug}`}
                      className="block font-bold text-base text-[#6D349F] hover:text-[#52237A] transition-colors line-clamp-1"
                    >
                      {product.name}
                    </Link>

                    <p className="text-lg font-extrabold text-[#6D349F] pt-1">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                </div>

                {/* Move to Bag Action */}
                <div className="pt-4 mt-3 border-t border-[#E4D1F7]/60">
                  <button
                    onClick={() => handleMoveToCart(product)}
                    disabled={product.stock === 0}
                    className={cn(
                      "flex w-full items-center justify-center gap-2 rounded-xl py-3 px-4 text-xs font-extrabold text-white shadow-xs transition-all cursor-pointer active:scale-[0.99]",
                      isAdded
                        ? "bg-emerald-600 hover:bg-emerald-600"
                        : "bg-[#6D349F] hover:bg-[#52237A]",
                      product.stock === 0 && "opacity-50 cursor-not-allowed bg-slate-400",
                    )}
                  >
                    {isAdded ? (
                      <>
                        <Check size={15} strokeWidth={3} />
                        <span>Added to Bag</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={15} />
                        <span>{product.stock === 0 ? "Out of Stock" : "Add to Bag"}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recommended Items at the bottom */}
        {items.length > 0 && (
          <div className="pt-10 border-t border-[#D8C2EF]">
            <h2 className="text-xl font-extrabold text-[#6D349F] font-montserrat mb-6">
              You Might Also Like
            </h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {RECOMMENDED.map((p) => (
                <ShopProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
