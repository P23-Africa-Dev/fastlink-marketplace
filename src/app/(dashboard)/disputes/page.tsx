"use client";

import { useState } from "react";
import { Loader2, Scale } from "lucide-react";

import { apiErrorMessage } from "@/lib/api";
import { formatOrderDate } from "@/lib/order-map";
import { formatPrice } from "@/lib/utils";
import { useSellerDisputeRespond, useSellerDisputes } from "@/hooks/use-disputes";
import { cn } from "@/lib/utils";
import type { Dispute } from "@/types/disputes";

const STATUSES = ["All", "open", "seller_responded", "under_review"] as const;

export default function SellerDisputesPage() {
  const [statusFilter, setStatusFilter] = useState<(typeof STATUSES)[number]>("All");
  const { data, isLoading, isError, refetch } = useSellerDisputes({
    status: statusFilter === "All" ? undefined : statusFilter,
  });
  const respond = useSellerDisputeRespond();
  const disputes = data?.data ?? [];
  const [toast, setToast] = useState("");
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState("");

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  async function handleRespond(id: string) {
    if (!responseText.trim()) return;
    try {
      await respond.mutateAsync({ id, response: responseText.trim() });
      setRespondingId(null);
      setResponseText("");
      showToast("Response submitted.");
      refetch();
    } catch (err) {
      showToast(apiErrorMessage(err, "Could not submit response."));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#3B1C5A] flex items-center gap-2">
            <Scale size={22} className="text-[#7a3dbf]" />
            Disputes
          </h1>
          <p className="text-sm text-[#8A79A5] mt-1">Respond to buyer disputes before admin review.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
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
              {s === "All" ? "All" : s.replace(/_/g, " ")}
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
          <p className="py-12 text-center text-sm text-red-600">Could not load disputes.</p>
        )}
        {!isLoading && !isError && disputes.length === 0 && (
          <p className="py-12 text-center text-sm text-[#8A79A5]">No disputes in this view.</p>
        )}
        {!isLoading && disputes.length > 0 && (
          <ul className="divide-y divide-[#EBD7FA]">
            {disputes.map((d: Dispute) => (
              <li key={d.id} className="p-5 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-[#3B1C5A]">{d.reason}</p>
                    <p className="text-xs text-[#8A79A5] mt-1">
                      Order {d.order?.reference} · {d.buyer?.name ?? d.buyer?.email} ·{" "}
                      {formatOrderDate(d.createdAt)}
                    </p>
                  </div>
                  <span className="rounded-full bg-[#FAF8FC] border border-[#EBD7FA] px-2.5 py-0.5 text-[10px] font-black uppercase text-[#6D349F]">
                    {d.displayStatus}
                  </span>
                </div>
                {d.refundAmount != null && (
                  <p className="text-sm font-bold">Refund: {formatPrice(d.refundAmount)}</p>
                )}
                {d.sellerResponse ? (
                  <p className="text-sm text-[#5F6C72] rounded-xl bg-[#FAF8FC] p-3">
                    Your response: {d.sellerResponse}
                  </p>
                ) : respondingId === d.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      placeholder="Explain your side or offer a resolution…"
                      className="w-full min-h-[80px] rounded-xl border border-[#EBD7FA] px-3 py-2 text-sm outline-none focus:border-[#7a3dbf]"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={respond.isPending}
                        onClick={() => handleRespond(d.id)}
                        className="rounded-xl bg-[#7a3dbf] px-4 py-2 text-xs font-bold text-white"
                      >
                        Send response
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRespondingId(null);
                          setResponseText("");
                        }}
                        className="rounded-xl border border-[#EBD7FA] px-4 py-2 text-xs font-bold text-[#6D349F]"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  !d.status.startsWith("resolved") && (
                    <button
                      type="button"
                      onClick={() => setRespondingId(d.id)}
                      className="text-xs font-bold text-[#7a3dbf] hover:underline"
                    >
                      Respond to buyer
                    </button>
                  )
                )}
              </li>
            ))}
          </ul>
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
