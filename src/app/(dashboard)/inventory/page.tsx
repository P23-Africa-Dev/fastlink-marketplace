"use client";

import { useState } from "react";
import { Boxes, Loader2 } from "lucide-react";

import { useAdjustSellerStock, useSellerInventory, useSellerInventorySummary, useSellerProducts } from "@/hooks/use-seller-products";
import { apiErrorMessage } from "@/lib/api";
import { formatOrderDate } from "@/lib/order-map";
import type { InventoryMovementRow } from "@/types/admin";

const TYPES = [
  { value: "restock", label: "Restock", deltaSign: 1 },
  { value: "damaged", label: "Damaged", deltaSign: -1 },
  { value: "write_off", label: "Write-off", deltaSign: -1 },
] as const;

export default function SellerInventoryPage() {
  const { data: productsPage } = useSellerProducts();
  const { data: summary } = useSellerInventorySummary();
  const { data, isLoading, refetch } = useSellerInventory();
  const adjust = useAdjustSellerStock();
  const products = productsPage?.data ?? [];
  const rows = data?.data ?? [];

  const [productId, setProductId] = useState("");
  const [type, setType] = useState<(typeof TYPES)[number]["value"]>("restock");
  const [qty, setQty] = useState("1");
  const [note, setNote] = useState("");
  const [toast, setToast] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!productId) return;
    const amount = Math.abs(Number(qty));
    if (!amount) return;
    const sign = TYPES.find((t) => t.value === type)?.deltaSign ?? 1;
    try {
      await adjust.mutateAsync({
        id: productId,
        quantity_delta: amount * sign,
        type,
        note: note.trim() || undefined,
      });
      setQty("1");
      setNote("");
      setToast("Inventory updated.");
      setTimeout(() => setToast(""), 3000);
      refetch();
    } catch (err) {
      setToast(apiErrorMessage(err, "Could not update inventory."));
      setTimeout(() => setToast(""), 4000);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#3B1C5A] flex items-center gap-2">
          <Boxes size={22} className="text-[#7a3dbf]" />
          Inventory
        </h1>
        <p className="text-sm text-[#8A79A5] mt-1">Restock, damaged, and write-off movements with an audit trail.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-[#EBD7FA] bg-white p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#8A79A5]">Products tracked</p>
          <p className="mt-1 text-2xl font-extrabold text-[#3B1C5A]">{summary?.totalProducts ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-[#EBD7FA] bg-white p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#8A79A5]">Low stock</p>
          <p className="mt-1 text-2xl font-extrabold text-amber-700">{summary?.lowStockCount ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-[#EBD7FA] bg-white p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#8A79A5]">Out of stock</p>
          <p className="mt-1 text-2xl font-extrabold text-rose-700">{summary?.outOfStockCount ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-[#EBD7FA] bg-white p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#8A79A5]">Movements (7d)</p>
          <p className="mt-1 text-2xl font-extrabold text-[#3B1C5A]">{summary?.movementCount7d ?? 0}</p>
        </div>
      </div>

      {!!summary?.lowStockProducts?.length && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
          <p className="text-xs font-black uppercase tracking-wider text-amber-800">Low stock alerts</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {summary.lowStockProducts.map((product) => (
              <span key={product.id} className="rounded-lg bg-white px-3 py-1 text-xs font-semibold text-amber-800 border border-amber-200">
                {product.name} ({product.stock})
              </span>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={submit} className="rounded-2xl border border-[#EBD7FA] bg-white p-5 grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <select required value={productId} onChange={(e) => setProductId(e.target.value)} className="rounded-xl border border-[#EBD7FA] px-3 py-2 text-sm">
          <option value="">Product…</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.stock} in stock)
            </option>
          ))}
        </select>
        <select value={type} onChange={(e) => setType(e.target.value as typeof type)} className="rounded-xl border border-[#EBD7FA] px-3 py-2 text-sm">
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <input required type="number" min="1" value={qty} onChange={(e) => setQty(e.target.value)} className="rounded-xl border border-[#EBD7FA] px-3 py-2 text-sm" placeholder="Quantity" />
        <input value={note} onChange={(e) => setNote(e.target.value)} className="rounded-xl border border-[#EBD7FA] px-3 py-2 text-sm" placeholder="Note (optional)" />
        <button type="submit" disabled={adjust.isPending} className="rounded-xl bg-[#7a3dbf] px-4 py-2 text-xs font-bold text-white">
          Record movement
        </button>
      </form>

      <div className="rounded-2xl border border-[#EBD7FA] bg-white overflow-x-auto">
        {isLoading && (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-[#7a3dbf]" />
          </div>
        )}
        {!isLoading && rows.length === 0 && (
          <p className="py-12 text-center text-sm text-[#8A79A5]">No inventory movements yet.</p>
        )}
        {rows.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] font-black uppercase tracking-wider text-[#8A79A5] border-b border-[#EBD7FA]">
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Delta</th>
                <th className="px-4 py-3">After</th>
                <th className="px-4 py-3">Note</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row: InventoryMovementRow) => (
                <tr key={row.id} className="border-b border-[#FAF8FC]">
                  <td className="px-4 py-3 text-xs text-[#8A79A5]">{row.createdAt ? formatOrderDate(row.createdAt) : "—"}</td>
                  <td className="px-4 py-3 font-semibold">{row.product?.name ?? "—"}</td>
                  <td className="px-4 py-3 capitalize text-xs">{row.type.replace(/_/g, " ")}</td>
                  <td className={`px-4 py-3 font-bold ${row.quantityDelta < 0 ? "text-rose-700" : "text-emerald-700"}`}>
                    {row.quantityDelta > 0 ? `+${row.quantityDelta}` : row.quantityDelta}
                  </td>
                  <td className="px-4 py-3">{row.quantityAfter}</td>
                  <td className="px-4 py-3 text-xs text-[#8A79A5]">{row.note ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-[#3B1C5A] px-4 py-3 text-sm font-semibold text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
