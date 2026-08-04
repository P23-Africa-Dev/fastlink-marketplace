"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Heart, Star, Check, Truck, RotateCcw, Shield, Store, ChevronRight } from "lucide-react";

import { useProduct } from "@/hooks/use-products";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";
import { formatPrice, cn, pluralize } from "@/lib/utils";
import { ShopProductCard } from "@/components/product/shop-product-card";
import { MOCK_PRODUCTS } from "@/mocks/data";

interface ProductDetailPageProps {
  params: { id: string };
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { data, isLoading, isError } = useProduct(params.id);
  const { addItem } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [addedToCart, setAddedToCart] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#EADBF8] py-10 font-montserrat">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-3">
              <div className="aspect-[4/3] sm:aspect-square animate-pulse rounded-2xl bg-white/50" />
              <div className="flex gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 w-20 animate-pulse rounded-xl bg-white/50" />
                ))}
              </div>
            </div>
            <div className="space-y-4 pt-4">
              <div className="h-5 w-32 animate-pulse rounded-full bg-white/50" />
              <div className="h-10 w-3/4 animate-pulse rounded-xl bg-white/50" />
              <div className="h-8 w-28 animate-pulse rounded-xl bg-white/50" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="min-h-screen bg-[#EADBF8] font-montserrat flex flex-col items-center justify-center gap-4 py-16 text-center px-4">
        <div className="rounded-3xl bg-[#F6EFFD] p-8 shadow-sm max-w-md w-full border border-white/80">
          <p className="text-2xl font-extrabold text-[#6D349F]">Product Not Found</p>
          <p className="mt-2 text-sm text-[#8A79A5]">The item you are looking for does not exist or has been removed.</p>
          <Link
            href="/products"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[#6D349F] px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-[#52237A] transition-all"
          >
            Browse All Products
          </Link>
        </div>
      </div>
    );
  }

  const product = data.data;
  const related = MOCK_PRODUCTS.filter(
    (p) => p.id !== product.id && p.category === product.category,
  ).slice(0, 4);

  function handleAddToCart() {
    addItem(product, 1, {
      size: selectedSize ?? undefined,
      color: selectedColor ?? undefined,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  }

  return (
    <div className="min-h-screen bg-[#EADBF8] py-8 md:py-12 font-montserrat text-[#4A2574]">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-xs font-semibold text-[#8A79A5] flex-wrap">
          <Link href="/" className="hover:text-[#6D349F] transition-colors">
            Home
          </Link>
          <ChevronRight size={12} className="text-[#8A79A5]" />
          <Link href="/products" className="hover:text-[#6D349F] transition-colors">
            Products
          </Link>
          <ChevronRight size={12} className="text-[#8A79A5]" />
          <Link
            href={`/products?category=${encodeURIComponent(product.category)}`}
            className="hover:text-[#6D349F] transition-colors"
          >
            {product.category}
          </Link>
          <ChevronRight size={12} className="text-[#8A79A5]" />
          <span className="text-[#6D349F] font-bold truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* Product Card Container */}
        <div className="rounded-3xl bg-[#F6EFFD] p-6 md:p-10 shadow-sm border border-white/80">
          <div className="grid gap-8 md:grid-cols-2 md:gap-12 items-start">
            
            {/* Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-square sm:aspect-[4/3] md:aspect-square w-full overflow-hidden rounded-2xl bg-white/80 shadow-xs border border-purple-100">
                <Image
                  src={product.images[selectedImage]?.url ?? ""}
                  alt={product.images[selectedImage]?.alt ?? product.name}
                  fill
                  priority
                  className="object-cover transition-opacity duration-300"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                {product.isNew && (
                  <span className="absolute left-4 top-4 rounded-full bg-[#6D349F] px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white shadow-md">
                    New Arrival
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {product.images.map((img, i) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImage(i)}
                      className={cn(
                        "relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-white border-2 transition-all cursor-pointer",
                        selectedImage === i
                          ? "border-[#6D349F] ring-2 ring-[#6D349F]/30"
                          : "border-transparent opacity-70 hover:opacity-100",
                      )}
                    >
                      <Image src={img.url} alt={img.alt} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="flex flex-col gap-5">
              
              {/* Store & Title */}
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1 text-xs font-bold text-[#6D349F] border border-purple-200/80 shadow-2xs mb-3">
                  <Store size={13} className="text-[#6D349F]" />
                  <span>{product.seller.name}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight text-[#6D349F]">
                  {product.name}
                </h1>
              </div>

              {/* Rating & Badge */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1.5 bg-white/80 px-3 py-1 rounded-lg border border-purple-100">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={cn(
                          i < Math.floor(product.rating)
                            ? "fill-[#fbb321] text-[#fbb321]"
                            : "fill-none text-slate-300",
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-[#6D349F] ml-1">
                    {product.rating}
                  </span>
                  <span className="text-xs font-medium text-[#8A79A5]">
                    ({product.reviewCount} {pluralize(product.reviewCount, "review")})
                  </span>
                </div>

                <span className="inline-flex items-center gap-1 rounded-md bg-[#53a69a]/15 px-2.5 py-1 text-xs font-bold text-[#2d776c]">
                  <Check size={12} strokeWidth={3} />
                  Verified Vendor
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 pt-1">
                <span className="text-3xl sm:text-4xl font-extrabold text-[#6D349F]">
                  {formatPrice(product.price)}
                </span>
                {product.compareAtPrice && (
                  <span className="text-lg font-semibold text-[#8A79A5] line-through">
                    {formatPrice(product.compareAtPrice)}
                  </span>
                )}
              </div>

              <div className="h-[1px] w-full bg-purple-200/60" />

              <p className="text-sm leading-relaxed text-[#594970] font-medium">
                {product.description}
              </p>

              {/* Variants - Colors */}
              {product.variants?.colors && (
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#6D349F]">
                    Colour: <span className="text-[#4A2574] font-semibold">{selectedColor ?? "Select"}</span>
                  </span>
                  <div className="flex flex-wrap gap-2.5">
                    {product.variants.colors.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedColor(v.value)}
                        className={cn(
                          "rounded-xl border-2 px-4 py-1.5 text-xs font-bold transition-all cursor-pointer",
                          selectedColor === v.value
                            ? "border-[#6D349F] bg-[#6D349F] text-white shadow-xs"
                            : "border-purple-200 bg-white text-[#6D349F] hover:border-[#6D349F]",
                        )}
                      >
                        {v.value}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Variants - Sizes */}
              {product.variants?.sizes && (
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#6D349F]">
                    Size: <span className="text-[#4A2574] font-semibold">{selectedSize ?? "Select"}</span>
                  </span>
                  <div className="flex flex-wrap gap-2.5">
                    {product.variants.sizes.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedSize(v.value)}
                        disabled={v.stock === 0}
                        className={cn(
                          "h-10 min-w-[2.75rem] rounded-xl border-2 px-3 text-xs font-bold transition-all cursor-pointer",
                          selectedSize === v.value
                            ? "border-[#6D349F] bg-[#6D349F] text-white shadow-xs"
                            : "border-purple-200 bg-white text-[#6D349F] hover:border-[#6D349F]",
                          v.stock === 0 && "cursor-not-allowed opacity-40 bg-slate-100 border-slate-200 text-slate-400",
                        )}
                      >
                        {v.value}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Stock status */}
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "h-2.5 w-2.5 rounded-full",
                    product.stock > 0 ? "bg-emerald-500 animate-pulse" : "bg-rose-500",
                  )}
                />
                <span className="text-xs font-bold text-[#6D349F]">
                  {product.stock > 10
                    ? "In Stock & Ready to Ship"
                    : product.stock > 0
                    ? `Only ${product.stock} left in stock`
                    : "Out of Stock"}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2.5 rounded-xl bg-[#6D349F] py-3.5 px-6 text-sm font-extrabold text-white shadow-md hover:bg-[#52237A] transition-all cursor-pointer active:scale-[0.99]",
                    addedToCart && "bg-emerald-600 hover:bg-emerald-600",
                  )}
                >
                  {addedToCart ? (
                    <>
                      <Check size={16} strokeWidth={3} />
                      <span>Added to Bag</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={16} />
                      <span>{product.stock === 0 ? "Sold Out" : "Add to Bag"}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => toggleWishlist(product)}
                  className={cn(
                    "flex items-center justify-center rounded-xl border-2 border-purple-200 bg-white px-4 text-[#6D349F] hover:border-[#6D349F] transition-all cursor-pointer",
                    isInWishlist(product.id) && "border-[#6D349F] bg-purple-100/50 text-[#6D349F]",
                  )}
                  aria-label="Wishlist"
                >
                  <Heart size={18} fill={isInWishlist(product.id) ? "#6D349F" : "none"} />
                </button>
              </div>

              {/* Trust signals */}
              <div className="grid grid-cols-3 gap-3 rounded-2xl bg-white/70 p-4 border border-purple-100/80 mt-2">
                {[
                  { icon: Truck, label: "Fast Shipping", sub: "Local & Nationwide" },
                  { icon: RotateCcw, label: "Easy Returns", sub: "Buyer Protection" },
                  { icon: Shield, label: "Verified Maker", sub: "Quality Assured" },
                ].map(({ icon: Icon, label, sub }) => (
                  <div key={label} className="flex flex-col items-center gap-1 text-center">
                    <Icon size={18} className="text-[#6D349F]" />
                    <span className="text-xs font-bold text-[#6D349F] mt-1">{label}</span>
                    <span className="text-[10px] font-semibold text-[#8A79A5]">{sub}</span>
                  </div>
                ))}
              </div>

            </div>
          </div>

          {/* Description Section */}
          {product.longDescription && (
            <div className="mt-12 border-t border-purple-200/60 pt-8">
              <h2 className="text-xl font-extrabold text-[#6D349F] mb-4">
                Product Details
              </h2>
              <div className="rounded-2xl bg-white/60 p-6 border border-purple-100/60 space-y-4">
                {product.longDescription.split("\n\n").map((para, i) => (
                  <p key={i} className="text-sm font-medium leading-relaxed text-[#594970]">
                    {para}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-extrabold text-[#6D349F] mb-6">
              More from {product.category}
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-4">
              {related.map((p) => (
                <ShopProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
