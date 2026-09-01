"use client";

import { useState, useMemo } from "react";
import { Loader2, Tag, Plus, Search, CheckCircle2, XCircle, Percent, DollarSign, Sparkles } from "lucide-react";

import { useAdminPromoCodeActions, useAdminPromoCodes } from "@/hooks/use-admin";
import { apiErrorMessage } from "@/lib/api";
import { formatPrice, cn } from "@/lib/utils";
import type { PromoCodeRow } from "@/types/growth";
import { Pagination } from "@/components/dashboard/pagination";
import { StatCard } from "@/components/dashboard/stat-card";

export default function AdminPromosPage() {
  const { data, isLoading, isError, refetch } = useAdminPromoCodes();
  const actions = useAdminPromoCodeActions();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: "", type: "percent" as "percent" | "fixed", value: "", max_discount: "" });
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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

  const filteredCodes = useMemo(() => {
    return codes.filter((p) => {
      const q = searchQuery.toLowerCase();
      return p.code.toLowerCase().includes(q);
    });
  }, [codes, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredCodes.length / pageSize));
  const paginatedCodes = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCodes.slice(start, start + pageSize);
  }, [filteredCodes, currentPage, pageSize]);

  const activeCodesCount = codes.filter((c) => c.isActive).length;
  const totalTimesUsed = codes.reduce((sum, c) => sum + (c.usedCount || 0), 0);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto font-sans">
      {/* ── Top Header Banner ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-[#ebd7fa] shadow-sm">
        <div>
          <span className="px-3 py-1 rounded-full bg-[#ebd7fa] text-[#7a3dbf] text-[11px] font-black uppercase tracking-wider">
            Campaign Incentives & Coupons
          </span>
          <h2 className="text-2xl font-bold text-slate-800 mt-2">Platform Promotion & Voucher Codes</h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
            Create global or merchant discount codes, enforce usage limits, and monitor redemption rates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#7a3dbf] hover:bg-[#682fad] text-white text-xs font-bold rounded-xl shadow-sm shadow-purple-600/20 transition active:scale-95"
          >
            <Plus size={16} />
            <span>Create Promo Code</span>
          </button>
        </div>
      </div>

      {/* ── Metric Stat Cards ────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Total Promo Codes"
          value={codes.length}
          icon={<Tag size={20} />}
          variant="purple"
          badgeText="All Coupons"
          badgeType="neutral"
          subtitle="System & merchant promo codes"
        />

        <StatCard
          title="Active Live Coupons"
          value={activeCodesCount}
          icon={<Sparkles size={20} />}
          variant="emerald"
          badgeText="Valid"
          badgeType="success"
          subtitle="Applicable at checkout"
        />

        <StatCard
          title="Total Redemptions"
          value={totalTimesUsed.toLocaleString()}
          icon={<Percent size={20} />}
          variant="blue"
          badgeText="Usage Count"
          badgeType="info"
          subtitle="Customer voucher redemptions"
        />
      </div>

      {/* ── Add Form Modal/Drawer ────────────────────────────────── */}
      {showForm && (
        <form
          onSubmit={create}
          className="rounded-[2rem] bg-white border border-[#ebd7fa] p-6 space-y-4 shadow-md max-w-xl animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="flex items-center justify-between border-b border-[#ebd7fa] pb-3">
            <h3 className="font-bold text-slate-800 text-sm">Create New Platform Promo Code</h3>
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
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Coupon Code (Uppercase) *</label>
            <input
              required
              placeholder="e.g. SUMMER25"
              value={form.code}
              onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
              className="w-full bg-[#faf6ff] rounded-xl border border-[#ebd7fa] px-3.5 py-2 text-xs font-semibold text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/20 focus:border-[#7a3dbf]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Discount Type *</label>
              <select
                value={form.type}
                onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as "percent" | "fixed" }))}
                className="w-full bg-[#faf6ff] rounded-xl border border-[#ebd7fa] px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/20 cursor-pointer"
              >
                <option value="percent">Percentage (%) Off</option>
                <option value="fixed">Fixed Amount (₦) Off</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Discount Value *</label>
              <input
                required
                type="number"
                min="0.01"
                step="0.01"
                placeholder={form.type === "percent" ? "e.g. 15 for 15%" : "e.g. 2000 for ₦2,000"}
                value={form.value}
                onChange={(e) => setForm((p) => ({ ...p, value: e.target.value }))}
                className="w-full bg-[#faf6ff] rounded-xl border border-[#ebd7fa] px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/20 focus:border-[#7a3dbf]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Maximum Discount Cap (₦) (Optional)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 10000"
              value={form.max_discount}
              onChange={(e) => setForm((p) => ({ ...p, max_discount: e.target.value }))}
              className="w-full bg-[#faf6ff] rounded-xl border border-[#ebd7fa] px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/20 focus:border-[#7a3dbf]"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={actions.create.isPending}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-[#7a3dbf] hover:bg-[#682fad] disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm shadow-purple-600/20 transition active:scale-95"
            >
              {actions.create.isPending ? <Loader2 size={14} className="animate-spin" /> : null}
              <span>Save & Publish Code</span>
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

      {/* ── Table & Search ───────────────────────────────────────── */}
      <div className="bg-white rounded-[2rem] border border-[#ebd7fa] p-5 shadow-sm space-y-4">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search by promo code..."
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
            <p className="text-xs font-bold text-slate-400">Loading coupons...</p>
          </div>
        ) : isError ? (
          <div className="p-6 text-center text-rose-600 font-semibold text-sm">
            Could not fetch promo codes.
          </div>
        ) : filteredCodes.length === 0 ? (
          <div className="text-center py-16">
            <Tag size={40} className="mx-auto text-[#ebd7fa] mb-2" />
            <p className="text-sm font-bold text-slate-700">No promo codes found</p>
            <p className="text-xs text-slate-400 mt-1">Create a new coupon above or adjust your search.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#faf6ff] text-slate-500 font-bold uppercase tracking-wider border-b border-[#ebd7fa]">
                    <th className="px-4 py-3.5 rounded-l-xl">Promo Code</th>
                    <th className="px-4 py-3.5">Discount Benefit</th>
                    <th className="px-4 py-3.5">Max Cap</th>
                    <th className="px-4 py-3.5">Redemptions</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 rounded-r-xl text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedCodes.map((promo) => (
                    <tr key={promo.id} className="hover:bg-[#faf6ff]/70 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-xl bg-[#f3eafb] text-[#7a3dbf] flex items-center justify-center font-bold shrink-0">
                            <Tag size={15} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm font-mono">{promo.code}</p>
                            <p className="text-[11px] text-slate-400">
                              {promo.storeId ? "Store-Specific Code" : "Global Marketplace Voucher"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-[#7a3dbf] text-sm">
                        {promo.type === "percent" ? `${promo.value}% OFF` : `${formatPrice(promo.value)} OFF`}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 font-medium">
                        {promo.maxDiscount != null ? formatPrice(promo.maxDiscount) : "No maximum cap"}
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-slate-900">
                        {promo.usedCount} uses
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={cn(
                            "inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border",
                            promo.isActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-slate-100 text-slate-500 border-slate-200"
                          )}
                        >
                          {promo.isActive ? "Active" : "Disabled"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => toggle(promo)}
                          className={cn(
                            "px-3 py-1.5 rounded-xl font-bold text-xs transition active:scale-95",
                            promo.isActive
                              ? "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                          )}
                        >
                          {promo.isActive ? "Deactivate" : "Activate"}
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
              totalItems={filteredCodes.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
              itemName="coupons"
            />
          </>
        )}
      </div>
    </div>
  );
}
