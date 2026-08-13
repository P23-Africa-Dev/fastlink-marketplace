"use client";

import { useState } from "react";
import { Loader2, Tag } from "lucide-react";

import { useAdminPromoCodeActions, useAdminPromoCodes } from "@/hooks/use-admin";
import { apiErrorMessage } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import type { PromoCodeRow } from "@/types/growth";
import { cn } from "@/lib/utils";

export default function AdminPromosPage() {
  const { data, isLoading, refetch } = useAdminPromoCodes();
  const actions = useAdminPromoCodeActions();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: "", type: "percent" as "percent" | "fixed", value: "", max_discount: "" });
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
        max_discount: form.max_discount ? Number(form.max_discount) : null,
        per_user_limit: 5,
      });
      setShowForm(false);
      setForm({ code: "", type: "percent", value: "", max_discount: "" });
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
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#7a3dbf]">Growth</p>
          <h1 className="text-3xl font-black text-[#3B1C5A] flex items-center gap-2">
            <Tag size={28} className="text-[#7a3dbf]" />
            Promo codes
          </h1>
          <p className="text-sm text-[#8A79A5] mt-1">Platform coupons applied at checkout. Seeded starter: FASTLINK10.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="rounded-xl bg-[#7a3dbf] px-4 py-2 text-xs font-bold text-white"
        >
          New code
        </button>
      </div>

      {showForm && (
        <form onSubmit={create} className="rounded-2xl bg-white border border-[#EBD7FA] p-5 space-y-3 max-w-lg">
          {error && <p className="text-xs text-red-600">{error}</p>}
          <input required placeholder="Code (e.g. WELCOME10)" value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))} className="w-full rounded-xl border border-[#EBD7FA] px-3 py-2 text-sm" />
          <div className="grid grid-cols-2 gap-2">
            <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as "percent" | "fixed" }))} className="rounded-xl border border-[#EBD7FA] px-3 py-2 text-sm">
              <option value="percent">Percent</option>
              <option value="fixed">Fixed ₦</option>
            </select>
            <input required type="number" min="0" step="0.01" placeholder="Value" value={form.value} onChange={(e) => setForm((p) => ({ ...p, value: e.target.value }))} className="rounded-xl border border-[#EBD7FA] px-3 py-2 text-sm" />
          </div>
          <input type="number" min="0" step="0.01" placeholder="Max discount (optional)" value={form.max_discount} onChange={(e) => setForm((p) => ({ ...p, max_discount: e.target.value }))} className="w-full rounded-xl border border-[#EBD7FA] px-3 py-2 text-sm" />
          <div className="flex gap-2">
            <button type="submit" disabled={actions.create.isPending} className="rounded-xl bg-[#7a3dbf] px-4 py-2 text-xs font-bold text-white">Save code</button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-[#EBD7FA] px-4 py-2 text-xs font-bold text-[#6D349F]">Cancel</button>
          </div>
        </form>
      )}

      {isLoading ? (
        <Loader2 className="animate-spin text-[#7a3dbf]" />
      ) : (
        <div className="space-y-3">
          {codes.map((promo) => (
            <div key={promo.id} className="rounded-2xl bg-white border border-[#EBD7FA] p-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-bold text-[#3B1C5A]">{promo.code}</p>
                <p className="text-xs text-[#8A79A5]">
                  {promo.type === "percent" ? `${promo.value}% off` : `${formatPrice(promo.value)} off`}
                  {promo.maxDiscount != null ? ` · max ${formatPrice(promo.maxDiscount)}` : ""}
                  {" · "}used {promo.usedCount}
                  {promo.storeId ? " · store code" : " · platform"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => toggle(promo)}
                className={cn(
                  "rounded-full px-3 py-1 text-[10px] font-black uppercase",
                  promo.isActive ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-slate-100 text-slate-500 border border-slate-200",
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
