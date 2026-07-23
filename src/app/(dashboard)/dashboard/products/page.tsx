"use client";

import { useState } from "react";
import Image from "next/image";
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
  ChevronRight
} from "lucide-react";

import { cn } from "@/lib/utils";

const INITIAL_PRODUCTS = [
  {
    id: "FL-SKU-0001",
    sku: "FL-SKU-0001",
    name: "Apple iPhone 15 Pro, 256GB",
    category: "Electronics",
    stock: 50,
    price: 1100000,
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100&auto=format"
  },
  {
    id: "FL-SKU-0002",
    sku: "FL-SKU-0002",
    name: "Samsung Odyssey G7 Monitor",
    category: "Monitors",
    stock: 5,
    price: 350000,
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=100&auto=format"
  },
  {
    id: "FL-SKU-0003",
    sku: "FL-SKU-0003",
    name: "Samsung Odyssey G7 Monitor",
    category: "Monitors",
    stock: 5,
    price: 350000,
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=100&auto=format"
  },
  {
    id: "FL-SKU-0004",
    sku: "FL-SKU-0004",
    name: "Nike Air Max 270",
    category: "Shoes",
    stock: 100,
    price: 120000,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&auto=format"
  },
  {
    id: "FL-SKU-0005",
    sku: "FL-SKU-0005",
    name: "Nike Air Max 270",
    category: "Shoes",
    stock: 100,
    price: 120000,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&auto=format"
  },
  {
    id: "FL-SKU-0006",
    sku: "FL-SKU-0006",
    name: "Apple iPhone 15 Pro, 256GB",
    category: "Shoes",
    stock: 100,
    price: 120000,
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100&auto=format"
  },
  {
    id: "FL-SKU-0007",
    sku: "FL-SKU-0007",
    name: "Samsung Odyssey G7 Monitor",
    category: "Electronics",
    stock: 5,
    price: 350000,
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=100&auto=format"
  },
  {
    id: "FL-SKU-0008",
    sku: "FL-SKU-0008",
    name: "Samsung Odyssey G7 Monitor",
    category: "Electronics",
    stock: 50,
    price: 350000,
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=100&auto=format"
  }
];

