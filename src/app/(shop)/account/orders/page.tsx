"use client";

import Link from "next/link";
import { Package } from "lucide-react";

import { formatPrice } from "@/lib/utils";
import { formatOrderDate } from "@/lib/order-map";
import { useMyOrders } from "@/hooks/use-orders";

const STATUS_STYLES: Record<string, string> = {
  Successful: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Shipped: "bg-blue-50 text-blue-700 border-blue-200",
  Delivered: "bg-purple-50 text-purple-700 border-purple-200",
  Refunded: "bg-rose-50 text-rose-700 border-rose-200",
};

export default function AccountOrdersPage() {
  const { data, isLoading, isError } = useMyOrders();
  const orders = data?.data ?? [];

  return (
    <div className="min-h-screen bg-[#FAF8FC] font-montserrat">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#6D349F]">My Orders</h1>
          <p className="text-sm text-[#8A79A5] mt-1">Orders you have placed on Fastlink.</p>
        </div>

        {isLoading && <p className="text-sm text-[#8A79A5]">Loading orders…</p>}
        {isError && (
          <p className="text-sm text-rose-600">Could not load your orders. Please try again.</p>
        )}

        {!isLoading && !isError && orders.length === 0 && (
          <div className="rounded-2xl border border-[#EBD7FA] bg-white p-10 text-center space-y-3">
            <Package className="mx-auto text-[#7a3dbf]" size={32} />
            <p className="font-bold text-[#3B1C5A]">No orders yet</p>
            <Link href="/products" className="text-sm font-semibold text-[#7a3dbf] hover:underline">
              Browse products
            </Link>
          </div>
        )}

        <ul className="space-y-4">
          {orders.map((order) => (
            <li
              key={order.id}
              className="rounded-2xl border border-[#EBD7FA] bg-white p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <p className="font-bold text-[#6D349F]">#{order.reference.replace(/^#/, "")}</p>
                <p className="text-xs text-[#8A79A5]">{formatOrderDate(order.createdAt)}</p>
                <p className="text-xs text-[#5F6C72]">
                  {order.items.length} item{order.items.length === 1 ? "" : "s"}
                  {order.store?.name ? ` · ${order.store.name}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold border ${STATUS_STYLES[order.displayStatus] ?? "bg-slate-50 text-slate-600 border-slate-200"}`}
                >
                  {order.displayStatus}
                </span>
                <span className="text-sm font-extrabold text-[#3B1C5A]">{formatPrice(order.total)}</span>
                <Link
                  href={`/account/orders/${encodeURIComponent(order.reference)}`}
                  className="text-xs font-bold text-[#7a3dbf] hover:underline"
                >
                  Details
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
