"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import {
  useAdminCatalog,
  useAdminStoreActions,
  useAdminVerification,
  useApproveRider,
  useRejectRider,
} from "@/hooks/use-admin";
import { apiErrorMessage } from "@/lib/api";
import { formatOrderDate } from "@/lib/order-map";

export default function AdminVerificationPage() {
  const { data, isLoading, refetch } = useAdminVerification();
  const { malls } = useAdminCatalog();
  const storeActions = useAdminStoreActions();
  const approveRider = useApproveRider();
  const rejectRider = useRejectRider();
  const [mallPick, setMallPick] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const mallOptions = malls.data ?? [];

  async function approveStore(id: string) {
    setError("");
    try {
      const mallId = mallPick[id];
      await storeActions.approve.mutateAsync(mallId ? { id, mallId } : id);
      refetch();
    } catch (err) {
      setError(apiErrorMessage(err, "Could not approve store."));
    }
  }

  async function rejectStore(id: string) {
    const reason = window.prompt("Rejection reason (optional):");
    if (reason === null) return;
    setError("");
    try {
      await storeActions.reject.mutateAsync(reason ? { id, reason } : id);
      refetch();
    } catch (err) {
      setError(apiErrorMessage(err, "Could not reject store."));
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-[#7a3dbf]" />
      </div>
    );
  }

  const stores = data?.pendingStores ?? [];
  const riders = data?.pendingRiders ?? [];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#7a3dbf]">Review</p>
        <h1 className="text-3xl font-black text-[#3B1C5A]">Verification queue</h1>
        <p className="text-sm text-[#8A79A5] mt-1">
          {data?.counts.total ?? 0} pending application{(data?.counts.total ?? 0) === 1 ? "" : "s"}
        </p>
      </div>
      {error && <p className="text-sm font-semibold text-rose-600">{error}</p>}

      <section className="space-y-4">
        <h2 className="font-bold text-[#3B1C5A]">Store applications ({stores.length})</h2>
        {stores.length === 0 && <p className="text-sm text-[#8A79A5]">No pending stores.</p>}
        {stores.map((store) => (
          <div key={store.id} className="rounded-2xl bg-white border border-[#EBD7FA] p-5 space-y-3">
            <div className="flex flex-wrap justify-between gap-2">
              <div>
                <p className="font-bold text-[#3B1C5A]">{store.name}</p>
                <p className="text-xs text-[#8A79A5]">
                  {store.type ?? "store"} · {store.owner?.email}
                </p>
              </div>
              <span className="text-[10px] font-black uppercase text-amber-700">pending</span>
            </div>
            <div className="text-xs text-[#5F6C72] grid sm:grid-cols-2 gap-2">
              <p>Bank: {store.bankName ?? "—"} · {store.bankAccountNumber ?? "—"}</p>
              <p>Account name: {store.bankAccountName ?? "—"}</p>
              <p>Phone: {store.owner?.phone ?? "—"}</p>
              {store.createdAt && <p>Applied: {formatOrderDate(store.createdAt)}</p>}
            </div>
            {mallOptions.length > 0 && (
              <select
                value={mallPick[store.id] ?? ""}
                onChange={(e) => setMallPick((p) => ({ ...p, [store.id]: e.target.value }))}
                className="rounded-xl border border-[#EBD7FA] text-xs px-3 py-2"
              >
                <option value="">Assign to mall (optional)</option>
                {mallOptions.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            )}
            <div className="flex gap-3">
              <button type="button" onClick={() => approveStore(store.id)} className="text-xs font-bold text-emerald-700">
                Approve
              </button>
              <button type="button" onClick={() => rejectStore(store.id)} className="text-xs font-bold text-rose-700">
                Reject
              </button>
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <h2 className="font-bold text-[#3B1C5A]">Rider applications ({riders.length})</h2>
        {riders.length === 0 && <p className="text-sm text-[#8A79A5]">No pending riders.</p>}
        {riders.map((rider) => (
          <div key={rider.id} className="rounded-2xl bg-white border border-[#EBD7FA] p-5 flex flex-wrap justify-between gap-3">
            <div>
              <p className="font-bold">{rider.user?.name ?? rider.phone}</p>
              <p className="text-xs text-[#8A79A5]">
                {rider.user?.email} · {rider.vehicleType} · {rider.city}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={async () => {
                  await approveRider.mutateAsync(rider.id);
                  refetch();
                }}
                className="text-xs font-bold text-emerald-700"
              >
                Approve
              </button>
              <button
                type="button"
                onClick={async () => {
                  const reason = window.prompt("Reason (optional):");
                  if (reason === null) return;
                  await rejectRider.mutateAsync({ id: rider.id, reason: reason || undefined });
                  refetch();
                }}
                className="text-xs font-bold text-rose-700"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
