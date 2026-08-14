"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { Loader2, Building2, ChevronRight, Search, MapPin, Store, ArrowUpRight } from "lucide-react";

import { useAdminCatalog } from "@/hooks/use-admin";
import { Pagination } from "@/components/dashboard/pagination";
import { StatCard } from "@/components/dashboard/stat-card";

export default function AdminMallsPage() {
  const { malls } = useAdminCatalog();
  const rows = malls.data ?? [];
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);

  const filteredMalls = useMemo(() => {
    return rows.filter((mall) => {
      const q = searchQuery.toLowerCase();
      return (
        mall.name.toLowerCase().includes(q) ||
        (mall.location && mall.location.toLowerCase().includes(q)) ||
        (mall.city && mall.city.toLowerCase().includes(q))
      );
    });
  }, [rows, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredMalls.length / pageSize));
  const paginatedMalls = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredMalls.slice(start, start + pageSize);
  }, [filteredMalls, currentPage, pageSize]);

  const totalStoresInMalls = rows.reduce((sum, m) => sum + (m.storeCount || 0), 0);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto font-sans">
      {/* ── Top Header Banner ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-[#ebd7fa] shadow-sm">
        <div>
          <span className="px-3 py-1 rounded-full bg-[#ebd7fa] text-[#7a3dbf] text-[11px] font-black uppercase tracking-wider">
            Commercial Real Estate
          </span>
          <h2 className="text-2xl font-bold text-slate-800 mt-2">Physical Shopping Malls & Hubs</h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
            Browse physical mall hubs, attached store outlets, and localized foot-traffic analytics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/catalog"
            className="flex items-center gap-2 px-4 py-2.5 bg-[#7a3dbf] hover:bg-[#682fad] text-white text-xs font-bold rounded-xl shadow-sm shadow-purple-600/20 transition active:scale-95"
          >
            <span>Manage Taxonomy</span>
            <ArrowUpRight size={15} />
          </Link>
        </div>
      </div>

      {/* ── Metric Stat Cards ────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <StatCard
          title="Total Physical Malls"
          value={rows.length}
          icon={<Building2 size={20} />}
          variant="purple"
          badgeText="Active Centers"
          badgeType="neutral"
          subtitle="Registered physical retail complexes"
        />

        <StatCard
          title="Attached Retail Stores"
          value={totalStoresInMalls}
          icon={<Store size={20} />}
          variant="emerald"
          badgeText="Store Outlets"
          badgeType="success"
          subtitle="Operating vendors in mall locations"
        />
      </div>

      {/* ── Search & Filter ──────────────────────────────────────── */}
      <div className="bg-white rounded-[2rem] border border-[#ebd7fa] p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#ebd7fa]/60">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search malls by name, state or city..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl pl-9 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/20 focus:border-[#7a3dbf] transition"
            />
          </div>
          <span className="text-xs font-semibold text-slate-400">
            Showing {filteredMalls.length} of {rows.length} malls
          </span>
        </div>

        {malls.isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-[#7a3dbf]" />
            <p className="text-xs font-bold text-slate-400">Loading malls...</p>
          </div>
        ) : filteredMalls.length === 0 ? (
          <div className="text-center py-16">
            <Building2 size={40} className="mx-auto text-[#ebd7fa] mb-2" />
            <p className="text-sm font-bold text-slate-700">No shopping malls found</p>
            <p className="text-xs text-slate-400 mt-1">Add malls in Catalog CMS or adjust your search.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedMalls.map((mall) => (
                <Link
                  key={mall.id}
                  href={`/admin/malls/${mall.id}`}
                  className="rounded-[1.6rem] bg-[#faf6ff] border border-[#ebd7fa] p-5 hover:border-[#7a3dbf] hover:bg-white hover:shadow-md transition-all group flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-[#f3eafb] to-[#ebd7fa] text-[#7a3dbf] flex items-center justify-center font-bold shadow-inner group-hover:scale-105 transition-transform shrink-0">
                        <Building2 size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm group-hover:text-[#7a3dbf] transition-colors leading-tight">
                          {mall.name}
                        </h3>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin size={12} />
                          <span>{mall.location ?? mall.city ?? "Nigeria"}</span>
                        </p>
                      </div>
                    </div>
                    <div className="h-7 w-7 rounded-lg bg-white border border-[#ebd7fa] flex items-center justify-center text-slate-400 group-hover:text-[#7a3dbf] group-hover:border-[#7a3dbf]/40 transition-colors shrink-0">
                      <ChevronRight size={15} />
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-[#ebd7fa]/60 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-500">
                      {mall.storeCount ?? 0} Store Outlets
                    </span>
                    <span className="font-bold text-[#7a3dbf] group-hover:underline">
                      View stores →
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredMalls.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
              itemName="malls"
            />
          </>
        )}
      </div>
    </div>
  );
}
