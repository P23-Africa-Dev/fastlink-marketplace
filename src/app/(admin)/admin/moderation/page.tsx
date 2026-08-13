"use client";

import { Loader2 } from "lucide-react";

import { useAdminModeration, useAdminProductModerationActions } from "@/hooks/use-admin";
import { apiErrorMessage } from "@/lib/api";
import { formatPrice } from "@/lib/utils";

export default function AdminModerationPage() {
  const { data, isLoading, refetch } = useAdminModeration();
  const actions = useAdminProductModerationActions();

  async function approve(id: string) {
    try {
      await actions.approve.mutateAsync(id);
      refetch();
    } catch (err) {
      alert(apiErrorMessage(err, "Could not approve product."));
    }
  }

  async function reject(id: string) {
    const note = window.prompt("Rejection note (optional):");
    if (note === null) return;
    try {
      await actions.reject.mutateAsync({ id, note: note || undefined });
      refetch();
    } catch (err) {
      alert(apiErrorMessage(err, "Could not reject product."));
    }
  }

  const rows = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#7a3dbf]">Catalog</p>
        <h1 className="text-3xl font-black text-[#3B1C5A]">Product moderation</h1>
        <p className="text-sm text-[#8A79A5] mt-1">{data?.pendingCount ?? 0} awaiting review</p>
      </div>
      {isLoading ? (
        <Loader2 className="animate-spin text-[#7a3dbf]" />
      ) : (
        <div className="space-y-4">
          {rows.length === 0 && <p className="text-sm text-[#8A79A5]">Queue is empty.</p>}
          {rows.map((p) => (
            <div key={p.id} className="rounded-2xl bg-white border border-[#EBD7FA] p-5 flex flex-wrap justify-between gap-3">
              <div>
                <p className="font-bold text-[#3B1C5A]">{p.name}</p>
                <p className="text-xs text-[#8A79A5]">{p.store?.name} · {formatPrice(p.price)} · {p.status}</p>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => approve(p.id)} className="text-xs font-bold text-emerald-700">Publish</button>
                <button type="button" onClick={() => reject(p.id)} className="text-xs font-bold text-rose-700">Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
