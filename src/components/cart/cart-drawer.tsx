"use client";

import { X, Minus, Plus, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
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
          "fixed inset-0 z-50 bg-black/50 backdrop-blur-xs transition-opacity duration-300",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={closeCart}
      />

      {/* Slide-over Drawer */}
      <div
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-[#F6EFFD] border-l border-white/60 shadow-2xl transition-transform duration-500 ease-out-expo font-montserrat",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#D8C2EF] px-6 py-5 bg-[#EADBF8]/60">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#6D349F] text-white shadow-xs">
              <ShoppingBag size={18} />
            </div>
            <h2 className="text-xl font-extrabold text-[#6D349F] font-montserrat flex items-center gap-2">
              <span>Your Shopping Bag</span>
              {items.length > 0 && (
                <span className="rounded-full bg-[#E4D1F7] px-2.5 py-0.5 text-xs font-bold text-[#6D349F]">
                  ({items.length})
                </span>
              )}
            </h2>
          </div>

          <button
            onClick={closeCart}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/60 text-[#6D349F] transition-colors hover:bg-white hover:text-[#52237A]"
            aria-label="Close cart"
          >
            <X size={18} />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3.5">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EADBF8] border border-white/80 shadow-xs">
                <ShoppingBag size={26} className="text-[#6D349F]" />
              </div>
              <div>
                <p className="text-lg font-bold text-[#6D349F] font-montserrat">Your bag is empty</p>
                <p className="mt-1 text-xs text-[#8A79A5] font-medium max-w-xs mx-auto">
                  Explore products from Kano local stores, top malls, and national brands.
                </p>
              </div>
              <Link
                href="/products"
                onClick={closeCart}
                className="mt-2 inline-flex items-center gap-2 rounded-xl bg-[#7E37C9] hover:bg-[#6C2CB5] text-white font-bold px-6 py-3 text-xs shadow-md transition-all"
              >
                <span>Explore Products</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex gap-3.5 p-3.5 rounded-2xl bg-white/80 border border-white/90 shadow-xs transition-all hover:bg-white"
                >
                  <Link
                    href={`/products/${item.product.slug}`}
                    onClick={closeCart}
                    className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-purple-100"
                  >
                    <Image
                      src={item.product.images[0]?.url ?? "/placeholder.jpg"}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </Link>

                  <div className="flex flex-1 flex-col justify-between min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <Link
                          href={`/products/${item.product.slug}`}
                          onClick={closeCart}
                          className="text-sm font-bold text-[#6D349F] hover:text-[#52237A] transition-colors truncate block font-montserrat"
                        >
                          {item.product.name}
                        </Link>
                        <p className="text-[11px] font-medium text-[#8A79A5] truncate">
                          {item.product.seller.name}
                        </p>
                        {item.selectedVariants && (
                          <p className="text-[10px] text-[#8A79A5] truncate">
                            {Object.entries(item.selectedVariants)
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(", ")}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => removeItem(item.productId)}
                        className="flex-shrink-0 p-1 text-[#8A79A5] transition-colors hover:text-red-600"
                        aria-label="Remove item"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center rounded-lg bg-white border border-[#D8C2EF] p-0.5 shadow-2xs">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="flex h-6 w-6 items-center justify-center text-[#6D349F] hover:bg-purple-100/50 rounded transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={11} />
                        </button>
                        <span className="min-w-[1.8rem] text-center text-xs font-bold text-[#6D349F]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="flex h-6 w-6 items-center justify-center text-[#6D349F] hover:bg-purple-100/50 rounded transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus size={11} />
                        </button>
                      </div>

                      <p className="text-sm font-extrabold text-[#6D349F] font-montserrat">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Summary & Actions */}
        {items.length > 0 && (
          <div className="border-t border-[#D8C2EF] bg-[#EADBF8]/60 p-6 space-y-4">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-[#8A79A5] font-medium">
                <span>Subtotal</span>
                <span className="font-bold text-[#6D349F]">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#8A79A5] font-medium">
                <span>Shipping</span>
                <span className="font-bold text-emerald-600">
                  {shipping === 0 ? "Free" : formatPrice(shipping)}
                </span>
              </div>
              <div className="flex justify-between text-[#8A79A5] font-medium">
                <span>Tax</span>
                <span className="font-bold text-[#6D349F]">{formatPrice(tax)}</span>
              </div>

              <div className="border-t border-[#D8C2EF] pt-2 mt-2 flex justify-between items-center">
                <span className="text-sm font-bold text-[#6D349F]">Total</span>
                <span className="text-lg font-extrabold text-[#6D349F] font-montserrat">
                  {formatPrice(total)}
                </span>
              </div>
            </div>

            <Link
              href="/checkout"
              onClick={closeCart}
              className="flex items-center justify-center gap-2 w-full rounded-xl bg-[#7E37C9] hover:bg-[#6C2CB5] text-white font-bold py-3.5 px-6 shadow-md transition-all text-center text-sm font-montserrat"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={16} />
            </Link>

            <button
              onClick={closeCart}
              className="w-full text-center text-xs font-bold text-[#6D349F] hover:text-[#52237A] transition-colors py-1"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
