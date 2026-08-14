"use client";

import { useState, useMemo } from "react";
import { Loader2, Scale, Search, CheckCircle2, RotateCcw, AlertTriangle, MessageSquare, DollarSign } from "lucide-react";

import { useAdminDisputes, useUpdateDispute } from "@/hooks/use-admin";
import { apiErrorMessage } from "@/lib/api";
import { formatPrice, cn } from "@/lib/utils";
import type { DisputeRow } from "@/types/admin";
import { Pagination } from "@/components/dashboard/pagination";
import { StatCard } from "@/components/dashboard/stat-card";

export default function AdminDisputesPage() {
  const { data, isLoading, isError, refetch } = useAdminDisputes();
  const update = useUpdateDispute();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const rawRows = data?.data ?? [];

  async function resolve(id: string, resolution: string, orderTotal?: number) {
    const note = window.prompt("Admin note (optional):") ?? undefined;
    let refundAmount: number | undefined;

    if (resolution === "refund" && orderTotal != null) {
      const input = window.prompt(
        `Refund amount (leave blank for full ${formatPrice(orderTotal)}):`,
        String(orderTotal),
      );
      if (input === null) return;
      if (input.trim()) {
        refundAmount = Number(input);
        if (Number.isNaN(refundAmount) || refundAmount <= 0) {
          alert("Invalid refund amount.");
          return;
        }
      }
    }

    setResolvingId(id);
    try {
      await update.mutateAsync({
        id,
        action: "resolve",
        resolution,
        admin_note: note,
        refund_amount: refundAmount,
      });
      refetch();
    } catch (err) {
      alert(apiErrorMessage(err, "Could not resolve dispute."));
    } finally {
      setResolvingId(null);
    }
  }

  const filteredRows = useMemo(() => {
    return rawRows.filter((d) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        (d.reason ?? "").toLowerCase().includes(q) ||
        (d.order?.reference ?? "").toLowerCase().includes(q) ||
        (d.buyer?.email ?? "").toLowerCase().includes(q) ||
        (d.sellerResponse ?? "").toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "open"
          ? !d.status.startsWith("resolved")
          : d.status.startsWith("resolved");
      return matchesSearch && matchesStatus;
    });
  }, [rawRows, searchQuery, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage, pageSize]);

  const openCount = rawRows.filter((d) => !d.status.startsWith("resolved")).length;
  const resolvedCount = rawRows.filter((d) => d.status.startsWith("resolved")).length;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto font-sans">
      {/* ── Top Header Banner ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-[#ebd7fa] shadow-sm">
        <div>
          <span className="px-3 py-1 rounded-full bg-[#ebd7fa] text-[#7a3dbf] text-[11px] font-black uppercase tracking-wider">
            Trust & Dispute Resolution
          </span>
          <h2 className="text-2xl font-bold text-slate-800 mt-2">Customer & Merchant Disputes</h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
            Arbitrate contentious buyer returns, missing items, and vendor claims.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#f3eafb] px-4 py-2.5 rounded-xl text-[#7a3dbf] font-bold text-xs">
            <Scale size={18} />
            <span>{openCount} Open Cases Requiring Action</span>
          </div>
        </div>
      </div>

      {/* ── Metric Stat Cards ────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Open Dispute Claims"
          value={openCount}
          icon={<Scale size={20} />}
          variant={openCount > 0 ? "amber" : "purple"}
          badgeText={openCount > 0 ? "Action Required" : "All Clear"}
          badgeType={openCount > 0 ? "warning" : "success"}
          subtitle="Awaiting administrative ruling"
        />

        <StatCard
          title="Resolved Disputes"
          value={resolvedCount}
          icon={<CheckCircle2 size={20} />}
          variant="emerald"
          badgeText="Settled"
          badgeType="success"
          subtitle="Closed & processed"
        />

        <StatCard
          title="Total Claims Logged"
          value={rawRows.length}
          icon={<MessageSquare size={20} />}
          variant="purple"
          badgeText="Lifetime"
          badgeType="neutral"
          subtitle="All recorded arbitration cases"
        />
      </div>

      {/* ── Table & Filter Container ─────────────────────────────── */}
      <div className="bg-white rounded-[2rem] border border-[#ebd7fa] p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by order ref, buyer, reason..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl pl-9 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/20 focus:border-[#7a3dbf] transition"
            />
          </div>

          <div className="flex items-center gap-2">
            {[
              { id: "all", label: "All Cases" },
              { id: "open", label: "Open Only" },
              { id: "resolved", label: "Resolved" },
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
            <p className="text-xs font-bold text-slate-400">Loading disputes data...</p>
          </div>
        ) : isError ? (
          <div className="p-6 text-center text-rose-600 font-semibold text-sm">
            Could not fetch dispute cases.
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="text-center py-16">
            <Scale size={40} className="mx-auto text-[#ebd7fa] mb-2" />
            <p className="text-sm font-bold text-slate-700">No disputes found</p>
            <p className="text-xs text-slate-400 mt-1">Everything is in good order or no cases match.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {paginatedRows.map((d: DisputeRow) => {
              const isResolved = d.status.startsWith("resolved");
              return (
                <div
                  key={d.id}
                  className="rounded-2xl bg-white border border-[#ebd7fa] p-5 space-y-3 hover:shadow-sm transition"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{d.reason}</span>
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase border",
                            isResolved
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          )}
                        >
                          {d.displayStatus}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Order Ref: <span className="font-bold text-slate-800">{d.order?.reference ?? "—"}</span> · Buyer:{" "}
                        <span className="font-medium text-slate-700">{d.buyer?.email ?? "—"}</span>
                        {d.order?.total != null ? ` · Total ${formatPrice(d.order.total)}` : ""}
                      </p>
                    </div>

                    {d.refundAmount != null && (
                      <div className="bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl text-emerald-800 font-bold text-xs flex items-center gap-1">
                        <DollarSign size={14} />
                        <span>Refund: {formatPrice(d.refundAmount)}</span>
                      </div>
                    )}
                  </div>

                  {d.sellerResponse && (
                    <div className="bg-[#faf6ff] rounded-xl p-3 border border-[#ebd7fa] text-xs text-slate-700">
                      <span className="font-bold text-[#7a3dbf] mr-1.5">Merchant Statement:</span>
                      {d.sellerResponse}
                    </div>
                  )}

                  {!isResolved && (
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100 flex-wrap">
                      <button
                        type="button"
                        onClick={() => update.mutateAsync({ id: d.id, action: "review" }).then(() => refetch())}
                        className="px-3 py-1.5 bg-[#f3eafb] text-[#7a3dbf] hover:bg-[#ebd7fa] rounded-xl text-xs font-bold transition"
                      >
                        Set Under Review
                      </button>
                      <button
                        type="button"
                        onClick={() => resolve(d.id, "refund", d.order?.total)}
                        className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-bold transition"
                      >
                        Approve Refund
                      </button>
                      <button
                        type="button"
                        onClick={() => resolve(d.id, "replacement")}
                        className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-xl text-xs font-bold transition"
                      >
                        Order Replacement
                      </button>
                      <button
                        type="button"
                        onClick={() => resolve(d.id, "rejected")}
                        className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-bold transition"
                      >
                        Reject Claim
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredRows.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
              itemName="dispute cases"
            />
          </div>
        )}
      </div>
    </div>
  );
}
