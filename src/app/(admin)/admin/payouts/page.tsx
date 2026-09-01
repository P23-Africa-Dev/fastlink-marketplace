"use client";

import { useState, useMemo } from "react";
import { Loader2, Wallet, Search, CheckCircle2, XCircle, Building, DollarSign, Clock, Store } from "lucide-react";

import { useAdminPayoutActions, useAdminPayouts } from "@/hooks/use-admin";
import { apiErrorMessage } from "@/lib/api";
import { formatPrice, cn } from "@/lib/utils";
import { Pagination } from "@/components/dashboard/pagination";
import { StatCard } from "@/components/dashboard/stat-card";

export default function AdminPayoutsPage() {
  const { data, isLoading, isError, refetch } = useAdminPayouts();
  const actions = useAdminPayoutActions();
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const rawPayouts = data?.data ?? [];

  async function run(id: string, fn: () => Promise<unknown>) {
    setError("");
    setProcessingId(id);
    try {
      await fn();
      refetch();
    } catch (err) {
      setError(apiErrorMessage(err, "Payout action failed."));
    } finally {
      setProcessingId(null);
    }
  }

  const filteredPayouts = useMemo(() => {
    return rawPayouts.filter((p) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        (p.store?.name && p.store.name.toLowerCase().includes(q)) ||
        (p.bankName && p.bankName.toLowerCase().includes(q)) ||
        (p.accountNumber && p.accountNumber.includes(q));
      const matchesStatus = statusFilter === "all" || p.status?.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [rawPayouts, searchQuery, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredPayouts.length / pageSize));
  const paginatedPayouts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPayouts.slice(start, start + pageSize);
  }, [filteredPayouts, currentPage, pageSize]);

  const pendingPayouts = rawPayouts.filter((p) => p.status === "pending");
  const pendingAmount = pendingPayouts.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const settledAmount = rawPayouts
    .filter((p) => p.status === "approved" || p.status === "transferred")
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto font-sans">
      {/* ── Top Header Banner ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-[#ebd7fa] shadow-sm">
        <div>
          <span className="px-3 py-1 rounded-full bg-[#ebd7fa] text-[#7a3dbf] text-[11px] font-black uppercase tracking-wider">
            Treasury & Disbursements
          </span>
          <h2 className="text-2xl font-bold text-slate-800 mt-2">Vendor Payouts & Settlements</h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
            Authorize bank account disbursements, audit vendor settlements, and review payouts.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#f3eafb] px-4 py-2.5 rounded-xl text-[#7a3dbf] font-bold text-xs">
          <Wallet size={18} />
          <span>{pendingPayouts.length} Pending Approval</span>
        </div>
      </div>

      {/* ── Metric Stat Cards ────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Pending Payout Requests"
          value={pendingPayouts.length}
          icon={<Clock size={20} />}
          variant={pendingPayouts.length > 0 ? "amber" : "emerald"}
          badgeText={pendingPayouts.length > 0 ? "Awaiting Transfer" : "All Settled"}
          badgeType={pendingPayouts.length > 0 ? "warning" : "success"}
          subtitle="Requests ready for bank disbursement"
        />

        <StatCard
          title="Pending Settlement Volume"
          value={formatPrice(pendingAmount)}
          icon={<DollarSign size={20} />}
          variant="rose"
          badgeText="Payable"
          badgeType="danger"
          subtitle="Total bank transfer queue"
        />

        <StatCard
          title="Disbursed Historical Total"
          value={formatPrice(settledAmount)}
          icon={<Wallet size={20} />}
          variant="emerald"
          badgeText="Settled"
          badgeType="success"
          subtitle="Transferred to merchant bank accounts"
        />
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* ── Table & Search ───────────────────────────────────────── */}
      <div className="bg-white rounded-[2rem] border border-[#ebd7fa] p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search store name, bank or account..."
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
              { id: "all", label: "All Payouts" },
              { id: "pending", label: "Pending" },
              { id: "approved", label: "Approved / Paid" },
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
            <p className="text-xs font-bold text-slate-400">Loading payout queue...</p>
          </div>
        ) : isError ? (
          <div className="p-6 text-center text-rose-600 font-semibold text-sm">
            Could not retrieve payouts.
          </div>
        ) : filteredPayouts.length === 0 ? (
          <div className="text-center py-16">
            <Wallet size={40} className="mx-auto text-[#ebd7fa] mb-2" />
            <p className="text-sm font-bold text-slate-700">No payout requests found</p>
            <p className="text-xs text-slate-400 mt-1">Vendors will request disbursements once orders mature.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#faf6ff] text-slate-500 font-bold uppercase tracking-wider border-b border-[#ebd7fa]">
                    <th className="px-4 py-3.5 rounded-l-xl">Merchant Store</th>
                    <th className="px-4 py-3.5">Bank Settlement Account</th>
                    <th className="px-4 py-3.5">Disbursement Amount</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 rounded-r-xl text-right">Approval Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedPayouts.map((payout) => (
                    <tr key={payout.id} className="hover:bg-[#faf6ff]/70 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-lg bg-[#f3eafb] text-[#7a3dbf] flex items-center justify-center font-bold">
                            <Store size={13} />
                          </div>
                          <span className="font-bold text-slate-900">{payout.store?.name ?? "—"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">
                        <p className="font-semibold text-slate-900 flex items-center gap-1">
                          <Building size={12} className="text-slate-400" />
                          <span>{payout.bankName}</span>
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          Acct: {payout.accountNumber}
                        </p>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-slate-900 text-sm">
                        {formatPrice(payout.amount)}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={cn(
                            "inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border",
                            payout.status === "approved" || payout.status === "transferred"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : payout.status === "rejected"
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          )}
                        >
                          {payout.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {payout.status === "pending" ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              disabled={processingId === payout.id}
                              onClick={() => run(payout.id, () => actions.approve.mutateAsync(payout.id))}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl font-bold text-xs transition disabled:opacity-50"
                            >
                              {processingId === payout.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={13} />}
                              <span>Approve</span>
                            </button>
                            <button
                              type="button"
                              disabled={processingId === payout.id}
                              onClick={() => run(payout.id, () => actions.reject.mutateAsync(payout.id))}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl font-bold text-xs transition disabled:opacity-50"
                            >
                              <XCircle size={13} />
                              <span>Reject</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs font-semibold">Processed</span>
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
              totalItems={filteredPayouts.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
              itemName="payouts"
            />
          </>
        )}
      </div>
    </div>
  );
}
