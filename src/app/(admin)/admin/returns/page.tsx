"use client";

import { useState, useMemo } from "react";
import { Loader2, RotateCcw, Search, CheckCircle2, XCircle, DollarSign, Store, ShoppingBag, Clock } from "lucide-react";

import { apiErrorMessage } from "@/lib/api";
import { formatOrderDate } from "@/lib/order-map";
import { formatPrice, cn } from "@/lib/utils";
import { useAdminReturnAction, useAdminReturns } from "@/hooks/use-admin";
import { Pagination } from "@/components/dashboard/pagination";
import { StatCard } from "@/components/dashboard/stat-card";

const STATUSES = ["All", "pending", "refunded", "rejected"] as const;

export default function AdminReturnsPage() {
  const [statusFilter, setStatusFilter] = useState<(typeof STATUSES)[number]>("All");
  const { data, isLoading, isError, refetch } = useAdminReturns({
    status: statusFilter === "All" ? undefined : statusFilter,
  });
  const action = useAdminReturnAction();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const rawReturns = data?.data ?? [];

  async function handleAction(id: string, approve: boolean) {
    setProcessingId(id);
    try {
      if (!approve) {
        const note = window.prompt("Optional note for the buyer:");
        if (note === null) return;
        await action.mutateAsync({ id, action: "reject", note: note || undefined });
      } else {
        if (!window.confirm("Approve this return and record a full refund to customer?")) return;
        await action.mutateAsync({ id, action: "approve" });
      }
      refetch();
    } catch (err) {
      alert(apiErrorMessage(err, "Could not update return."));
    } finally {
      setProcessingId(null);
    }
  }

  const filteredReturns = useMemo(() => {
    return rawReturns.filter((r) => {
      const q = searchQuery.toLowerCase();
      const orderRef = (r.order?.reference ?? "").toLowerCase();
      const buyer = `${r.buyer?.name ?? ""} ${r.buyer?.email ?? ""}`.toLowerCase();
      const store = (r.store?.name ?? "").toLowerCase();
      return orderRef.includes(q) || buyer.includes(q) || store.includes(q);
    });
  }, [rawReturns, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredReturns.length / pageSize));
  const paginatedReturns = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredReturns.slice(start, start + pageSize);
  }, [filteredReturns, currentPage, pageSize]);

  const pendingReturnsCount = rawReturns.filter((r) => r.status === "pending").length;
  const refundedReturnsCount = rawReturns.filter((r) => r.status === "refunded" || r.status === "approved").length;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto font-sans">
      {/* ── Top Header Banner ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-[#ebd7fa] shadow-sm">
        <div>
          <span className="px-3 py-1 rounded-full bg-[#ebd7fa] text-[#7a3dbf] text-[11px] font-black uppercase tracking-wider">
            RMA & Reverse Logistics
          </span>
          <h2 className="text-2xl font-bold text-slate-800 mt-2">Returns & Customer Refund Claims</h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
            Authorize return merchandise requests, review merchant inspection notes, and disburse refunds.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#f3eafb] px-4 py-2.5 rounded-xl text-[#7a3dbf] font-bold text-xs">
          <RotateCcw size={18} />
          <span>{pendingReturnsCount} Pending Approval</span>
        </div>
      </div>

      {/* ── Metric Stat Cards ────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Pending Return Requests"
          value={pendingReturnsCount}
          icon={<Clock size={20} />}
          variant={pendingReturnsCount > 0 ? "amber" : "emerald"}
          badgeText={pendingReturnsCount > 0 ? "Needs Review" : "Clear"}
          badgeType={pendingReturnsCount > 0 ? "warning" : "success"}
          subtitle="Customer items awaiting return confirmation"
        />

        <StatCard
          title="Refunded Claims"
          value={refundedReturnsCount}
          icon={<CheckCircle2 size={20} />}
          variant="emerald"
          badgeText="Processed"
          badgeType="success"
          subtitle="Approved refunds disbursed"
        />

        <StatCard
          title="Total Returns History"
          value={rawReturns.length}
          icon={<RotateCcw size={20} />}
          variant="purple"
          badgeText="All Time"
          badgeType="neutral"
          subtitle="Cumulative RMA requests"
        />
      </div>

      {/* ── Table & Search ───────────────────────────────────────── */}
      <div className="bg-white rounded-[2rem] border border-[#ebd7fa] p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by order ref, customer or store..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl pl-9 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/20 focus:border-[#7a3dbf] transition"
            />
          </div>

          <div className="flex items-center gap-2">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setStatusFilter(s);
                  setCurrentPage(1);
                }}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition",
                  statusFilter === s
                    ? "bg-[#7a3dbf] text-white shadow-sm shadow-purple-600/20"
                    : "bg-[#faf6ff] text-slate-600 hover:bg-[#f3eafb]"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-[#7a3dbf]" />
            <p className="text-xs font-bold text-slate-400">Loading returns...</p>
          </div>
        ) : isError ? (
          <div className="p-6 text-center text-rose-600 font-semibold text-sm">
            Could not fetch return requests.
          </div>
        ) : filteredReturns.length === 0 ? (
          <div className="text-center py-16">
            <RotateCcw size={40} className="mx-auto text-[#ebd7fa] mb-2" />
            <p className="text-sm font-bold text-slate-700">No return requests found</p>
            <p className="text-xs text-slate-400 mt-1">No items currently match your search or filter.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#faf6ff] text-slate-500 font-bold uppercase tracking-wider border-b border-[#ebd7fa]">
                    <th className="px-4 py-3.5 rounded-l-xl">Order & Value</th>
                    <th className="px-4 py-3.5">Store Outlet</th>
                    <th className="px-4 py-3.5">Customer Buyer</th>
                    <th className="px-4 py-3.5">Return Status</th>
                    <th className="px-4 py-3.5">Date Requested</th>
                    <th className="px-4 py-3.5 rounded-r-xl text-right">RMA Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedReturns.map((r) => (
                    <tr key={r.id} className="hover:bg-[#faf6ff]/70 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-lg bg-[#f3eafb] text-[#7a3dbf] flex items-center justify-center font-bold">
                            <ShoppingBag size={13} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">
                              #{r.order?.reference?.replace(/^#/, "") ?? r.order?.id}
                            </p>
                            <p className="text-[11px] text-slate-400 font-semibold">
                              {r.order ? formatPrice(r.order.total) : "—"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-700 font-semibold">
                        <div className="flex items-center gap-1.5">
                          <Store size={12} className="text-[#7a3dbf]" />
                          <span>{r.store?.name ?? "—"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-slate-900">{r.buyer?.name ?? "Customer"}</p>
                        <p className="text-[11px] text-slate-400">{r.buyer?.email}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={cn(
                            "inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border",
                            r.status === "refunded" || r.status === "approved"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : r.status === "rejected"
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          )}
                        >
                          {r.displayStatus ?? r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500">
                        {formatOrderDate(r.createdAt)}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {r.status === "pending" ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              disabled={processingId === r.id}
                              onClick={() => handleAction(r.id, true)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl font-bold text-xs transition disabled:opacity-50"
                            >
                              {processingId === r.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={13} />}
                              <span>Approve & Refund</span>
                            </button>
                            <button
                              type="button"
                              disabled={processingId === r.id}
                              onClick={() => handleAction(r.id, false)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl font-bold text-xs transition disabled:opacity-50"
                            >
                              <XCircle size={13} />
                              <span>Reject</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs font-semibold">Settled</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredReturns.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
              itemName="returns"
            />
          </>
        )}
      </div>
    </div>
  );
}
