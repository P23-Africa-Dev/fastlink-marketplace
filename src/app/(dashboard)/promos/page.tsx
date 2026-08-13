"use client";

import { useState } from "react";
import { Loader2, Tag } from "lucide-react";

import { useSellerPromoCodeActions, useSellerPromoCodes } from "@/hooks/use-growth";
import { apiErrorMessage } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import type { PromoCodeRow } from "@/types/growth";
import { cn } from "@/lib/utils";

export default function SellerPromosPage() {
  const { data, isLoading, refetch } = useSellerPromoCodes();
  const actions = useSellerPromoCodeActions();
  const [form, setForm] = useState({ code: "", type: "percent" as "percent" | "fixed", value: "" });
  const [error, setError] = useState("");
  const codes = data ?? [];

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await actions.create.mutateAsync({
        code: form.code.trim(),
        type: form.type,
        value: Number(form.value),
      });
      setForm({ code: "", type: "percent", value: "" });
      refetch();
    } catch (err) {
      setError(apiErrorMessage(err, "Could not create promo code."));
    }
  }

  async function toggle(promo: PromoCodeRow) {
    try {
      await actions.update.mutateAsync({ id: promo.id, is_active: !promo.isActive });
      refetch();
    } catch (err) {
      alert(apiErrorMessage(err, "Could not update promo."));
    }
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#7a3dbf]">Growth</p>
        <h1 className="text-2xl font-extrabold text-[#3B1C5A] flex items-center gap-2 mt-1">
          <Tag size={22} className="text-[#7a3dbf]" />
          Store promo codes
        </h1>
        <p className="text-sm text-[#8A79A5] mt-1">Codes only apply to products from your store.</p>
      </div>

      <form onSubmit={create} className="rounded-2xl bg-white border border-[#ebd7fa] p-5 space-y-3">
        {error && <p className="text-xs text-rose-600">{error}</p>}
        <div className="grid sm:grid-cols-3 gap-2">
          <input required placeholder="CODE" value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))} className="rounded-xl border border-[#EBD7FA] px-3 py-2 text-sm" />
          <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as "percent" | "fixed" }))} className="rounded-xl border border-[#EBD7FA] px-3 py-2 text-sm">
            <option value="percent">Percent</option>
            <option value="fixed">Fixed ₦</option>
          </select>
          <input required type="number" min="0" step="0.01" placeholder="Value" value={form.value} onChange={(e) => setForm((p) => ({ ...p, value: e.target.value }))} className="rounded-xl border border-[#EBD7FA] px-3 py-2 text-sm" />
        </div>
        <button type="submit" disabled={actions.create.isPending} className="rounded-xl bg-[#7a3dbf] px-4 py-2 text-xs font-bold text-white">
          {actions.create.isPending ? "Saving…" : "Create code"}
        </button>
      </form>

      {isLoading ? (
        <Loader2 className="animate-spin text-[#7a3dbf]" />
      ) : codes.length === 0 ? (
        <p className="text-sm text-[#8A79A5]">No store promo codes yet.</p>
      ) : (
        <div className="space-y-3">
          {codes.map((promo) => (
            <div key={promo.id} className="rounded-2xl bg-white border border-[#ebd7fa] p-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-bold text-[#3B1C5A]">{promo.code}</p>
                <p className="text-xs text-[#8A79A5]">
                  {promo.type === "percent" ? `${promo.value}% off` : `${formatPrice(promo.value)} off`} · used {promo.usedCount}
                </p>
              </div>
              <button
                type="button"
                onClick={() => toggle(promo)}
                className={cn(
                  "rounded-full px-3 py-1 text-[10px] font-black uppercase",
                  promo.isActive ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-slate-100 text-slate-500",
                )}
              >
                {promo.isActive ? "Active" : "Inactive"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
