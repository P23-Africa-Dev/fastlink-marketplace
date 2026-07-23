"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Plus,
  Search,
  Edit2,
  Eye,
  Trash2,
  Download,
  AlertTriangle,
  Clock,
  ShoppingCart,
  Package,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle
} from "lucide-react";

import { cn } from "@/lib/utils";
import { MOCK_PRODUCTS } from "@/lib/mock-products";
import type { Product } from "@/lib/mock-products";

export default function AllProductsPage() {
  const router = useRouter();
  // Products Local Database State
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);

  // Search & Filter state
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"name" | "sku" | "price" | "stock" | "none">("none");

  // Dialogs States
  const [activeModal, setActiveModal] = useState<"add" | "edit" | "delete" | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Add Product Form State
  const [newProduct, setNewProduct] = useState<Omit<Product, "id">>({
    sku: "",
    name: "",
    brand: "",
    condition: "New",
    description: "",
    category: "",
    categoryPath: [],
    stock: 0,
    basePrice: 0,
    costPrice: 0,
    comparePrice: 0,
    price: 0,
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100&auto=format",
    images: [],
    tags: [],
    weight: 0,
    length: 0,
    width: 0,
    height: 0,
    shippingClass: "Standard",
    specialHandling: false,
    hasVariants: false,
    variantTypes: [],
    variants: [],
    status: "Draft"
  });

  // Edit Product Form State
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  // Toast notifications state
  const [toast, setToast] = useState("");

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  // Filter products based on search inputs
  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      categoryFilter === "" || p.category.toLowerCase().includes(categoryFilter.toLowerCase());

    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Active" && p.stock > 0) ||
      (statusFilter === "Low Stock" && p.stock > 0 && p.stock <= 5) || // Low stock is stock level <= 5 matching table highlight
      (statusFilter === "Out of Stock" && p.stock === 0);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Sort logic if chosen
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "sku") return a.sku.localeCompare(b.sku);
    if (sortBy === "price") return b.price - a.price;
    if (sortBy === "stock") return b.stock - a.stock;
    return 0;
  });

  // Multi-row Selection Handlers
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

  // CSV Export Simulator
  const handleExportCSV = () => {
    if (filtered.length === 0) {
      triggerToast("No products found to export.");
      return;
    }
    const headers = "SKU,Product Name,Category,Stock Level,Base Price\n";
    const csvContent =
      headers +
      filtered
        .map((p) => `"${p.sku}","${p.name.replace(/"/g, '""')}","${p.category}",${p.stock},${p.price}`)
        .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `fastlink_products_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast("Inventory catalog CSV downloaded successfully!");
  };

  // Add Product Handler
  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.sku.trim() || !newProduct.name.trim() || !newProduct.category.trim()) {
      triggerToast("Please fill all required fields.");
      return;
    }
    const skuExists = products.some((p) => p.sku.toLowerCase() === newProduct.sku.toLowerCase());
    if (skuExists) {
      triggerToast("Product SKU already exists. Please use a unique SKU.");
      return;
    }

    const created: Product = {
      ...newProduct,
      id: newProduct.sku,
      price: Number(newProduct.price),
      stock: Number(newProduct.stock)
    };

    setProducts((prev) => [...prev, created]);
    setActiveModal(null);
    setNewProduct({
      sku: "",
      name: "",
      brand: "",
      condition: "New",
      description: "",
      category: "",
      categoryPath: [],
      stock: 0,
      basePrice: 0,
      costPrice: 0,
      comparePrice: 0,
      price: 0,
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100&auto=format",
      images: [],
      tags: [],
      weight: 0,
      length: 0,
      width: 0,
      height: 0,
      shippingClass: "Standard",
      specialHandling: false,
      hasVariants: false,
      variantTypes: [],
      variants: [],
      status: "Draft"
    });
    triggerToast("Product added to catalog successfully!");
  };

  // Edit Product Handler
  const handleEditProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProduct) return;
    if (!editProduct.name.trim() || !editProduct.category.trim()) {
      triggerToast("Please fill all required fields.");
      return;
    }

    setProducts((prev) =>
      prev.map((p) =>
        p.id === editProduct.id
          ? {
              ...editProduct,
              price: Number(editProduct.price),
              stock: Number(editProduct.stock)
            }
          : p
      )
    );
    setActiveModal(null);
    setEditProduct(null);
    triggerToast("Product details updated successfully!");
  };

  // Delete Product Handler
  const handleDeleteConfirm = () => {
    if (!selectedProduct) return;
    setProducts((prev) => prev.filter((p) => p.id !== selectedProduct.id));
    setSelectedIds((prev) => prev.filter((id) => id !== selectedProduct.id));
    setActiveModal(null);
    setSelectedProduct(null);
    triggerToast("Product deleted successfully.");
  };

  // Metrics Calculation (Baseline offsets to match mockup statistics)
  // Mockup cards state values: Total SKUs (1850), Active (1620), Low Stock (45), Out of stock (25)
  const totalSKUs = 1842 + products.length;
  const activeListings = 1612 + products.filter((p) => p.stock > 0).length;
  const lowStockCount = 41 + products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const outOfStockCount = 25 + products.filter((p) => p.stock === 0).length;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto font-sans relative pb-12">
      {/* Toast Alert Popup */}
      {toast && (
        <div className="fixed top-24 right-8 z-50 bg-[#7a3dbf] text-white font-bold text-sm px-6 py-4 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle size={16} />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[#7a3dbf] text-2xl font-extrabold tracking-tight">Products List</h2>
          <p className="text-slate-500 text-sm mt-0.5">Manage store listings, live stock levels, and basic price matrices.</p>
        </div>

        <button
          onClick={() => {
            router.push("/products/new/add-new-product");
          }}
          className="bg-[#7a3dbf] hover:bg-[#682fad] text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5 shrink-0"
        >
          <Plus size={16} />
          <span>Add Product</span>
        </button>
      </div>

      {/* Telemetry Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total SKUs */}
        <div className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-[#ebd7fa] flex items-center gap-4 hover:shadow-md transition-all duration-200">
          <div className="h-12 w-12 rounded-full bg-[#f3eafb] flex items-center justify-center shrink-0">
            <Package className="text-[#7a3dbf]" size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-[#7a3dbf] uppercase tracking-wider truncate">Total SKUs</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-0.5">{totalSKUs.toLocaleString()}</p>
            <span className="text-[10px] font-bold text-green-500 mt-0.5 block">+15% vs last month</span>
          </div>
        </div>

        {/* Active Listings */}
        <div className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-[#ebd7fa] flex items-center gap-4 hover:shadow-md transition-all duration-200">
          <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center shrink-0">
            <ShoppingCart className="text-green-600" size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate">Active Listings</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-0.5">{activeListings.toLocaleString()}</p>
            <span className="text-[10px] font-bold text-green-500 mt-0.5 block">+10% vs last month</span>
          </div>
        </div>

        {/* Low Stock Items */}
        <div className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-[#ebd7fa] flex items-center gap-4 hover:shadow-md transition-all duration-200">
          <div className="h-12 w-12 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
            <Clock className="text-amber-600" size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate">Low Stock Items</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-0.5">{lowStockCount}</p>
            <span className="text-[10px] font-bold text-green-500 mt-0.5 block">+5% vs last month</span>
          </div>
        </div>

        {/* Out of Stock */}
        <div className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-[#ebd7fa] flex items-center gap-4 hover:shadow-md transition-all duration-200">
          <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center shrink-0">
            <AlertTriangle className="text-red-500" size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate">Out of Stock</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-0.5">{outOfStockCount}</p>
            <span className="text-[10px] font-bold text-red-500 mt-0.5 block">-2% vs last month</span>
          </div>
        </div>
      </div>

      {/* Filters & Control Grid Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Filter by Category */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Filter by category or icons..."
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-white border border-[#ebd7fa] rounded-full pl-10 pr-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/20 transition-all shadow-sm"
          />
        </div>

        {/* Status Dropdown Filter */}
        <div className="relative bg-white border border-[#ebd7fa] rounded-full px-4 py-2 text-sm text-slate-700 shadow-sm flex items-center justify-between">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-transparent focus:outline-none pr-6 cursor-pointer font-semibold text-slate-700 appearance-none text-xs md:text-sm"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
          <div className="absolute right-4 pointer-events-none text-slate-400 text-xs">▼</div>
        </div>

        {/* Name / SKU Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search by SKU or product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-[#ebd7fa] rounded-full pl-10 pr-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/20 transition-all shadow-sm"
          />
        </div>

        {/* Sort Sorter Dropdown */}
        <div className="relative bg-white border border-[#ebd7fa] rounded-full px-4 py-2 text-sm text-slate-700 shadow-sm flex items-center justify-between">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "name" | "sku" | "price" | "stock" | "none")}
            className="w-full bg-transparent focus:outline-none pr-6 cursor-pointer font-semibold text-slate-700 appearance-none text-xs md:text-sm"
          >
            <option value="none">Sort: Last Updated</option>
            <option value="name">Sort: Product Name</option>
            <option value="sku">Sort: SKU Identifier</option>
            <option value="price">Sort: Price (Highest)</option>
            <option value="stock">Sort: Stock Level</option>
          </select>
          <div className="absolute right-4 pointer-events-none text-slate-400 text-xs">▼</div>
        </div>

        {/* Export to CSV Trigger */}
        <button
          onClick={handleExportCSV}
          className="bg-white hover:bg-slate-50 text-slate-700 border border-[#ebd7fa] rounded-full px-4 py-2 hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5 font-bold text-sm shadow-sm"
        >
          <Download size={15} className="text-[#7a3dbf]" />
          <span>Export</span>
        </button>
      </div>

      {/* Main Inventory Records Table Container */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#ebd7fa] space-y-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={filtered.length > 0 && selectedIds.length === filtered.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-[#ebd7fa] h-4 w-4 text-[#7a3dbf] focus:ring-[#7a3dbf] cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4 w-20">Product</th>
                <th className="py-3 px-4 w-36">SKU</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4 w-36">Category</th>
                <th className="py-3 px-4 w-28">Stock Level</th>
                <th className="py-3 px-4 w-36">Base Price</th>
                <th className="py-3 px-4 w-32 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-700">
              {sorted.length > 0 ? (
                sorted.map((p) => {
                  const isChecked = selectedIds.includes(p.id);
                  return (
                    <tr
                      key={p.id}
                      className={cn(
                        "hover:bg-[#faf6ff]/20 transition-colors duration-150",
                        isChecked && "bg-[#faf6ff]/50"
                      )}
                    >
                      {/* Checkbox cell */}
                      <td className="py-4 px-4 w-10">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => handleSelectRow(p.id, e.target.checked)}
                          className="rounded border-[#ebd7fa] h-4 w-4 text-[#7a3dbf] focus:ring-[#7a3dbf] cursor-pointer"
                        />
                      </td>

                      {/* Product Image */}
                      <td className="py-4 px-4">
                        <div className="relative h-12 w-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center shadow-sm">
                          <Image
                            src={p.image}
                            alt={p.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                      </td>

                      {/* SKU Identifier */}
                      <td className="py-4 px-4 text-slate-500 font-bold text-xs">{p.sku}</td>

                      {/* Name */}
                      <td className="py-4 px-4 text-slate-800 font-bold text-sm sm:text-base tracking-tight">
                        {p.name}
                      </td>

                      {/* Category Badge */}
                      <td className="py-4 px-4">
                        <span className="bg-[#f3eafb] text-[#7a3dbf] text-xs font-bold px-3 py-1 rounded-full border border-[#ebd7fa]/40">
                          {p.category}
                        </span>
                      </td>

                      {/* Stock Level with alarm alerts */}
                      <td className="py-4 px-4">
                        <span
                          className={cn(
                            "font-extrabold text-sm",
                            p.stock === 0
                              ? "text-red-500"
                              : p.stock <= 5
                              ? "text-amber-500"
                              : "text-slate-800"
                          )}
                        >
                          {p.stock}
                        </span>
                      </td>

                      {/* Currency Formatted Price */}
                      <td className="py-4 px-4 font-extrabold text-slate-800">
                        ₦{p.price.toLocaleString()}
                      </td>

                      {/* Actions buttons */}
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              router.push(`/products/${p.id}/add-new-product`);
                            }}
                            title="Edit product parameters"
                            className="p-2 border border-slate-200 hover:border-[#7a3dbf] rounded-lg text-slate-400 hover:text-[#7a3dbf] transition-all bg-white shadow-sm active:scale-90"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => {
                              router.push(`/all-products/${p.id}`);
                            }}
                            title="View product spec details"
                            className="p-2 border border-slate-200 hover:border-[#7a3dbf] rounded-lg text-slate-400 hover:text-[#7a3dbf] transition-all bg-white shadow-sm active:scale-90"
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedProduct(p);
                              setActiveModal("delete");
                            }}
                            title="Delete this listing"
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
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-semibold">
                    No products found matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Counter controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 pt-4">
          <p className="text-xs font-semibold text-slate-400">
            Showing 1-{sorted.length} of {products.length} products
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

      {/* --- ADD PRODUCT MODAL DIALOG --- */}
      {activeModal === "add" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setActiveModal(null)} />
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-[#ebd7fa] relative z-10 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 transition-colors p-1"
            >
              <X size={20} />
            </button>

            <h3 className="text-slate-800 text-xl font-bold mb-4 flex items-center gap-2">
              <Package className="text-[#7a3dbf]" size={20} />
              <span>Add New Product Listing</span>
            </h3>

            <form onSubmit={handleAddProductSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  SKU Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FL-SKU-0009"
                  value={newProduct.sku}
                  onChange={(e) => setNewProduct((prev) => ({ ...prev, sku: e.target.value }))}
                  className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-4 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#7a3dbf]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apple iPad Pro, M4 Chip"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-4 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#7a3dbf]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Electronics"
                    value={newProduct.category}
                    onChange={(e) => setNewProduct((prev) => ({ ...prev, category: e.target.value }))}
                    className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-4 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#7a3dbf]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct((prev) => ({ ...prev, stock: Number(e.target.value) }))}
                    className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-4 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#7a3dbf]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Base Price (₦) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={newProduct.price}
                    onChange={(e) => setNewProduct((prev) => ({ ...prev, price: Number(e.target.value) }))}
                    className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-4 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#7a3dbf]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Image URL
                  </label>
                  <input
                    type="text"
                    value={newProduct.image}
                    onChange={(e) => setNewProduct((prev) => ({ ...prev, image: e.target.value }))}
                    className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-4 py-2 text-xs font-semibold text-slate-850 focus:outline-none focus:ring-1 focus:ring-[#7a3dbf]"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#7a3dbf] hover:bg-[#682fad] text-white text-xs font-bold transition-all shadow-md active:scale-95"
                >
                  Create Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT PRODUCT MODAL DIALOG --- */}
      {activeModal === "edit" && editProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setActiveModal(null); setEditProduct(null); }} />
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-[#ebd7fa] relative z-10 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => { setActiveModal(null); setEditProduct(null); }}
              className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 transition-colors p-1"
            >
              <X size={20} />
            </button>

            <h3 className="text-slate-800 text-xl font-bold mb-4 flex items-center gap-2">
              <Edit2 className="text-[#7a3dbf]" size={20} />
              <span>Modify Listing: {editProduct.sku}</span>
            </h3>

            <form onSubmit={handleEditProductSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={editProduct.name}
                  onChange={(e) => setEditProduct((prev) => prev ? { ...prev, name: e.target.value } : null)}
                  className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-4 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#7a3dbf]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    value={editProduct.category}
                    onChange={(e) => setEditProduct((prev) => prev ? { ...prev, category: e.target.value } : null)}
                    className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-4 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#7a3dbf]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editProduct.stock}
                    onChange={(e) => setEditProduct((prev) => prev ? { ...prev, stock: Number(e.target.value) } : null)}
                    className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-4 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#7a3dbf]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Base Price (₦) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editProduct.price}
                    onChange={(e) => setEditProduct((prev) => prev ? { ...prev, price: Number(e.target.value) } : null)}
                    className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-4 py-2 text-xs font-semibold text-slate-850 focus:outline-none focus:ring-1 focus:ring-[#7a3dbf]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Image URL
                  </label>
                  <input
                    type="text"
                    value={editProduct.image}
                    onChange={(e) => setEditProduct((prev) => prev ? { ...prev, image: e.target.value } : null)}
                    className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-4 py-2 text-xs font-semibold text-slate-850 focus:outline-none focus:ring-1 focus:ring-[#7a3dbf]"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setActiveModal(null); setEditProduct(null); }}
                  className="px-5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#7a3dbf] hover:bg-[#682fad] text-white text-xs font-bold transition-all shadow-md active:scale-95"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}



      {/* --- DELETE CONFIRMATION DIALOG --- */}
      {activeModal === "delete" && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setActiveModal(null); setSelectedProduct(null); }} />
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-[#ebd7fa] relative z-10 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-slate-800 text-lg font-bold mb-2 flex items-center gap-2">
              <AlertTriangle className="text-red-500" size={20} />
              <span>Confirm Deletion</span>
            </h3>

            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              Are you sure you want to delete product <strong className="text-slate-700">{selectedProduct.sku}</strong> ({selectedProduct.name})? This action cannot be undone.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => { setActiveModal(null); setSelectedProduct(null); }}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-md"
              >
                Delete Listing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
