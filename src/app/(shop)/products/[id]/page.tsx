"use client";

import { useState, useRef, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Heart,
  Star,
  Check,
  Truck,
  RotateCcw,
  Shield,
  Store,
  ChevronRight,
  ChevronLeft,
  Award,
  Headphones,
  CreditCard,
  Minus,
  Plus,
  ArrowLeft,
  ArrowRight,
  ArrowLeftRight,
  Copy,
  Facebook,
  Twitter,
  Share2,
} from "lucide-react";

import { useProduct } from "@/hooks/use-products";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";
import { formatPrice, cn, pluralize } from "@/lib/utils";
import { ShopProductCard } from "@/components/product/shop-product-card";
import { MOCK_PRODUCTS } from "@/mocks/data";
import type { Product } from "@/types/product";

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

function getDistinctProducts(
  primaryList: Product[],
  count: number,
  excludeId: string
): Product[] {
  const map = new Map<string, Product>();
  primaryList.forEach((p) => {
    if (p.id !== excludeId) map.set(p.id, p);
  });
  if (map.size < count) {
    MOCK_PRODUCTS.forEach((p) => {
      if (p.id !== excludeId && map.size < count) map.set(p.id, p);
    });
  }
  return Array.from(map.values()).slice(0, count);
}

export default function ProductDetailPage(props: ProductDetailPageProps) {
  const params = use(props.params);
  const router = useRouter();
  const { data, isLoading, isError } = useProduct(params.id);
  const { addItem } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedMemory, setSelectedMemory] = useState<string | null>(null);
  const [selectedStorage, setSelectedStorage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "description" | "additional" | "specification" | "review"
  >("description");

  const thumbnailContainerRef = useRef<HTMLDivElement>(null);

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
              <div className="h-5 w-[#1E1E2F] animate-pulse rounded-full bg-white/50" />
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

  const relatedProducts = getDistinctProducts(
    MOCK_PRODUCTS.filter(
      (p) => p.id !== product.id && p.category === product.category
    ),
    3,
    product.id
  );

  const accessoryProducts = getDistinctProducts(
    MOCK_PRODUCTS.filter(
      (p) =>
        p.id !== product.id &&
        (p.category.toLowerCase().includes("accessori") ||
          p.subcategory?.toLowerCase().includes("accessori") ||
          p.tags.some((t) => t.toLowerCase().includes("accessori")))
    ),
    3,
    product.id
  );

  const sellerName = product.seller?.name || "Store";
  const sellerProducts = getDistinctProducts(
    MOCK_PRODUCTS.filter(
      (p) => p.id !== product.id && p.seller?.id === product.seller?.id
    ),
    3,
    product.id
  );

  const featuredProducts = getDistinctProducts(
    MOCK_PRODUCTS.filter(
      (p) => p.id !== product.id && (p.isFeatured || p.isBestseller)
    ),
    3,
    product.id
  );

  const recommendationColumns = [
    { title: "RELATED PRODUCT", products: relatedProducts },
    { title: "PRODUCT ACCESSORIES", products: accessoryProducts },
    { title: `${sellerName.toUpperCase()} PRODUCT`, products: sellerProducts },
    { title: "FEATURED PRODUCTS", products: featuredProducts },
  ];

  function handleAddToCart() {
    addItem(product, quantity, {
      size: selectedSize ?? undefined,
      color: selectedColor ?? undefined,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  }

  function handleBuyNow() {
    addItem(product, quantity, {
      size: selectedSize ?? undefined,
      color: selectedColor ?? undefined,
    });
    router.push("/cart");
  }

  function handlePrevImage() {
    if (!product.images || product.images.length === 0) return;
    setSelectedImage((prev) => {
      const nextIdx = prev === 0 ? product.images.length - 1 : prev - 1;
      return nextIdx;
    });
    if (thumbnailContainerRef.current) {
      thumbnailContainerRef.current.scrollBy({ left: -90, behavior: "smooth" });
    }
  }

  function handleNextImage() {
    if (!product.images || product.images.length === 0) return;
    setSelectedImage((prev) => {
      const nextIdx = prev === product.images.length - 1 ? 0 : prev + 1;
      return nextIdx;
    });
    if (thumbnailContainerRef.current) {
      thumbnailContainerRef.current.scrollBy({ left: 90, behavior: "smooth" });
    }
  }

  function handleCopyShareLink() {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
    }
  }

  return (
    <div className="min-h-screen bg-[#EADBF8] pt-6 md:pt-12 font-montserrat text-[#4A2574]">
      
      {/* Product Main Container */}
      <div className="mx-auto max-w-[1600px] px-3 sm:px-6 md:px-10 lg:px-16 pb-10">
        
        {/* Breadcrumb */}
        <nav className="mb-4 sm:mb-6 flex items-center gap-1.5 sm:gap-2 text-xs font-semibold text-[#8A79A5] flex-wrap">
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
          <span className="text-[#6D349F] font-bold truncate max-w-[160px] sm:max-w-[240px]">{product.name}</span>
        </nav>

        {/* Product Card Container */}
        <div className="rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-6 md:p-10 shadow-sm border border-slate-200/80 overflow-hidden">
          <div className="grid gap-6 md:gap-8 lg:grid-cols-12 lg:gap-12 items-start">
            
            {/* Gallery Slider (6 cols) */}
            <div className="lg:col-span-6 space-y-4 w-full min-w-0">
              <div className="relative aspect-[4/3] sm:aspect-square w-full overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-2xs flex items-center justify-center p-4 sm:p-8 md:p-10">
                <Image
                  src={product.images[selectedImage]?.url ?? ""}
                  alt={product.images[selectedImage]?.alt ?? product.name}
                  fill
                  priority
                  className="object-contain p-2 sm:p-4 transition-opacity duration-300"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                {product.isNew && (
                  <span className="absolute left-3 top-3 sm:left-4 sm:top-4 rounded-full bg-[#6D349F] px-3 py-0.5 sm:px-3.5 sm:py-1 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-white shadow-md">
                    New Arrival
                  </span>
                )}
              </div>

              {/* Thumbnails Carousel with Responsive Inset Arrows */}
              <div className="relative flex items-center w-full px-7 sm:px-9">
                <button
                  onClick={handlePrevImage}
                  className="absolute left-0 z-10 h-8 w-8 sm:h-10 sm:w-10 shrink-0 rounded-full bg-[#411266] hover:bg-[#320c50] text-white flex items-center justify-center shadow-md cursor-pointer transition-all active:scale-95 border border-white"
                  aria-label="Previous Image"
                >
                  <ArrowLeft size={16} />
                </button>

                <div
                  ref={thumbnailContainerRef}
                  className="flex gap-2.5 sm:gap-3 overflow-x-auto py-2 flex-1 scroll-smooth scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden min-w-0"
                >
                  {product.images.map((img, i) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImage(i)}
                      className={cn(
                        "relative h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 shrink-0 overflow-hidden rounded-xl sm:rounded-2xl bg-white border-2 p-1 sm:p-1.5 transition-all cursor-pointer",
                        selectedImage === i
                          ? "border-[#411266] shadow-xs"
                          : "border-slate-200/90 opacity-70 hover:opacity-100",
                      )}
                    >
                      <Image src={img.url} alt={img.alt} fill className="object-contain p-0.5 sm:p-1" />
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleNextImage}
                  className="absolute right-0 z-10 h-8 w-8 sm:h-10 sm:w-10 shrink-0 rounded-full bg-[#411266] hover:bg-[#320c50] text-white flex items-center justify-center shadow-md cursor-pointer transition-all active:scale-95 border border-white"
                  aria-label="Next Image"
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            {/* Product Metadata & Purchasing Controls (6 cols) */}
            <div className="lg:col-span-6 flex flex-col gap-4 w-full min-w-0">
              
              {/* Rating & User feedback */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={15}
                      className={cn(
                        i < Math.floor(product.rating)
                          ? "fill-[#411266] text-[#411266]"
                          : "fill-none text-slate-300",
                      )}
                    />
                  ))}
                </div>
                <span className="text-xs sm:text-sm font-bold text-[#1E1E2F]">
                  {product.rating} Star Rating
                </span>
                <span className="text-xs sm:text-sm font-normal text-[#8A79A5]">
                  ({product.reviewCount.toLocaleString()} User feedback)
                </span>
              </div>

              {/* Title */}
              <h1 className="text-lg sm:text-2xl font-bold leading-tight text-[#1E1E2F]">
                {product.name}
              </h1>

              {/* 2-Column Metadata */}
              <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs sm:text-sm">
                <div>
                  <span className="text-[#8A79A5]">Sku: </span>
                  <span className="font-bold text-[#1E1E2F]">{product.sku}</span>
                </div>
                <div>
                  <span className="text-[#8A79A5]">Availability: </span>
                  <span className={cn("font-bold", product.stock > 0 ? "text-emerald-600" : "text-rose-600")}>
                    {product.stock > 0 ? "In Stock" : "Out of Stock"}
                  </span>
                </div>
                <div>
                  <span className="text-[#8A79A5]">Brand: </span>
                  <span className="font-bold text-[#1E1E2F]">{product.brand || product.seller.name}</span>
                </div>
                <div>
                  <span className="text-[#8A79A5]">Category: </span>
                  <span className="font-bold text-[#1E1E2F]">{product.category}</span>
                </div>
              </div>

              {/* Price Block */}
              <div className="flex flex-wrap items-baseline gap-2.5 sm:gap-3 pt-1">
                <span className="text-2xl sm:text-4xl font-extrabold text-[#00A8FF]">
                  {formatPrice(product.price)}
                </span>
                {product.compareAtPrice && (
                  <span className="text-base sm:text-lg font-medium text-slate-400 line-through">
                    {formatPrice(product.compareAtPrice)}
                  </span>
                )}
                {product.discountPercentage && (
                  <span className="bg-[#FF9800] text-white font-bold text-[10px] sm:text-xs px-2.5 py-1 rounded-sm uppercase tracking-wider">
                    {product.discountPercentage}% OFF
                  </span>
                )}
              </div>

              <div className="h-[1px] w-full bg-slate-200/80 my-2" />

              {/* Option Selectors (2x2 Grid) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Color */}
                <div>
                  <label className="text-xs font-semibold text-[#8A79A5] uppercase tracking-wider block mb-2">
                    Color
                  </label>
                  <div className="flex items-center gap-3">
                    {(product.variants?.colors || [
                      { id: "col-1", name: "color", value: "Space Gray", stock: 10, priceModifier: 0 },
                      { id: "col-2", name: "color", value: "Silver", stock: 10, priceModifier: 0 },
                    ]).map((c) => {
                      const colorHex = c.value.toLowerCase().includes("space gray") || c.value.toLowerCase().includes("black") || c.value.toLowerCase().includes("ink")
                        ? "#6B6D76"
                        : c.value.toLowerCase().includes("silver") || c.value.toLowerCase().includes("white") || c.value.toLowerCase().includes("ecru")
                        ? "#E2E4E5"
                        : c.value.toLowerCase().includes("red") || c.value.toLowerCase().includes("rose")
                        ? "#E53935"
                        : "#9E9E9E";
                      return (
                        <button
                          key={c.id}
                          onClick={() => setSelectedColor(c.value)}
                          title={c.value}
                          className={cn(
                            "h-8 w-8 rounded-full border-2 transition-all cursor-pointer relative flex items-center justify-center p-0.5",
                            (selectedColor || product.variants?.colors?.[0]?.value) === c.value
                              ? "ring-2 ring-[#411266] ring-offset-2 border-transparent scale-105"
                              : "border-slate-300 opacity-80 hover:opacity-100",
                          )}
                        >
                          <span className="h-full w-full rounded-full border border-black/10" style={{ backgroundColor: colorHex }} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Size */}
                <div>
                  <label className="text-xs font-semibold text-[#8A79A5] uppercase tracking-wider block mb-2">
                    Size
                  </label>
                  <select
                    value={selectedSize || product.variants?.sizes?.[0]?.value || ""}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-[#1E1E2F] shadow-2xs focus:border-[#411266] focus:outline-none truncate"
                  >
                    {(product.variants?.sizes || [
                      { id: "s-default", name: "size", value: "14-inch Liquid Retina XDR display", stock: 10, priceModifier: 0 }
                    ]).map((s) => (
                      <option key={s.id} value={s.value}>
                        {s.value}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Memory */}
                <div>
                  <label className="text-xs font-semibold text-[#8A79A5] uppercase tracking-wider block mb-2">
                    Memory
                  </label>
                  <select
                    value={selectedMemory || product.variants?.memory?.[0]?.value || ""}
                    onChange={(e) => setSelectedMemory(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-[#1E1E2F] shadow-2xs focus:border-[#411266] focus:outline-none"
                  >
                    {(product.variants?.memory || [
                      { id: "m-1", name: "memory", value: "16GB unified memory", stock: 10, priceModifier: 0 },
                      { id: "m-2", name: "memory", value: "32GB unified memory", stock: 10, priceModifier: 0 },
                    ]).map((m) => (
                      <option key={m.id} value={m.value}>
                        {m.value}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Storage */}
                <div>
                  <label className="text-xs font-semibold text-[#8A79A5] uppercase tracking-wider block mb-2">
                    Storage
                  </label>
                  <select
                    value={selectedStorage || product.variants?.storage?.[0]?.value || ""}
                    onChange={(e) => setSelectedStorage(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-[#1E1E2F] shadow-2xs focus:border-[#411266] focus:outline-none"
                  >
                    {(product.variants?.storage || [
                      { id: "st-1", name: "storage", value: "1TB SSD Storage", stock: 10, priceModifier: 0 },
                      { id: "st-2", name: "storage", value: "512GB SSD Storage", stock: 10, priceModifier: 0 },
                    ]).map((st) => (
                      <option key={st.id} value={st.value}>
                        {st.value}
                      </option>
                    ))}
                  </select>
                </div>

              </div>

              {/* Quantity Counter & CTA Buttons Row */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-4">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {/* Quantity Counter */}
                  <div className="flex items-center justify-between rounded-xl border border-slate-300 bg-white px-3 py-2.5 w-28 sm:w-32 shrink-0 shadow-2xs">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="text-slate-600 hover:text-slate-900 font-bold p-1 cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-sm font-bold text-[#1E1E2F]">
                      {quantity < 10 ? `0${quantity}` : quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="text-slate-600 hover:text-slate-900 font-bold p-1 cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* ADD TO CART */}
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#411266] hover:bg-[#320c50] text-white py-3.5 px-4 sm:px-6 text-xs sm:text-sm font-extrabold shadow-md transition-all cursor-pointer active:scale-[0.99]",
                      addedToCart && "bg-emerald-600 hover:bg-emerald-600",
                    )}
                  >
                    {addedToCart ? (
                      <>
                        <Check size={16} strokeWidth={3} />
                        <span>ADDED</span>
                      </>
                    ) : (
                      <>
                        <span>ADD TO CART</span>
                        <ShoppingBag size={16} />
                      </>
                    )}
                  </button>
                </div>

                {/* BUY NOW */}
                <button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className="w-full sm:w-auto flex-1 min-w-[120px] flex items-center justify-center rounded-xl border-2 border-[#411266] text-[#411266] hover:bg-purple-50 py-3.5 px-6 text-xs sm:text-sm font-extrabold transition-all cursor-pointer active:scale-[0.99]"
                >
                  <span>BUY NOW</span>
                </button>
              </div>

              {/* Actions Row (Wishlist, Compare, Share) */}
              <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 mt-2 text-xs sm:text-sm pt-2">
                <button
                  onClick={() => toggleWishlist(product)}
                  className="flex items-center gap-1.5 text-[#594970] hover:text-[#411266] font-semibold transition-colors cursor-pointer"
                >
                  <Heart size={16} className={cn(isInWishlist(product.id) && "fill-[#411266] text-[#411266]")} />
                  <span>{isInWishlist(product.id) ? "In Wishlist" : "Add to Wishlist"}</span>
                </button>

                <button className="flex items-center gap-1.5 text-[#594970] hover:text-[#411266] font-semibold transition-colors cursor-pointer">
                  <ArrowLeftRight size={16} />
                  <span>Add to Compare</span>
                </button>

                <div className="flex items-center gap-2 text-[#594970]">
                  <span>Share product:</span>
                  <button onClick={handleCopyShareLink} className="hover:text-[#411266] p-1 cursor-pointer" title="Copy Link">
                    <Copy size={15} />
                  </button>
                  <a href="#" className="hover:text-[#411266] p-1" title="Share on Facebook">
                    <Facebook size={15} />
                  </a>
                  <a href="#" className="hover:text-[#411266] p-1" title="Share on Twitter">
                    <Twitter size={15} />
                  </a>
                  <a href="#" className="hover:text-[#411266] p-1" title="Share">
                    <Share2 size={15} />
                  </a>
                </div>
              </div>

              {/* 100% Guarantee Safe Checkout Box (With Proper Padding) */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-6 mt-4 space-y-3.5 shadow-2xs">
                <span className="text-xs sm:text-sm font-semibold text-[#1E1E2F] block">
                  100% Guarantee Safe Checkout
                </span>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-1">
                  {/* VISA */}
                  <div className="h-7 px-2.5 rounded bg-white border border-slate-200 flex items-center justify-center shadow-2xs">
                    <span className="font-black italic text-[11px] text-[#1A1F71]">VISA</span>
                  </div>

                  {/* Mastercard */}
                  <div className="h-7 px-2.5 rounded bg-white border border-slate-200 flex items-center justify-center gap-0.5 shadow-2xs">
                    <span className="h-3.5 w-3.5 rounded-full bg-[#EB001B] inline-block -mr-1.5 opacity-95" />
                    <span className="h-3.5 w-3.5 rounded-full bg-[#F79E1B] inline-block opacity-95" />
                  </div>

                  {/* PayPal */}
                  <div className="h-7 px-2.5 rounded bg-[#FFF9F2] border border-[#FFE7CD] flex items-center justify-center shadow-2xs">
                    <span className="font-black italic text-[10px] text-[#003087]">Pay<span className="text-[#009CDE]">Pal</span></span>
                  </div>

                  {/* American Express */}
                  <div className="h-7 px-2 rounded bg-[#016FD0] flex items-center justify-center shadow-2xs">
                    <span className="font-extrabold text-[9px] text-white uppercase tracking-tighter">AMEX</span>
                  </div>

                  {/* Visa Electron */}
                  <div className="h-7 px-2 rounded bg-[#1A1F71] flex items-center justify-center shadow-2xs">
                    <span className="font-bold text-[9px] text-white">VISA <span className="text-sky-300 font-normal">Electron</span></span>
                  </div>

                  {/* Laser */}
                  <div className="h-7 px-2.5 rounded bg-gradient-to-r from-purple-600 to-pink-500 flex items-center justify-center shadow-2xs">
                    <span className="font-extrabold text-[9px] text-white italic">LASER</span>
                  </div>

                  {/* Maestro */}
                  <div className="h-7 px-2.5 rounded bg-white border border-slate-200 flex items-center justify-center gap-0.5 shadow-2xs">
                    <span className="h-3.5 w-3.5 rounded-full bg-[#0064E0] inline-block -mr-1.5 opacity-95" />
                    <span className="h-3.5 w-3.5 rounded-full bg-[#EB001B] inline-block opacity-95" />
                  </div>

                  {/* Delta */}
                  <div className="h-7 px-2.5 rounded bg-[#004B87] flex items-center justify-center shadow-2xs">
                    <span className="font-black italic text-[9px] text-amber-400">DELTA</span>
                  </div>

                  {/* Solo */}
                  <div className="h-7 px-2.5 rounded bg-[#682382] flex items-center justify-center shadow-2xs">
                    <span className="font-extrabold text-[9px] text-white italic">SOLO</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>

      {/* Full-Width Product Details Tabs Container */}
      <div className="w-full bg-[#EFEBFA] border-t border-b border-purple-200/50 shadow-2xs mt-6">
        <div className="mx-auto max-w-[1600px] px-3 sm:px-6 md:px-10 lg:px-16">
          
          {/* Tab Navigation */}
          <div className="flex overflow-x-auto no-scrollbar scrollbar-none items-center border-b border-purple-200/40 pt-4 gap-1">
            {[
              { id: "description", label: "DESCRIPTION" },
              { id: "additional", label: "ADDITIONAL INFORMATION" },
              { id: "specification", label: "SPECIFICATION" },
              { id: "review", label: "REVIEW" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "px-4 sm:px-6 py-3.5 sm:py-4 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0 relative whitespace-nowrap",
                  activeTab === tab.id
                    ? "bg-white text-[#222222] border-b-[3px] border-[#FA541C] shadow-2xs"
                    : "text-[#716388] hover:text-[#222222] bg-transparent font-semibold"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="py-10 md:py-12">
            {activeTab === "description" && (
              <div className="grid gap-8 md:grid-cols-3 md:gap-10 items-start">
                {/* Column 1: Description */}
                <div className="space-y-3">
                  <h3 className="text-base font-bold text-[#1E1E2F]">Description</h3>
                  <div className="space-y-3 text-xs sm:text-sm font-medium leading-relaxed text-[#6A6678]">
                    {(product.longDescription || product.description)
                      .split("\n\n")
                      .map((paragraph, i) => (
                        <p key={i}>{paragraph}</p>
                      ))}
                  </div>
                </div>

                {/* Column 2: Feature */}
                <div className="space-y-3">
                  <h3 className="text-base font-bold text-[#1E1E2F]">Feature</h3>
                  <div className="space-y-3.5">
                    {[
                      { icon: Award, label: "Free 1 Year Warranty" },
                      { icon: Truck, label: "Free Shipping & Fasted Delivery" },
                      { icon: RotateCcw, label: "100% Money-back guarantee" },
                      { icon: Headphones, label: "24/7 Customer support" },
                      { icon: CreditCard, label: "Secure payment method" },
                    ].map(({ icon: Icon, label }) => (
                      <div key={label} className="flex items-center gap-3">
                        <Icon size={20} className="text-[#E67E22] shrink-0" strokeWidth={1.8} />
                        <span className="text-xs sm:text-sm font-medium text-[#222222]">
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column 3: Shipping Information */}
                <div className="space-y-3">
                  <h3 className="text-base font-bold text-[#1E1E2F]">
                    Shipping Information
                  </h3>
                  <div className="space-y-3 text-xs sm:text-sm">
                    <p>
                      <span className="font-bold text-[#222222]">Courier:</span>{" "}
                      <span className="text-[#6A6678]">2 - 4 days, free shipping</span>
                    </p>
                    <p>
                      <span className="font-bold text-[#222222]">Local Shipping:</span>{" "}
                      <span className="text-[#6A6678]">up to one week, $19.00</span>
                    </p>
                    <p>
                      <span className="font-bold text-[#222222]">UPS Ground Shipping:</span>{" "}
                      <span className="text-[#6A6678]">4 - 6 days, $29.00</span>
                    </p>
                    <p>
                      <span className="font-bold text-[#222222]">Unishop Global Export:</span>{" "}
                      <span className="text-[#6A6678]">3 - 4 days, $39.00</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "additional" && (
              <div className="space-y-4 max-w-2xl">
                <h3 className="text-base font-bold text-[#1E1E2F]">
                  Additional Specifications
                </h3>
                <div className="rounded-xl border border-purple-200/60 bg-white/80 overflow-hidden divide-y divide-purple-100">
                  <div className="grid grid-cols-3 p-3.5 text-xs sm:text-sm">
                    <span className="font-bold text-[#222222]">Category</span>
                    <span className="col-span-2 text-[#6A6678]">{product.category}</span>
                  </div>
                  <div className="grid grid-cols-3 p-3.5 text-xs sm:text-sm bg-purple-50/30">
                    <span className="font-bold text-[#222222]">Vendor / Store</span>
                    <span className="col-span-2 text-[#6A6678]">{product.seller?.name}</span>
                  </div>
                  <div className="grid grid-cols-3 p-3.5 text-xs sm:text-sm">
                    <span className="font-bold text-[#222222]">SKU Code</span>
                    <span className="col-span-2 text-[#6A6678]">{product.sku}</span>
                  </div>
                  <div className="grid grid-cols-3 p-3.5 text-xs sm:text-sm bg-purple-50/30">
                    <span className="font-bold text-[#222222]">Stock Available</span>
                    <span className="col-span-2 text-[#6A6678]">{product.stock} units</span>
                  </div>
                  <div className="grid grid-cols-3 p-3.5 text-xs sm:text-sm">
                    <span className="font-bold text-[#222222]">Warranty</span>
                    <span className="col-span-2 text-[#6A6678]">1 Year Official Manufacturer Warranty</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "specification" && (
              <div className="space-y-4 max-w-2xl">
                <h3 className="text-base font-bold text-[#1E1E2F]">
                  Product Specifications
                </h3>
                <div className="rounded-xl border border-purple-200/60 bg-white/80 p-4 space-y-3 text-xs sm:text-sm text-[#6A6678]">
                  <p>
                    <strong className="text-[#222222]">Product ID:</strong> {product.id}
                  </p>
                  <p>
                    <strong className="text-[#222222]">Tags:</strong> {product.tags?.join(", ") || "N/A"}
                  </p>
                  <p>
                    <strong className="text-[#222222]">Subcategory:</strong> {product.subcategory || "General"}
                  </p>
                  <p>
                    <strong className="text-[#222222]">Return Policy:</strong> 30 Days standard return & exchange policy.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "review" && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/80 border border-purple-100 max-w-md">
                  <div className="text-center">
                    <span className="text-3xl font-extrabold text-[#1E1E2F]">
                      {product.rating}
                    </span>
                    <p className="text-xs text-[#8A79A5]">out of 5</p>
                  </div>
                  <div className="h-10 w-[1px] bg-purple-200" />
                  <div>
                    <div className="flex gap-1 text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={i < Math.floor(product.rating) ? "fill-amber-400" : "text-slate-300"}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-semibold text-[#6A6678] mt-1 block">
                      Based on {product.reviewCount} customer reviews
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full-Width 4-Column Recommended Products Grid */}
      <div className="w-full bg-white py-12 md:py-16 border-t border-purple-100">
        <div className="mx-auto max-w-[1600px] px-4 md:px-10 lg:px-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
            {recommendationColumns.map((col) => (
              <div key={col.title} className="space-y-4">
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#111827]">
                  {col.title}
                </h3>
                <div className="space-y-3.5">
                  {col.products.map((p) => (
                    <Link
                      key={p.id}
                      href={`/products/${p.id}`}
                      className="flex items-center gap-3.5 rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs hover:shadow-md hover:border-purple-300 transition-all group"
                    >
                      <div className="relative h-16 w-16 sm:h-18 sm:w-18 shrink-0 overflow-hidden rounded-lg bg-white border border-slate-100 p-1 flex items-center justify-center">
                        <Image
                          src={p.images[0]?.url || ""}
                          alt={p.name}
                          fill
                          className="object-contain p-0.5 group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="flex flex-col justify-center min-w-0 flex-1">
                        <h4 className="text-xs sm:text-[13px] font-normal text-[#222222] group-hover:text-[#6D349F] transition-colors line-clamp-2 leading-snug">
                          {p.name}
                        </h4>
                        <span className="mt-1.5 text-xs sm:text-sm font-bold text-[#00A8FF]">
                          {formatPrice(p.price)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}



