"use client";

import { useState } from "react";
import {
  Search,
  CreditCard,
  TrendingUp,
  Loader2,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import { cn, formatPrice } from "@/lib/utils";
import { useSellerPayments } from "@/hooks/use-payments";
import type { PaymentDisplayStatus } from "@/types/payment";

const STATUS_BADGE_CLASSES: Record<PaymentDisplayStatus, string> = {
  Successful: "bg-green-50 text-green-700 border border-green-200",
  Pending: "bg-orange-50 text-orange-700 border border-orange-200",
  Failed: "bg-red-50 text-red-700 border border-red-200",
  Refunded: "bg-slate-50 text-slate-500 border border-slate-200",
};

export default function PaymentsPage() {
  const { data, isLoading, isError } = useSellerPayments();
  const [search, setSearch] = useState("");

  const records = data?.data ?? [];
  const summary = data?.summary;
  const chart = data?.chart ?? [];

  const filtered = records.filter((rec) => {
    const haystack = `${rec.reference} ${rec.orderReference ?? ""} ${rec.buyer?.name ?? ""} ${rec.gateway}`.toLowerCase();
    return haystack.includes(search.toLowerCase());
  });

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto font-sans relative">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#ebd7fa] lg:col-span-2 flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-slate-800 text-lg font-bold">Payment Summary</h2>
            <span className="bg-[#f3eafb] text-[#7a3dbf] px-3.5 py-1 rounded-xl text-xs font-bold shadow-sm">
              Past 6 months
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_250px] gap-6">
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Monthly Transaction Volume
              </span>
              <div className="w-full h-[180px] select-none">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chart} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1eafc" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: "bold" }} dy={8} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: "bold" }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #ebd7fa", borderRadius: "8px", fontSize: "12px", fontWeight: "bold" }}
                      formatter={(value) => [formatPrice(Number(value ?? 0)), "Volume"]}
                    />
                    <Area type="monotone" dataKey="volume" stroke="#7a3dbf" strokeWidth={3} fill="#7a3dbf" fillOpacity={0.08} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-3 flex flex-col justify-center">
              <div className="bg-[#faf6ff] rounded-2xl p-4 border border-[#ebd7fa] shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total volume</span>
                <span className="text-xl font-extrabold text-slate-800 mt-1 block">{formatPrice(summary?.volume ?? 0)}</span>
              </div>
              <div className="bg-[#faf6ff] rounded-2xl p-4 border border-[#ebd7fa] shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pending</span>
                <span className="text-xl font-extrabold text-slate-800 mt-1 block">{summary?.pending ?? 0}</span>
              </div>
              <div className="bg-[#faf6ff] rounded-2xl p-4 border border-[#ebd7fa] shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Average value</span>
                <span className="text-xl font-extrabold text-slate-800 mt-1 block">{formatPrice(summary?.average ?? 0)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#ebd7fa] flex flex-col justify-between space-y-5">
          <h2 className="text-slate-800 text-lg font-bold border-b border-slate-100 pb-3">Fees & net</h2>
          <div className="flex items-center gap-3 py-3">
            <div className="h-10 w-10 rounded-xl bg-[#f3eafb] text-[#7a3dbf] flex items-center justify-center">
              <CreditCard size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Platform fees</p>
              <span className="text-lg font-extrabold text-slate-800">{formatPrice(summary?.fees ?? 0)}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 py-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Net to store</p>
              <span className="text-lg font-extrabold text-slate-800">{formatPrice(summary?.net ?? 0)}</span>
            </div>
          </div>
          <p className="text-[11px] font-semibold text-slate-400">
            Commission is applied when a payment is marked paid via Paystack or demo verify.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#ebd7fa] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-slate-800 text-lg font-bold">Transactions</h2>
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reference or buyer"
              className="w-full rounded-xl border border-[#ebd7fa] bg-[#faf6ff] pl-9 pr-4 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#7a3dbf]"
            />
          </div>
        </div>

        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#7a3dbf]" />
          </div>
        )}
        {isError && <p className="text-sm font-semibold text-rose-600">Could not load payments.</p>}
        {!isLoading && filtered.length === 0 && (
          <p className="text-sm font-semibold text-slate-400 py-10 text-center">No payment records found.</p>
        )}

        {filtered.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  <th className="py-3 pr-4">Reference</th>
                  <th className="py-3 pr-4">Buyer</th>
                  <th className="py-3 pr-4">Gateway</th>
                  <th className="py-3 pr-4">Amount</th>
                  <th className="py-3 pr-4">Fee</th>
                  <th className="py-3 pr-4">Net</th>
                  <th className="py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((rec) => (
                  <tr key={rec.id} className="border-b border-slate-50 text-sm">
                    <td className="py-4 pr-4 font-bold text-slate-800">{rec.orderReference ?? rec.reference}</td>
                    <td className="py-4 pr-4 font-semibold text-slate-600">{rec.buyer?.name ?? "—"}</td>
                    <td className="py-4 pr-4 font-semibold text-slate-600">{rec.gateway}</td>
                    <td className="py-4 pr-4 font-bold">{formatPrice(rec.amount)}</td>
                    <td className="py-4 pr-4 text-slate-500">{formatPrice(rec.fees)}</td>
                    <td className="py-4 pr-4 font-bold text-emerald-700">{formatPrice(rec.net)}</td>
                    <td className="py-4">
                      <span className={cn("px-2.5 py-1 rounded-lg text-[10px] font-bold border", STATUS_BADGE_CLASSES[rec.displayStatus])}>
                        {rec.displayStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
