"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { apiErrorMessage } from "@/lib/api";
import { formatOrderDate } from "@/lib/order-map";
import { formatPrice, cn } from "@/lib/utils";
import { useAdminReturnAction, useAdminReturns } from "@/hooks/use-admin";

const STATUSES = ["All", "pending", "refunded", "rejected"] as const;

export default function AdminReturnsPage() {
  const [statusFilter, setStatusFilter] = useState<(typeof STATUSES)[number]>("All");
  const { data, isLoading } = useAdminReturns({
    status: statusFilter === "All" ? undefined : statusFilter,
  });
  const action = useAdminReturnAction();
  const returns = data?.data ?? [];

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
    } catch (err) {
      alert(apiErrorMessage(err, "Could not update return."));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-black text-[#14081c]">Returns</h1>
        <div className="flex gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-bold capitalize border",
                statusFilter === s
                  ? "bg-[#14081c] text-white border-[#14081c]"
                  : "bg-white text-slate-600 border-[#e3d4f0]",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-[#e3d4f0] overflow-x-auto">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-[#7a3dbf]" />
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-slate-400 border-b">
                <th className="p-4">Order</th>
                <th className="p-4">Store</th>
                <th className="p-4">Buyer</th>
                <th className="p-4">Status</th>
                <th className="p-4">Requested</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {returns.map((r) => (
                <tr key={r.id} className="border-b border-slate-50">
                  <td className="p-4 font-bold">
                    #{r.order?.reference?.replace(/^#/, "") ?? r.order?.id}
                    <span className="block text-xs font-normal text-slate-400">
                      {r.order ? formatPrice(r.order.total) : "—"}
                    </span>
                  </td>
                  <td className="p-4 text-xs">{r.store?.name ?? "—"}</td>
                  <td className="p-4 text-xs">
                    <p className="font-semibold">{r.buyer?.name}</p>
                    <p className="text-slate-400">{r.buyer?.email}</p>
                  </td>
                  <td className="p-4 text-xs font-black uppercase">{r.displayStatus}</td>
                  <td className="p-4 text-xs text-slate-400">{formatOrderDate(r.createdAt)}</td>
                  <td className="p-4">
                    {r.status === "pending" ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={action.isPending}
                          onClick={() => handleAction(r.id, true)}
                          className="text-[10px] font-black uppercase rounded-lg bg-[#14081c] text-white px-3 py-1"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={action.isPending}
                          onClick={() => handleAction(r.id, false)}
                          className="text-[10px] font-black uppercase rounded-lg border px-3 py-1"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
              {returns.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No returns in this queue.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
