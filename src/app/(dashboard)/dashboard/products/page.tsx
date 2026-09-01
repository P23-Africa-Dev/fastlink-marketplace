"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Plus,
  Search,
  Edit2,
  Eye,
  Trash2,
  Calendar,
  Download,
  AlertTriangle,
  Clock,
  ShoppingCart,
  Package,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { toDashboardProduct } from "@/lib/product-map";
import { useSellerProducts } from "@/hooks/use-seller-products";

export default function DashboardProductsPage() {
  const { data: sellerPage, isLoading } = useSellerProducts();
  const products = (sellerPage?.data ?? []).map(toDashboardProduct);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      categoryFilter === "" || p.category.toLowerCase().includes(categoryFilter.toLowerCase());

    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Active" && p.stock > 0) ||
      (statusFilter === "Low Stock" && p.stock > 0 && p.stock <= 10) ||
      (statusFilter === "Out of Stock" && p.stock === 0);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((p) => p.id));
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-[#ebd7fa] shadow-sm">
        <div>
          <span className="px-3 py-1 rounded-full bg-[#ebd7fa] text-[#7a3dbf] text-[11px] font-black uppercase tracking-wider">
            Inventory
          </span>
          <h2 className="text-2xl font-bold text-slate-800 mt-2">Product Catalog</h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
            Live products from your store API.
          </p>
        </div>
        <Link
          href="/products/new/add-new-product"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#7a3dbf] hover:bg-[#682fad] text-white text-xs font-bold rounded-xl shadow-md transition"
        >
          <Plus size={16} />
          Add Product
        </Link>
      </div>

      <div className="bg-white rounded-[2rem] border border-[#ebd7fa] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#ebd7fa]/60 flex flex-wrap gap-3 items-center justify-between">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or SKU..."
              className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-full pl-9 pr-4 py-2 text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-3 py-2 text-xs font-semibold"
          >
            <option value="All">All statuses</option>
            <option value="Active">Active</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
        </div>

        {isLoading ? (
          <p className="p-8 text-center text-sm text-slate-500">Loading products…</p>
        ) : filtered.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">No products found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#faf6ff] text-slate-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filtered.length && filtered.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="p-4">Product</th>
                  <th className="p-4">SKU</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ebd7fa]/50">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-[#faf6ff]/50">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(p.id)}
                        onChange={() => toggleSelect(p.id)}
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-purple-50">
                          {p.image && (
                            <Image src={p.image} alt={p.name} fill className="object-cover" />
                          )}
                        </div>
                        <span className="font-bold text-slate-800">{p.name}</span>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-slate-600">{p.sku}</td>
                    <td className="p-4 text-slate-600">{p.category}</td>
                    <td className="p-4">
                      <span
                        className={cn(
                          "font-bold",
                          p.stock === 0 ? "text-rose-600" : p.stock <= 10 ? "text-amber-600" : "text-emerald-600",
                        )}
                      >
                        {p.stock}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-[#7a3dbf]">₦{p.price.toLocaleString()}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/all-products/${p.id}`}
                          className="p-2 rounded-lg hover:bg-[#f3eafb] text-[#7a3dbf]"
                        >
                          <Eye size={14} />
                        </Link>
                        <Link
                          href={`/products/${p.id}/add-new-product`}
                          className="p-2 rounded-lg hover:bg-[#f3eafb] text-[#7a3dbf]"
                        >
                          <Edit2 size={14} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
