"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { ArrowLeft, Package } from "lucide-react";

import { formatPrice } from "@/lib/utils";
import { formatOrderDate } from "@/lib/order-map";
import { useMyOrder } from "@/hooks/use-orders";
import { MessageSellerButton } from "@/components/inbox/message-seller";

export default function AccountOrderDetailPage() {
  const params = useParams();
  const id = decodeURIComponent(String(params?.id ?? ""));
  const { data, isLoading, isError } = useMyOrder(id);
  const order = data?.data;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8FC] font-montserrat px-4 py-16 text-center text-[#8A79A5]">
        Loading order…
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="min-h-screen bg-[#FAF8FC] font-montserrat px-4 py-16 text-center space-y-4">
        <Package className="mx-auto text-[#7a3dbf]" size={32} />
        <h1 className="text-xl font-bold text-[#3B1C5A]">Order not found</h1>
        <Link href="/account/orders" className="text-sm font-semibold text-[#7a3dbf] hover:underline">
          Back to My Orders
        </Link>
      </div>
    );
  }

  const trackHref = `/order-tracking/${encodeURIComponent(order.trackingNumber || order.reference)}?email=${encodeURIComponent(order.buyer.email)}`;

  return (
    <div className="min-h-screen bg-[#FAF8FC] font-montserrat">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 space-y-6">
        <Link
          href="/account/orders"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#6D349F] hover:underline"
        >
          <ArrowLeft size={14} />
          Back to My Orders
        </Link>

        <div className="rounded-2xl border border-[#EBD7FA] bg-white p-6 space-y-2">
          <h1 className="text-2xl font-extrabold text-[#6D349F]">#{order.reference.replace(/^#/, "")}</h1>
          <p className="text-sm text-[#8A79A5]">
            {order.displayStatus} · Placed {formatOrderDate(order.createdAt)}
          </p>
          <p className="text-lg font-extrabold text-[#3B1C5A]">{formatPrice(order.total)}</p>
          <Link href={trackHref} className="inline-block text-xs font-bold text-[#7a3dbf] hover:underline">
            Track this order
          </Link>
          <div className="pt-2">
            <MessageSellerButton storeId={order.store?.id} orderId={order.id} label="Message seller about this order" />
          </div>
        </div>

        <div className="rounded-2xl border border-[#EBD7FA] bg-white p-6 space-y-4">
          <h2 className="font-bold text-[#3B1C5A]">Items</h2>
          <ul className="divide-y divide-[#EBD7FA]">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center gap-3 py-3">
                <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-purple-100 shrink-0">
                  {item.productImage ? (
                    <Image src={item.productImage} alt={item.productName} fill className="object-cover" />
                  ) : null}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#3B1C5A] truncate">{item.productName}</p>
                  <p className="text-xs text-[#8A79A5]">Qty {item.quantity}</p>
                </div>
                <p className="text-sm font-bold">{formatPrice(item.price * item.quantity)}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-[#EBD7FA] bg-white p-6 text-sm text-[#5F6C72]">
          <h2 className="font-bold text-[#3B1C5A] mb-2">Shipping</h2>
          <p>
            {[order.shippingAddress.street, order.shippingAddress.city, order.shippingAddress.state]
              .filter(Boolean)
              .join(", ")}
          </p>
        </div>
      </div>
    </div>
  );
}
