"use client";

import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { useCartStore } from "@/store/cart-store";
import { cn, formatPrice } from "@/lib/utils";

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal, shipping, tax, total } =
    useCartStore();

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={closeCart}
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-card transition-transform duration-500 ease-out-expo",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <div className="flex items-center gap-3">
            <ShoppingBag size={18} className="text-primary" />
            <h2 className="font-display text-xl font-light">
              Your Bag{" "}
              {items.length > 0 && (
                <span className="text-base text-muted-foreground">({items.length})</span>
              )}
            </h2>
          </div>
          <button
            onClick={closeCart}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
          >
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <ShoppingBag size={24} className="text-muted-foreground" />
              </div>
              <div>
                <p className="font-display text-lg text-muted-foreground">Your bag is empty</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Discover exceptional goods from independent makers.
                </p>
              </div>
              <Link href="/products" onClick={closeCart} className="btn-gold mt-2 text-xs">
                Explore Products
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-border px-6">
              {items.map((item) => (
                <li key={item.productId} className="flex gap-4 py-5">
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded bg-muted">
                    <Image
                      src={item.product.images[0]?.url ?? "/placeholder.jpg"}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link
                          href={`/products/${item.product.slug}`}
                          onClick={closeCart}
                          className="text-sm font-medium text-foreground hover:text-primary"
                        >
                          {item.product.name}
                        </Link>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {item.product.seller.name}
                        </p>
                        {item.selectedVariants && (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {Object.entries(item.selectedVariants)
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(", ")}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="flex-shrink-0 text-muted-foreground transition-colors hover:text-destructive"
                        aria-label="Remove item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center rounded-full border border-border">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="flex h-7 w-7 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="min-w-[2rem] text-center text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="flex h-7 w-7 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                          aria-label="Increase quantity"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <p className="text-sm font-medium text-primary">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border px-6 py-6">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Tax</span>
                <span>{formatPrice(tax)}</span>
              </div>
              <div className="rule-gold my-3" />
              <div className="flex justify-between font-medium">
                <span className="font-display text-lg">Total</span>
                <span className="text-primary">{formatPrice(total)}</span>
              </div>
            </div>

            {shipping > 0 && (
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Add{" "}
                <span className="text-primary">{formatPrice(150 - subtotal)}</span> more for
                free shipping
              </p>
            )}

            <Link href="/checkout" onClick={closeCart} className="btn-gold mt-4 w-full">
              Proceed to Checkout
            </Link>
            <button
              onClick={closeCart}
              className="mt-2 w-full py-2 text-center text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
