"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { useAdminSettings, useUpdateAdminSettings } from "@/hooks/use-admin";
import { apiErrorMessage } from "@/lib/api";

export default function AdminSettingsPage() {
  const { data, isLoading } = useAdminSettings();
  const update = useUpdateAdminSettings();
  const [form, setForm] = useState({
    commissionRate: "10",
    returnWindowDays: "14",
    minOrderAmount: "0",
    defaultShippingFee: "1500",
    maintenanceMode: false,
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!data) return;
    setForm({
      commissionRate: String(data.commissionRate),
      returnWindowDays: String(data.returnWindowDays),
      minOrderAmount: String(data.minOrderAmount),
      defaultShippingFee: String(data.defaultShippingFee),
      maintenanceMode: data.maintenanceMode,
    });
  }, [data]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await update.mutateAsync({
        commissionRate: Number(form.commissionRate),
        returnWindowDays: Number(form.returnWindowDays),
        minOrderAmount: Number(form.minOrderAmount),
        defaultShippingFee: Number(form.defaultShippingFee),
        maintenanceMode: form.maintenanceMode,
      });
      setMessage("Marketplace settings saved.");
    } catch (err) {
      setError(apiErrorMessage(err, "Could not save settings."));
    }
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#7a3dbf]">Platform</p>
        <h1 className="text-3xl font-black text-[#3B1C5A]">Marketplace config</h1>
        <p className="text-sm text-[#8A79A5] mt-1">Commission, returns window, order minimums, and maintenance mode.</p>
      </div>

      {isLoading ? (
        <Loader2 className="animate-spin text-[#7a3dbf]" />
      ) : (
        <form onSubmit={save} className="bg-white rounded-2xl border border-[#EBD7FA] p-6 space-y-5">
          {(
            [
              ["commissionRate", "Commission rate (%)", "number"],
              ["returnWindowDays", "Return window (days)", "number"],
              ["minOrderAmount", "Minimum order (₦)", "number"],
              ["defaultShippingFee", "Default shipping fee (₦)", "number"],
            ] as const
          ).map(([key, label, inputType]) => (
            <label key={key} className="block space-y-1">
              <span className="text-xs font-bold text-[#6D349F]">{label}</span>
              <input
                type={inputType}
                min={0}
                value={form[key]}
                onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                className="w-full rounded-xl border border-[#EBD7FA] px-4 py-2.5 text-sm font-semibold"
              />
            </label>
          ))}

          <label className="flex items-center gap-3 text-sm font-semibold text-[#3B1C5A]">
            <input
              type="checkbox"
              checked={form.maintenanceMode}
              onChange={(e) => setForm((p) => ({ ...p, maintenanceMode: e.target.checked }))}
              className="rounded border-[#EBD7FA]"
            />
            Maintenance mode (block new checkouts)
          </label>

          {error && <p className="text-sm font-semibold text-rose-600">{error}</p>}
          {message && <p className="text-sm font-semibold text-emerald-700">{message}</p>}

          <button
            type="submit"
            disabled={update.isPending}
            className="rounded-xl bg-[#14081c] text-[#d4a24c] font-bold px-5 py-3 text-sm disabled:opacity-70"
          >
            {update.isPending ? "Saving…" : "Save settings"}
          </button>
        </form>
      )}
    </div>
  );
}
