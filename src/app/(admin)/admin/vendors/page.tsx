"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Loader2, Store, Search, ShieldCheck, Building2, CheckCircle2, XCircle, AlertOctagon, User, ArrowUpRight } from "lucide-react";

import { useAdminCatalog, useAdminStoreActions, useAdminStores } from "@/hooks/use-admin";
import { apiErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Pagination } from "@/components/dashboard/pagination";
import { StatCard } from "@/components/dashboard/stat-card";

export default function AdminVendorsPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const { data, isLoading, isError, refetch } = useAdminStores({ q, status });
  const { malls } = useAdminCatalog();
  const actions = useAdminStoreActions();
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [mallPick, setMallPick] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const mallOptions = malls.data ?? [];
  const rawStores = data?.data ?? [];

  async function run(id: string, fn: () => Promise<unknown>) {
    setError("");
    setProcessingId(id);
    try {
      await fn();
      refetch();
    } catch (err) {
      setError(apiErrorMessage(err, "Store action failed."));
    } finally {
      setProcessingId(null);
    }
  }

  async function approve(storeId: string) {
    const mallId = mallPick[storeId];
    await run(storeId, () => actions.approve.mutateAsync(mallId ? { id: storeId, mallId } : storeId));
  }

  const filteredStores = useMemo(() => {
    return rawStores.filter((store) => {
      const query = q.toLowerCase();
      const matchesSearch =
        store.name.toLowerCase().includes(query) ||
        store.slug.toLowerCase().includes(query) ||
        (store.owner?.email && store.owner.email.toLowerCase().includes(query));
      const matchesStatus = !status || store.status?.toLowerCase() === status.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [rawStores, q, status]);

  const totalPages = Math.max(1, Math.ceil(filteredStores.length / pageSize));
  const paginatedStores = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStores.slice(start, start + pageSize);
  }, [filteredStores, currentPage, pageSize]);

  const approvedVendorsCount = rawStores.filter((s) => s.status === "approved").length;
  const pendingVendorsCount = rawStores.filter((s) => s.status === "pending").length;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto font-sans">
      {/* ── Top Header Banner ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-[#ebd7fa] shadow-sm">
        <div>
          <span className="px-3 py-1 rounded-full bg-[#ebd7fa] text-[#7a3dbf] text-[11px] font-black uppercase tracking-wider">
            Merchant Accounts & Stores
          </span>
          <h2 className="text-2xl font-bold text-slate-800 mt-2">Vendors & Merchant Outlets</h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
            Oversee merchant business accounts, mall assignments, and merchant verification states.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/verification"
            className="flex items-center gap-2 px-4 py-2.5 bg-[#7a3dbf] hover:bg-[#682fad] text-white text-xs font-bold rounded-xl shadow-sm shadow-purple-600/20 transition active:scale-95"
          >
            <ShieldCheck size={16} />
            <span>Verification Queue ({pendingVendorsCount})</span>
          </Link>
        </div>
      </div>

      {/* ── Metric Stat Cards ────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Active Verified Vendors"
          value={approvedVendorsCount}
          icon={<Store size={20} />}
          variant="emerald"
          badgeText="Verified"
          badgeType="success"
          subtitle="Operating vendor outlets"
        />

        <StatCard
          title="Pending Onboarding"
          value={pendingVendorsCount}
          icon={<Building2 size={20} />}
          variant={pendingVendorsCount > 0 ? "amber" : "purple"}
          badgeText={pendingVendorsCount > 0 ? "Awaiting KYC" : "Clear"}
          badgeType={pendingVendorsCount > 0 ? "warning" : "success"}
          subtitle="Awaiting administrative verification"
        />

        <StatCard
          title="Total Registered Outlets"
          value={rawStores.length}
          icon={<Store size={20} />}
          variant="purple"
          badgeText="All Stores"
          badgeType="neutral"
          subtitle="All registered vendor stores"
        />
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* ── Table & Search ───────────────────────────────────────── */}
      <div className="bg-white rounded-[2rem] border border-[#ebd7fa] p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search store name, slug or merchant..."
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl pl-9 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/20 focus:border-[#7a3dbf] transition"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/20 cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="suspended">Suspended</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-[#7a3dbf]" />
            <p className="text-xs font-bold text-slate-400">Loading vendors...</p>
          </div>
        ) : isError ? (
          <div className="p-6 text-center text-rose-600 font-semibold text-sm">
            Could not fetch vendors.
          </div>
        ) : filteredStores.length === 0 ? (
          <div className="text-center py-16">
            <Store size={40} className="mx-auto text-[#ebd7fa] mb-2" />
            <p className="text-sm font-bold text-slate-700">No vendors found</p>
            <p className="text-xs text-slate-400 mt-1">Try modifying your search query or status filter.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#faf6ff] text-slate-500 font-bold uppercase tracking-wider border-b border-[#ebd7fa]">
                    <th className="px-4 py-3.5 rounded-l-xl">Vendor Store</th>
                    <th className="px-4 py-3.5">Store Type</th>
                    <th className="px-4 py-3.5">Assigned Mall</th>
                    <th className="px-4 py-3.5">Merchant Owner</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 rounded-r-xl text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedStores.map((store) => {
                    const mallName = mallOptions.find((m) => m.id === store.mallId)?.name ?? "—";
                    return (
                      <tr key={store.id} className="hover:bg-[#faf6ff]/70 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-[#f3eafb] text-[#7a3dbf] font-bold flex items-center justify-center text-sm shadow-inner shrink-0">
                              <Store size={16} />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-sm">{store.name}</p>
                              <p className="text-[11px] text-slate-400 font-mono">slug: {store.slug}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-slate-700 font-medium capitalize">
                          {store.type?.replace("_", " ") ?? "Standard"}
                        </td>
                        <td className="px-4 py-3.5 text-slate-600">
                          {mallName !== "—" ? (
                            <span className="inline-flex items-center gap-1 font-semibold text-purple-900">
                              <Building2 size={12} className="text-[#7a3dbf]" />
                              {mallName}
                            </span>
                          ) : (
                            <span className="text-slate-400">Standalone</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-slate-600 font-medium">
                          <div className="flex items-center gap-1.5">
                            <User size={13} className="text-slate-400" />
                            <span>{store.owner?.email ?? "—"}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={cn(
                              "inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border",
                              store.status === "approved"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : store.status === "pending"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-rose-50 text-rose-700 border-rose-200"
                            )}
                          >
                            {store.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          {store.status === "pending" ? (
                            <div className="flex flex-col gap-2 min-w-[140px] items-end">
                              {mallOptions.length > 0 && (
                                <select
                                  value={mallPick[store.id] ?? ""}
                                  onChange={(e) => setMallPick((p) => ({ ...p, [store.id]: e.target.value }))}
                                  className="bg-[#faf6ff] border border-[#ebd7fa] rounded-lg text-xs px-2 py-1 font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/20 cursor-pointer"
                                >
                                  <option value="">Assign mall (optional)</option>
                                  {mallOptions.map((m) => (
                                    <option key={m.id} value={m.id}>
                                      {m.name}
                                    </option>
                                  ))}
                                </select>
                              )}
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  disabled={processingId === store.id}
                                  onClick={() => approve(store.id)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl font-bold text-xs transition disabled:opacity-50"
                                >
                                  {processingId === store.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={13} />}
                                  <span>Approve</span>
                                </button>
                                <button
                                  type="button"
                                  disabled={processingId === store.id}
                                  onClick={() => {
                                    const reason = window.prompt("Rejection reason (optional):");
                                    if (reason === null) return;
                                    run(store.id, () =>
                                      actions.reject.mutateAsync(reason ? { id: store.id, reason } : store.id),
                                    );
                                  }}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 rounded-xl font-bold text-xs transition disabled:opacity-50"
                                >
                                  <XCircle size={13} />
                                  <span>Reject</span>
                                </button>
                              </div>
                            </div>
                          ) : store.status === "approved" ? (
                            <button
                              type="button"
                              disabled={processingId === store.id}
                              onClick={() => run(store.id, () => actions.suspend.mutateAsync(store.id))}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl font-bold text-xs transition disabled:opacity-50"
                            >
                              <AlertOctagon size={13} />
                              <span>Suspend</span>
                            </button>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredStores.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
              itemName="vendors"
            />
          </>
        )}
      </div>
    </div>
  );
}
