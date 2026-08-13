"use client";

import { useState } from "react";
import { Loader2, RotateCcw } from "lucide-react";

import { apiErrorMessage } from "@/lib/api";
import { formatOrderDate } from "@/lib/order-map";
import { formatPrice } from "@/lib/utils";
import { useSellerReturnAction, useSellerReturns } from "@/hooks/use-returns";
import { cn } from "@/lib/utils";

const STATUSES = ["All", "pending", "refunded", "rejected"] as const;

export default function SellerReturnsPage() {
  const [statusFilter, setStatusFilter] = useState<(typeof STATUSES)[number]>("All");
  const { data, isLoading, isError } = useSellerReturns({
    status: statusFilter === "All" ? undefined : statusFilter,
  });
  const action = useSellerReturnAction();
  const returns = data?.data ?? [];
  const [toast, setToast] = useState("");

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  async function handleAction(id: string, approve: boolean) {
    try {
      if (!approve) {
        const note = window.prompt("Optional note for the buyer:");
        if (note === null) return;
        await action.mutateAsync({ id, action: "reject", note: note || undefined });
      } else {
        if (!window.confirm("Approve this return and record a full refund?")) return;
        await action.mutateAsync({ id, action: "approve" });
      }
      showToast(approve ? "Return approved." : "Return rejected.");
    } catch (err) {
      showToast(apiErrorMessage(err, "Could not update return."));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#3B1C5A] flex items-center gap-2">
            <RotateCcw size={22} className="text-[#7a3dbf]" />
            Returns
          </h1>
          <p className="text-sm text-[#8A79A5] mt-1">Review buyer return requests for your store.</p>
        </div>
        <div className="flex gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-bold capitalize",
                statusFilter === s
                  ? "bg-[#7a3dbf] text-white"
                  : "bg-white border border-[#EBD7FA] text-[#6D349F]",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-[#EBD7FA] bg-white overflow-x-auto">
        {isLoading && (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-[#7a3dbf]" />
          </div>
        )}
        {isError && (
          <p className="py-12 text-center text-sm text-red-600">Could not load returns.</p>
        )}
        {!isLoading && !isError && (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-[#8A79A5] border-b border-[#F0E8F8]">
                <th className="p-4">Order</th>
                <th className="p-4">Buyer</th>
                <th className="p-4">Reason</th>
                <th className="p-4">Status</th>
                <th className="p-4">Requested</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {returns.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#8A79A5]">
                    No return requests yet.
                  </td>
                </tr>
              )}
              {returns.map((r) => (
                <tr key={r.id} className="border-b border-[#F5F1FA]">
                  <td className="p-4 font-bold text-[#3B1C5A]">
                    #{r.order?.reference?.replace(/^#/, "") ?? r.order?.id}
                    <span className="block text-xs font-normal text-[#8A79A5]">
                      {r.order ? formatPrice(r.order.total) : "—"}
                    </span>
                  </td>
                  <td className="p-4 text-xs">
                    <p className="font-semibold">{r.buyer?.name}</p>
                    <p className="text-[#8A79A5]">{r.buyer?.email}</p>
                  </td>
                  <td className="p-4 text-xs max-w-xs">
                    <p className="line-clamp-2">{r.reason}</p>
                  </td>
                  <td className="p-4">
                    <span className="text-[10px] font-black uppercase text-[#6D349F]">
                      {r.displayStatus}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-[#8A79A5]">{formatOrderDate(r.createdAt)}</td>
                  <td className="p-4">
                    {r.status === "pending" ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={action.isPending}
                          onClick={() => handleAction(r.id, true)}
                          className="rounded-lg bg-[#7a3dbf] px-3 py-1.5 text-[10px] font-black uppercase text-white"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={action.isPending}
                          onClick={() => handleAction(r.id, false)}
                          className="rounded-lg border border-[#EBD7FA] px-3 py-1.5 text-[10px] font-black uppercase text-[#6D349F]"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-[#8A79A5]">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-[#3B1C5A] px-4 py-3 text-sm font-semibold text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
