"use client";

import { useState, useMemo } from "react";
import { Loader2, BookOpen, Search, ArrowDownLeft, ArrowUpRight, DollarSign, Wallet, FileText } from "lucide-react";

import { useAdminLedger } from "@/hooks/use-admin";
import { formatPrice, cn } from "@/lib/utils";
import { Pagination } from "@/components/dashboard/pagination";
import { StatCard } from "@/components/dashboard/stat-card";

const TYPE_LABELS: Record<string, string> = {
  order_payment: "Order Payment",
  platform_fee: "Platform Fee Take",
  seller_earnings: "Merchant Net Earnings",
  order_refund: "Customer Refund",
  platform_fee_reversal: "Fee Reversal",
  seller_earnings_reversal: "Earnings Reversal",
  payout_disbursement: "Bank Payout Settlement",
};

export default function AdminLedgerPage() {
  const [type, setType] = useState("");
  const { data, isLoading, isError } = useAdminLedger({ type: type || undefined });
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const rawRows = data?.data ?? [];

  const filteredRows = useMemo(() => {
    return rawRows.filter((r) => {
      const q = searchQuery.toLowerCase();
      const ref = `${r.referenceType ?? ""} ${r.referenceId ?? ""}`.toLowerCase();
      const label = (TYPE_LABELS[r.type] ?? r.type).toLowerCase();
      return ref.includes(q) || label.includes(q);
    });
  }, [rawRows, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage, pageSize]);

  const totalCredit = rawRows
    .filter((r) => r.direction === "credit")
    .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  const totalDebit = rawRows
    .filter((r) => r.direction === "debit")
    .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto font-sans">
      {/* ── Top Header Banner ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-[#ebd7fa] shadow-sm">
        <div>
          <span className="px-3 py-1 rounded-full bg-[#ebd7fa] text-[#7a3dbf] text-[11px] font-black uppercase tracking-wider">
            Double-Entry Accounting
          </span>
          <h2 className="text-2xl font-bold text-slate-800 mt-2">Financial Ledger & Money Movements</h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
            Immutable audit record of all debits, credits, platform commission takes, and payouts.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#f3eafb] px-4 py-2.5 rounded-xl text-[#7a3dbf] font-bold text-xs">
          <BookOpen size={18} />
          <span>{rawRows.length} Ledger Entries</span>
        </div>
      </div>

      {/* ── Summary Stats ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Total Inward Credits"
          value={formatPrice(totalCredit)}
          icon={<ArrowDownLeft size={20} />}
          variant="emerald"
          badgeText="Inflow"
          badgeType="success"
          subtitle="Orders and received funds"
        />

        <StatCard
          title="Total Outward Debits"
          value={formatPrice(totalDebit)}
          icon={<ArrowUpRight size={20} />}
          variant="rose"
          badgeText="Outflow"
          badgeType="danger"
          subtitle="Payouts, refunds & reversals"
        />

        <StatCard
          title="Net Ledger Delta"
          value={formatPrice(totalCredit - totalDebit)}
          icon={<DollarSign size={20} />}
          variant="purple"
          badgeText="Platform Balance"
          badgeType="neutral"
          subtitle="Net platform cash position"
        />
      </div>

      {/* ── Table & Filters ──────────────────────────────────────── */}
      <div className="bg-white rounded-[2rem] border border-[#ebd7fa] p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search reference # or entry type..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl pl-9 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/20 focus:border-[#7a3dbf] transition"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/20 cursor-pointer"
            >
              <option value="">All Transaction Types</option>
              {Object.entries(TYPE_LABELS).map(([val, label]) => (
                <option key={val} value={val}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-[#7a3dbf]" />
            <p className="text-xs font-bold text-slate-400">Loading ledger journals...</p>
          </div>
        ) : isError ? (
          <div className="p-6 text-center text-rose-600 font-semibold text-sm">
            Failed to retrieve ledger entries.
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="text-center py-16">
            <FileText size={40} className="mx-auto text-[#ebd7fa] mb-2" />
            <p className="text-sm font-bold text-slate-700">No journal records found</p>
            <p className="text-xs text-slate-400 mt-1">Transactions will record automatically when checkouts occur.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#faf6ff] text-slate-500 font-bold uppercase tracking-wider border-b border-[#ebd7fa]">
                    <th className="px-4 py-3.5 rounded-l-xl">Timestamp</th>
                    <th className="px-4 py-3.5">Entry Type</th>
                    <th className="px-4 py-3.5">Direction</th>
                    <th className="px-4 py-3.5">Amount</th>
                    <th className="px-4 py-3.5 rounded-r-xl">Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedRows.map((row) => (
                    <tr key={row.id} className="hover:bg-[#faf6ff]/70 transition-colors">
                      <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                        {new Date(row.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-slate-900">
                        {TYPE_LABELS[row.type] ?? row.type}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border",
                            row.direction === "credit"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          )}
                        >
                          {row.direction === "credit" ? (
                            <ArrowDownLeft size={11} />
                          ) : (
                            <ArrowUpRight size={11} />
                          )}
                          {row.direction}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-slate-900 text-sm">
                        {formatPrice(row.amount)}
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 font-mono text-[11px]">
                        {row.referenceType} #{row.referenceId ?? "—"}
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
              itemName="ledger entries"
            />
          </>
        )}
      </div>
    </div>
  );
}
