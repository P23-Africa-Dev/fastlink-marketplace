"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Loader2,
  Store,
  Search,
  ShieldCheck,
  Building2,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  User,
  AlertTriangle,
  X,
} from "lucide-react";

import { useAdminCatalog, useAdminStoreActions, useAdminStores } from "@/hooks/use-admin";
import { apiErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Pagination } from "@/components/dashboard/pagination";
import { StatCard } from "@/components/dashboard/stat-card";

type VendorModal =
  | { type: "approve"; store: any }
  | { type: "reject"; store: any }
  | { type: "suspend"; store: any }
  | null;

export default function AdminVendorsPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const { data, isLoading, isError, refetch } = useAdminStores({ q, status });
  const { malls } = useAdminCatalog();
  const actions = useAdminStoreActions();
  const [error, setError] = useState("");
  const [mallPick, setMallPick] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modalState, setModalState] = useState<VendorModal>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processing, setProcessing] = useState(false);

  const mallOptions = malls.data ?? [];
  const rawStores = data?.data ?? [];

  function closeModal() {
    if (processing) return;
    setModalState(null);
    setRejectionReason("");
    setError("");
  }

  async function handleConfirmModal() {
    if (!modalState) return;
    setError("");
    setProcessing(true);

    try {
      const storeId = modalState.store.id;
      if (modalState.type === "approve") {
        const mallId = mallPick[storeId];
        await actions.approve.mutateAsync(mallId ? { id: storeId, mallId } : storeId);
      } else if (modalState.type === "reject") {
        await actions.reject.mutateAsync(
          rejectionReason.trim() ? { id: storeId, reason: rejectionReason.trim() } : storeId,
        );
      } else if (modalState.type === "suspend") {
        await actions.suspend.mutateAsync(storeId);
      }

      await refetch();
      closeModal();
    } catch (err) {
      setError(apiErrorMessage(err, "Store action failed."));
    } finally {
      setProcessing(false);
    }
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

      {error && !modalState && (
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
                                  onClick={() => setModalState({ type: "approve", store })}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl font-bold text-xs transition active:scale-95"
                                >
                                  <CheckCircle2 size={13} />
                                  <span>Approve</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRejectionReason("");
                                    setModalState({ type: "reject", store });
                                  }}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 rounded-xl font-bold text-xs transition active:scale-95"
                                >
                                  <XCircle size={13} />
                                  <span>Reject</span>
                                </button>
                              </div>
                            </div>
                          ) : store.status === "approved" ? (
                            <button
                              type="button"
                              onClick={() => setModalState({ type: "suspend", store })}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl font-bold text-xs transition active:scale-95"
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

      {/* ── Confirmation Modal ───────────────────────────────────── */}
      {modalState && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="bg-white rounded-[2rem] border border-[#ebd7fa] shadow-2xl p-6 sm:p-8 max-w-md w-full space-y-5 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                {modalState.type === "approve" ? (
                  <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={24} />
                  </div>
                ) : (
                  <div className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center shrink-0">
                    <AlertTriangle size={24} />
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-lg text-slate-900">
                    {modalState.type === "approve" && "Approve Vendor Store"}
                    {modalState.type === "reject" && "Reject Store Application"}
                    {modalState.type === "suspend" && "Suspend Vendor Store"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Store: <span className="font-bold text-slate-800">{modalState.store?.name}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={processing}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Description */}
            <div className="text-xs text-slate-600 leading-relaxed bg-[#faf6ff] p-4 rounded-2xl border border-[#ebd7fa]">
              {modalState.type === "approve" && (
                <p>
                  Approving this store will grant seller permissions, allowing them to publish products and receive orders.
                  {mallPick[modalState.store?.id] && (
                    <span className="block mt-1 text-[#7a3dbf] font-semibold">
                      Mall: {mallOptions.find((m) => m.id === mallPick[modalState.store?.id])?.name}
                    </span>
                  )}
                </p>
              )}
              {modalState.type === "reject" && (
                <p>
                  Rejecting will decline this store&apos;s registration application.
                </p>
              )}
              {modalState.type === "suspend" && (
                <p>
                  Suspending will temporarily hide this store&apos;s listings and prevent new orders.
                </p>
              )}
            </div>

            {/* Rejection Reason Input */}
            {modalState.type === "reject" && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Rejection Reason (Optional)
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Please provide a verified government identity document."
                  rows={3}
                  className="w-full rounded-xl border border-[#ebd7fa] bg-[#faf6ff] p-3 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/20"
                />
              </div>
            )}

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
                {error}
              </div>
            )}

            {/* Modal Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={processing}
                onClick={closeModal}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition active:scale-95 disabled:opacity-50"
              >
                Cancel
              </button>

              {modalState.type === "approve" ? (
                <button
                  type="button"
                  disabled={processing}
                  onClick={handleConfirmModal}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-600/20 transition active:scale-95 disabled:opacity-50"
                >
                  {processing ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                  <span>{processing ? "Approving..." : "Confirm Approval"}</span>
                </button>
              ) : modalState.type === "reject" ? (
                <button
                  type="button"
                  disabled={processing}
                  onClick={handleConfirmModal}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs shadow-md shadow-amber-600/20 transition active:scale-95 disabled:opacity-50"
                >
                  {processing ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                  <span>{processing ? "Rejecting..." : "Confirm Rejection"}</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled={processing}
                  onClick={handleConfirmModal}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-md shadow-rose-600/20 transition active:scale-95 disabled:opacity-50"
                >
                  {processing ? <Loader2 size={14} className="animate-spin" /> : <AlertOctagon size={14} />}
                  <span>{processing ? "Suspending..." : "Confirm Suspension"}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
