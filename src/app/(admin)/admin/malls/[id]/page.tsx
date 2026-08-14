"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Loader2, ExternalLink, Building2, Store, DollarSign, Clock, CheckCircle2, ArrowLeft, Search } from "lucide-react";
import { useState, useMemo } from "react";

import { useAdminMall, useAdminStoreActions } from "@/hooks/use-admin";
import { apiErrorMessage } from "@/lib/api";
import { formatPrice, cn } from "@/lib/utils";
import { StatCard } from "@/components/dashboard/stat-card";
import { Pagination } from "@/components/dashboard/pagination";

export default function AdminMallDetailPage() {
  const params = useParams();
  const id = String(params?.id ?? "");
  const { data, isLoading, isError, refetch } = useAdminMall(id);
  const actions = useAdminStoreActions();
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 font-sans">
        <Loader2 className="h-10 w-10 animate-spin text-[#7a3dbf]" />
        <p className="text-sm font-bold text-slate-400">Loading shopping mall details...</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 font-semibold font-sans">
        Could not load shopping mall information.
      </div>
    );
  }

  const { mall, stores, gmv, pendingStores } = data;

  async function approveStore(storeId: string) {
    setApprovingId(storeId);
    try {
      await actions.approve.mutateAsync({ id: storeId, mallId: id });
      refetch();
    } catch (err) {
      alert(apiErrorMessage(err, "Could not approve store."));
    } finally {
      setApprovingId(null);
    }
  }

  const filteredStores = stores.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      (s.owner?.email && s.owner.email.toLowerCase().includes(q))
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredStores.length / pageSize));
  const paginatedStores = filteredStores.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto font-sans">
      <Link
        href="/admin/malls"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7a3dbf] hover:underline"
      >
        <ArrowLeft size={14} />
        <span>Back to all malls</span>
      </Link>

      {/* ── Top Header Banner ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-[#ebd7fa] shadow-sm">
        <div>
          <span className="px-3 py-1 rounded-full bg-[#ebd7fa] text-[#7a3dbf] text-[11px] font-black uppercase tracking-wider">
            Mall Facility Details
          </span>
          <h2 className="text-2xl font-bold text-slate-800 mt-2">{mall.name}</h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
            {mall.location ?? mall.city ?? "Nigeria"} · Slug: <span className="font-mono">{mall.slug}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/malls/${mall.slug}`}
            target="_blank"
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#7a3dbf] hover:bg-[#682fad] text-white text-xs font-bold rounded-xl shadow-sm shadow-purple-600/20 transition active:scale-95"
          >
            <span>View Public Storefront</span>
            <ExternalLink size={14} />
          </Link>
        </div>
      </div>

      {/* ── Metric Stat Cards ────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Attached Stores"
          value={mall.storeCount ?? stores.length}
          icon={<Store size={20} />}
          variant="purple"
          badgeText="Active Outlets"
          badgeType="neutral"
          subtitle="Operating vendors in this mall"
        />

        <StatCard
          title="Gross Volume (Paid)"
          value={formatPrice(gmv)}
          icon={<DollarSign size={20} />}
          variant="emerald"
          badgeText="Mall GMV"
          badgeType="success"
          subtitle="All transactions processed"
        />

        <StatCard
          title="Pending Store Applications"
          value={pendingStores}
          icon={<Clock size={20} />}
          variant={pendingStores > 0 ? "amber" : "purple"}
          badgeText={pendingStores > 0 ? "Awaiting Review" : "Clear"}
          badgeType={pendingStores > 0 ? "warning" : "success"}
          subtitle="Store onboarding queue"
        />
      </div>

      {/* ── Table & Search ───────────────────────────────────────── */}
      <div className="bg-white rounded-[2rem] border border-[#ebd7fa] p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search store name or merchant email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl pl-9 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/20 focus:border-[#7a3dbf] transition"
            />
          </div>
        </div>

        {filteredStores.length === 0 ? (
          <div className="text-center py-16">
            <Store size={40} className="mx-auto text-[#ebd7fa] mb-2" />
            <p className="text-sm font-bold text-slate-700">No stores found in this mall</p>
            <p className="text-xs text-slate-400 mt-1">Vendors can choose this mall during store registration.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#faf6ff] text-slate-500 font-bold uppercase tracking-wider border-b border-[#ebd7fa]">
                    <th className="px-4 py-3.5 rounded-l-xl">Store Name</th>
                    <th className="px-4 py-3.5">Merchant Email</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 rounded-r-xl text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedStores.map((store) => (
                    <tr key={store.id} className="hover:bg-[#faf6ff]/70 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-slate-900 text-sm">
                        {store.name}
                      </td>
                      <td className="px-4 py-3.5 text-slate-500">
                        {store.owner?.email ?? "—"}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={cn(
                            "inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border",
                            store.status === "approved"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          )}
                        >
                          {store.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {store.status === "pending" ? (
                          <button
                            type="button"
                            disabled={approvingId === store.id}
                            onClick={() => approveStore(store.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl font-bold text-xs transition disabled:opacity-50"
                          >
                            {approvingId === store.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={13} />}
                            <span>Approve Store</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 text-xs font-semibold">Active in Mall</span>
                        )}
                      </td>
                    </tr>
                  ))}
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
              itemName="stores"
            />
          </>
        )}
      </div>
    </div>
  );
}
