"use client";

import Link from "next/link";
import Image from "next/image";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Tag, ArrowLeft } from "lucide-react";
import { useMemo, useState } from "react";

import { useCartStore } from "@/store/cart-store";
import { formatPrice } from "@/lib/utils";
import { apiErrorMessage } from "@/lib/api";
import { ShopProductCard } from "@/components/product/shop-product-card";
import { MOCK_PRODUCTS } from "@/mocks/data";
import { useCartSync, usePromoPreview } from "@/hooks/use-growth";
import { useAuthStore } from "@/store/auth-store";

const SUGGESTED = MOCK_PRODUCTS.filter((p) => p.isBestseller).slice(0, 4);

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, subtotal, shipping, tax, total, couponCode, discount, setCoupon, clearCoupon } =
    useCartStore();
  const [codeInput, setCodeInput] = useState(couponCode);
  const [couponError, setCouponError] = useState("");
  const preview = usePromoPreview();
  const token = useAuthStore((s) => s.token);
  useCartSync();
  const storeGroups = useMemo(() => {
    const map = new Map<string, { storeName: string; items: typeof items; subtotal: number }>();
    for (const item of items) {
      const storeId = item.product.store?.id ?? item.product.seller.id;
      const storeName = item.product.store?.name ?? item.product.seller.name;
      const existing = map.get(storeId);
      const line = item.product.price * item.quantity;
      if (existing) {
        existing.items.push(item);
        existing.subtotal += line;
      } else {
        map.set(storeId, { storeName, items: [item], subtotal: line });
      }
    }
    return Array.from(map.entries()).map(([storeId, row]) => ({ storeId, ...row }));
  }, [items]);

  if (items.length === 0) {
    return (
      <div className="bg-[#EADBF8] min-h-screen py-10 font-montserrat">
        <div className="container-narrow text-center py-12">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#F2E7FC] border border-white/80 shadow-sm">
            <ShoppingBag size={32} className="text-[#6D349F]" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#6D349F] mb-3 font-montserrat">
            Your Cart is Empty
          </h1>
          <p className="mb-8 text-sm text-[#8A79A5] font-medium max-w-md mx-auto">
            Discover quality goods from local stores, top malls, and verified brands in Kano.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-xl bg-[#7E37C9] hover:bg-[#6C2CB5] text-white font-bold px-8 py-3.5 shadow-md transition-all duration-200"
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
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {SUGGESTED.map((p) => (
                <ShopProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#EADBF8] min-h-screen py-10 font-montserrat">
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
              <span>Your Shopping Cart</span>
              <span className="rounded-full bg-[#E4D1F7] px-3 py-1 text-xs font-bold text-[#6D349F]">
                {items.length} {items.length === 1 ? "item" : "items"}
              </span>
            </h1>
          </div>

          <button
            onClick={clearCart}
            className="text-xs font-bold text-[#8A79A5] transition-colors hover:text-red-600 underline self-start sm:self-auto"
          >
            Clear all items
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {storeGroups.map((group) => (
              <div key={group.storeId} className="space-y-3">
                <div className="flex items-center justify-between rounded-xl bg-white/70 border border-[#E4D1F7] px-4 py-2">
                  <p className="text-[11px] font-black uppercase tracking-wider text-[#8A79A5]">{group.storeName}</p>
                  <p className="text-xs font-bold text-[#6D349F]">Subtotal: {formatPrice(group.subtotal)}</p>
                </div>
                {group.items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl bg-[#F6EFFD] border border-white/60 shadow-sm transition-all hover:shadow-md"
                  >
                <Link
                  href={`/products/${item.product.slug}`}
                  className="relative aspect-square sm:w-28 sm:h-28 flex-shrink-0 overflow-hidden rounded-xl bg-purple-100"
                >
                  <Image
                    src={item.product.images[0]?.url ?? ""}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                </Link>

                <div className="flex flex-1 flex-col justify-between space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-bold text-[#8A79A5] uppercase tracking-wider">
                        {item.product.seller.name}
                      </p>
                      <Link
                        href={`/products/${item.product.slug}`}
                        className="font-bold text-base sm:text-lg text-[#6D349F] hover:text-[#52237A] transition-colors font-montserrat"
                      >
                        {item.product.name}
                      </Link>
                      {item.selectedVariants && (
                        <p className="mt-1 text-xs text-[#8A79A5]">
                          {Object.entries(item.selectedVariants)
                            .filter(([, v]) => v)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(", ")}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="flex-shrink-0 p-1.5 rounded-lg text-[#8A79A5] transition-colors hover:bg-red-50 hover:text-red-600"
                      aria-label="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#E4D1F7]/60">
                    <div className="flex items-center rounded-xl bg-white border border-[#D8C2EF] p-1 shadow-xs">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="flex h-7 w-7 items-center justify-center text-[#6D349F] hover:bg-purple-100/50 rounded-lg transition-colors"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="min-w-[2.2rem] text-center text-xs font-bold text-[#6D349F]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="flex h-7 w-7 items-center justify-center text-[#6D349F] hover:bg-purple-100/50 rounded-lg transition-colors"
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    <p className="text-lg font-extrabold text-[#6D349F] font-montserrat">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                  </div>
                </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Order Summary Card */}
          <div className="h-fit rounded-2xl bg-[#F6EFFD] p-6 border border-white/60 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-[#6D349F] font-montserrat border-b border-[#D8C2EF] pb-3">
              Order Summary
            </h2>

            {/* Coupon Code */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#8A79A5]">
                Coupon Code
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A79A5]"
                  />
                  <input
                    type="text"
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                    placeholder="FASTLINK10"
                    className="w-full rounded-xl border border-[#D8C2EF] bg-white py-2.5 pl-9 pr-3 text-xs text-[#3B1C5A] placeholder:text-[#8A79A5] focus:border-[#7E37C9] focus:outline-none font-montserrat"
                  />
                </div>
                <button
                  type="button"
                  disabled={preview.isPending || !codeInput.trim()}
                  onClick={async () => {
                    setCouponError("");
                    if (!token) {
                      setCouponError("Sign in to apply a promo code.");
                      return;
                    }
                    try {
                      const result = await preview.mutateAsync({
                        coupon_code: codeInput.trim(),
                        items: items.map((item) => ({ product_id: item.productId, quantity: item.quantity })),
                      });
                      setCoupon(result.code, result.discount);
                    } catch (err) {
                      clearCoupon();
                      setCouponError(apiErrorMessage(err, "This promo code could not be applied."));
                    }
                  }}
                  className="rounded-xl border border-[#6D349F] text-[#6D349F] font-bold text-xs px-4 py-2 hover:bg-purple-100/50 transition-colors disabled:opacity-50"
                >
                  {preview.isPending ? "…" : "Apply"}
                </button>
              </div>
              {couponError && <p className="mt-2 text-[11px] font-semibold text-rose-600">{couponError}</p>}
              {discount > 0 && couponCode && (
                <p className="mt-2 text-[11px] font-semibold text-emerald-700">
                  {couponCode} applied — {formatPrice(discount)} off
                </p>
              )}
            </div>

            <div className="space-y-3 text-sm pt-2">
              <div className="flex justify-between text-[#8A79A5] font-medium">
                <span>Subtotal</span>
                <span className="font-bold text-[#6D349F]">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#8A79A5] font-medium">
                <span>Shipping</span>
                <span>
                  {shipping === 0 ? (
                    <span className="font-bold text-emerald-600">Free</span>
                  ) : (
                    <span className="font-bold text-[#6D349F]">{formatPrice(shipping)}</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between text-[#8A79A5] font-medium">
                <span>Estimated Tax</span>
                <span className="font-bold text-[#6D349F]">{formatPrice(tax)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Discount{couponCode ? ` (${couponCode})` : ""}</span>
                  <span className="font-bold">-{formatPrice(discount)}</span>
                </div>
              )}

              <div className="border-t border-[#D8C2EF] my-3 pt-3 flex justify-between items-center">
                <span className="text-base font-bold text-[#6D349F]">Total</span>
                <span className="text-2xl font-extrabold text-[#6D349F] font-montserrat">
                  {formatPrice(total)}
                </span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="flex items-center justify-center gap-2 w-full rounded-xl bg-[#7E37C9] hover:bg-[#6C2CB5] text-white font-bold py-3.5 px-6 shadow-md transition-all text-center"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={16} />
            </Link>
            {storeGroups.length > 1 && (
              <p className="text-[11px] text-[#8A79A5] font-semibold text-center">
                Checkout will split this cart into {storeGroups.length} seller orders with separate shipping calculations.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
