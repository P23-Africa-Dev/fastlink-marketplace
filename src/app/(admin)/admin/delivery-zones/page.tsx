"use client";

import { useState } from "react";
import { Loader2, MapPin } from "lucide-react";

import { useAdminDeliveryZoneActions, useAdminDeliveryZones } from "@/hooks/use-admin";
import { apiErrorMessage } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import type { DeliveryZoneRow } from "@/types/admin";
import { cn } from "@/lib/utils";

export default function AdminDeliveryZonesPage() {
  const { data, isLoading, refetch } = useAdminDeliveryZones();
  const actions = useAdminDeliveryZoneActions();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", state: "", city: "", fee: "", free_above: "" });
  const [error, setError] = useState("");
  const zones = data ?? [];

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await actions.create.mutateAsync({
        name: form.name.trim(),
        state: form.state.trim() || undefined,
        city: form.city.trim() || undefined,
        fee: Number(form.fee),
        free_above: form.free_above ? Number(form.free_above) : null,
      });
      setShowForm(false);
      setForm({ name: "", state: "", city: "", fee: "", free_above: "" });
      refetch();
    } catch (err) {
      setError(apiErrorMessage(err, "Could not create zone."));
    }
  }

  async function toggle(zone: DeliveryZoneRow) {
    try {
      await actions.update.mutateAsync({ id: zone.id, is_active: !zone.isActive });
      refetch();
    } catch (err) {
      alert(apiErrorMessage(err, "Could not update zone."));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#7a3dbf]">Commerce</p>
          <h1 className="text-3xl font-black text-[#3B1C5A] flex items-center gap-2">
            <MapPin size={28} className="text-[#7a3dbf]" />
            Delivery zones
          </h1>
          <p className="text-sm text-[#8A79A5] mt-1">State and city fees used at checkout. More specific city zones win over state defaults.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="rounded-xl bg-[#7a3dbf] px-4 py-2 text-xs font-bold text-white"
        >
          Add zone
        </button>
      </div>

      {showForm && (
        <form onSubmit={create} className="rounded-2xl bg-white border border-[#EBD7FA] p-5 space-y-3 max-w-lg">
          {error && <p className="text-xs text-red-600">{error}</p>}
          <input required placeholder="Name (e.g. Lagos — Ikeja)" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="w-full rounded-xl border border-[#EBD7FA] px-3 py-2 text-sm" />
          <div className="grid grid-cols-2 gap-2">
            <input placeholder="State (optional)" value={form.state} onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))} className="rounded-xl border border-[#EBD7FA] px-3 py-2 text-sm" />
            <input placeholder="City (optional)" value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} className="rounded-xl border border-[#EBD7FA] px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input required type="number" min="0" step="0.01" placeholder="Fee (₦)" value={form.fee} onChange={(e) => setForm((p) => ({ ...p, fee: e.target.value }))} className="rounded-xl border border-[#EBD7FA] px-3 py-2 text-sm" />
            <input type="number" min="0" step="0.01" placeholder="Free above (₦)" value={form.free_above} onChange={(e) => setForm((p) => ({ ...p, free_above: e.target.value }))} className="rounded-xl border border-[#EBD7FA] px-3 py-2 text-sm" />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={actions.create.isPending} className="rounded-xl bg-[#7a3dbf] px-4 py-2 text-xs font-bold text-white">Save zone</button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-[#EBD7FA] px-4 py-2 text-xs font-bold text-[#6D349F]">Cancel</button>
          </div>
        </form>
      )}

      {isLoading ? (
        <Loader2 className="animate-spin text-[#7a3dbf]" />
      ) : (
        <div className="space-y-3">
          {zones.map((zone: DeliveryZoneRow) => (
            <div key={zone.id} className="rounded-2xl bg-white border border-[#EBD7FA] p-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-bold text-[#3B1C5A]">{zone.name}</p>
                <p className="text-xs text-[#8A79A5]">
                  {[zone.state, zone.city].filter(Boolean).join(" · ") || "National fallback"}
                  {" · "}
                  {formatPrice(zone.fee)}
                  {zone.freeAbove != null ? ` · free above ${formatPrice(zone.freeAbove)}` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => toggle(zone)}
                className={cn(
                  "rounded-full px-3 py-1 text-[10px] font-black uppercase",
                  zone.isActive ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-slate-100 text-slate-500 border border-slate-200",
                )}
              >
                {zone.isActive ? "Active" : "Inactive"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
