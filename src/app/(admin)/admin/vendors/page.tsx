"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { useAdminCatalog, useAdminStoreActions, useAdminStores } from "@/hooks/use-admin";
import { apiErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function AdminVendorsPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const { data, isLoading } = useAdminStores({ q, status });
  const { malls } = useAdminCatalog();
  const actions = useAdminStoreActions();
  const [error, setError] = useState("");
  const [mallPick, setMallPick] = useState<Record<string, string>>({});
  const mallOptions = malls.data ?? [];

  async function run(fn: () => Promise<unknown>) {
    setError("");
    try {
      await fn();
    } catch (err) {
      setError(apiErrorMessage(err, "Store action failed."));
    }
  }

  async function approve(storeId: string) {
    const mallId = mallPick[storeId];
    await run(() => actions.approve.mutateAsync(mallId ? { id: storeId, mallId } : storeId));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#7a3dbf]">Sellers</p>
          <h1 className="text-3xl font-black text-[#3B1C5A]">Vendors</h1>
          <p className="text-sm text-[#8A79A5] mt-1">All seller stores — status, mall, and owner.</p>
        </div>
        <Link href="/admin/verification" className="text-xs font-bold text-[#7a3dbf] hover:underline">
          Verification queue →
        </Link>
      </div>
      <div className="flex flex-wrap gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search stores"
          className="rounded-xl border border-[#EBD7FA] bg-white px-4 py-2.5 text-sm font-semibold"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-xl border border-[#EBD7FA] bg-white px-3 py-2.5 text-sm font-semibold"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="suspended">Suspended</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      {error && <p className="text-sm font-semibold text-rose-600">{error}</p>}
      <div className="bg-white rounded-2xl border border-[#EBD7FA] overflow-x-auto">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-[#7a3dbf]" />
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-[#8A79A5] border-b">
                <th className="p-4">Store</th>
                <th className="p-4">Type</th>
                <th className="p-4">Mall</th>
                <th className="p-4">Owner</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(data?.data ?? []).map((store) => {
                const mallName = mallOptions.find((m) => m.id === store.mallId)?.name ?? "—";
                return (
                  <tr key={store.id} className="border-b border-[#F5F1FA]">
                    <td className="p-4">
                      <p className="font-bold text-[#3B1C5A]">{store.name}</p>
                      <p className="text-xs text-[#8A79A5]">{store.slug}</p>
                    </td>
                    <td className="p-4 text-xs capitalize">{store.type?.replace("_", " ") ?? "—"}</td>
                    <td className="p-4 text-xs">{mallName}</td>
                    <td className="p-4 text-xs">{store.owner?.email ?? "—"}</td>
                    <td className="p-4">
                      <span
                        className={cn(
                          "text-[10px] font-black uppercase px-2 py-1 rounded-lg",
                          store.status === "pending"
                            ? "bg-amber-50 text-amber-800"
                            : store.status === "approved"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-rose-50 text-rose-700",
                        )}
                      >
                        {store.status}
                      </span>
                    </td>
                    <td className="p-4">
                      {store.status === "pending" && (
                        <div className="flex flex-col gap-2 min-w-[140px]">
                          {mallOptions.length > 0 && (
                            <select
                              value={mallPick[store.id] ?? ""}
                              onChange={(e) => setMallPick((p) => ({ ...p, [store.id]: e.target.value }))}
                              className="rounded-lg border border-[#EBD7FA] text-xs px-2 py-1"
                            >
                              <option value="">Assign mall (optional)</option>
                              {mallOptions.map((m) => (
                                <option key={m.id} value={m.id}>
                                  {m.name}
                                </option>
                              ))}
                            </select>
                          )}
                          <div className="flex flex-wrap gap-2">
                            <button type="button" onClick={() => approve(store.id)} className="text-xs font-bold text-emerald-700">
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const reason = window.prompt("Rejection reason (optional):");
                                if (reason === null) return;
                                run(() =>
                                  actions.reject.mutateAsync(reason ? { id: store.id, reason } : store.id),
                                );
                              }}
                              className="text-xs font-bold text-rose-700"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      )}
                      {store.status === "approved" && (
                        <button
                          type="button"
                          onClick={() => run(() => actions.suspend.mutateAsync(store.id))}
                          className="text-xs font-bold text-rose-700"
                        >
                          Suspend
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
