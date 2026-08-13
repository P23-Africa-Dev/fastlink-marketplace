"use client";

import { Loader2 } from "lucide-react";

import { useAdminPayments } from "@/hooks/use-admin";
import { formatPrice } from "@/lib/utils";

export default function AdminPaymentsPage() {
  const { data, isLoading } = useAdminPayments();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black text-[#14081c]">Payments</h1>
      <div className="bg-white rounded-3xl border border-[#e3d4f0] overflow-x-auto">
        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin text-[#7a3dbf]" /></div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-slate-400 border-b">
                <th className="p-4">Reference</th>
                <th className="p-4">Store</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Fee</th>
                <th className="p-4">Net</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {(data?.data ?? []).map((payment) => (
                <tr key={payment.id} className="border-b border-slate-50">
                  <td className="p-4 font-bold">{payment.reference}</td>
                  <td className="p-4 text-xs">{payment.store?.name ?? "—"}</td>
                  <td className="p-4">{formatPrice(payment.amount)}</td>
                  <td className="p-4">{formatPrice(payment.fees)}</td>
                  <td className="p-4 font-bold">{formatPrice(payment.net)}</td>
                  <td className="p-4 text-xs font-black uppercase">{payment.displayStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
