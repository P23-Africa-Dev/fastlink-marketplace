"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Package, RotateCcw, Download, Scale } from "lucide-react";

import { formatPrice } from "@/lib/utils";
import { formatOrderDate } from "@/lib/order-map";
import { apiErrorMessage, ordersApi } from "@/lib/api";
import { useMyOrder } from "@/hooks/use-orders";
import { useOrderReturn, useRequestReturn } from "@/hooks/use-returns";
import { useOpenDispute, useOrderDispute } from "@/hooks/use-disputes";
import { MessageSellerButton } from "@/components/inbox/message-seller";

export default function AccountOrderDetailPage() {
  const params = useParams();
  const id = decodeURIComponent(String(params?.id ?? ""));
  const { data, isLoading, isError } = useMyOrder(id);
  const returnQuery = useOrderReturn(id);
  const disputeQuery = useOrderDispute(id);
  const requestReturn = useRequestReturn();
  const openDispute = useOpenDispute();
  const [reason, setReason] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [toast, setToast] = useState("");
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const order = data?.data;
  const returnRequest = returnQuery.data ?? null;
  const dispute = disputeQuery.data ?? null;

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

  const canRequestReturn =
    order.paymentStatus === "paid" &&
    ["confirmed", "shipped", "delivered"].includes(order.status) &&
    !returnRequest &&
    !dispute;

  const canOpenDispute =
    order.paymentStatus === "paid" &&
    !dispute &&
    !returnRequest;

  async function handleDownloadInvoice() {
    setInvoiceLoading(true);
    try {
      const invoice = await ordersApi.invoice(id);
      const blob = new Blob([invoice.html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      setToast(apiErrorMessage(err, "Could not download receipt."));
      setTimeout(() => setToast(""), 4000);
    } finally {
      setInvoiceLoading(false);
    }
  }

  async function handleReturnSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason.trim()) return;
    try {
      await requestReturn.mutateAsync({ orderId: id, reason: reason.trim() });
      setShowForm(false);
      setReason("");
      setToast("Return request submitted.");
      setTimeout(() => setToast(""), 3000);
    } catch (err) {
      setToast(apiErrorMessage(err, "Could not submit return request."));
      setTimeout(() => setToast(""), 4000);
    }
  }

  async function handleDisputeSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!disputeReason.trim()) return;
    try {
      await openDispute.mutateAsync({ orderId: id, reason: disputeReason.trim() });
      setShowDisputeForm(false);
      setDisputeReason("");
      setToast("Dispute opened. The seller and platform will review it.");
      setTimeout(() => setToast(""), 3000);
    } catch (err) {
      setToast(apiErrorMessage(err, "Could not open dispute."));
      setTimeout(() => setToast(""), 4000);
    }
  }

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
          {order.paymentStatus === "paid" && (
            <button
              type="button"
              disabled={invoiceLoading}
              onClick={handleDownloadInvoice}
              className="ml-4 inline-flex items-center gap-1 text-xs font-bold text-[#7a3dbf] hover:underline disabled:opacity-60"
            >
              <Download size={14} />
              {invoiceLoading ? "Loading…" : "Download receipt"}
            </button>
          )}
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

        {(returnRequest || canRequestReturn) && (
          <div className="rounded-2xl border border-[#EBD7FA] bg-white p-6 space-y-4">
            <h2 className="font-bold text-[#3B1C5A] flex items-center gap-2">
              <RotateCcw size={18} className="text-[#7a3dbf]" />
              Returns
            </h2>
            {returnRequest ? (
              <div className="rounded-xl bg-[#FAF8FC] border border-[#EBD7FA] p-4 space-y-2">
                <p className="text-xs font-black uppercase text-[#6D349F]">{returnRequest.displayStatus}</p>
                <p className="text-sm">{returnRequest.reason}</p>
                {returnRequest.refundAmount != null && (
                  <p className="text-sm font-bold text-[#3B1C5A]">
                    Refund: {formatPrice(returnRequest.refundAmount)}
                  </p>
                )}
                <p className="text-xs text-[#8A79A5]">
                  Requested {formatOrderDate(returnRequest.createdAt)}
                </p>
              </div>
            ) : showForm ? (
              <form onSubmit={handleReturnSubmit} className="space-y-3">
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Tell the seller why you want to return this order…"
                  className="w-full min-h-[100px] rounded-xl border border-[#EBD7FA] px-3 py-2 text-sm outline-none focus:border-[#7a3dbf]"
                  required
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={requestReturn.isPending}
                    className="rounded-xl bg-[#7a3dbf] px-4 py-2 text-xs font-bold text-white"
                  >
                    Submit request
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="rounded-xl border border-[#EBD7FA] px-4 py-2 text-xs font-bold text-[#6D349F]"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="rounded-xl border border-[#EBD7FA] px-4 py-2 text-xs font-bold text-[#6D349F] hover:bg-[#FAF8FC]"
              >
                Request a return
              </button>
            )}
          </div>
        )}

        {(dispute || canOpenDispute) && (
          <div className="rounded-2xl border border-[#EBD7FA] bg-white p-6 space-y-4">
            <h2 className="font-bold text-[#3B1C5A] flex items-center gap-2">
              <Scale size={18} className="text-[#7a3dbf]" />
              Disputes
            </h2>
            {dispute ? (
              <div className="rounded-xl bg-[#FAF8FC] border border-[#EBD7FA] p-4 space-y-2">
                <p className="text-xs font-black uppercase text-[#6D349F]">{dispute.displayStatus}</p>
                <p className="text-sm">{dispute.reason}</p>
                {dispute.sellerResponse && (
                  <p className="text-sm text-[#5F6C72]">
                    <span className="font-semibold">Seller:</span> {dispute.sellerResponse}
                  </p>
                )}
                {dispute.refundAmount != null && (
                  <p className="text-sm font-bold text-[#3B1C5A]">
                    Refund: {formatPrice(dispute.refundAmount)}
                  </p>
                )}
                <p className="text-xs text-[#8A79A5]">Opened {formatOrderDate(dispute.createdAt)}</p>
              </div>
            ) : showDisputeForm ? (
              <form onSubmit={handleDisputeSubmit} className="space-y-3">
                <textarea
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  placeholder="Describe the issue with this order…"
                  className="w-full min-h-[100px] rounded-xl border border-[#EBD7FA] px-3 py-2 text-sm outline-none focus:border-[#7a3dbf]"
                  required
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={openDispute.isPending}
                    className="rounded-xl bg-[#7a3dbf] px-4 py-2 text-xs font-bold text-white"
                  >
                    Submit dispute
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDisputeForm(false)}
                    className="rounded-xl border border-[#EBD7FA] px-4 py-2 text-xs font-bold text-[#6D349F]"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setShowDisputeForm(true)}
                className="rounded-xl border border-[#EBD7FA] px-4 py-2 text-xs font-bold text-[#6D349F] hover:bg-[#FAF8FC]"
              >
                Open a dispute
              </button>
            )}
          </div>
        )}

        {toast && (
          <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-[#3B1C5A] px-4 py-3 text-sm font-semibold text-white shadow-lg">
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}
