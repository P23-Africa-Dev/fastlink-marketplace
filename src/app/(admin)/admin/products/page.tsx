"use client";

import { useState, useMemo } from "react";
import { Loader2, Package, Search, Tag, EyeOff, Store, DollarSign, Layers } from "lucide-react";

import { useAdminProducts, useUnpublishProduct } from "@/hooks/use-admin";
import { apiErrorMessage } from "@/lib/api";
import { formatPrice, cn } from "@/lib/utils";
import { Pagination } from "@/components/dashboard/pagination";
import { StatCard } from "@/components/dashboard/stat-card";

export default function AdminProductsPage() {
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { data, isLoading, isError, refetch } = useAdminProducts({ q });
  const unpublish = useUnpublishProduct();
  const [error, setError] = useState("");
  const [unpublishingId, setUnpublishingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const rawProducts = data?.data ?? [];

  async function takeDown(id: string) {
    if (!window.confirm("Are you sure you want to unpublish / archive this product listing?")) return;
    setError("");
    setUnpublishingId(id);
    try {
      await unpublish.mutateAsync(id);
      refetch();
    } catch (err) {
      setError(apiErrorMessage(err, "Could not unpublish product."));
    } finally {
      setUnpublishingId(null);
    }
  }

  const filteredProducts = useMemo(() => {
    return rawProducts.filter((p) => {
      const query = q.toLowerCase();
      const matchesSearch =
        p.name.toLowerCase().includes(query) ||
        (p.store?.name && p.store.name.toLowerCase().includes(query)) ||
        (p.seller?.name && p.seller.name.toLowerCase().includes(query));
      const matchesStatus =
        statusFilter === "all" ||
        (p.status ?? "active").toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [rawProducts, q, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  const activeCount = rawProducts.filter((p) => (p.status ?? "active") === "active").length;
  const archivedCount = rawProducts.filter((p) => p.status === "archived").length;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto font-sans">
      {/* ── Top Header Banner ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-[#ebd7fa] shadow-sm">
        <div>
          <span className="px-3 py-1 rounded-full bg-[#ebd7fa] text-[#7a3dbf] text-[11px] font-black uppercase tracking-wider">
            Global Marketplace Inventory
          </span>
          <h2 className="text-2xl font-bold text-slate-800 mt-2">Product Catalog Oversight</h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
            Search all active vendor product listings, audit prices, and enforce marketplace catalog compliance.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#f3eafb] px-4 py-2.5 rounded-xl text-[#7a3dbf] font-bold text-xs">
          <Package size={18} />
          <span>{rawProducts.length} Total SKUs</span>
        </div>
      </div>

      {/* ── Metric Stat Cards ────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Total Catalog Items"
          value={rawProducts.length.toLocaleString()}
          icon={<Package size={20} />}
          variant="purple"
          badgeText="All Stores"
          badgeType="neutral"
          subtitle="Inventory across all vendors"
        />

        <StatCard
          title="Active Live Products"
          value={activeCount.toLocaleString()}
          icon={<Tag size={20} />}
          variant="emerald"
          badgeText="Published"
          badgeType="success"
          subtitle="Visible to buyers in shop"
        />

        <StatCard
          title="Archived / Unpublished"
          value={archivedCount.toLocaleString()}
          icon={<EyeOff size={20} />}
          variant={archivedCount > 0 ? "amber" : "purple"}
          badgeText={archivedCount > 0 ? "Hidden" : "None"}
          badgeType={archivedCount > 0 ? "warning" : "neutral"}
          subtitle="Removed from public catalog"
        />
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* ── Table & Filters ──────────────────────────────────────── */}
      <div className="bg-white rounded-[2rem] border border-[#ebd7fa] p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by product title or store..."
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl pl-9 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/20 focus:border-[#7a3dbf] transition"
            />
          </div>

          <div className="flex items-center gap-2">
            {[
              { id: "all", label: "All Items" },
              { id: "active", label: "Active" },
              { id: "archived", label: "Archived" },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => {
                  setStatusFilter(st.id);
                  setCurrentPage(1);
                }}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-bold transition",
                  statusFilter === st.id
                    ? "bg-[#7a3dbf] text-white shadow-sm shadow-purple-600/20"
                    : "bg-[#faf6ff] text-slate-600 hover:bg-[#f3eafb]"
                )}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-[#7a3dbf]" />
            <p className="text-xs font-bold text-slate-400">Loading catalog items...</p>
          </div>
        ) : isError ? (
          <div className="p-6 text-center text-rose-600 font-semibold text-sm">
            Failed to retrieve products.
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <Package size={40} className="mx-auto text-[#ebd7fa] mb-2" />
            <p className="text-sm font-bold text-slate-700">No products found</p>
            <p className="text-xs text-slate-400 mt-1">Try refining or clearing your search term.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#faf6ff] text-slate-500 font-bold uppercase tracking-wider border-b border-[#ebd7fa]">
                    <th className="px-4 py-3.5 rounded-l-xl">Product Title</th>
                    <th className="px-4 py-3.5">Store / Merchant</th>
                    <th className="px-4 py-3.5">Retail Price</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 rounded-r-xl text-right">Moderation Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-[#faf6ff]/70 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-[#f3eafb] text-[#7a3dbf] font-bold flex items-center justify-center text-sm shadow-inner shrink-0">
                            <Tag size={16} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{product.name}</p>
                            <p className="text-[11px] text-slate-400 font-mono">ID: {product.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-700 font-semibold">
                        <div className="flex items-center gap-1.5">
                          <Store size={12} className="text-[#7a3dbf]" />
                          <span>{product.store?.name ?? product.seller?.name ?? "—"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-slate-900 text-sm">
                        {formatPrice(product.price)}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={cn(
                            "inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border",
                            (product.status ?? "active") === "active"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-slate-100 text-slate-600 border-slate-200"
                          )}
                        >
                          {product.status ?? "active"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {product.status !== "archived" ? (
                          <button
                            type="button"
                            disabled={unpublishingId === product.id}
                            onClick={() => takeDown(product.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl font-bold text-xs transition active:scale-95 disabled:opacity-50"
                          >
                            {unpublishingId === product.id ? <Loader2 size={12} className="animate-spin" /> : <EyeOff size={13} />}
                            <span>Unpublish</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 text-xs font-semibold">Archived</span>
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
              totalItems={filteredProducts.length}
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
    </div>
  );
}
