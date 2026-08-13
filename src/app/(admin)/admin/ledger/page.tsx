"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { useAdminLedger } from "@/hooks/use-admin";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

const TYPE_LABELS: Record<string, string> = {
  order_payment: "Order payment",
  platform_fee: "Platform fee",
  seller_earnings: "Seller earnings",
  order_refund: "Refund",
  platform_fee_reversal: "Fee reversal",
  seller_earnings_reversal: "Earnings reversal",
  payout_disbursement: "Payout",
};

export default function AdminLedgerPage() {
  const [type, setType] = useState("");
  const { data, isLoading } = useAdminLedger({ type: type || undefined });
  const rows = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#7a3dbf]">Finance</p>
        <h1 className="text-3xl font-black text-[#3B1C5A]">Financial ledger</h1>
        <p className="text-sm text-[#8A79A5] mt-1">Immutable record of money movements on the platform.</p>
      </div>

      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="rounded-xl border border-[#EBD7FA] bg-white px-3 py-2.5 text-sm font-semibold"
      >
        <option value="">All entry types</option>
        {Object.entries(TYPE_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      <div className="bg-white rounded-2xl border border-[#EBD7FA] overflow-x-auto">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-[#7a3dbf]" />
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-[#8A79A5] border-b">
                <th className="p-4">When</th>
                <th className="p-4">Type</th>
                <th className="p-4">Direction</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Ref</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[#8A79A5]">
                    No ledger entries yet. Payments will appear here after checkout.
                  </td>
                </tr>
              )}
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-[#F5F1FA]">
                  <td className="p-4 text-xs text-[#8A79A5]">
                    {new Date(row.createdAt).toLocaleString()}
                  </td>
                  <td className="p-4 font-semibold text-[#3B1C5A]">
                    {TYPE_LABELS[row.type] ?? row.type}
                  </td>
                  <td className="p-4">
                    <span
                      className={cn(
                        "text-[10px] font-black uppercase",
                        row.direction === "credit" ? "text-emerald-700" : "text-rose-700",
                      )}
                    >
                      {row.direction}
                    </span>
                  </td>
                  <td className="p-4 font-bold">{formatPrice(row.amount)}</td>
                  <td className="p-4 text-xs text-[#8A79A5]">
                    {row.referenceType} #{row.referenceId ?? "—"}
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
