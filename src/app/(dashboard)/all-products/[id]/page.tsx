"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import {
  Package,
  ChevronLeft,
  ImageIcon,
  DollarSign,
  Sliders,
  Truck,
  Edit2,
  ShoppingCart,
  CheckCircle,
  Eye,
  EyeOff
} from "lucide-react";

import { cn } from "@/lib/utils";
import { MOCK_PRODUCTS } from "@/lib/mock-products";
import type { Product } from "@/lib/mock-products";

const TAG_COLORS = [
  "bg-[#faf6ff] text-[#7a3dbf] border-[#ebd7fa]",
  "bg-[#e6fafa] text-[#2a9d96] border-[#b2e8e6]",
  "bg-[#f3eafb] text-[#7a3dbf] border-[#ebd7fa]",
  "bg-[#e0f7f6] text-[#2a9d96] border-[#b2e8e6]",
  "bg-[#ede8fb] text-[#7a3dbf] border-[#ebd7fa]",
  "bg-[#d6f5f3] text-[#2a9d96] border-[#b2e8e6]",
];

export default function ViewProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [activeSection, setActiveSection] = useState("basic-info");
  const [isPreviewCollapsed, setIsPreviewCollapsed] = useState(false);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [selectedVariantImage] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const found = MOCK_PRODUCTS.find((p) => p.id === id);
      setProduct(found || null);
    }
  }, [id]);

  useEffect(() => {
    const sections = ["basic-info", "media", "pricing", "variants", "shipping"];
    const observers = sections.map((secId) => {
      const el = document.getElementById(secId);
      if (!el) return null;
      const observer = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(secId); },
        { threshold: 0.3 }
      );
      observer.observe(el);
      return { observer, el };
    });
    return () => {
      observers.forEach((obs) => { if (obs) obs.observer.unobserve(obs.el); });
    };
  }, [product]);

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Package size={48} className="text-slate-300" />
        <h2 className="text-xl font-bold text-slate-700">Product Not Found</h2>
        <button onClick={() => router.push("/all-products")} className="px-5 py-2 bg-[#7a3dbf] text-white rounded-xl font-bold">
          Back to Catalog
        </button>
      </div>
    );
  }

  const profitMargin = product.basePrice > 0 ? ((product.basePrice - product.costPrice) / product.basePrice) * 100 : 0;

  const SECTIONS = [
    { id: "basic-info", label: "Basic Info", icon: Package, keyIdx: 0 },
    { id: "media", label: "Product Media", icon: ImageIcon, keyIdx: 1 },
    { id: "pricing", label: "Pricing & Stock", icon: DollarSign, keyIdx: 2 },
    { id: "variants", label: "Variants", icon: Sliders, keyIdx: 3 },
    { id: "shipping", label: "Shipping", icon: Truck, keyIdx: 4 },
  ];

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto font-sans relative pb-24 select-none">
      
      {/* ── Sticky Top Action Bar ── */}
      <div className="sticky top-0 z-40 bg-white border border-[#ebd7fa] rounded-2xl px-5 py-3.5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="absolute left-0 top-3 bottom-3 w-1 rounded-full bg-[#7a3dbf]" />
        <div className="flex items-center gap-4 pl-3">
          <button
            onClick={() => router.push("/all-products")}
            className="p-2 border border-[#ebd7fa] hover:border-[#7a3dbf] rounded-xl hover:text-[#7a3dbf] transition-all bg-white shadow-sm"
          >
            <ChevronLeft size={16} />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-slate-900 text-base font-black tracking-tight">{product.sku} Details</h2>
              <span className={cn(
                "text-[9px] font-bold px-2.5 py-1 rounded-full border",
                product.status === "Active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                product.status === "Low Stock" ? "bg-amber-50 text-amber-700 border-amber-200" :
                "bg-slate-50 text-slate-500 border-slate-200"
              )}>
                {product.status}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Read-only view mode</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button onClick={() => setIsPreviewCollapsed(!isPreviewCollapsed)}
            className="border border-[#ebd7fa] hover:border-[#7a3dbf] text-slate-700 hover:text-[#7a3dbf] font-semibold text-xs px-4 py-2.5 rounded-xl transition-all bg-white shadow-sm flex items-center gap-1.5">
            {isPreviewCollapsed ? <Eye size={13} /> : <EyeOff size={13} />}
            Preview
          </button>
          <button onClick={() => router.push(`/products/${product.id}/add-new-product`)}
            className="bg-[#7a3dbf] hover:bg-[#682fad] text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5">
            <Edit2 size={13} />
            Edit Product
          </button>
        </div>
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-5 items-start">
        
        {/* ── Left Sidebar ── */}
        <aside className="lg:col-span-2 sticky top-24 hidden lg:flex flex-col gap-5">
          <div className="bg-white border border-[#ebd7fa] rounded-3xl p-5 shadow-sm space-y-5">
            <nav className="space-y-1">
              {SECTIONS.map(({ id: secId, label, icon: Icon }) => {
                const isActive = activeSection === secId;
                return (
                  <a
                    key={secId}
                    href={`#${secId}`}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById(secId)?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative overflow-hidden group",
                      isActive
                        ? "bg-[#faf6ff] text-[#7a3dbf]"
                        : "text-slate-500 hover:bg-slate-50"
                    )}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-[#7a3dbf]" />
                    )}
                    <div className={cn(
                      "h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 border-2 transition-all",
                      isActive
                        ? "bg-[#7a3dbf] border-[#7a3dbf] text-white"
                        : "bg-white border-slate-200 text-slate-400"
                    )}>
                      <Icon size={11} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={cn("text-xs font-bold block truncate", isActive ? "text-[#7a3dbf]" : "text-slate-600 group-hover:text-slate-800")}>
                        {label}
                      </span>
                    </div>
                  </a>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* ── Center Content ── */}
        <div className={cn("space-y-5 transition-all duration-300", isPreviewCollapsed ? "lg:col-span-8" : "lg:col-span-5")}>
          
          {/* ── Section 1: Basic Info ── */}
          <section id="basic-info" className="bg-white rounded-3xl shadow-sm border border-[#ebd7fa] overflow-hidden">
            <div className="border-l-4 border-[#7a3dbf] px-6 py-5 flex items-center gap-3 bg-[#faf6ff]">
              <div className="h-10 w-10 rounded-2xl bg-[#7a3dbf] flex items-center justify-center shadow-sm">
                <Package size={18} className="text-white" />
              </div>
              <div>
                <h3 className="text-slate-900 text-sm font-black tracking-tight">Basic Product Information</h3>
                <p className="text-[10px] text-slate-400 font-medium">Name, category, brand & description</p>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div className="md:col-span-2 space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Product Name / Title</span>
                  <p className="text-base font-bold text-slate-800">{product.name}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Category</span>
                  <p className="text-sm font-semibold text-slate-700">{product.categoryPath.join(" › ")}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Brand</span>
                  <p className="text-sm font-semibold text-slate-700">{product.brand || "N/A"}</p>
                </div>
                <div className="md:col-span-2 space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Condition</span>
                  <span className="inline-block px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700">{product.condition}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Product Description</span>
                <div className="bg-[#faf6ff]/50 border border-[#ebd7fa] rounded-xl p-4 text-sm text-slate-700 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: product.description }} />
              </div>

              {product.tags && product.tags.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Tags / Keywords</span>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, i) => (
                      <span key={tag} className={cn("text-[11px] font-bold px-3 py-1 rounded-full border", TAG_COLORS[i % TAG_COLORS.length])}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ── Section 2: Media ── */}
          <section id="media" className="bg-white rounded-3xl shadow-sm border border-[#ebd7fa] overflow-hidden">
            <div className="border-l-4 border-[#5FD0C8] px-6 py-5 flex items-center gap-3 bg-[#faf6ff]">
              <div className="h-10 w-10 rounded-2xl bg-[#5FD0C8] flex items-center justify-center shadow-sm">
                <ImageIcon size={18} className="text-white" />
              </div>
              <div>
                <h3 className="text-slate-900 text-sm font-black tracking-tight">Product Media</h3>
                <p className="text-[10px] text-slate-400 font-medium">Gallery images</p>
              </div>
            </div>
            <div className="p-6">
              {product.images && product.images.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {product.images.map((img, idx) => (
                    <div key={img.id} className={cn("relative aspect-square rounded-2xl border-2 overflow-hidden bg-slate-50", idx === 0 ? "border-amber-400 ring-2 ring-amber-300/50 ring-offset-1" : "border-slate-100")}>
                      <Image src={img.url} alt={img.name} fill className="object-cover" sizes="150px" />
                      {idx === 0 && <div className="absolute top-2 left-2 h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-black shadow-sm bg-amber-400 text-white">★</div>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center border-2 border-dashed border-[#ebd7fa] rounded-3xl bg-[#faf6ff]/30 text-slate-400 text-sm font-semibold">
                  No media uploaded.
                </div>
              )}
            </div>
          </section>

          {/* ── Section 3: Pricing & Stock ── */}
          <section id="pricing" className="bg-white rounded-3xl shadow-sm border border-[#ebd7fa] overflow-hidden">
            <div className="border-l-4 border-[#5FD0C8] px-6 py-5 flex items-center gap-3 bg-[#faf6ff]">
              <div className="h-10 w-10 rounded-2xl bg-[#5FD0C8] flex items-center justify-center shadow-sm">
                <DollarSign size={18} className="text-white" />
              </div>
              <div>
                <h3 className="text-slate-900 text-sm font-black tracking-tight">Pricing & Inventory</h3>
                <p className="text-[10px] text-slate-400 font-medium">Set prices, stock levels & margins</p>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1 p-4 bg-[#faf6ff] border border-[#ebd7fa] rounded-2xl">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Base Price</span>
                  <p className="text-lg font-black text-[#7a3dbf]">₦{product.basePrice.toLocaleString()}</p>
                </div>
                <div className="space-y-1 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Cost Price</span>
                  <p className="text-lg font-bold text-slate-700">₦{product.costPrice.toLocaleString()}</p>
                </div>
                <div className="space-y-1 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Compare at (MSRP)</span>
                  <p className="text-lg font-bold text-slate-400 line-through">₦{product.comparePrice.toLocaleString()}</p>
                </div>
              </div>

              <div className="p-4 bg-white border border-[#ebd7fa] rounded-2xl shadow-inner flex items-center gap-6">
                <div className="flex-1">
                  <span className="text-xs font-bold text-slate-500">Projected Margin</span>
                  <div className="h-2.5 rounded-full overflow-hidden bg-[#ebd7fa] mt-2">
                    <div className={cn("h-full rounded-full transition-all duration-500", profitMargin >= 30 ? "bg-[#5FD0C8]" : profitMargin > 0 ? "bg-[#7a3dbf]" : "bg-red-400")} style={{ width: `${Math.min(profitMargin, 100)}%` }} />
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn("text-xl font-black", profitMargin >= 30 ? "text-[#5FD0C8]" : profitMargin > 0 ? "text-[#7a3dbf]" : "text-red-500")}>
                    {profitMargin.toFixed(1)}%
                  </p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Margin</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Base Stock Quantity</span>
                  <p className="text-base font-bold text-slate-800">{product.stock} units</p>
                </div>
              </div>
            </div>
          </section>

          {/* ── Section 4: Variants ── */}
          <section id="variants" className="bg-white rounded-3xl shadow-sm border border-[#ebd7fa] overflow-hidden">
            <div className="border-l-4 border-[#7a3dbf] px-6 py-5 flex items-center gap-3 bg-[#faf6ff]">
              <div className="h-10 w-10 rounded-2xl bg-[#7a3dbf] flex items-center justify-center shadow-sm">
                <Sliders size={18} className="text-white" />
              </div>
              <div>
                <h3 className="text-slate-900 text-sm font-black tracking-tight">Attributes & Variants</h3>
                <p className="text-[10px] text-slate-400 font-medium">Colors, sizes & SKU matrix</p>
              </div>
            </div>
            <div className="p-6">
              {!product.hasVariants || !product.variants || product.variants.length === 0 ? (
                <div className="p-8 text-center border border-[#ebd7fa] rounded-3xl bg-[#faf6ff]/30 text-slate-400 text-sm font-semibold">
                  This product has no variations.
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex gap-2 flex-wrap">
                    {product.variantTypes.map((type) => (
                      <div key={type.name} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm">
                        <span className="font-bold text-slate-700 block mb-1">{type.name}</span>
                        <span className="text-slate-500 font-medium">{type.values.join(", ")}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="overflow-x-auto rounded-2xl border border-[#ebd7fa] shadow-inner">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                      <thead>
                        <tr className="bg-[#faf6ff] text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-[#ebd7fa]">
                          <th className="py-3 px-4">Variant Options</th>
                          <th className="py-3 px-4">SKU</th>
                          <th className="py-3 px-4">Price (₦)</th>
                          <th className="py-3 px-4">Stock</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#ebd7fa]/50 text-sm font-semibold text-slate-700">
                        {product.variants.map((v, i) => (
                          <tr key={i} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-4 text-[#7a3dbf]">{Object.values(v.options).join(" / ")}</td>
                            <td className="py-3 px-4 font-bold text-slate-600">{v.sku}</td>
                            <td className="py-3 px-4 font-black">₦{v.price.toLocaleString()}</td>
                            <td className="py-3 px-4">{v.stock}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ── Section 5: Shipping ── */}
          <section id="shipping" className="bg-white rounded-3xl shadow-sm border border-[#ebd7fa] overflow-hidden">
            <div className="border-l-4 border-[#5FD0C8] px-6 py-5 flex items-center gap-3 bg-[#faf6ff]">
              <div className="h-10 w-10 rounded-2xl bg-[#5FD0C8] flex items-center justify-center shadow-sm">
                <Truck size={18} className="text-white" />
              </div>
              <div>
                <h3 className="text-slate-900 text-sm font-black tracking-tight">Shipping & Logistics</h3>
                <p className="text-[10px] text-slate-400 font-medium">Weight, dimensions & handling</p>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Weight (kg)</span>
                  <p className="text-base font-bold text-slate-800">{product.weight}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Length (cm)</span>
                  <p className="text-base font-bold text-slate-800">{product.length}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Width (cm)</span>
                  <p className="text-base font-bold text-slate-800">{product.width}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Height (cm)</span>
                  <p className="text-base font-bold text-slate-800">{product.height}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600">Shipping Class</span>
                  <span className="px-2.5 py-1 bg-[#f3eafb] text-[#7a3dbf] font-bold text-[10px] rounded-full">{product.shippingClass}</span>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600">Special Handling</span>
                  {product.specialHandling ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-600"><CheckCircle size={14} /> Required</span>
                  ) : (
                    <span className="text-xs font-bold text-slate-400">None</span>
                  )}
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* ── Right Sidebar (Preview) ── */}
        {!isPreviewCollapsed && (
          <aside className="lg:col-span-3 sticky top-24 bg-white border border-[#ebd7fa] rounded-3xl p-5 shadow-lg shadow-purple-100/30 space-y-4">
            <div className="flex items-center justify-between border-b border-[#ebd7fa]/60 pb-3">
              <div className="flex items-center gap-1.5">
                <div className="h-6 w-6 rounded-lg bg-[#7a3dbf] flex items-center justify-center">
                  <Eye size={12} className="text-white" />
                </div>
                <span className="text-xs font-black text-slate-800">Live Preview</span>
              </div>
              <div className="flex items-center gap-1 bg-[#faf6ff] border border-[#ebd7fa] p-1 rounded-lg">
                <button type="button" onClick={() => setPreviewMode("desktop")} className={cn("p-1 rounded-md transition-all", previewMode === "desktop" ? "bg-white shadow-sm text-[#7a3dbf]" : "text-slate-400")}>
                  <CheckCircle size={12} className="opacity-0 w-0 h-0" /> <span className="text-[10px] font-bold px-1">Desktop</span>
                </button>
                <button type="button" onClick={() => setPreviewMode("mobile")} className={cn("p-1 rounded-md transition-all", previewMode === "mobile" ? "bg-white shadow-sm text-[#7a3dbf]" : "text-slate-400")}>
                  <CheckCircle size={12} className="opacity-0 w-0 h-0" /> <span className="text-[10px] font-bold px-1">Mobile</span>
                </button>
              </div>
            </div>

            <div className={cn("border border-[#ebd7fa] rounded-2xl bg-[#faf6ff]/20 overflow-hidden shadow-sm mx-auto transition-all", previewMode === "mobile" ? "max-w-[280px]" : "w-full")}>
              <div className="aspect-square bg-white relative">
                {product.image ? (
                  <Image src={selectedVariantImage || product.image} alt="Preview" fill className="object-contain p-4" sizes="(max-width: 768px) 100vw, 300px" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-300"><ImageIcon size={40} /></div>
                )}
                {product.stock <= 5 && product.stock > 0 && <span className="absolute top-2 right-2 bg-amber-500 text-white text-[8px] font-black px-2 py-0.5 rounded-md">LOW STOCK</span>}
              </div>
              
              <div className="p-3 space-y-2.5">
                <div>
                  <p className="text-[9px] font-bold text-[#7a3dbf] uppercase tracking-wider mb-0.5">{product.brand}</p>
                  <h4 className="text-xs font-bold text-slate-800 leading-tight line-clamp-2">{product.name || "Untitled Product"}</h4>
                </div>
                <div className="flex items-end gap-1.5">
                  <span className="text-base font-black text-slate-900">₦{product.basePrice.toLocaleString()}</span>
                  {product.comparePrice > product.basePrice && <span className="text-[9px] font-bold text-slate-400 line-through mb-1">₦{product.comparePrice.toLocaleString()}</span>}
                </div>
                {product.hasVariants && product.variantTypes.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {product.variantTypes[0].values.slice(0, 3).map(v => (
                      <span key={v} className="text-[8px] font-bold px-1.5 py-0.5 rounded border border-[#ebd7fa] text-slate-600 bg-white">{v}</span>
                    ))}
                    {product.variantTypes[0].values.length > 3 && <span className="text-[8px] font-bold px-1.5 py-0.5 text-slate-400">+{product.variantTypes[0].values.length - 3}</span>}
                  </div>
                )}
                <div className="bg-[#faf6ff] border border-[#ebd7fa] rounded-lg p-2 text-[8px] font-semibold text-slate-500">
                  ⚡ {product.shippingClass} · Fragile: {product.specialHandling ? "Yes" : "No"}
                </div>
                <button type="button" className="w-full bg-[#7a3dbf] text-white text-[9px] font-black py-2 rounded-xl shadow-sm flex items-center justify-center gap-1 pointer-events-none">
                  <ShoppingCart size={10} />
                  Add to Cart
                </button>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
