"use client";

import { useState, useMemo } from "react";
import { AlertTriangle, Loader2, Plus, Search, ShieldAlert, CheckCircle, XCircle, ArrowUpRight, DollarSign } from "lucide-react";

import {
  useAdminChargebacks,
  useRecordChargeback,
  useUpdateChargeback,
} from "@/hooks/use-admin";
import { apiErrorMessage } from "@/lib/api";
import { formatPrice, cn } from "@/lib/utils";
import type { ChargebackRow } from "@/types/admin";
import { Pagination } from "@/components/dashboard/pagination";
import { StatCard } from "@/components/dashboard/stat-card";

export default function AdminChargebacksPage() {
  const { data, isLoading, isError, refetch } = useAdminChargebacks();
  const record = useRecordChargeback();
  const update = useUpdateChargeback();
  const [showForm, setShowForm] = useState(false);
  const [paymentId, setPaymentId] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [providerRef, setProviderRef] = useState("");
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const rawRows = data?.data ?? [];

  async function handleRecord(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await record.mutateAsync({
        payment_id: Number(paymentId),
        amount: Number(amount),
        reason: reason.trim(),
        provider_reference: providerRef.trim() || undefined,
      });
      setShowForm(false);
      setPaymentId("");
      setAmount("");
      setReason("");
      setProviderRef("");
      refetch();
    } catch (err) {
      setError(apiErrorMessage(err, "Could not record chargeback."));
    }
  }

  async function resolve(row: ChargebackRow, status: "won" | "lost") {
    const note = window.prompt("Admin note (optional):") ?? undefined;
    try {
      await update.mutateAsync({ id: row.id, status, admin_note: note });
      refetch();
    } catch (err) {
      alert(apiErrorMessage(err, "Could not update chargeback."));
    }
  }

  const filteredRows = useMemo(() => {
    return rawRows.filter((row) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        (row.reason ?? "").toLowerCase().includes(q) ||
        (row.order?.reference ?? "").toLowerCase().includes(q) ||
        (row.store?.name ?? "").toLowerCase().includes(q) ||
        (row.providerReference ?? "").toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || row.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [rawRows, searchQuery, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage, pageSize]);

  const openChargebacksCount = rawRows.filter((r) => r.status === "open").length;
  const totalChargebackSum = rawRows.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto font-sans">
      {/* ── Top Header Banner ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-[#ebd7fa] shadow-sm">
        <div>
          <span className="px-3 py-1 rounded-full bg-[#ebd7fa] text-[#7a3dbf] text-[11px] font-black uppercase tracking-wider">
            Risk & Financial Claims
          </span>
          <h2 className="text-2xl font-bold text-slate-800 mt-2">Payment Chargebacks & Claims</h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
            Review disputed card payments, dispute arbitration, and reverse merchant balances.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#7a3dbf] hover:bg-[#682fad] text-white text-xs font-bold rounded-xl shadow-sm shadow-purple-600/20 transition active:scale-95"
          >
            <Plus size={16} />
            <span>Record Chargeback</span>
          </button>
        </div>
      </div>

      {/* ── Summary Stats ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Open Chargeback Cases"
          value={openChargebacksCount}
          icon={<AlertTriangle size={20} />}
          variant={openChargebacksCount > 0 ? "amber" : "purple"}
          badgeText={openChargebacksCount > 0 ? "Action Required" : "All Clear"}
          badgeType={openChargebacksCount > 0 ? "warning" : "success"}
          subtitle="Pending bank resolution"
        />

        <StatCard
          title="Total Disputed Amount"
          value={formatPrice(totalChargebackSum)}
          icon={<DollarSign size={20} />}
          variant="rose"
          badgeText="Cumulative"
          badgeType="danger"
          subtitle="Total claims registered"
        />

        <StatCard
          title="Total Claims Logged"
          value={rawRows.length}
          icon={<ShieldAlert size={20} />}
          variant="blue"
          badgeText="All Time"
          badgeType="info"
          subtitle="Recorded ledger entries"
        />
      </div>

      {/* ── Record Modal / Collapsible Form ──────────────────────── */}
      {showForm && (
        <form
          onSubmit={handleRecord}
          className="rounded-[2rem] bg-white border border-[#ebd7fa] p-6 space-y-4 shadow-md max-w-xl animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="flex items-center justify-between border-b border-[#ebd7fa] pb-3">
            <h3 className="font-bold text-slate-800 text-sm">Record New Chargeback Reversal</h3>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              Close
            </button>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Payment ID *</label>
              <input
                type="number"
                required
                placeholder="e.g. 1042"
                value={paymentId}
                onChange={(e) => setPaymentId(e.target.value)}
                className="w-full bg-[#faf6ff] rounded-xl border border-[#ebd7fa] px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/20 focus:border-[#7a3dbf]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Disputed Amount (NGN) *</label>
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                placeholder="e.g. 45000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-[#faf6ff] rounded-xl border border-[#ebd7fa] px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/20 focus:border-[#7a3dbf]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Provider Reference (Optional)</label>
            <input
              type="text"
              placeholder="e.g. chg_paystack_98231"
              value={providerRef}
              onChange={(e) => setProviderRef(e.target.value)}
              className="w-full bg-[#faf6ff] rounded-xl border border-[#ebd7fa] px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/20 focus:border-[#7a3dbf]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Reason / Bank Claim Notes *</label>
            <textarea
              required
              rows={3}
              placeholder="Provide context regarding customer fraud claim or unauthorized charge..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-[#faf6ff] rounded-xl border border-[#ebd7fa] px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/20 focus:border-[#7a3dbf]"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={record.isPending}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-[#7a3dbf] hover:bg-[#682fad] disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm shadow-purple-600/20 transition active:scale-95"
            >
              {record.isPending ? <Loader2 size={14} className="animate-spin" /> : null}
              <span>Save & Post to Ledger</span>
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* ── Table & Filters ──────────────────────────────────────── */}
      <div className="bg-white rounded-[2rem] border border-[#ebd7fa] p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by store, reference, reason..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl pl-9 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/20 focus:border-[#7a3dbf] transition"
            />
          </div>

          <div className="flex items-center gap-2">
            {["all", "open", "won", "lost"].map((st) => (
              <button
                key={st}
                onClick={() => {
                  setStatusFilter(st);
                  setCurrentPage(1);
                }}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition",
                  statusFilter === st
                    ? "bg-[#7a3dbf] text-white"
                    : "bg-[#faf6ff] text-slate-600 hover:bg-[#f3eafb]"
                )}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-[#7a3dbf]" />
            <p className="text-xs font-bold text-slate-400">Loading chargebacks...</p>
          </div>
        ) : isError ? (
          <div className="p-6 text-center text-rose-600 font-semibold text-sm">
            Could not fetch chargebacks data.
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="text-center py-16">
            <AlertTriangle size={40} className="mx-auto text-[#ebd7fa] mb-2" />
            <p className="text-sm font-bold text-slate-700">No chargebacks found</p>
            <p className="text-xs text-slate-400 mt-1">All clean or no items match your current filter.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#faf6ff] text-slate-500 font-bold uppercase tracking-wider border-b border-[#ebd7fa]">
                    <th className="px-4 py-3.5 rounded-l-xl">Amount & Order</th>
                    <th className="px-4 py-3.5">Store / Merchant</th>
                    <th className="px-4 py-3.5">Reason & Reference</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 rounded-r-xl text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedRows.map((row: ChargebackRow) => (
                    <tr key={row.id} className="hover:bg-[#faf6ff]/70 transition-colors">
                      <td className="px-4 py-3.5">
                        <p className="font-bold text-slate-900 text-sm">{formatPrice(row.amount)}</p>
                        <p className="text-[11px] text-slate-400 font-mono">
                          Order: {row.order?.reference ?? "—"}
                        </p>
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-slate-800">
                        {row.store?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">
                        <p className="font-medium text-slate-800">{row.reason}</p>
                        {row.providerReference && (
                          <p className="text-[11px] text-slate-400 font-mono">Ref: {row.providerReference}</p>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase inline-block border",
                            row.status === "open" && "bg-amber-50 text-amber-800 border-amber-200",
                            row.status === "won" && "bg-emerald-50 text-emerald-800 border-emerald-200",
                            row.status === "lost" && "bg-rose-50 text-rose-800 border-rose-200"
                          )}
                        >
                          {row.displayStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {row.status === "open" ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => resolve(row, "won")}
                              className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold rounded-lg text-xs transition flex items-center gap-1"
                            >
                              <CheckCircle size={13} />
                              Won
                            </button>
                            <button
                              type="button"
                              onClick={() => resolve(row, "lost")}
                              className="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold rounded-lg text-xs transition flex items-center gap-1"
                            >
                              <XCircle size={13} />
                              Lost
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs font-semibold">Resolved</span>
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
              totalItems={filteredRows.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
              itemName="chargebacks"
            />
          </>
        )}
      </div>
    </div>
  );
}