export default function DashboardProductsPage() {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filter products
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

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filtered.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleDelete = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setSelectedIds((prev) => prev.filter((item) => item !== id));
  };

  // Metrics calculation
  const totalSKUs = products.length;
  const activeListings = products.filter((p) => p.stock > 0).length;
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 10).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto font-sans">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-800 text-2xl font-bold">Products List</h1>
          <p className="text-slate-400 text-sm mt-0.5">Manage your listings, inventory, and pricing</p>
        </div>
        
        <button className="bg-[#7a3dbf] hover:bg-[#682fad] text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5">
          <Plus size={16} />
          Add Product
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total SKUs */}
        <div className="bg-white rounded-[1.5rem] p-4 sm:p-5 shadow-sm border border-[#ebd7fa] flex items-center gap-3 sm:gap-4 hover:shadow-md transition-all duration-200">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-[#f3eafb] flex items-center justify-center shrink-0">
            <Package className="text-[#7a3dbf]" size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] sm:text-xs font-bold text-[#7a3dbf] uppercase tracking-wider truncate">Total SKUs</p>
            <p className="text-xl sm:text-2xl font-extrabold text-slate-800 mt-0.5">{totalSKUs * 231}</p>
            <span className="text-[10px] font-bold text-green-500 mt-0.5 block">+ 15% vs last month</span>
          </div>
        </div>

        {/* Active Listings */}
        <div className="bg-white rounded-[1.5rem] p-4 sm:p-5 shadow-sm border border-[#ebd7fa] flex items-center gap-3 sm:gap-4 hover:shadow-md transition-all duration-200">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-[#e8f5e9] flex items-center justify-center shrink-0">
            <ShoppingCart className="text-[#2e7d32]" size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] sm:text-xs font-bold text-[#7a3dbf] uppercase tracking-wider truncate">Active Listings</p>
            <p className="text-xl sm:text-2xl font-extrabold text-slate-800 mt-0.5">{activeListings * 202}</p>
            <span className="text-[10px] font-bold text-green-500 mt-0.5 block">+ 10% vs last month</span>
          </div>
        </div>

        {/* Low Stock Items */}
        <div className="bg-white rounded-[1.5rem] p-4 sm:p-5 shadow-sm border border-[#ebd7fa] flex items-center gap-3 sm:gap-4 hover:shadow-md transition-all duration-200">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-[#fff3e0] flex items-center justify-center shrink-0">
            <Clock className="text-[#e65100]" size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] sm:text-xs font-bold text-[#7a3dbf] uppercase tracking-wider truncate">Low Stock Items</p>
            <p className="text-xl sm:text-2xl font-extrabold text-slate-800 mt-0.5">{lowStockCount + 40}</p>
            <span className="text-[10px] font-bold text-green-500 mt-0.5 block">+ 5% vs last month</span>
          </div>
        </div>

        {/* Out of Stock */}
        <div className="bg-white rounded-[1.5rem] p-4 sm:p-5 shadow-sm border border-[#ebd7fa] flex items-center gap-3 sm:gap-4 hover:shadow-md transition-all duration-200">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-red-50 flex items-center justify-center shrink-0">
            <AlertTriangle className="text-red-600" size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] sm:text-xs font-bold text-[#7a3dbf] uppercase tracking-wider truncate">Out of Stock</p>
            <p className="text-xl sm:text-2xl font-extrabold text-slate-800 mt-0.5">{outOfStockCount + 22}</p>
            <span className="text-[10px] font-bold text-red-500 mt-0.5 block">- 2% vs last month</span>
          </div>
        </div>

      </div>

      {/* Filter Row Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        
        {/* Category Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Filter by category..."
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-full pl-10 pr-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/40 transition-all shadow-sm"
          />
        </div>

        {/* Status Dropdown */}
        <div className="relative bg-[#faf6ff] border border-[#ebd7fa] rounded-full px-4 py-2 text-sm text-slate-800 shadow-sm flex items-center justify-between">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-transparent focus:outline-none pr-6 cursor-pointer font-semibold text-slate-700 appearance-none"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
          <div className="absolute right-4 pointer-events-none text-slate-500">▼</div>
        </div>

        {/* Main Text Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-full pl-10 pr-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/40 transition-all shadow-sm"
          />
        </div>

        {/* Last Updated Calendar Box */}
        <div className="bg-[#faf6ff] border border-[#ebd7fa] rounded-full px-4 py-2 text-sm text-slate-700 shadow-sm flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-2 font-semibold">
            <Calendar size={16} className="text-[#7a3dbf]" />
            <span>Last Updated</span>
          </div>
          <span className="text-xs">▼</span>
        </div>

        {/* Export Button */}
        <button className="bg-[#faf6ff] hover:bg-slate-50 text-slate-800 border border-[#ebd7fa] rounded-full px-4 py-2 hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5 font-bold text-sm shadow-sm">
          <Download size={15} className="text-[#7a3dbf]" />
          Export
        </button>

      </div>

      {/* Detailed Products Records Table */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#ebd7fa] space-y-6">
        
        {/* Table container */}
        <div className="overflow-x-auto select-none">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={filtered.length > 0 && selectedIds.length === filtered.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-[#ebd7fa] h-4 w-4 text-[#7a3dbf] focus:ring-[#7a3dbf]"
                  />
                </th>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Stock Level</th>
                <th className="py-3 px-4">Base Price</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-700">
              {filtered.length > 0 ? (
                filtered.map((p) => {
                  const isChecked = selectedIds.includes(p.id);
                  return (
                    <tr key={p.id} className={cn("hover:bg-slate-50/50 transition-colors", isChecked && "bg-purple-50/30")}>
                      
                      {/* Checkbox cell */}
                      <td className="py-4 px-4 w-10">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => handleSelectRow(p.id, e.target.checked)}
                          className="rounded border-[#ebd7fa] h-4 w-4 text-[#7a3dbf] focus:ring-[#7a3dbf] cursor-pointer"
                        />
                      </td>

                      {/* Product Thumbnail */}
                      <td className="py-4 px-4">
                        <div className="relative h-12 w-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center shadow-sm">
                          <Image
                            src={p.image}
                            alt={p.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="py-4 px-4 font-bold text-slate-500">{p.sku}</td>

                      {/* Name */}
                      <td className="py-4 px-4 font-bold text-slate-800 text-sm sm:text-base">{p.name}</td>

                      {/* Category */}
                      <td className="py-4 px-4 font-medium text-slate-500">{p.category}</td>

                      {/* Stock */}
                      <td className="py-4 px-4">
                        <span className={cn(
                          "font-extrabold text-sm",
                          p.stock <= 5 ? "text-red-500" : p.stock <= 10 ? "text-yellow-600" : "text-slate-800"
                        )}>
                          {p.stock}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-4 px-4 font-extrabold text-slate-800">
                        ₦{p.price.toLocaleString()}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-2.5">
                          <button className="p-2 border border-slate-200 hover:border-[#7a3dbf] rounded-lg text-slate-400 hover:text-[#7a3dbf] transition-all bg-white shadow-sm active:scale-90">
                            <Edit2 size={13} />
                          </button>
                          <button className="p-2 border border-slate-200 hover:border-[#7a3dbf] rounded-lg text-slate-400 hover:text-[#7a3dbf] transition-all bg-white shadow-sm active:scale-90">
                            <Eye size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-2 border border-slate-200 hover:border-red-500 rounded-lg text-slate-400 hover:text-red-500 transition-all bg-white shadow-sm active:scale-90"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                    No products found matching the criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info / Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 pt-4">
          <p className="text-xs font-semibold text-slate-400">
            Showing {filtered.length} of {products.length} products
          </p>
          
          <div className="flex items-center gap-1 select-none">
            <button className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 transition-colors">
              <ChevronLeft size={16} />
            </button>
            <button className="h-8 w-8 rounded-lg flex items-center justify-center font-bold text-sm bg-[#7a3dbf] text-white shadow-md">
              1
            </button>
            <button className="h-8 w-8 rounded-lg flex items-center justify-center font-bold text-sm text-slate-700 hover:bg-slate-50 transition-colors border border-slate-200">
              2
            </button>
            <button className="h-8 w-8 rounded-lg flex items-center justify-center font-bold text-sm text-slate-700 hover:bg-slate-50 transition-colors border border-slate-200">
              3
            </button>
            <span className="text-slate-400 px-1 font-bold">...</span>
            <button className="h-8 w-8 rounded-lg flex items-center justify-center font-bold text-sm text-slate-700 hover:bg-slate-50 transition-colors border border-slate-200">
              114
            </button>
            <button className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
