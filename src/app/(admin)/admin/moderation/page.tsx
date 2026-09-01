"use client";

import { useState, useMemo } from "react";
import {
  Loader2,
  PackageCheck,
  Search,
  CheckCircle2,
  XCircle,
  Tag,
  Store,
  AlertTriangle,
  X,
} from "lucide-react";

import { useAdminModeration, useAdminProductModerationActions } from "@/hooks/use-admin";
import { apiErrorMessage } from "@/lib/api";
import { formatPrice, cn } from "@/lib/utils";
import { Pagination } from "@/components/dashboard/pagination";
import { StatCard } from "@/components/dashboard/stat-card";

type ModerationModal =
  | { type: "publish"; product: any }
  | { type: "reject"; product: any }
  | null;

export default function AdminModerationPage() {
  const { data, isLoading, isError, refetch } = useAdminModeration();
  const actions = useAdminProductModerationActions();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modalState, setModalState] = useState<ModerationModal>(null);
  const [rejectionNote, setRejectionNote] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const rawRows = data?.data ?? [];

  function closeModal() {
    if (processing) return;
    setModalState(null);
    setRejectionNote("");
    setError("");
  }

  async function handleConfirmModal() {
    if (!modalState) return;
    setError("");
    setProcessing(true);

    try {
      if (modalState.type === "publish") {
        await actions.approve.mutateAsync(modalState.product.id);
      } else if (modalState.type === "reject") {
        await actions.reject.mutateAsync({
          id: modalState.product.id,
          note: rejectionNote.trim() || undefined,
        });
      }

      await refetch();
      closeModal();
    } catch (err) {
      setError(apiErrorMessage(err, "Product action failed."));
    } finally {
      setProcessing(false);
    }
  }

  const filteredRows = useMemo(() => {
    return rawRows.filter((p) => {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        (p.store?.name && p.store.name.toLowerCase().includes(q))
      );
    });
  }, [rawRows, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage, pageSize]);

  const pendingCount = data?.pendingCount ?? rawRows.length;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto font-sans">
      {/* ── Top Header Banner ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-[#ebd7fa] shadow-sm">
        <div>
          <span className="px-3 py-1 rounded-full bg-[#ebd7fa] text-[#7a3dbf] text-[11px] font-black uppercase tracking-wider">
            Trust & Catalog Quality
          </span>
          <h2 className="text-2xl font-bold text-slate-800 mt-2">Product Moderation Queue</h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
            Review new merchant item submissions, verify photos, pricing, and compliance before publishing.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#f3eafb] px-4 py-2.5 rounded-xl text-[#7a3dbf] font-bold text-xs">
          <PackageCheck size={18} />
          <span>{pendingCount} Awaiting Review</span>
        </div>
      </div>

      {/* ── Metric Stat Cards ────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <StatCard
          title="Awaiting Moderation"
          value={pendingCount}
          icon={<PackageCheck size={20} />}
          variant={pendingCount > 0 ? "amber" : "emerald"}
          badgeText={pendingCount > 0 ? "Action Required" : "All Clear"}
          badgeType={pendingCount > 0 ? "warning" : "success"}
          subtitle="Submitted listings awaiting publish"
        />

        <StatCard
          title="Items in Review Buffer"
          value={rawRows.length}
          icon={<Tag size={20} />}
          variant="purple"
          badgeText="Queue Depth"
          badgeType="neutral"
          subtitle="Total pending approvals in queue"
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
              placeholder="Search by product title or store name..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl pl-9 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/20 focus:border-[#7a3dbf] transition"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-[#7a3dbf]" />
            <p className="text-xs font-bold text-slate-400">Loading moderation queue...</p>
          </div>
        ) : isError ? (
          <div className="p-6 text-center text-rose-600 font-semibold text-sm">
            Failed to retrieve moderation queue.
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="text-center py-16">
            <PackageCheck size={40} className="mx-auto text-[#ebd7fa] mb-2" />
            <p className="text-sm font-bold text-slate-700">Moderation queue is empty</p>
            <p className="text-xs text-slate-400 mt-1">All merchant product listings are currently approved and live.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#faf6ff] text-slate-500 font-bold uppercase tracking-wider border-b border-[#ebd7fa]">
                    <th className="px-4 py-3.5 rounded-l-xl">Product Title</th>
                    <th className="px-4 py-3.5">Store / Merchant</th>
                    <th className="px-4 py-3.5">Listing Price</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 rounded-r-xl text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedRows.map((p) => (
                    <tr key={p.id} className="hover:bg-[#faf6ff]/70 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-[#f3eafb] text-[#7a3dbf] font-bold flex items-center justify-center text-sm shadow-inner shrink-0">
                            <Tag size={16} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{p.name}</p>
                            <p className="text-[11px] text-slate-400 font-mono">ID: {p.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-700 font-semibold">
                        <div className="flex items-center gap-1.5">
                          <Store size={13} className="text-[#7a3dbf]" />
                          <span>{p.store?.name ?? "—"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-slate-900 text-sm">
                        {formatPrice(p.price)}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-50 text-amber-800 border border-amber-200">
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setModalState({ type: "publish", product: p })}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl font-bold text-xs transition active:scale-95"
                          >
                            <CheckCircle2 size={13} />
                            <span>Publish</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setRejectionNote("");
                              setModalState({ type: "reject", product: p });
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl font-bold text-xs transition active:scale-95"
                          >
                            <XCircle size={13} />
                            <span>Reject</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredRows.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
              itemName="products"
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
                {modalState.type === "publish" ? (
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
                    {modalState.type === "publish" ? "Publish Product Listing" : "Reject Product Submission"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Product: <span className="font-bold text-slate-800">{modalState.product?.name}</span>
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
              {modalState.type === "publish" ? (
                <p>
                  Publishing will make this product visible across search, category listings, and the vendor&apos;s storefront.
                </p>
              ) : (
                <p>
                  Rejecting will return this product to draft status with your moderation note.
                </p>
              )}
            </div>

            {/* Rejection Note Input */}
            {modalState.type === "reject" && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Moderation Rejection Note (Optional / Sent to merchant)
                </label>
                <textarea
                  value={rejectionNote}
                  onChange={(e) => setRejectionNote(e.target.value)}
                  placeholder="e.g. Please provide high-resolution images or correct pricing details."
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

              {modalState.type === "publish" ? (
                <button
                  type="button"
                  disabled={processing}
                  onClick={handleConfirmModal}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-600/20 transition active:scale-95 disabled:opacity-50"
                >
                  {processing ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                  <span>{processing ? "Publishing..." : "Confirm Publish"}</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled={processing}
                  onClick={handleConfirmModal}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-md shadow-rose-600/20 transition active:scale-95 disabled:opacity-50"
                >
                  {processing ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                  <span>{processing ? "Rejecting..." : "Confirm Rejection"}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
