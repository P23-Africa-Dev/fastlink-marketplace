"use client";

import { useState, useMemo } from "react";
import { Loader2, Landmark, Plus, Trash2, Search, Layers, Building2, Tag, AlertCircle } from "lucide-react";

import { useAdminCatalog } from "@/hooks/use-admin";
import { adminApi, apiErrorMessage } from "@/lib/api";
import { QUERY_KEYS, queryClient } from "@/lib/query-client";
import { cn } from "@/lib/utils";
import { Pagination } from "@/components/dashboard/pagination";

type Tab = "malls" | "categories" | "brands";

const TAB_CONFIG: { id: Tab; label: string; icon: typeof Landmark }[] = [
  { id: "malls", label: "Malls Directory", icon: Building2 },
  { id: "categories", label: "Product Categories", icon: Layers },
  { id: "brands", label: "Verified Brands", icon: Tag },
];

export default function AdminCatalogPage() {
  const { malls, categories, brands } = useAdminCatalog();
  const [tab, setTab] = useState<Tab>("malls");
  const [name, setName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  async function createItem() {
    if (!name.trim()) return;
    setError("");
    setIsSubmitting(true);
    try {
      if (tab === "malls") await adminApi.createMall({ name });
      if (tab === "categories") await adminApi.createCategory({ name });
      if (tab === "brands") await adminApi.createBrand({ name });
      setName("");
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.all });
    } catch (err) {
      setError(apiErrorMessage(err, "Could not create item."));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function remove(id: string) {
    setError("");
    setDeletingId(id);
    try {
      if (tab === "malls") await adminApi.deleteMall(id);
      if (tab === "categories") await adminApi.deleteCategory(id);
      if (tab === "brands") await adminApi.deleteBrand(id);
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.all });
    } catch (err) {
      setError(apiErrorMessage(err, "Could not delete item."));
    } finally {
      setDeletingId(null);
    }
  }

  const rawRows =
    tab === "malls" ? malls.data ?? [] : tab === "categories" ? categories.data ?? [] : brands.data ?? [];
  const loading = malls.isLoading || categories.isLoading || brands.isLoading;

  const filteredRows = useMemo(() => {
    return rawRows.filter((r) => {
      const q = searchQuery.toLowerCase();
      return r.name.toLowerCase().includes(q) || (r.slug && r.slug.toLowerCase().includes(q));
    });
  }, [rawRows, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage, pageSize]);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto font-sans">
      {/* ── Top Header Banner ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-[#ebd7fa] shadow-sm">
        <div>
          <span className="px-3 py-1 rounded-full bg-[#ebd7fa] text-[#7a3dbf] text-[11px] font-black uppercase tracking-wider">
            Catalog CMS & Taxonomy
          </span>
          <h2 className="text-2xl font-bold text-slate-800 mt-2">Manage Store Categories, Malls & Brands</h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
            Organize the marketplace navigation hierarchy, brand verifications, and physical malls.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#f3eafb] px-4 py-2.5 rounded-xl text-[#7a3dbf] font-bold text-xs">
          <Landmark size={18} />
          <span>{rawRows.length} Total {tab}</span>
        </div>
      </div>

      {/* ── Navigation Tabs ──────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-[#ebd7fa] shadow-sm w-fit">
        {TAB_CONFIG.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => {
              setTab(id);
              setCurrentPage(1);
              setSearchQuery("");
              setError("");
            }}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all",
              tab === id
                ? "bg-[#7a3dbf] text-white shadow-sm shadow-purple-600/20"
                : "text-slate-600 hover:bg-[#faf6ff] hover:text-[#7a3dbf]"
            )}
          >
            <Icon size={16} />
            <span>{label}</span>
            <span
              className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-black",
                tab === id ? "bg-white/20 text-white" : "bg-[#f3eafb] text-[#7a3dbf]"
              )}
            >
              {id === "malls"
                ? malls.data?.length ?? 0
                : id === "categories"
                ? categories.data?.length ?? 0
                : brands.data?.length ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* ── Create Form & Search Toolbar ─────────────────────────── */}
      <div className="bg-white rounded-[2rem] border border-[#ebd7fa] p-6 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-5 border-b border-[#ebd7fa]/60">
          {/* Add form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createItem();
            }}
            className="flex flex-wrap items-center gap-2 w-full md:w-auto"
          >
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`Enter new ${tab.slice(0, -1)} title...`}
              className="bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/20 focus:border-[#7a3dbf] min-w-[240px] transition"
            />
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-[#7a3dbf] hover:bg-[#682fad] disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm shadow-purple-600/20 transition active:scale-95"
            >
              {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={15} />}
              <span>Add {tab.slice(0, -1)}</span>
            </button>
          </form>

          {/* Search box */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              placeholder={`Search ${tab}...`}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl pl-9 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/20 focus:border-[#7a3dbf] transition"
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        {/* Content Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-[#7a3dbf]" />
            <p className="text-xs font-bold text-slate-400">Loading catalog items...</p>
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="text-center py-16">
            <Landmark size={40} className="mx-auto text-[#ebd7fa] mb-2" />
            <p className="text-sm font-bold text-slate-700">No {tab} entries found</p>
            <p className="text-xs text-slate-400 mt-1">Create a new entry above or adjust your search term.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#faf6ff] text-slate-500 font-bold uppercase tracking-wider border-b border-[#ebd7fa]">
                    <th className="px-4 py-3.5 rounded-l-xl">Name / Title</th>
                    <th className="px-4 py-3.5">Slug Identifier</th>
                    <th className="px-4 py-3.5">ID</th>
                    <th className="px-4 py-3.5 rounded-r-xl text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedRows.map((row) => (
                    <tr key={row.id} className="hover:bg-[#faf6ff]/70 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-slate-800">
                        <div className="flex items-center gap-2.5">
                          <div className="h-7 w-7 rounded-lg bg-[#f3eafb] text-[#7a3dbf] flex items-center justify-center font-bold">
                            {row.name[0]?.toUpperCase()}
                          </div>
                          <span>{row.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 font-mono">
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] text-slate-600">
                          {row.slug || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-400 font-mono text-[11px]">
                        {row.id}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => remove(row.id)}
                          disabled={deletingId === row.id}
                          className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                        >
                          {deletingId === row.id ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <Trash2 size={13} />
                          )}
                          <span>Delete</span>
                        </button>
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
              itemName={tab}
            />
          </>
        )}
      </div>
    </div>
  );
}
