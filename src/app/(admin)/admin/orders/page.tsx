"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { useAdminOrders, useAdminRiders, useAssignRider } from "@/hooks/use-admin";
import { formatPrice } from "@/lib/utils";

export default function AdminOrdersPage() {
  const [q, setQ] = useState("");
  const { data, isLoading } = useAdminOrders({ q });
  const ridersQuery = useAdminRiders({ status: "approved" });
  const assign = useAssignRider();
  const riders = ridersQuery.data?.data ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black text-[#14081c]">Orders</h1>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search reference, tracking, or email" className="rounded-xl border border-[#e3d4f0] bg-white px-4 py-2.5 text-sm font-semibold w-full max-w-lg" />
      <div className="bg-white rounded-3xl border border-[#e3d4f0] overflow-x-auto">
        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin text-[#7a3dbf]" /></div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-slate-400 border-b">
                <th className="p-4">Reference</th>
                <th className="p-4">Buyer</th>
                <th className="p-4">Store</th>
                <th className="p-4">Total</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Status</th>
                <th className="p-4">Rider</th>
              </tr>
            </thead>
            <tbody>
              {(data?.data ?? []).map((order) => (
                <tr key={order.id} className="border-b border-slate-50">
                  <td className="p-4 font-bold">{order.reference}</td>
                  <td className="p-4 text-xs">{order.buyer.email}</td>
                  <td className="p-4 text-xs">{order.store?.name ?? "—"}</td>
                  <td className="p-4 font-semibold">{formatPrice(order.total)}</td>
                  <td className="p-4 text-xs font-bold uppercase">{order.paymentStatus}</td>
                  <td className="p-4 text-xs font-black uppercase">{order.status}</td>
                  <td className="p-4">
                    <select
                      defaultValue={order.rider?.id ?? ""}
                      onChange={(e) => {
                        if (e.target.value) assign.mutate({ orderId: order.id, riderId: e.target.value });
                      }}
                      className="rounded-lg border border-[#e3d4f0] px-2 py-1 text-xs font-semibold max-w-[140px]"
                    >
                      <option value="">{order.rider?.name ?? "Assign rider"}</option>
                      {riders.map((rider) => (
                        <option key={rider.id} value={rider.id}>
                          {rider.user?.name ?? rider.phone}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
