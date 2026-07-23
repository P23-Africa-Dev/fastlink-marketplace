"use client";

import Link from "next/link";
import Image from "next/image";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Tag } from "lucide-react";
import { useState } from "react";

import { useCartStore } from "@/store/cart-store";
import { formatPrice } from "@/lib/utils";
import { ProductCard } from "@/components/product/product-card";
import { MOCK_PRODUCTS } from "@/mocks/data";

const SUGGESTED = MOCK_PRODUCTS.filter((p) => p.isBestseller).slice(0, 4);

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, subtotal, shipping, tax, total } =
    useCartStore();
  const [couponCode, setCouponCode] = useState("");

  if (items.length === 0) {
    return (
      <div className="container-narrow section-padding text-center">
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <ShoppingBag size={32} className="text-muted-foreground" />
        </div>
        <h1 className="font-display mb-3 text-4xl font-light text-foreground">
          Your bag is empty
        </h1>
        <p className="mb-8 text-muted-foreground">
          Discover handcrafted goods from independent makers.
        </p>
        <Link href="/products" className="btn-gold">
          Explore Products
          <ArrowRight size={14} />
        </Link>

        <div className="mt-20">
          <p className="mb-6 text-xs uppercase tracking-widest text-muted-foreground">
            You might like
          </p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {SUGGESTED.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-wide py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-4xl font-light text-foreground">
          Your Bag{" "}
          <span className="text-2xl text-muted-foreground">({items.length})</span>
        </h1>
        <button
          onClick={clearCart}
          className="text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-destructive"
        >
          Clear all
        </button>
      </div>

      <div className="grid gap-10 lg:grid-cols-3">
        {/* Items */}
        <div className="lg:col-span-2">
          <ul className="divide-y divide-border">
            {items.map((item) => (
              <li key={item.productId} className="flex gap-5 py-6">
                <Link
                  href={`/products/${item.product.slug}`}
                  className="relative h-28 w-24 flex-shrink-0 overflow-hidden rounded bg-muted"
                >
                  <Image
                    src={item.product.images[0]?.url ?? ""}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                </Link>
                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        {item.product.seller.name}
                      </p>
                      <Link
                        href={`/products/${item.product.slug}`}
                        className="font-display mt-1 text-xl font-light text-foreground hover:text-primary"
                      >
                        {item.product.name}
                      </Link>
                      {item.selectedVariants && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {Object.entries(item.selectedVariants)
                            .filter(([, v]) => v)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(", ")}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="flex-shrink-0 p-1 text-muted-foreground transition-colors hover:text-destructive"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center rounded-full border border-border">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-foreground"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="min-w-[2rem] text-center text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-foreground"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <p className="font-display text-xl font-light text-primary">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Summary */}
        <div className="h-fit rounded bg-card p-6">
          <h2 className="font-display mb-6 text-xl font-light text-foreground">Order Summary</h2>

          {/* Coupon */}
          <div className="mb-6">
            <label className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">
              Coupon Code
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="MAKER10"
                  className="w-full rounded border border-border bg-input py-2.5 pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>
              <button className="btn-outline-gold px-4 py-2 text-xs">Apply</button>
            </div>
          </div>

          <div className="rule-gold mb-4" />

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Shipping</span>
              <span>
                {shipping === 0 ? (
                  <span className="text-green-500">Free</span>
                ) : (
                  formatPrice(shipping)
                )}
              </span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Tax (9%)</span>
              <span>{formatPrice(tax)}</span>
            </div>
            <div className="rule-gold" />
            <div className="flex justify-between">
              <span className="font-display text-xl font-light">Total</span>
              <span className="font-display text-xl text-primary">{formatPrice(total)}</span>
            </div>
          </div>

          {shipping > 0 && (
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Add <span className="text-primary">{formatPrice(150 - subtotal)}</span> for free
              shipping
            </p>
          )}

          <Link href="/checkout" className="btn-gold mt-6 w-full">
            Proceed to Checkout
            <ArrowRight size={14} />
          </Link>

          <div className="mt-4 text-center">
            <Link
              href="/products"
              className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
