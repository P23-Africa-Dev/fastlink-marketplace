"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Heart, Star, Check, Truck, RotateCcw, Shield } from "lucide-react";

import { useProduct } from "@/hooks/use-products";
import { useCartStore } from "@/store/cart-store";
import { formatPrice, cn, pluralize } from "@/lib/utils";
import { ProductCard } from "@/components/product/product-card";
import { MOCK_PRODUCTS } from "@/mocks/data";

interface ProductDetailPageProps {
  params: { id: string };
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { data, isLoading, isError } = useProduct(params.id);
  const { addItem } = useCartStore();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  if (isLoading) {
    return (
      <div className="container-wide py-10">
        <div className="grid gap-12 md:grid-cols-2">
          <div className="space-y-3">
            <div className="aspect-[3/4] animate-pulse rounded bg-muted" />
            <div className="flex gap-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-20 w-20 animate-pulse rounded bg-muted" />
              ))}
            </div>
          </div>
          <div className="space-y-4 pt-4">
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="h-10 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-6 w-20 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="container-wide flex h-64 flex-col items-center justify-center gap-4 py-10 text-center">
        <p className="font-display text-2xl text-muted-foreground">Product not found</p>
        <Link href="/products" className="btn-outline-gold">
          Browse Products
        </Link>
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
    <div className="container-wide py-10">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-foreground">
          Products
        </Link>
        <span>/</span>
        <Link
          href={`/products?category=${encodeURIComponent(product.category)}`}
          className="hover:text-foreground"
        >
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-12 md:grid-cols-2">
        {/* Images */}
        <div className="space-y-3">
          <div className="relative aspect-[3/4] overflow-hidden rounded bg-muted">
            <Image
              src={product.images[selectedImage]?.url ?? ""}
              alt={product.images[selectedImage]?.alt ?? product.name}
              fill
              priority
              className="object-cover transition-opacity duration-500"
            />
            {product.isNew && (
              <span className="absolute left-4 top-4 bg-foreground px-3 py-1 text-[10px] font-medium uppercase tracking-widest text-background">
                New
              </span>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(i)}
                  className={cn(
                    "relative h-20 w-20 overflow-hidden rounded transition-all",
                    selectedImage === i
                      ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                      : "opacity-60 hover:opacity-100",
                  )}
                >
                  <Image src={img.url} alt={img.alt} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-5 pt-2">
          <div>
            <Link
              href="#"
              className="text-xs uppercase tracking-widest text-primary hover:underline"
            >
              {product.seller.name}
            </Link>
            <h1 className="font-display mt-2 text-4xl font-light leading-tight text-foreground">
              {product.name}
            </h1>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={13}
                  className={cn(
                    i < Math.floor(product.rating)
                      ? "fill-primary text-primary"
                      : "fill-none text-muted",
                  )}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {product.rating} · {product.reviewCount} {pluralize(product.reviewCount, "review")}
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="font-display text-3xl font-light text-primary">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && (
              <span className="text-lg text-muted-foreground line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>

          <div className="rule-gold" />

          <p className="leading-relaxed text-muted-foreground">{product.description}</p>

          {/* Variants */}
          {product.variants?.colors && (
            <div>
              <p className="mb-2.5 text-xs uppercase tracking-widest text-muted-foreground">
                Colour: <span className="text-foreground">{selectedColor ?? "Select"}</span>
              </p>
              <div className="flex gap-2">
                {product.variants.colors.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedColor(v.value)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs transition-all",
                      selectedColor === v.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/50",
                    )}
                  >
                    {v.value}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.variants?.sizes && (
            <div>
              <p className="mb-2.5 text-xs uppercase tracking-widest text-muted-foreground">
                Size: <span className="text-foreground">{selectedSize ?? "Select"}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {product.variants.sizes.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedSize(v.value)}
                    disabled={v.stock === 0}
                    className={cn(
                      "h-9 min-w-[2.5rem] rounded border px-3 text-sm transition-all",
                      selectedSize === v.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/50",
                      v.stock === 0 && "cursor-not-allowed opacity-40",
                    )}
                  >
                    {v.value}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stock */}
          <p className="text-xs text-muted-foreground">
            {product.stock > 10
              ? "In stock"
              : product.stock > 0
              ? `Only ${product.stock} left`
              : "Out of stock"}
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={cn(
                "btn-gold flex-1 gap-2 transition-all",
                addedToCart && "bg-green-600 hover:bg-green-600",
              )}
            >
              {addedToCart ? (
                <>
                  <Check size={14} /> Added to Bag
                </>
              ) : (
                <>
                  <ShoppingBag size={14} />
                  {product.stock === 0 ? "Sold Out" : "Add to Bag"}
                </>
              )}
            </button>
            <button
              onClick={() => setIsWishlisted((w) => !w)}
              className={cn(
                "btn-outline-gold px-4",
                isWishlisted && "border-primary bg-primary/10",
              )}
              aria-label="Wishlist"
            >
              <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} />
            </button>
          </div>

          {/* Trust signals */}
          <div className="grid grid-cols-3 gap-3 border-t border-border pt-4">
            {[
              { icon: Truck, label: "Free shipping", sub: "over $150" },
              { icon: RotateCcw, label: "Easy returns", sub: "30-day window" },
              { icon: Shield, label: "Verified maker", sub: "studio visited" },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex flex-col items-center gap-1.5 text-center">
                <Icon size={16} className="text-primary" />
                <span className="text-xs font-medium text-foreground">{label}</span>
                <span className="text-[10px] text-muted-foreground">{sub}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Long description */}
      {product.longDescription && (
        <div className="mt-16 border-t border-border pt-12">
          <h2 className="font-display mb-6 text-2xl font-light text-foreground">
            About this piece
          </h2>
          <div className="prose prose-invert max-w-2xl">
            {product.longDescription.split("\n\n").map((para, i) => (
              <p key={i} className="mb-4 leading-relaxed text-muted-foreground">
                {para}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Related products */}
      {related.length > 0 && (
        <div className="mt-16 border-t border-border pt-12">
          <h2 className="font-display mb-8 text-2xl font-light text-foreground">
            More from this category
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
