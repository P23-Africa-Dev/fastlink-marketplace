"use client";

import { useState } from "react";
import { Loader2, ShieldCheck, CheckCircle2, XCircle, FileText, Store, Bike, Phone, Building, Calendar, ExternalLink } from "lucide-react";

import {
  useAdminCatalog,
  useAdminStoreActions,
  useAdminVerification,
  useApproveRider,
  useRejectRider,
} from "@/hooks/use-admin";
import { apiErrorMessage } from "@/lib/api";
import { formatOrderDate } from "@/lib/order-map";
import { StatCard } from "@/components/dashboard/stat-card";

export default function AdminVerificationPage() {
  const { data, isLoading, refetch } = useAdminVerification();
  const { malls } = useAdminCatalog();
  const storeActions = useAdminStoreActions();
  const approveRider = useApproveRider();
  const rejectRider = useRejectRider();
  const [mallPick, setMallPick] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const mallOptions = malls.data ?? [];

  async function approveStore(id: string) {
    setError("");
    setProcessingId(id);
    try {
      const mallId = mallPick[id];
      await storeActions.approve.mutateAsync(mallId ? { id, mallId } : id);
      refetch();
    } catch (err) {
      setError(apiErrorMessage(err, "Could not approve store."));
    } finally {
      setProcessingId(null);
    }
  }

  async function rejectStore(id: string) {
    const reason = window.prompt("Rejection reason (optional):");
    if (reason === null) return;
    setError("");
    setProcessingId(id);
    try {
      await storeActions.reject.mutateAsync(reason ? { id, reason } : id);
      refetch();
    } catch (err) {
      setError(apiErrorMessage(err, "Could not reject store."));
    } finally {
      setProcessingId(null);
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 font-sans">
        <Loader2 className="h-10 w-10 animate-spin text-[#7a3dbf]" />
        <p className="text-sm font-bold text-slate-400">Loading compliance verification requests...</p>
      </div>
    );
  }

  const stores = data?.pendingStores ?? [];
  const riders = data?.pendingRiders ?? [];
  const totalPending = data?.counts.total ?? (stores.length + riders.length);

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto font-sans">
      {/* ── Top Header Banner ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-[#ebd7fa] shadow-sm">
        <div>
          <span className="px-3 py-1 rounded-full bg-[#ebd7fa] text-[#7a3dbf] text-[11px] font-black uppercase tracking-wider">
            KYC & Compliance Approvals
          </span>
          <h2 className="text-2xl font-bold text-slate-800 mt-2">Merchant & Courier Verification Queue</h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
            Review uploaded identification docs, CAC documents, bank details, and vehicle credentials before unlocking platform selling.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#f3eafb] px-4 py-2.5 rounded-xl text-[#7a3dbf] font-bold text-xs">
          <ShieldCheck size={18} />
          <span>{totalPending} Awaiting Verification</span>
        </div>
      </div>

      {/* ── Metric Stat Cards ────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Pending Store KYC"
          value={stores.length}
          icon={<Store size={20} />}
          variant={stores.length > 0 ? "amber" : "emerald"}
          badgeText={stores.length > 0 ? "Pending Audit" : "Clear"}
          badgeType={stores.length > 0 ? "warning" : "success"}
          subtitle="New vendor store applications"
        />

        <StatCard
          title="Pending Rider Licenses"
          value={riders.length}
          icon={<Bike size={20} />}
          variant={riders.length > 0 ? "amber" : "emerald"}
          badgeText={riders.length > 0 ? "Pending Audit" : "Clear"}
          badgeType={riders.length > 0 ? "warning" : "success"}
          subtitle="Dispatch courier onboarding"
        />

        <StatCard
          title="Total Verification Queue"
          value={totalPending}
          icon={<ShieldCheck size={20} />}
          variant="purple"
          badgeText="Total Pending"
          badgeType="neutral"
          subtitle="All KYC records requiring action"
        />
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* ── Store Applications Section ───────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
            <Store size={18} className="text-[#7a3dbf]" />
            <span>Store KYC Applications ({stores.length})</span>
          </h3>
        </div>

        {stores.length === 0 ? (
          <div className="bg-white rounded-[2rem] border border-[#ebd7fa] p-10 text-center text-slate-400">
            <ShieldCheck size={36} className="mx-auto text-emerald-400 mb-2" />
            <p className="font-bold text-sm text-slate-700">No pending store applications</p>
            <p className="text-xs text-slate-400 mt-1">All vendor verification documents have been processed.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {stores.map((store) => (
              <div
                key={store.id}
                className="rounded-[1.8rem] bg-white border border-[#ebd7fa] p-6 space-y-4 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">{store.name}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Type: <span className="font-semibold text-slate-700 capitalize">{store.type ?? "Store"}</span> · Owner:{" "}
                      <span className="font-medium text-slate-800">{store.owner?.email}</span>
                    </p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-50 text-amber-800 border border-amber-200">
                    Awaiting KYC
                  </span>
                </div>

                <div className="bg-[#faf6ff] rounded-xl p-3.5 border border-[#ebd7fa] grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Bank Details</p>
                    <p className="font-bold text-slate-800 mt-0.5">{store.bankName ?? "—"}</p>
                    <p className="font-mono text-slate-500">{store.bankAccountNumber ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Account Name & Phone</p>
                    <p className="font-bold text-slate-800 mt-0.5">{store.bankAccountName ?? "—"}</p>
                    <p className="text-slate-500">{store.owner?.phone ?? "—"}</p>
                  </div>
                </div>

                {store.documents && store.documents.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Attached Documents</p>
                    <div className="flex flex-wrap gap-2">
                      {store.documents.map((doc) => (
                        <a
                          key={doc.id}
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1 bg-[#f3eafb] text-[#7a3dbf] hover:bg-[#ebd7fa] rounded-lg text-xs font-bold transition"
                        >
                          <FileText size={12} />
                          <span>{doc.type.replace(/_/g, " ")}</span>
                          <ExternalLink size={10} />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {mallOptions.length > 0 && (
                  <div>
                    <select
                      value={mallPick[store.id] ?? ""}
                      onChange={(e) => setMallPick((p) => ({ ...p, [store.id]: e.target.value }))}
                      className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl text-xs px-3 py-2 font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/20 cursor-pointer"
                    >
                      <option value="">Assign to Physical Mall (Optional)</option>
                      {mallOptions.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    disabled={processingId === store.id}
                    onClick={() => approveStore(store.id)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition shadow-sm active:scale-95 disabled:opacity-50"
                  >
                    {processingId === store.id ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={14} />}
                    <span>Approve & Verify</span>
                  </button>
                  <button
                    type="button"
                    disabled={processingId === store.id}
                    onClick={() => rejectStore(store.id)}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl font-bold text-xs transition active:scale-95 disabled:opacity-50"
                  >
                    <XCircle size={14} />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Rider Applications Section ───────────────────────────── */}
      <section className="space-y-4 pt-4 border-t border-[#ebd7fa]/60">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
            <Bike size={18} className="text-[#7a3dbf]" />
            <span>Rider Courier Applications ({riders.length})</span>
          </h3>
        </div>

        {riders.length === 0 ? (
          <div className="bg-white rounded-[2rem] border border-[#ebd7fa] p-10 text-center text-slate-400">
            <CheckCircle2 size={36} className="mx-auto text-emerald-400 mb-2" />
            <p className="font-bold text-sm text-slate-700">No pending rider applications</p>
            <p className="text-xs text-slate-400 mt-1">All courier registrations are up to date.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {riders.map((rider) => (
              <div
                key={rider.id}
                className="rounded-[1.8rem] bg-white border border-[#ebd7fa] p-6 space-y-4 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">{rider.user?.name ?? rider.phone}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Email: <span className="font-medium text-slate-800">{rider.user?.email}</span>
                    </p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-50 text-amber-800 border border-amber-200">
                    Awaiting License
                  </span>
                </div>

                <div className="bg-[#faf6ff] rounded-xl p-3.5 border border-[#ebd7fa] grid grid-cols-2 gap-2 text-xs text-slate-700">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Vehicle Type</p>
                    <p className="font-bold text-slate-800 capitalize mt-0.5">{rider.vehicleType ?? "Motorcycle"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Operating City</p>
                    <p className="font-bold text-slate-800 mt-0.5">{rider.city ?? "Nigeria"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={async () => {
                      await approveRider.mutateAsync(rider.id);
                      refetch();
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition shadow-sm active:scale-95"
                  >
                    <CheckCircle2 size={14} />
                    <span>Approve Courier</span>
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const reason = window.prompt("Reason (optional):");
                      if (reason === null) return;
                      await rejectRider.mutateAsync({ id: rider.id, reason: reason || undefined });
                      refetch();
                    }}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl font-bold text-xs transition active:scale-95"
                  >
                    <XCircle size={14} />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
