"use client";

import Link from "next/link";
import { Bike, Loader2, LogOut, Package, ShieldCheck, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

import { useRiderMe, useRiderOrders } from "@/hooks/use-rider";
import { formatPrice } from "@/lib/utils";
import { formatOrderDate } from "@/lib/order-map";
import { useAuthStore } from "@/store/auth-store";

export default function RiderHomePage() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const me = useRiderMe();
  const orders = useRiderOrders();
  const status = me.data?.status ?? null;
  const isPending = status === "pending";
  const isRejected = status === "rejected";

  return (
    <div className="min-h-screen bg-[#FAF8FC] font-montserrat">
      <div className="mx-auto max-w-4xl px-4 py-10 space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-[#7a3dbf] text-white flex items-center justify-center">
              <Bike size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-[#6D349F]">Rider deliveries</h1>
              <p className="text-sm text-[#8A79A5]">
                {me.data ? `${me.data.vehicleType} · ${me.data.city ?? "—"} · ${me.data.status}` : "Assigned orders appear here."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              logout();
              router.push("/login");
            }}
            className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>

        {isPending && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
            <p className="flex items-center gap-2 text-sm font-bold">
              <ShieldCheck size={16} />
              Rider KYC under review
            </p>
            <p className="mt-1 text-xs text-amber-800">
              Your profile is active, but you cannot receive delivery assignments until your rider KYC is approved by admin.
            </p>
          </div>
        )}

        {isRejected && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-900">
            <p className="flex items-center gap-2 text-sm font-bold">
              <AlertTriangle size={16} />
              Rider application was not approved
            </p>
            <p className="mt-1 text-xs text-rose-700">
              Your rider KYC was rejected. Please contact support or resubmit your details with a valid ID card.
            </p>
          </div>
        )}

        {orders.isLoading && <Loader2 className="animate-spin text-[#7a3dbf]" />}
        {orders.isError && <p className="text-rose-600 text-sm">Could not load assigned orders.</p>}

        {!orders.isLoading && (orders.data ?? []).length === 0 && (
          <div className="rounded-2xl border border-[#EBD7FA] bg-white p-10 text-center space-y-2">
            <Package className="mx-auto text-[#7a3dbf]" />
            <p className="font-bold text-[#3B1C5A]">No deliveries assigned yet</p>
            <p className="text-sm text-[#8A79A5]">An admin will assign orders to you from Control.</p>
          </div>
        )}

        <ul className="space-y-3">
          {(orders.data ?? []).map((order) => (
            <li key={order.id} className="rounded-2xl border border-[#EBD7FA] bg-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="font-bold text-[#6D349F]">#{order.reference.replace(/^#/, "")}</p>
                <p className="text-xs text-[#8A79A5]">{formatOrderDate(order.createdAt)} · {order.store?.name}</p>
                <p className="text-xs text-[#5F6C72]">{order.shippingAddress.street}, {order.shippingAddress.city}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-extrabold">{formatPrice(order.total)}</p>
                <p className="text-xs font-bold uppercase text-[#8A79A5]">{order.status}</p>
              </div>
            </li>
          ))}
        </ul>

        <Link href="/" className="text-xs font-bold text-[#7a3dbf] hover:underline">Back to marketplace</Link>
      </div>
    </div>
  );
}
