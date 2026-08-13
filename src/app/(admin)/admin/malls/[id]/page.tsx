"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Loader2, ExternalLink } from "lucide-react";

import { useAdminMall, useAdminStoreActions } from "@/hooks/use-admin";
import { apiErrorMessage } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function AdminMallDetailPage() {
  const params = useParams();
  const id = String(params?.id ?? "");
  const { data, isLoading, isError } = useAdminMall(id);
  const actions = useAdminStoreActions();

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-[#7a3dbf]" />
      </div>
    );
  }

  if (isError || !data) {
    return <p className="text-rose-600 font-semibold">Could not load mall.</p>;
  }

  const { mall, stores, gmv, pendingStores } = data;

  async function approveStore(storeId: string) {
    try {
      await actions.approve.mutateAsync({ id: storeId, mallId: id });
    } catch (err) {
      alert(apiErrorMessage(err, "Could not approve store."));
    }
  }

  return (
    <div className="space-y-6">
      <Link href="/admin/malls" className="text-xs font-bold text-[#7a3dbf] hover:underline">
        ← All malls
      </Link>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#3B1C5A]">{mall.name}</h1>
          <p className="text-sm text-[#8A79A5]">{mall.location ?? mall.city ?? "—"}</p>
        </div>
        <Link
          href={`/malls/${mall.slug}`}
          target="_blank"
          className="inline-flex items-center gap-1 text-xs font-bold text-[#7a3dbf]"
        >
          Public page <ExternalLink size={12} />
        </Link>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white border border-[#EBD7FA] p-4">
          <p className="text-[10px] font-black uppercase text-[#8A79A5]">Stores</p>
          <p className="text-2xl font-black text-[#3B1C5A]">{mall.storeCount ?? stores.length}</p>
        </div>
        <div className="rounded-2xl bg-white border border-[#EBD7FA] p-4">
          <p className="text-[10px] font-black uppercase text-[#8A79A5]">GMV (paid)</p>
          <p className="text-2xl font-black text-[#3B1C5A]">{formatPrice(gmv)}</p>
        </div>
        <div className="rounded-2xl bg-white border border-[#EBD7FA] p-4">
          <p className="text-[10px] font-black uppercase text-[#8A79A5]">Pending</p>
          <p className="text-2xl font-black text-amber-700">{pendingStores}</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-[#EBD7FA] overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-[#8A79A5] border-b">
              <th className="p-4">Store</th>
              <th className="p-4">Owner</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {stores.map((store) => (
              <tr key={store.id} className="border-b border-[#F5F1FA]">
                <td className="p-4 font-bold">{store.name}</td>
                <td className="p-4 text-xs">{store.owner?.email ?? "—"}</td>
                <td className="p-4">
                  <span className={cn("text-[10px] font-black uppercase", store.status === "approved" ? "text-emerald-700" : "text-amber-700")}>
                    {store.status}
                  </span>
                </td>
                <td className="p-4">
                  {store.status === "pending" && (
                    <button
                      type="button"
                      onClick={() => approveStore(store.id)}
                      className="text-xs font-bold text-emerald-700"
                    >
                      Approve
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
