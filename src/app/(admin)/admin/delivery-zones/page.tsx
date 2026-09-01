"use client";

import { useState, useMemo } from "react";
import { Loader2, MapPin, Plus, Search, CheckCircle2, XCircle, DollarSign, Globe } from "lucide-react";

import { useAdminDeliveryZoneActions, useAdminDeliveryZones } from "@/hooks/use-admin";
import { apiErrorMessage } from "@/lib/api";
import { formatPrice, cn } from "@/lib/utils";
import type { DeliveryZoneRow } from "@/types/admin";
import { Pagination } from "@/components/dashboard/pagination";
import { StatCard } from "@/components/dashboard/stat-card";

export default function AdminDeliveryZonesPage() {
  const { data, isLoading, isError, refetch } = useAdminDeliveryZones();
  const actions = useAdminDeliveryZoneActions();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", state: "", city: "", fee: "", free_above: "", eta_min_days: "2", eta_max_days: "5" });
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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
        eta_min_days: Number(form.eta_min_days || 0),
        eta_max_days: Number(form.eta_max_days || 0),
      });
      setShowForm(false);
      setForm({ name: "", state: "", city: "", fee: "", free_above: "", eta_min_days: "2", eta_max_days: "5" });
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

  const filteredZones = useMemo(() => {
    return zones.filter((z) => {
      const q = searchQuery.toLowerCase();
      return (
        z.name.toLowerCase().includes(q) ||
        (z.state && z.state.toLowerCase().includes(q)) ||
        (z.city && z.city.toLowerCase().includes(q))
      );
    });
  }, [zones, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredZones.length / pageSize));
  const paginatedZones = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredZones.slice(start, start + pageSize);
  }, [filteredZones, currentPage, pageSize]);

  const activeZonesCount = zones.filter((z) => z.isActive).length;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto font-sans">
      {/* ── Top Header Banner ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-[#ebd7fa] shadow-sm">
        <div>
          <span className="px-3 py-1 rounded-full bg-[#ebd7fa] text-[#7a3dbf] text-[11px] font-black uppercase tracking-wider">
            Logistics & Geo Pricing
          </span>
          <h2 className="text-2xl font-bold text-slate-800 mt-2">Delivery Zones & Shipping Rates</h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
            Configure state and city base shipping fees and delivery ETA windows for checkout.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#7a3dbf] hover:bg-[#682fad] text-white text-xs font-bold rounded-xl shadow-sm shadow-purple-600/20 transition active:scale-95"
          >
            <Plus size={16} />
            <span>Add Delivery Zone</span>
          </button>
        </div>
      </div>

      {/* ── Metric Stat Cards ────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Total Configured Zones"
          value={zones.length}
          icon={<Globe size={20} />}
          variant="purple"
          badgeText="All Locations"
          badgeType="neutral"
          subtitle="Coverage areas configured"
        />

        <StatCard
          title="Active Shipping Zones"
          value={activeZonesCount}
          icon={<MapPin size={20} />}
          variant="emerald"
          badgeText="Live at Checkout"
          badgeType="success"
          subtitle="Available for order routing"
        />

        <StatCard
          title="Inactive / Paused Zones"
          value={zones.length - activeZonesCount}
          icon={<MapPin size={20} />}
          variant="amber"
          badgeText="Paused"
          badgeType="warning"
          subtitle="Temporarily disabled"
        />
      </div>

      {/* ── Add Form Drawer/Modal ────────────────────────────────── */}
      {showForm && (
        <form
          onSubmit={create}
          className="rounded-[2rem] bg-white border border-[#ebd7fa] p-6 space-y-4 shadow-md max-w-xl animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="flex items-center justify-between border-b border-[#ebd7fa] pb-3">
            <h3 className="font-bold text-slate-800 text-sm">Create New Delivery Zone</h3>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              Close
            </button>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Zone Name *</label>
            <input
              required
              placeholder="e.g. Lagos — Ikeja & Mainland"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="w-full bg-[#faf6ff] rounded-xl border border-[#ebd7fa] px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/20 focus:border-[#7a3dbf]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">State (Optional)</label>
              <input
                placeholder="e.g. Lagos"
                value={form.state}
                onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))}
                className="w-full bg-[#faf6ff] rounded-xl border border-[#ebd7fa] px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/20 focus:border-[#7a3dbf]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">City (Optional)</label>
              <input
                placeholder="e.g. Ikeja"
                value={form.city}
                onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                className="w-full bg-[#faf6ff] rounded-xl border border-[#ebd7fa] px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/20 focus:border-[#7a3dbf]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Min ETA (days)</label>
              <input
                type="number"
                min="0"
                step="1"
                value={form.eta_min_days}
                onChange={(e) => setForm((p) => ({ ...p, eta_min_days: e.target.value }))}
                className="w-full bg-[#faf6ff] rounded-xl border border-[#ebd7fa] px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/20 focus:border-[#7a3dbf]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Max ETA (days)</label>
              <input
                type="number"
                min="0"
                step="1"
                value={form.eta_max_days}
                onChange={(e) => setForm((p) => ({ ...p, eta_max_days: e.target.value }))}
                className="w-full bg-[#faf6ff] rounded-xl border border-[#ebd7fa] px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/20 focus:border-[#7a3dbf]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Delivery Fee (NGN) *</label>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 1500"
                value={form.fee}
                onChange={(e) => setForm((p) => ({ ...p, fee: e.target.value }))}
                className="w-full bg-[#faf6ff] rounded-xl border border-[#ebd7fa] px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/20 focus:border-[#7a3dbf]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Free Delivery Above (NGN)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 50000"
                value={form.free_above}
                onChange={(e) => setForm((p) => ({ ...p, free_above: e.target.value }))}
                className="w-full bg-[#faf6ff] rounded-xl border border-[#ebd7fa] px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/20 focus:border-[#7a3dbf]"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={actions.create.isPending}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-[#7a3dbf] hover:bg-[#682fad] disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm shadow-purple-600/20 transition active:scale-95"
            >
              {actions.create.isPending ? <Loader2 size={14} className="animate-spin" /> : null}
              <span>Save Zone Rate</span>
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* ── Table & Search Container ─────────────────────────────── */}
      <div className="bg-white rounded-[2rem] border border-[#ebd7fa] p-5 shadow-sm space-y-4">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search zones by name, state or city..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl pl-9 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/20 focus:border-[#7a3dbf] transition"
          />
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-[#7a3dbf]" />
            <p className="text-xs font-bold text-slate-400">Loading delivery zones...</p>
          </div>
        ) : isError ? (
          <div className="p-6 text-center text-rose-600 font-semibold text-sm">
            Could not fetch delivery zones.
          </div>
        ) : filteredZones.length === 0 ? (
          <div className="text-center py-16">
            <MapPin size={40} className="mx-auto text-[#ebd7fa] mb-2" />
            <p className="text-sm font-bold text-slate-700">No delivery zones found</p>
            <p className="text-xs text-slate-400 mt-1">Create a new delivery zone above or adjust your search.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#faf6ff] text-slate-500 font-bold uppercase tracking-wider border-b border-[#ebd7fa]">
                    <th className="px-4 py-3.5 rounded-l-xl">Zone Name & Geo Scope</th>
                    <th className="px-4 py-3.5">Delivery Fee</th>
                    <th className="px-4 py-3.5">Free Threshold</th>
                    <th className="px-4 py-3.5">ETA Window</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 rounded-r-xl text-right">Toggle Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedZones.map((zone: DeliveryZoneRow) => (
                    <tr key={zone.id} className="hover:bg-[#faf6ff]/70 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-xl bg-[#f3eafb] text-[#7a3dbf] flex items-center justify-center font-bold shrink-0">
                            <MapPin size={15} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{zone.name}</p>
                            <p className="text-[11px] text-slate-400">
                              {[zone.state, zone.city].filter(Boolean).join(" · ") || "National General Zone"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-slate-900 text-sm">
                        {formatPrice(zone.fee)}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 font-medium">
                        {zone.freeAbove != null ? (
                          <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            Free above {formatPrice(zone.freeAbove)}
                          </span>
                        ) : (
                          <span className="text-slate-400">No threshold</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 font-semibold">
                        {zone.etaMinDays === zone.etaMaxDays
                          ? `${zone.etaMinDays} day${zone.etaMinDays === 1 ? "" : "s"}`
                          : `${zone.etaMinDays}-${zone.etaMaxDays} days`}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={cn(
                            "inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border",
                            zone.isActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-slate-100 text-slate-500 border-slate-200"
                          )}
                        >
                          {zone.isActive ? "Active" : "Disabled"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => toggle(zone)}
                          className={cn(
                            "px-3 py-1.5 rounded-xl font-bold text-xs transition active:scale-95",
                            zone.isActive
                              ? "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                          )}
                        >
                          {zone.isActive ? "Deactivate" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredZones.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
              itemName="zones"
            />
          </>
        )}
      </div>
    </div>
  );
}
