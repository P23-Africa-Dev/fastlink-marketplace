"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { useAdminProducts, useUnpublishProduct } from "@/hooks/use-admin";
import { apiErrorMessage } from "@/lib/api";
import { formatPrice } from "@/lib/utils";

export default function AdminProductsPage() {
  const [q, setQ] = useState("");
  const { data, isLoading } = useAdminProducts({ q });
  const unpublish = useUnpublishProduct();
  const [error, setError] = useState("");

  async function takeDown(id: string) {
    setError("");
    try {
      await unpublish.mutateAsync(id);
    } catch (err) {
      setError(apiErrorMessage(err, "Could not unpublish product."));
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black text-[#14081c]">Products</h1>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or SKU" className="rounded-xl border border-[#e3d4f0] bg-white px-4 py-2.5 text-sm font-semibold w-full max-w-sm" />
      {error && <p className="text-sm font-semibold text-rose-600">{error}</p>}
      <div className="bg-white rounded-3xl border border-[#e3d4f0] overflow-x-auto">
        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin text-[#7a3dbf]" /></div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-slate-400 border-b">
                <th className="p-4">Product</th>
                <th className="p-4">Store</th>
                <th className="p-4">Price</th>
                <th className="p-4">Status</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {(data?.data ?? []).map((product) => (
                <tr key={product.id} className="border-b border-slate-50">
                  <td className="p-4 font-bold">{product.name}</td>
                  <td className="p-4 text-xs">{product.store?.name ?? product.seller?.name ?? "—"}</td>
                  <td className="p-4 font-semibold">{formatPrice(product.price)}</td>
                  <td className="p-4 text-xs font-black uppercase">{product.status ?? "active"}</td>
                  <td className="p-4">
                    {product.status !== "archived" && (
                      <button onClick={() => takeDown(product.id)} className="text-xs font-bold text-rose-700">
                        Unpublish
                      </button>
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
