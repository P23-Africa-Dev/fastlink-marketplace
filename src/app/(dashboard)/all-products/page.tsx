"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Plus,
  Search,
  Edit2,
  Eye,
  Trash2,
  Download,
  AlertCircle,
  PackageX,
  BadgeCheck,
  Boxes,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { apiErrorCode, apiErrorMessage } from "@/lib/api";
import { StatCard } from "@/components/dashboard/stat-card";
import { Pagination } from "@/components/dashboard/pagination";
import { toDashboardProduct } from "@/lib/product-map";
import {
  useCreateSellerProduct,
  useDeleteSellerProduct,
  useSellerProducts,
  useSubmitSellerProduct,
  useUpdateSellerProduct,
} from "@/hooks/use-seller-products";
import { useSellerStore } from "@/hooks/use-dashboard";
import type { Product as ApiProduct } from "@/types/product";
import type { DashboardProduct } from "@/types/seller-dashboard-product";
import Link from "next/link";

export default function AllProductsPage() {
  const router = useRouter();
  const { data: sellerPage } = useSellerProducts();
  const { data: storeRes } = useSellerStore();
  const canSell = Boolean(storeRes?.data?.canSell);
  const [kycBlocked, setKycBlocked] = useState(false);
  const createProduct = useCreateSellerProduct();
  const updateProduct = useUpdateSellerProduct();
  const deleteProduct = useDeleteSellerProduct();
  const submitProduct = useSubmitSellerProduct();
  const apiProducts = sellerPage?.data ?? [];
  const catalogStatusById = Object.fromEntries(apiProducts.map((p: ApiProduct) => [p.id, p.status ?? "draft"]));
  const products = apiProducts.map(toDashboardProduct);

  // Search & Filter state
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"name" | "sku" | "price" | "stock" | "none">("none");

  // Dialogs States
  const [activeModal, setActiveModal] = useState<"add" | "edit" | "delete" | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<DashboardProduct | null>(null);

  // Add Product Form State
  const [newProduct, setNewProduct] = useState<Omit<DashboardProduct, "id">>({
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
    status: "Draft",
  });

  // Edit Product Form State
  const [editProduct, setEditProduct] = useState<DashboardProduct | null>(null);

  // Toast notifications state
  const [toast, setToast] = useState("");

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  // Filter products based on search inputs
  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        categoryFilter === "" || p.category.toLowerCase().includes(categoryFilter.toLowerCase());

      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Active" && p.stock > 5) ||
        (statusFilter === "Low Stock" && p.stock > 0 && p.stock <= 5) ||
        (statusFilter === "Out of Stock" && p.stock === 0);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, search, categoryFilter, statusFilter]);

  // Sort logic if chosen
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "sku") return a.sku.localeCompare(b.sku);
      if (sortBy === "price") return b.price - a.price;
      if (sortBy === "stock") return b.stock - a.stock;
      return 0;
    });
  }, [filtered, sortBy]);

  // Pagination State & Logic
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter, statusFilter, sortBy, pageSize]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, currentPage, pageSize]);

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
  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.sku.trim() || !newProduct.name.trim() || !newProduct.category.trim()) {
      triggerToast("Please fill all required fields.");
      return;
    }

    try {
      const wantsActive = newProduct.status !== "Draft";
      if (wantsActive && !canSell) {
        setKycBlocked(true);
        return;
      }
      await createProduct.mutateAsync({
        name: newProduct.name,
        sku: newProduct.sku,
        description: newProduct.description,
        price: Number(newProduct.price),
        compare_at_price: Number(newProduct.comparePrice) || null,
        cost_price: Number(newProduct.costPrice) || null,
        stock: Number(newProduct.stock),
        category: newProduct.category,
        brand: newProduct.brand || undefined,
        tags: newProduct.tags,
        status: wantsActive ? "active" : "draft",
        image_urls: newProduct.image
          ? [newProduct.image, ...newProduct.images.map((img) => img.url)]
          : newProduct.images.map((img) => img.url),
      });
    } catch (error) {
      if (apiErrorCode(error) === "KYC_REQUIRED") {
        setKycBlocked(true);
        return;
      }
      triggerToast(apiErrorMessage(error, "Could not create product."));
      return;
    }
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
      status: "Draft",
    });
    triggerToast("Product added to catalog successfully!");
  };

  // Edit Product Handler
  const handleEditProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProduct) return;
    if (!editProduct.name.trim() || !editProduct.category.trim()) {
      triggerToast("Please fill all required fields.");
      return;
    }

    try {
      const wantsActive = editProduct.status !== "Draft";
      if (wantsActive && !canSell) {
        setKycBlocked(true);
        return;
      }
      await updateProduct.mutateAsync({
        id: editProduct.id,
        payload: {
          name: editProduct.name,
          description: editProduct.description,
          price: Number(editProduct.price),
          compare_at_price: Number(editProduct.comparePrice) || null,
          cost_price: Number(editProduct.costPrice) || null,
          stock: Number(editProduct.stock),
          category: editProduct.category,
          brand: editProduct.brand || undefined,
          tags: editProduct.tags,
          status: wantsActive ? "active" : "draft",
        },
      });
    } catch (error) {
      if (apiErrorCode(error) === "KYC_REQUIRED") {
        setKycBlocked(true);
        return;
      }
      triggerToast(apiErrorMessage(error, "Could not update product."));
      return;
    }
    setActiveModal(null);
    setEditProduct(null);
    triggerToast("Product details updated successfully!");
  };

  // Delete Product Handler
  const handleDeleteConfirm = async () => {
    if (!selectedProduct) return;
    try {
      await deleteProduct.mutateAsync(selectedProduct.id);
    } catch (error) {
      triggerToast(apiErrorMessage(error, "Could not delete product."));
      return;
    }
    setSelectedIds((prev) => prev.filter((id) => id !== selectedProduct.id));
    setActiveModal(null);
    setSelectedProduct(null);
    triggerToast("Product archived successfully.");
  };

  // Metrics Calculation
  const totalSKUs = products.length;
  const activeListings = products.filter((p) => p.stock > 0 && p.status !== "Draft").length;
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto font-sans relative pb-12">
      {/* Toast Alert Popup */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-[#7a3dbf] text-white font-semibold text-xs px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 size={18} className="text-purple-200" />
          <span>{toast}</span>
        </div>
      )}

      {kycBlocked && (
        <div className="fixed inset-0 z-[70] bg-black/40 flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-3xl bg-white border border-[#ebd7fa] p-6 space-y-4 shadow-xl">
            <p className="text-lg font-extrabold text-[#3B1C5A]">KYC verification required</p>
            <p className="text-sm text-[#8A79A5]">
              Complete your business verification before you can publish products on the marketplace.
            </p>
            <div className="flex flex-wrap gap-2 justify-end">
              <button
                type="button"
                onClick={() => setKycBlocked(false)}
                className="rounded-xl border border-[#ebd7fa] px-4 py-2 text-xs font-bold text-[#6D349F]"
              >
                Close
              </button>
              <Link
                href="/vendor/register"
                className="rounded-xl bg-[#7a3dbf] px-4 py-2 text-xs font-bold text-white"
              >
                Complete KYC
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Telemetry Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
        <StatCard
          title="Total SKUs"
          value={totalSKUs.toLocaleString()}
          icon={<Boxes size={18} />}
          badgeText="+15%"
          badgeType="success"
          variant="purple"
        />

        <StatCard
          title="Active Listings"
          value={activeListings.toLocaleString()}
          icon={<BadgeCheck size={18} />}
          badgeText="+10%"
          badgeType="success"
          variant="emerald"
        />

        <StatCard
          title="Low Stock Items"
          value={lowStockCount}
          icon={<AlertCircle size={18} />}
          badgeText="Low Stock"
          badgeType="warning"
          variant="amber"
        />

        <StatCard
          title="Out of Stock"
          value={outOfStockCount}
          icon={<PackageX size={18} />}
          badgeText="Action Required"
          badgeType="danger"
          variant="rose"
        />
      </div>

      {/* Main Inventory Records Card */}
      <div className="bg-white rounded-[2.2rem] p-6 shadow-sm border border-[#ebd7fa] space-y-6">
        
        {/* Top Header Row with Add Product Button (Aligned to the Right) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h2 className="text-[#7a3dbf] text-xl font-semibold tracking-tight">Inventory Listings</h2>
            <p className="text-slate-400 text-xs font-normal mt-0.5">Filter, search, and manage product inventory</p>
          </div>

          <button
            onClick={() => router.push("/products/new/add-new-product")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#7a3dbf] hover:bg-[#682fad] text-white text-xs font-semibold shadow-md shadow-purple-600/20 transition-all active:scale-95 shrink-0 self-start sm:self-auto"
          >
            <Plus size={16} />
            <span>Add Product</span>
          </button>
        </div>

        {/* Filter Controls Row (Search Inputs on top of component) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex flex-wrap items-center gap-3 w-full">
            {/* Search Input */}
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search SKU or product name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-full pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/40 transition-all"
              />
            </div>

            {/* Category Filter Dropdown */}
            <div className="relative flex-1 md:w-52 bg-[#faf6ff] border border-[#ebd7fa] rounded-full px-4 py-2 text-xs sm:text-sm text-slate-700 shadow-sm flex items-center justify-between">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full bg-transparent focus:outline-none pr-6 cursor-pointer font-semibold text-slate-700 appearance-none text-xs md:text-sm"
              >
                <option value="">All Categories</option>
                {Array.from(new Set(products.map((p) => p.category).filter(Boolean))).sort().map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 pointer-events-none text-slate-400 text-xs">▼</div>
            </div>
          </div>
        </div>

        {/* Status Filter Tabs & Export Controls Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs font-semibold">
            {["All", "Active", "Low Stock", "Out of Stock"].map((status) => {
              const isActive = statusFilter === status;
              return (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={cn(
                    "px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 shrink-0 border whitespace-nowrap",
                    isActive
                      ? "bg-[#7a3dbf] text-white border-[#7a3dbf] shadow-sm"
                      : "bg-[#faf6ff] text-slate-600 border-[#ebd7fa] hover:bg-[#f3eafb]"
                  )}
                >
                  <span>{status === "All" ? "All Status" : status}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Sort Sorter */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "name" | "sku" | "price" | "stock" | "none")}
              className="bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="none">Sort: Default</option>
              <option value="name">Sort: Name</option>
              <option value="sku">Sort: SKU</option>
              <option value="price">Sort: Price</option>
              <option value="stock">Sort: Stock</option>
            </select>

            {/* Export CSV Button */}
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#faf6ff] hover:bg-[#f3eafb] text-[#7a3dbf] border border-[#ebd7fa] text-xs font-semibold transition-all active:scale-95 whitespace-nowrap"
            >
              <Download size={15} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Products Table */}
        <div className="overflow-x-auto select-none rounded-2xl border border-slate-100">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-[#faf6ff] border-b border-[#ebd7fa] text-[11px] font-semibold uppercase tracking-wider text-[#7a3dbf]">
                <th className="py-3.5 px-4 w-10 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={filtered.length > 0 && selectedIds.length === filtered.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-[#ebd7fa] h-4 w-4 text-[#7a3dbf] focus:ring-[#7a3dbf] cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-4 whitespace-nowrap">Product</th>
                <th className="py-3.5 px-4 whitespace-nowrap">SKU</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Product Name</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Category</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Stock Level</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Base Price</th>
                <th className="py-3.5 px-4 whitespace-nowrap text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-normal text-slate-700">
              {paginatedProducts.length > 0 ? (
                paginatedProducts.map((p) => {
                  const isChecked = selectedIds.includes(p.id);
                  return (
                    <tr
                      key={p.id}
                      className={cn(
                        "hover:bg-[#faf6ff]/50 transition-colors duration-150",
                        isChecked && "bg-[#faf6ff]"
                      )}
                    >
                      {/* Checkbox */}
                      <td className="py-4 px-4 whitespace-nowrap w-10">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => handleSelectRow(p.id, e.target.checked)}
                          className="rounded border-[#ebd7fa] h-4 w-4 text-[#7a3dbf] focus:ring-[#7a3dbf] cursor-pointer"
                        />
                      </td>

                      {/* Product Image */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="relative h-11 w-11 rounded-xl bg-white border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center shadow-sm">
                          <Image
                            src={p.image}
                            alt={p.name}
                            fill
                            className="object-cover"
                            sizes="44px"
                          />
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="py-4 px-4 whitespace-nowrap text-slate-500 font-normal text-xs">{p.sku}</td>

                      {/* Name */}
                      <td className="py-4 px-4 whitespace-nowrap text-slate-800 font-semibold text-xs sm:text-sm max-w-[280px] truncate">
                        {p.name}
                      </td>

                      {/* Category Badge */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="bg-[#faf6ff] text-[#7a3dbf] text-xs font-semibold px-3 py-1 rounded-full border border-[#ebd7fa]">
                          {p.category}
                        </span>
                      </td>

                      {/* Stock Level Badge */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={cn(
                            "px-2.5 py-0.5 rounded-full text-xs font-semibold border inline-block",
                            p.stock === 0
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : p.stock <= 5
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          )}
                        >
                          {p.stock === 0 ? "0 (Out of stock)" : `${p.stock} units`}
                        </span>
                      </td>

                      {/* Currency Formatted Price */}
                      <td className="py-4 px-4 whitespace-nowrap font-semibold text-slate-800">
                        ₦{p.price.toLocaleString()}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => router.push(`/all-products/${p.id}`)}
                            title="View product spec details"
                            className="p-1.5 rounded-xl bg-slate-100 hover:bg-purple-50 text-slate-600 hover:text-[#7a3dbf] transition-all text-xs font-semibold"
                          >
                            <Eye size={14} />
                          </button>

                          <button
                            onClick={() => router.push(`/products/${p.id}/add-new-product`)}
                            title="Edit product parameters"
                            className="p-1.5 rounded-xl bg-[#faf6ff] hover:bg-[#f3eafb] text-[#7a3dbf] border border-[#ebd7fa] transition-all text-xs font-semibold"
                          >
                            <Edit2 size={13} />
                          </button>

                          {(catalogStatusById[p.id] === "draft" || catalogStatusById[p.id] === "rejected") && (
                            <button
                              onClick={async () => {
                                if (!canSell) {
                                  setKycBlocked(true);
                                  return;
                                }
                                try {
                                  await submitProduct.mutateAsync(p.id);
                                  triggerToast("Submitted for admin review.");
                                } catch (err) {
                                  if (apiErrorCode(err) === "KYC_REQUIRED") {
                                    setKycBlocked(true);
                                    return;
                                  }
                                  triggerToast(apiErrorMessage(err, "Could not submit for review."));
                                }
                              }}
                              title="Submit for review"
                              disabled={submitProduct.isPending}
                              className="px-2 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-all text-[10px] font-bold uppercase"
                            >
                              Submit
                            </button>
                          )}

                          {["submitted", "under_review"].includes(catalogStatusById[p.id] ?? "") && (
                            <span className="px-2 py-1 rounded-xl bg-slate-100 text-slate-600 text-[10px] font-bold uppercase">
                              In review
                            </span>
                          )}

                          <button
                            onClick={() => {
                              setSelectedProduct(p);
                              setActiveModal("delete");
                            }}
                            title="Delete this listing"
                            className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-all text-xs font-semibold"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400 font-normal whitespace-nowrap">
                    No products found matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={sorted.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[10, 25, 50]}
          itemName="products"
        />
      </div>

      {/* --- ADD PRODUCT MODAL DIALOG --- */}
      {activeModal === "add" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setActiveModal(null)} />
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-[#ebd7fa] relative z-10 animate-in fade-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-slate-800 text-base font-semibold flex items-center gap-2">
                <Boxes className="text-[#7a3dbf]" size={18} />
                <span>Add New Product Listing</span>
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddProductSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  SKU Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FL-SKU-0009"
                  value={newProduct.sku}
                  onChange={(e) => setNewProduct((prev) => ({ ...prev, sku: e.target.value }))}
                  className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-4 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/40"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apple iPad Pro, M4 Chip"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-4 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Electronics"
                    value={newProduct.category}
                    onChange={(e) => setNewProduct((prev) => ({ ...prev, category: e.target.value }))}
                    className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-4 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/40"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct((prev) => ({ ...prev, stock: Number(e.target.value) }))}
                    className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-4 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Base Price (₦) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={newProduct.price}
                    onChange={(e) => setNewProduct((prev) => ({ ...prev, price: Number(e.target.value) }))}
                    className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-4 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/40"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Image URL
                  </label>
                  <input
                    type="text"
                    value={newProduct.image}
                    onChange={(e) => setNewProduct((prev) => ({ ...prev, image: e.target.value }))}
                    className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-4 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/40"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#7a3dbf] hover:bg-[#682fad] text-white text-xs font-semibold transition-all shadow-md shadow-purple-600/20"
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
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setActiveModal(null); setEditProduct(null); }} />
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-[#ebd7fa] relative z-10 animate-in fade-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-slate-800 text-base font-semibold flex items-center gap-2">
                <Edit2 className="text-[#7a3dbf]" size={18} />
                <span>Modify Listing: {editProduct.sku}</span>
              </h3>
              <button
                onClick={() => { setActiveModal(null); setEditProduct(null); }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditProductSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={editProduct.name}
                  onChange={(e) => setEditProduct((prev) => prev ? { ...prev, name: e.target.value } : null)}
                  className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-4 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    value={editProduct.category}
                    onChange={(e) => setEditProduct((prev) => prev ? { ...prev, category: e.target.value } : null)}
                    className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-4 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/40"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editProduct.stock}
                    onChange={(e) => setEditProduct((prev) => prev ? { ...prev, stock: Number(e.target.value) } : null)}
                    className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-4 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Base Price (₦) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editProduct.price}
                    onChange={(e) => setEditProduct((prev) => prev ? { ...prev, price: Number(e.target.value) } : null)}
                    className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-4 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/40"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Image URL
                  </label>
                  <input
                    type="text"
                    value={editProduct.image}
                    onChange={(e) => setEditProduct((prev) => prev ? { ...prev, image: e.target.value } : null)}
                    className="w-full bg-[#faf6ff] border border-[#ebd7fa] rounded-xl px-4 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/40"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setActiveModal(null); setEditProduct(null); }}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#7a3dbf] hover:bg-[#682fad] text-white text-xs font-semibold transition-all shadow-md shadow-purple-600/20"
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
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setActiveModal(null); setSelectedProduct(null); }} />
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-[#ebd7fa] relative z-10 animate-in fade-in zoom-in-95 duration-200 space-y-4">
            <h3 className="text-slate-800 text-base font-semibold flex items-center gap-2">
              <AlertCircle className="text-rose-500" size={18} />
              <span>Confirm Deletion</span>
            </h3>

            <p className="text-slate-500 text-xs font-normal leading-relaxed">
              Are you sure you want to delete product <strong className="text-slate-800">{selectedProduct.sku}</strong> ({selectedProduct.name})? This action cannot be undone.
            </p>

            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => { setActiveModal(null); setSelectedProduct(null); }}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-all shadow-md shadow-rose-600/20"
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
