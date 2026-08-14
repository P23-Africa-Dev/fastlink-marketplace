"use client";

import { useState, useMemo } from "react";
import { Loader2, ShoppingBag, Search, Bike, CheckCircle2, Clock, Truck, DollarSign, Store } from "lucide-react";

import { useAdminOrders, useAdminRiders, useAssignRider } from "@/hooks/use-admin";
import { formatPrice, cn } from "@/lib/utils";
import { Pagination } from "@/components/dashboard/pagination";
import { StatCard } from "@/components/dashboard/stat-card";

export default function AdminOrdersPage() {
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { data, isLoading, isError } = useAdminOrders({ q });
  const ridersQuery = useAdminRiders({ status: "approved" });
  const assign = useAssignRider();
  const riders = ridersQuery.data?.data ?? [];

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [assigningOrderId, setAssigningOrderId] = useState<string | null>(null);

  const rawOrders = data?.data ?? [];

  const filteredOrders = useMemo(() => {
    return rawOrders.filter((order) => {
      const query = q.toLowerCase();
      const matchesSearch =
        order.reference.toLowerCase().includes(query) ||
        (order.buyer?.email && order.buyer.email.toLowerCase().includes(query)) ||
        (order.store?.name && order.store.name.toLowerCase().includes(query));
      const matchesStatus = statusFilter === "all" || order.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [rawOrders, q, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, currentPage, pageSize]);

  const totalGMV = rawOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const pendingFulfillment = rawOrders.filter((o) => o.status === "pending" || o.status === "confirmed").length;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto font-sans">
      {/* ── Top Header Banner ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-[#ebd7fa] shadow-sm">
        <div>
          <span className="px-3 py-1 rounded-full bg-[#ebd7fa] text-[#7a3dbf] text-[11px] font-black uppercase tracking-wider">
            Order Fulfillment & Dispatch
          </span>
          <h2 className="text-2xl font-bold text-slate-800 mt-2">Marketplace Orders & Dispatch</h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
            Global view of transactions, delivery fulfillment statuses, and dispatch fleet assignment.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#f3eafb] px-4 py-2.5 rounded-xl text-[#7a3dbf] font-bold text-xs">
          <ShoppingBag size={18} />
          <span>{rawOrders.length} Total Orders</span>
        </div>
      </div>

      {/* ── Metric Stat Cards ────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Total Order Volume"
          value={rawOrders.length}
          icon={<ShoppingBag size={20} />}
          variant="purple"
          badgeText="Total"
          badgeType="neutral"
          subtitle="Orders across all stores"
        />

        <StatCard
          title="Gross Revenue Value"
          value={formatPrice(totalGMV)}
          icon={<DollarSign size={20} />}
          variant="emerald"
          badgeText="Marketplace Volume"
          badgeType="success"
          subtitle="Aggregate transaction total"
        />

        <StatCard
          title="Pending Fulfillment"
          value={pendingFulfillment}
          icon={<Clock size={20} />}
          variant={pendingFulfillment > 0 ? "amber" : "emerald"}
          badgeText={pendingFulfillment > 0 ? "In Progress" : "Clear"}
          badgeType={pendingFulfillment > 0 ? "warning" : "success"}
          subtitle="Awaiting pickup or delivery"
        />
      </div>

      {/* ── Table & Filters ──────────────────────────────────────── */}
      <div className="bg-white rounded-[2rem] border border-[#ebd7fa] p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search reference, buyer email or store..."
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl pl-9 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/20 focus:border-[#7a3dbf] transition"
            />
          </div>

          <div className="flex items-center gap-2">
            {[
              { id: "all", label: "All Orders" },
              { id: "paid", label: "Paid" },
              { id: "shipped", label: "Shipped" },
              { id: "delivered", label: "Delivered" },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => {
                  setStatusFilter(st.id);
                  setCurrentPage(1);
                }}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-bold transition",
                  statusFilter === st.id
                    ? "bg-[#7a3dbf] text-white shadow-sm shadow-purple-600/20"
                    : "bg-[#faf6ff] text-slate-600 hover:bg-[#f3eafb]"
                )}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-[#7a3dbf]" />
            <p className="text-xs font-bold text-slate-400">Loading marketplace orders...</p>
          </div>
        ) : isError ? (
          <div className="p-6 text-center text-rose-600 font-semibold text-sm">
            Could not retrieve orders.
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag size={40} className="mx-auto text-[#ebd7fa] mb-2" />
            <p className="text-sm font-bold text-slate-700">No orders found</p>
            <p className="text-xs text-slate-400 mt-1">Try modifying your search or filter parameters.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#faf6ff] text-slate-500 font-bold uppercase tracking-wider border-b border-[#ebd7fa]">
                    <th className="px-4 py-3.5 rounded-l-xl">Order Reference</th>
                    <th className="px-4 py-3.5">Customer</th>
                    <th className="px-4 py-3.5">Store / Outlet</th>
                    <th className="px-4 py-3.5">Total Amount</th>
                    <th className="px-4 py-3.5">Payment</th>
                    <th className="px-4 py-3.5">Fulfillment Status</th>
                    <th className="px-4 py-3.5 rounded-r-xl">Assigned Rider</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-[#faf6ff]/70 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-lg bg-[#f3eafb] text-[#7a3dbf] flex items-center justify-center font-bold">
                            <ShoppingBag size={13} />
                          </div>
                          <span className="font-bold text-slate-900">{order.reference}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 font-medium">
                        {order.buyer?.email ?? "—"}
                      </td>
                      <td className="px-4 py-3.5 text-slate-800 font-semibold">
                        <div className="flex items-center gap-1.5">
                          <Store size={12} className="text-[#7a3dbf]" />
                          <span>{order.store?.name ?? "—"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-slate-900 text-sm">
                        {formatPrice(order.total)}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={cn(
                            "inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border",
                            order.paymentStatus === "paid" || order.paymentStatus === "successful"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          )}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={cn(
                            "inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border",
                            order.status === "delivered"
                              ? "bg-purple-50 text-[#7a3dbf] border-purple-200"
                              : order.status === "shipped"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          )}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <Bike size={14} className="text-slate-400 shrink-0" />
                          <select
                            defaultValue={order.rider?.id ?? ""}
                            disabled={assigningOrderId === order.id}
                            onChange={async (e) => {
                              if (e.target.value) {
                                setAssigningOrderId(order.id);
                                try {
                                  await assign.mutateAsync({ orderId: order.id, riderId: e.target.value });
                                } finally {
                                  setAssigningOrderId(null);
                                }
                              }
                            }}
                            className="bg-[#faf6ff] border border-[#ebd7fa] rounded-lg px-2 py-1 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/20 cursor-pointer max-w-[160px]"
                          >
                            <option value="">{order.rider?.name ?? "Assign rider..."}</option>
                            {riders.map((rider) => (
                              <option key={rider.id} value={rider.id}>
                                {rider.user?.name ?? rider.phone}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredOrders.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
              itemName="orders"
            />
          </>
        )}
      </div>
    </div>
  );
}
