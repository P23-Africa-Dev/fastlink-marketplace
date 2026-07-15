"use client";

import React from "react";
import { X } from "lucide-react";
import { useCartStore, selectTotalPrice, selectTotalItems } from "@/lib/stores/cart-store";
import { toast } from "sonner";
import Link from "next/link";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartModal({ isOpen, onClose }: CartModalProps) {
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const totalItems = useCartStore(selectTotalItems);
  const totalPrice = useCartStore(selectTotalPrice);

  if (!isOpen) return null;

  const formattedCount = totalItems < 10 ? `0${totalItems}` : totalItems;

  const handleCheckout = () => {
    toast.success("Proceeding to checkout!");
    onClose();
  };

  return (
    <>
      {/* Transparent Click-Dismiss Backdrop */}
      <div className="fixed inset-0 z-[9998]" onClick={onClose} />

      {/* Cart Dropdown Container */}
      <div className="fixed md:absolute inset-x-4 md:inset-x-auto md:right-6 top-[12%] md:top-full mt-0 md:mt-4 w-auto md:w-[420px] max-w-[420px] md:max-w-none mx-auto md:mx-0 bg-white rounded-[32px] p-8 sm:p-10 shadow-2xl z-[9999] border border-gray-100 flex flex-col gap-6 animate-in fade-in slide-in-from-top-4 duration-300 text-left">
        {/* Header */}
        <div className="border-b border-gray-100 pb-4">
          <h3 className="text-[17px] font-semibold text-gray-800">
            Shopping Cart <span className="text-gray-400 font-medium">({formattedCount})</span>
          </h3>
        </div>

        {/* Scrollable Items List */}
        <div className="flex flex-col max-h-[240px] overflow-y-auto pr-1 -mr-2 scrollbar-thin">
          {items.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-400 font-medium">
              Your cart is empty.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center gap-4 relative pb-4 border-b border-gray-50 last:border-0 last:pb-0"
                >
                  {/* Thumbnail */}
                  <div className="w-[74px] h-[74px] rounded-2xl border border-gray-100 bg-[#FAFAFA] flex items-center justify-center p-1.5 flex-shrink-0">
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="max-w-full max-h-full object-contain rounded-lg"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col gap-1 pr-6">
                    <h4 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-tight">
                      {item.product.name}
                    </h4>
                    <div className="text-[13px] text-gray-400 font-medium">
                      {item.quantity} x{" "}
                      <span className="text-[#00AEEF] font-bold">
                        ${item.product.price.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeItem(item.product.id)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-300 hover:text-gray-500 hover:bg-gray-50 transition-all"
                    aria-label="Remove item"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Divider & Sub-Total */}
        <div className="border-t border-gray-100 pt-4 flex flex-col gap-5">
          <div className="flex items-center justify-between text-[15px]">
            <span className="text-gray-400 font-medium">Sub-Total:</span>
            <span className="text-gray-800 font-bold">
              ${totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
            </span>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleCheckout}
              disabled={items.length === 0}
              className="w-full bg-primary-dark hover:bg-primary-dark/95 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold text-sm h-[54px] rounded-xl flex items-center justify-center gap-2 transition-all active:scale-98 shadow-md tracking-wider"
            >
              <span>CHECKOUT NOW &rarr;</span>
            </button>
            <Link
              href="/cart"
              onClick={onClose}
              className="w-full bg-white border border-orange-200/80 hover:bg-orange-50/10 text-primary-dark font-bold text-sm h-[54px] rounded-xl flex items-center justify-center transition-all active:scale-98 tracking-wider"
            >
              VIEW CART
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
