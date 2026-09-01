"use client";

import { useState, useMemo } from "react";
import { Loader2, CreditCard, Search, DollarSign, ArrowDownLeft, ShieldCheck, Store, TrendingUp } from "lucide-react";

import { useAdminPayments } from "@/hooks/use-admin";
import { formatPrice, cn } from "@/lib/utils";
import { Pagination } from "@/components/dashboard/pagination";
import { StatCard } from "@/components/dashboard/stat-card";

export default function AdminPaymentsPage() {
  const { data, isLoading, isError } = useAdminPayments();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const rawPayments = data?.data ?? [];

  const filteredPayments = useMemo(() => {
    return rawPayments.filter((p) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        p.reference.toLowerCase().includes(q) ||
        (p.store?.name && p.store.name.toLowerCase().includes(q));
      const matchesStatus = statusFilter === "all" || p.status?.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [rawPayments, searchQuery, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredPayments.length / pageSize));
  const paginatedPayments = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPayments.slice(start, start + pageSize);
  }, [filteredPayments, currentPage, pageSize]);

  const totalProcessed = rawPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const totalFeesEarned = rawPayments.reduce((sum, p) => sum + (Number(p.fees) || 0), 0);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto font-sans">
      {/* ── Top Header Banner ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-[#ebd7fa] shadow-sm">
        <div>
          <span className="px-3 py-1 rounded-full bg-[#ebd7fa] text-[#7a3dbf] text-[11px] font-black uppercase tracking-wider">
            Inward Cashflow & Settlements
          </span>
          <h2 className="text-2xl font-bold text-slate-800 mt-2">Payments & Gateway Transactions</h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
            Real-time capture of customer card transactions, processing fees, and merchant net balances.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#f3eafb] px-4 py-2.5 rounded-xl text-[#7a3dbf] font-bold text-xs">
          <CreditCard size={18} />
          <span>{rawPayments.length} Gateway Charges</span>
        </div>
      </div>

      {/* ── Metric Stat Cards ────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Total Inward Volume"
          value={formatPrice(totalProcessed)}
          icon={<DollarSign size={20} />}
          variant="purple"
          badgeText="Gross Paid"
          badgeType="success"
          subtitle="Processed via payment gateways"
        />

        <StatCard
          title="Platform Take (Fees)"
          value={formatPrice(totalFeesEarned)}
          icon={<TrendingUp size={20} />}
          variant="emerald"
          badgeText="Fee Cut"
          badgeType="success"
          subtitle="Net commission retained"
        />

        <StatCard
          title="Captured Transactions"
          value={rawPayments.length}
          icon={<ShieldCheck size={20} />}
          variant="blue"
          badgeText="Completed"
          badgeType="info"
          subtitle="Total successful gateway calls"
        />
      </div>

      {/* ── Table & Search ───────────────────────────────────────── */}
      <div className="bg-white rounded-[2rem] border border-[#ebd7fa] p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search reference # or store name..."
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
              { id: "all", label: "All Records" },
              { id: "successful", label: "Successful" },
              { id: "pending", label: "Pending" },
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
            <p className="text-xs font-bold text-slate-400">Loading payment ledger...</p>
          </div>
        ) : isError ? (
          <div className="p-6 text-center text-rose-600 font-semibold text-sm">
            Could not fetch payments.
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="text-center py-16">
            <CreditCard size={40} className="mx-auto text-[#ebd7fa] mb-2" />
            <p className="text-sm font-bold text-slate-700">No payment records found</p>
            <p className="text-xs text-slate-400 mt-1">Transactions will show here automatically upon checkout.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#faf6ff] text-slate-500 font-bold uppercase tracking-wider border-b border-[#ebd7fa]">
                    <th className="px-4 py-3.5 rounded-l-xl">Payment Reference</th>
                    <th className="px-4 py-3.5">Store Outlet</th>
                    <th className="px-4 py-3.5">Gross Amount</th>
                    <th className="px-4 py-3.5">Platform Fee</th>
                    <th className="px-4 py-3.5">Merchant Net</th>
                    <th className="px-4 py-3.5 rounded-r-xl">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-[#faf6ff]/70 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-lg bg-[#f3eafb] text-[#7a3dbf] flex items-center justify-center font-bold">
                            <CreditCard size={13} />
                          </div>
                          <span className="font-bold text-slate-900">{payment.reference}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-700 font-semibold">
                        <div className="flex items-center gap-1.5">
                          <Store size={12} className="text-[#7a3dbf]" />
                          <span>{payment.store?.name ?? "—"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-slate-900 text-sm">
                        {formatPrice(payment.amount)}
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-purple-700">
                        {formatPrice(payment.fees)}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-emerald-700 text-sm">
                        {formatPrice(payment.net)}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={cn(
                            "inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border",
                            payment.status === "paid" || payment.displayStatus === "Successful"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          )}
                        >
                          {payment.displayStatus ?? payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredPayments.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
              itemName="payments"
            />
          </>
        )}
      </div>
    </div>
  );
}
