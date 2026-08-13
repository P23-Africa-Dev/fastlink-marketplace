"use client";

import { useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  Truck,
  User,
  Mail,
  Phone,
  MapPin,
  Package,
  Edit2,
  CheckCircle2,
  Clock,
  RotateCcw,
  X,
} from "lucide-react";
import { toDashboardOrder, type Order } from "@/lib/order-map";
import { apiErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useSellerOrder, useUpdateOrderStatus } from "@/hooks/use-orders";

const STATUS_STYLES: Record<string, string> = {
  Successful: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Shipped: "bg-blue-50 text-blue-700 border-blue-200",
  Delivered: "bg-purple-50 text-purple-700 border-purple-200",
  Refunded: "bg-rose-50 text-rose-700 border-rose-200",
};

export default function OrderDetailsPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const { id } = params;
  const { data, isLoading, isError } = useSellerOrder(decodeURIComponent(id));
  const updateStatus = useUpdateOrderStatus();
  const order = data?.data ? toDashboardOrder(data.data) : undefined;

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<Order["status"]>("Successful");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("Order status updated successfully!");

  if (isLoading) {
    return (
      <div className="max-w-[1200px] mx-auto py-16 text-center text-slate-500 text-sm font-sans">
        Loading order…
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="max-w-[1200px] mx-auto py-16 text-center space-y-4 font-sans">
        <div className="h-16 w-16 bg-[#faf6ff] text-[#7a3dbf] rounded-2xl flex items-center justify-center mx-auto border border-[#ebd7fa]">
          <Package size={32} />
        </div>
        <h1 className="text-2xl font-semibold text-slate-800">Order Not Found</h1>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          We couldn&apos;t find an order matching ID &quot;{id}&quot;. It may have been removed or the ID is incorrect.
        </p>
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#7a3dbf] text-white rounded-xl text-xs font-semibold hover:bg-[#682fad] transition-all shadow-md"
        >
          <ArrowLeft size={16} />
          <span>Back to Orders</span>
        </Link>
      </div>
    );
  }

  const handleUpdateStatusConfirm = async () => {
    try {
      await updateStatus.mutateAsync({ id: order.rawId, status: selectedStatus });
      setShowStatusModal(false);
      setToastMessage(`Order status updated to "${selectedStatus}" successfully!`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    } catch (error) {
      setToastMessage(apiErrorMessage(error, "Could not update order status."));
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    }
  };

  const subtotal = order.subtotal;
  const shippingFee = order.shipping;
  const grandTotal = order.amount;

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto font-sans pb-12">
      
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-700 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 size={20} className="text-emerald-200" />
          <span className="text-xs font-semibold">
            {toastMessage}
          </span>
        </div>
      )}

      {/* Top Header & Breadcrumb */}
      <div className="space-y-3">
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#7a3dbf] hover:underline"
        >
          <ArrowLeft size={15} />
          <span>Back to Orders List</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-6 rounded-[2rem] border border-[#ebd7fa] shadow-sm">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-semibold text-slate-800 tracking-tight">
                Order Details {order.id}
              </h1>
              <span className={cn("px-3.5 py-1 rounded-full text-xs font-semibold shadow-sm border", STATUS_STYLES[order.status])}>
                {order.status}
              </span>
            </div>
            <p className="text-xs font-normal text-slate-500 mt-1 flex items-center gap-2">
              <Calendar size={14} className="text-slate-400" />
              <span>Placed on {order.date}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSelectedStatus(order.status);
                setShowStatusModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#7a3dbf] hover:bg-[#682fad] text-white text-xs font-semibold shadow-md shadow-purple-600/20 transition-all active:scale-95"
            >
              <Edit2 size={15} />
              <span>Change Status</span>
            </button>
          </div>
        </div>
      </div>

      {/* Customer & Order Metadata Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Customer Information Card */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#ebd7fa] space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-[#7a3dbf]">
            <User size={18} />
            <h2 className="text-sm font-semibold text-slate-800">Customer Details</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-[#f3eafb] text-[#7a3dbf] font-semibold text-xs flex items-center justify-center shrink-0 mt-0.5">
                {order.customerName.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-slate-800 text-sm">{order.customerName}</p>
                <p className="text-slate-400 font-normal text-[11px]">Customer ID: #CUST-9281</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-600 font-normal pt-1">
              <Mail size={15} className="text-slate-400 shrink-0" />
              <a href={`mailto:${order.email}`} className="hover:underline text-slate-700 font-medium truncate">
                {order.email}
              </a>
            </div>

            <div className="flex items-center gap-2 text-slate-600 font-normal">
              <Phone size={15} className="text-slate-400 shrink-0" />
              <span className="text-slate-700 font-medium">{order.phone}</span>
            </div>
          </div>
        </div>

        {/* Shipping Address Card */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#ebd7fa] space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-[#7a3dbf]">
            <MapPin size={18} />
            <h2 className="text-sm font-semibold text-slate-800">Shipping Address</h2>
          </div>

          <div className="space-y-2 text-xs font-normal text-slate-600">
            <p className="font-semibold text-slate-800 text-sm">{order.customerName}</p>
            <p className="leading-relaxed">{order.address}</p>
            <div className="pt-2 flex items-center gap-2 text-[11px] font-semibold text-emerald-600">
              <Truck size={14} />
              <span>Standard Door Delivery</span>
            </div>
          </div>
        </div>

        {/* Payment & Logistics Card */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#ebd7fa] space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-[#7a3dbf]">
            <CreditCard size={18} />
            <h2 className="text-sm font-semibold text-slate-800">Payment & Logistics</h2>
          </div>

          <div className="space-y-2.5 text-xs font-normal">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Payment Method:</span>
              <span className="font-semibold text-slate-800">{order.paymentMethod}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Tracking Number:</span>
              <span className="font-semibold text-[#7a3dbf] bg-[#faf6ff] px-2 py-0.5 rounded-md border border-[#ebd7fa]">
                {order.trackingNumber}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Items Count:</span>
              <span className="font-semibold text-slate-800">{order.items.length} Product(s)</span>
            </div>
          </div>
        </div>

      </div>

      {/* Order Items Table Card */}
      <div className="bg-white rounded-[2.2rem] p-6 shadow-sm border border-[#ebd7fa] space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-slate-800 text-lg font-semibold tracking-tight">Ordered Items</h2>
          <p className="text-slate-400 text-xs font-normal">List of products included in this customer order</p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-[#faf6ff] border-b border-[#ebd7fa] text-[11px] font-semibold uppercase tracking-wider text-[#7a3dbf]">
                <th className="py-3.5 px-4 whitespace-nowrap">Product</th>
                <th className="py-3.5 px-4 whitespace-nowrap">SKU</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Unit Price</th>
                <th className="py-3.5 px-4 whitespace-nowrap text-center">Quantity</th>
                <th className="py-3.5 px-4 whitespace-nowrap text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-normal text-slate-700">
              {order.items.map((item) => (
                <tr key={item.id} className="hover:bg-[#faf6ff]/50 transition-colors">
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-white shrink-0 border border-slate-200 shadow-sm">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                        ) : null}
                      </div>
                      <span className="font-semibold text-slate-800 text-xs sm:text-sm">{item.title}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap text-xs font-normal text-slate-500">{item.sku}</td>
                  <td className="py-4 px-4 whitespace-nowrap text-xs font-semibold text-slate-800">
                    ₦{item.price.toLocaleString()}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap text-xs font-semibold text-slate-800 text-center">
                    {item.quantity}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap text-xs font-semibold text-slate-800 text-right">
                    ₦{(item.price * item.quantity).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Order Payment Summary */}
        <div className="flex flex-col sm:flex-row justify-end pt-2">
          <div className="w-full sm:w-80 bg-[#faf6ff] rounded-2xl p-5 border border-[#ebd7fa] space-y-3 text-xs">
            <div className="flex justify-between text-slate-600 font-normal">
              <span>Items Subtotal:</span>
              <span className="font-semibold text-slate-800">₦{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-600 font-normal">
              <span>Shipping & Delivery:</span>
              <span className="font-semibold text-slate-800">₦{shippingFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-600 font-normal">
              <span>Tax:</span>
              <span className="font-semibold text-slate-800">₦{order.tax.toLocaleString()}</span>
            </div>
            <div className="border-t border-[#ebd7fa] pt-3 flex justify-between text-sm font-semibold text-slate-900">
              <span>Grand Total:</span>
              <span className="text-[#7a3dbf]">₦{grandTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Change Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowStatusModal(false)}
          />
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#ebd7fa] relative z-10 animate-in fade-in zoom-in-95 duration-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-slate-900 text-base font-semibold">Update Order Status</h3>
              <button
                onClick={() => setShowStatusModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-slate-500 text-xs font-normal leading-relaxed">
              Select a new fulfillment status for order <strong className="text-slate-800">{order.id}</strong>:
            </p>

            <div className="space-y-2">
              {(["Successful", "Pending", "Shipped", "Delivered", "Refunded"] as const).map((status) => (
                <label
                  key={status}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all text-xs font-semibold",
                    selectedStatus === status
                      ? "bg-[#faf6ff] border-[#7a3dbf] text-[#7a3dbf] shadow-sm"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="status"
                      value={status}
                      checked={selectedStatus === status}
                      onChange={() => setSelectedStatus(status)}
                      className="accent-[#7a3dbf]"
                    />
                    <span>{status}</span>
                  </div>
                  <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-semibold border", STATUS_STYLES[status])}>
                    {status}
                  </span>
                </label>
              ))}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowStatusModal(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatusConfirm}
                disabled={updateStatus.isPending}
                className="flex-1 py-2.5 bg-[#7a3dbf] hover:bg-[#682fad] disabled:opacity-60 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-purple-600/20"
              >
                {updateStatus.isPending ? "Updating…" : "Confirm Update"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
