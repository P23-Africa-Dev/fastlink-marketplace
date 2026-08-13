"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { useAdminStoreActions, useAdminStores } from "@/hooks/use-admin";
import { apiErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function AdminStoresPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const { data, isLoading } = useAdminStores({ q, status });
  const actions = useAdminStoreActions();
  const [error, setError] = useState("");

  async function run(fn: () => Promise<unknown>) {
    setError("");
    try {
      await fn();
    } catch (err) {
      setError(apiErrorMessage(err, "Store action failed."));
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black text-[#14081c]">Stores</h1>
      <div className="flex flex-wrap gap-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search stores" className="rounded-xl border border-[#e3d4f0] bg-white px-4 py-2.5 text-sm font-semibold" />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-[#e3d4f0] bg-white px-3 py-2.5 text-sm font-semibold">
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="suspended">Suspended</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      {error && <p className="text-sm font-semibold text-rose-600">{error}</p>}
      <div className="bg-white rounded-3xl border border-[#e3d4f0] overflow-x-auto">
        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin text-[#7a3dbf]" /></div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-slate-400 border-b">
                <th className="p-4">Store</th>
                <th className="p-4">Owner</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(data?.data ?? []).map((store) => (
                <tr key={store.id} className="border-b border-slate-50">
                  <td className="p-4">
                    <p className="font-bold">{store.name}</p>
                    <p className="text-xs text-slate-500">{store.slug}</p>
                  </td>
                  <td className="p-4 text-xs font-semibold">{store.owner?.email ?? "—"}</td>
                  <td className="p-4">
                    <span className={cn("text-[10px] font-black uppercase px-2 py-1 rounded-lg", store.status === "pending" ? "bg-amber-50 text-amber-800" : store.status === "approved" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700")}>
                      {store.status}
                    </span>
                  </td>
                  <td className="p-4 flex flex-wrap gap-2">
                    {store.status !== "approved" && (
                      <button onClick={() => run(() => actions.approve.mutateAsync(store.id))} className="text-xs font-bold text-emerald-700">Approve</button>
                    )}
                    {store.status === "pending" && (
                      <button onClick={() => run(() => actions.reject.mutateAsync(store.id))} className="text-xs font-bold text-amber-800">Reject</button>
                    )}
                    {store.status === "approved" && (
                      <button onClick={() => run(() => actions.suspend.mutateAsync(store.id))} className="text-xs font-bold text-rose-700">Suspend</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
