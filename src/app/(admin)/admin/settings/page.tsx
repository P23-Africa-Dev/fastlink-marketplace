"use client";

import { useEffect, useState } from "react";
import { Loader2, Settings, ShieldCheck, Save, Percent, RotateCcw, DollarSign, Truck, AlertTriangle } from "lucide-react";

import { useAdminSettings, useUpdateAdminSettings } from "@/hooks/use-admin";
import { apiErrorMessage } from "@/lib/api";
import { StatCard } from "@/components/dashboard/stat-card";

export default function AdminSettingsPage() {
  const { data, isLoading, isError } = useAdminSettings();
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
      setMessage("Marketplace parameters successfully saved and applied.");
      setTimeout(() => setMessage(""), 5000);
    } catch (err) {
      setError(apiErrorMessage(err, "Could not save settings."));
    }
  }

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto font-sans">
      {/* ── Top Header Banner ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-[#ebd7fa] shadow-sm">
        <div>
          <span className="px-3 py-1 rounded-full bg-[#ebd7fa] text-[#7a3dbf] text-[11px] font-black uppercase tracking-wider">
            System & Parameter Rules
          </span>
          <h2 className="text-2xl font-bold text-slate-800 mt-2">Platform Global Settings</h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
            Configure default commission cuts, RMA return window duration, minimum checkout values, and maintenance state.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#f3eafb] px-4 py-2.5 rounded-xl text-[#7a3dbf] font-bold text-xs">
          <Settings size={18} />
          <span>Active Config Engine</span>
        </div>
      </div>

      {/* ── Metric Stat Cards ────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Base Commission Take"
          value={`${form.commissionRate}%`}
          icon={<Percent size={20} />}
          variant="purple"
          badgeText="Standard"
          badgeType="neutral"
          subtitle="Platform transaction commission"
        />

        <StatCard
          title="Return Window"
          value={`${form.returnWindowDays} Days`}
          icon={<RotateCcw size={20} />}
          variant="emerald"
          badgeText="Customer RMA"
          badgeType="success"
          subtitle="Allowed period for disputes"
        />

        <StatCard
          title="Default Base Shipping"
          value={`₦${Number(form.defaultShippingFee).toLocaleString()}`}
          icon={<Truck size={20} />}
          variant="blue"
          badgeText="Fallback Fee"
          badgeType="info"
          subtitle="Default delivery rate"
        />
      </div>

      {/* ── Settings Form ────────────────────────────────────────── */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#7a3dbf]" />
          <p className="text-xs font-bold text-slate-400">Loading platform parameters...</p>
        </div>
      ) : (
        <form
          onSubmit={save}
          className="bg-white rounded-[2rem] border border-[#ebd7fa] p-7 space-y-6 shadow-sm"
        >
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}
          {message && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 text-xs font-semibold flex items-center gap-2">
              <ShieldCheck size={16} />
              <span>{message}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Commission Take Rate (%) *
              </label>
              <input
                type="number"
                min={0}
                max={100}
                step={0.1}
                required
                value={form.commissionRate}
                onChange={(e) => setForm((p) => ({ ...p, commissionRate: e.target.value }))}
                className="w-full bg-[#faf6ff] rounded-xl border border-[#ebd7fa] px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/20 focus:border-[#7a3dbf] transition"
              />
              <p className="text-[11px] text-slate-400 mt-1">Percentage charged on each vendor order sale.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Customer Return Window (Days) *
              </label>
              <input
                type="number"
                min={1}
                required
                value={form.returnWindowDays}
                onChange={(e) => setForm((p) => ({ ...p, returnWindowDays: e.target.value }))}
                className="w-full bg-[#faf6ff] rounded-xl border border-[#ebd7fa] px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/20 focus:border-[#7a3dbf] transition"
              />
              <p className="text-[11px] text-slate-400 mt-1">Number of days after delivery a buyer can request RMA.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Minimum Order Value (₦) *
              </label>
              <input
                type="number"
                min={0}
                required
                value={form.minOrderAmount}
                onChange={(e) => setForm((p) => ({ ...p, minOrderAmount: e.target.value }))}
                className="w-full bg-[#faf6ff] rounded-xl border border-[#ebd7fa] px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/20 focus:border-[#7a3dbf] transition"
              />
              <p className="text-[11px] text-slate-400 mt-1">Minimum subtotal required to complete checkout.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Default Base Shipping Fee (₦) *
              </label>
              <input
                type="number"
                min={0}
                required
                value={form.defaultShippingFee}
                onChange={(e) => setForm((p) => ({ ...p, defaultShippingFee: e.target.value }))}
                className="w-full bg-[#faf6ff] rounded-xl border border-[#ebd7fa] px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/20 focus:border-[#7a3dbf] transition"
              />
              <p className="text-[11px] text-slate-400 mt-1">Fallback shipping cost if no city/state zone matches.</p>
            </div>
          </div>

          {/* Maintenance Mode Switch */}
          <div className="pt-4 border-t border-[#ebd7fa]/60">
            <label className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50/70 border border-amber-200 cursor-pointer">
              <input
                type="checkbox"
                checked={form.maintenanceMode}
                onChange={(e) => setForm((p) => ({ ...p, maintenanceMode: e.target.checked }))}
                className="mt-0.5 h-4 w-4 rounded border-amber-300 text-[#7a3dbf] focus:ring-[#7a3dbf]"
              />
              <div>
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <AlertTriangle size={14} className="text-amber-700" />
                  Enable Platform Maintenance Mode
                </span>
                <p className="text-[11px] text-amber-800/80 mt-0.5">
                  When enabled, buyers will be prevented from placing new orders or checking out carts. Store browsing remains active.
                </p>
              </div>
            </label>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={update.isPending}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#7a3dbf] hover:bg-[#682fad] disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md shadow-purple-600/20 transition active:scale-95"
            >
              {update.isPending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              <span>{update.isPending ? "Saving parameters..." : "Save Platform Parameters"}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
