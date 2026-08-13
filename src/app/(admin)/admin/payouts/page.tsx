"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { useAdminPayoutActions, useAdminPayouts } from "@/hooks/use-admin";
import { apiErrorMessage } from "@/lib/api";
import { formatPrice } from "@/lib/utils";

export default function AdminPayoutsPage() {
  const { data, isLoading } = useAdminPayouts();
  const actions = useAdminPayoutActions();
  const [error, setError] = useState("");

  async function run(fn: () => Promise<unknown>) {
    setError("");
    try {
      await fn();
    } catch (err) {
      setError(apiErrorMessage(err, "Payout action failed."));
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black text-[#14081c]">Payouts</h1>
      {error && <p className="text-sm font-semibold text-rose-600">{error}</p>}
      <div className="bg-white rounded-3xl border border-[#e3d4f0] overflow-x-auto">
        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin text-[#7a3dbf]" /></div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-slate-400 border-b">
                <th className="p-4">Store</th>
                <th className="p-4">Bank</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(data?.data ?? []).map((payout) => (
                <tr key={payout.id} className="border-b border-slate-50">
                  <td className="p-4 font-bold">{payout.store?.name ?? "—"}</td>
                  <td className="p-4 text-xs">{payout.bankName} · {payout.accountNumber}</td>
                  <td className="p-4 font-semibold">{formatPrice(payout.amount)}</td>
                  <td className="p-4 text-xs font-black uppercase">{payout.status}</td>
                  <td className="p-4 flex gap-3">
                    {payout.status === "pending" && (
                      <>
                        <button onClick={() => run(() => actions.approve.mutateAsync(payout.id))} className="text-xs font-bold text-emerald-700">Approve</button>
                        <button onClick={() => run(() => actions.reject.mutateAsync(payout.id))} className="text-xs font-bold text-rose-700">Reject</button>
                      </>
                    )}
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
