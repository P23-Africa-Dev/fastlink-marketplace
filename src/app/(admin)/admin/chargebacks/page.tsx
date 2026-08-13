"use client";

import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

import {
  useAdminChargebacks,
  useRecordChargeback,
  useUpdateChargeback,
} from "@/hooks/use-admin";
import { apiErrorMessage } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import type { ChargebackRow } from "@/types/admin";
import { cn } from "@/lib/utils";

export default function AdminChargebacksPage() {
  const { data, isLoading, refetch } = useAdminChargebacks();
  const record = useRecordChargeback();
  const update = useUpdateChargeback();
  const [showForm, setShowForm] = useState(false);
  const [paymentId, setPaymentId] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [providerRef, setProviderRef] = useState("");
  const [error, setError] = useState("");

  const rows = data?.data ?? [];

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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#7a3dbf]">Trust & Money</p>
          <h1 className="text-3xl font-black text-[#3B1C5A] flex items-center gap-2">
            <AlertTriangle size={28} className="text-amber-600" />
            Chargebacks
          </h1>
          <p className="text-sm text-[#8A79A5] mt-1">{data?.openCount ?? 0} open · linked to financial ledger</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="rounded-xl bg-[#7a3dbf] px-4 py-2 text-xs font-bold text-white"
        >
          Record chargeback
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleRecord} className="rounded-2xl bg-white border border-[#EBD7FA] p-5 space-y-3 max-w-lg">
          <p className="text-sm font-bold text-[#3B1C5A]">Record payment reversal</p>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <input
            type="number"
            required
            placeholder="Payment ID"
            value={paymentId}
            onChange={(e) => setPaymentId(e.target.value)}
            className="w-full rounded-xl border border-[#EBD7FA] px-3 py-2 text-sm"
          />
          <input
            type="number"
            required
            min="0.01"
            step="0.01"
            placeholder="Amount (NGN)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-xl border border-[#EBD7FA] px-3 py-2 text-sm"
          />
          <input
            type="text"
            placeholder="Provider reference (optional)"
            value={providerRef}
            onChange={(e) => setProviderRef(e.target.value)}
            className="w-full rounded-xl border border-[#EBD7FA] px-3 py-2 text-sm"
          />
          <textarea
            required
            placeholder="Reason / notes from Paystack or bank"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full min-h-[80px] rounded-xl border border-[#EBD7FA] px-3 py-2 text-sm"
          />
          <div className="flex gap-2">
            <button type="submit" disabled={record.isPending} className="rounded-xl bg-[#7a3dbf] px-4 py-2 text-xs font-bold text-white">
              Save & post to ledger
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-[#EBD7FA] px-4 py-2 text-xs font-bold text-[#6D349F]">
              Cancel
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <Loader2 className="animate-spin text-[#7a3dbf]" />
      ) : (
        <div className="space-y-4">
          {rows.map((row: ChargebackRow) => (
            <div key={row.id} className="rounded-2xl bg-white border border-[#EBD7FA] p-5 space-y-2">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-[#3B1C5A]">{formatPrice(row.amount)}</p>
                  <p className="text-sm">{row.reason}</p>
                  <p className="text-xs text-[#8A79A5] mt-1">
                    Order {row.order?.reference} · {row.store?.name}
                    {row.providerReference ? ` · Ref ${row.providerReference}` : ""}
                  </p>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase",
                    row.status === "open" && "bg-amber-50 text-amber-800 border border-amber-200",
                    row.status === "won" && "bg-emerald-50 text-emerald-800 border border-emerald-200",
                    row.status === "lost" && "bg-rose-50 text-rose-800 border border-rose-200",
                  )}
                >
                  {row.displayStatus}
                </span>
              </div>
              {row.status === "open" && (
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => resolve(row, "won")} className="text-xs font-bold text-emerald-700">
                    Mark won
                  </button>
                  <button type="button" onClick={() => resolve(row, "lost")} className="text-xs font-bold text-rose-700">
                    Mark lost
                  </button>
                </div>
              )}
            </div>
          ))}
          {rows.length === 0 && (
            <p className="text-sm text-[#8A79A5] py-8 text-center">No chargebacks recorded yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
