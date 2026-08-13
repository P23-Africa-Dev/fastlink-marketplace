"use client";

import { Loader2 } from "lucide-react";

import { useAdminDisputes, useUpdateDispute } from "@/hooks/use-admin";
import { apiErrorMessage } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import type { DisputeRow } from "@/types/admin";

export default function AdminDisputesPage() {
  const { data, isLoading, refetch } = useAdminDisputes();
  const update = useUpdateDispute();

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
    }
  }

  const rows = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#7a3dbf]">Trust & Money</p>
        <h1 className="text-3xl font-black text-[#3B1C5A]">Disputes</h1>
        <p className="text-sm text-[#8A79A5] mt-1">{data?.openCount ?? 0} open</p>
      </div>
      {isLoading ? (
        <Loader2 className="animate-spin text-[#7a3dbf]" />
      ) : (
        <div className="space-y-4">
          {rows.map((d: DisputeRow) => (
            <div key={d.id} className="rounded-2xl bg-white border border-[#EBD7FA] p-5 space-y-2">
              <p className="font-bold">{d.reason}</p>
              <p className="text-xs text-[#8A79A5]">
                Order {d.order?.reference} · {d.buyer?.email} · {d.displayStatus}
                {d.order?.total != null ? ` · Total ${formatPrice(d.order.total)}` : ""}
              </p>
              {d.sellerResponse && <p className="text-sm">Seller: {d.sellerResponse}</p>}
              {!d.status.startsWith("resolved") && (
                <div className="flex gap-3 pt-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => update.mutateAsync({ id: d.id, action: "review" }).then(() => refetch())}
                    className="text-xs font-bold text-[#7a3dbf]"
                  >
                    Mark reviewing
                  </button>
                  <button
                    type="button"
                    onClick={() => resolve(d.id, "refund", d.order?.total)}
                    className="text-xs font-bold text-emerald-700"
                  >
                    Refund (full or partial)
                  </button>
                  <button type="button" onClick={() => resolve(d.id, "replacement")} className="text-xs font-bold text-blue-700">
                    Replacement
                  </button>
                  <button type="button" onClick={() => resolve(d.id, "rejected")} className="text-xs font-bold text-rose-700">
                    Reject
                  </button>
                </div>
              )}
              {d.refundAmount != null && <p className="text-sm font-bold">Refund: {formatPrice(d.refundAmount)}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
