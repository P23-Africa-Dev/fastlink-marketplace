"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { useAdminCatalog } from "@/hooks/use-admin";
import { adminApi, apiErrorMessage } from "@/lib/api";
import { QUERY_KEYS, queryClient } from "@/lib/query-client";

type Tab = "malls" | "categories" | "brands";

export default function AdminCatalogPage() {
  const { malls, categories, brands } = useAdminCatalog();
  const [tab, setTab] = useState<Tab>("malls");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  async function createItem() {
    if (!name.trim()) return;
    setError("");
    try {
      if (tab === "malls") await adminApi.createMall({ name });
      if (tab === "categories") await adminApi.createCategory({ name });
      if (tab === "brands") await adminApi.createBrand({ name });
      setName("");
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.all });
    } catch (err) {
      setError(apiErrorMessage(err, "Could not create item."));
    }
  }

  async function remove(id: string) {
    setError("");
    try {
      if (tab === "malls") await adminApi.deleteMall(id);
      if (tab === "categories") await adminApi.deleteCategory(id);
      if (tab === "brands") await adminApi.deleteBrand(id);
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.all });
    } catch (err) {
      setError(apiErrorMessage(err, "Could not delete item."));
    }
  }

  const rows =
    tab === "malls" ? malls.data ?? [] : tab === "categories" ? categories.data ?? [] : brands.data ?? [];
  const loading = malls.isLoading || categories.isLoading || brands.isLoading;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black text-[#14081c]">Catalog CMS</h1>
      <div className="flex gap-2">
        {(["malls", "categories", "brands"] as Tab[]).map((item) => (
          <button
            key={item}
            onClick={() => setTab(item)}
            className={`rounded-xl px-4 py-2 text-xs font-black uppercase ${tab === item ? "bg-[#14081c] text-[#d4a24c]" : "bg-white border border-[#e3d4f0]"}`}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder={`New ${tab.slice(0, -1)} name`} className="rounded-xl border border-[#e3d4f0] bg-white px-4 py-2.5 text-sm font-semibold flex-1 max-w-sm" />
        <button onClick={createItem} className="rounded-xl bg-[#14081c] text-white font-bold px-4 py-2.5 text-sm">Add</button>
      </div>
      {error && <p className="text-sm font-semibold text-rose-600">{error}</p>}
      <div className="bg-white rounded-3xl border border-[#e3d4f0] overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin text-[#7a3dbf]" /></div>
        ) : (
          <ul className="divide-y">
            {rows.map((row) => (
              <li key={row.id} className="flex items-center justify-between p-4 text-sm">
                <div>
                  <p className="font-bold">{row.name}</p>
                  <p className="text-xs text-slate-500">{row.slug}</p>
                </div>
                <button onClick={() => remove(row.id)} className="text-xs font-bold text-rose-700">Delete</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
