"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import {
  Plus,
  Eye,
  Trash2,
  Package,
  ChevronLeft,
  X,
  CheckCircle,
  UploadCloud,
  ChevronDown,
  Info,
  DollarSign,
  Maximize2,
  Sliders,
  Sparkles,
  FolderOpen,
  Image as ImageIcon,
  Check,
  EyeOff,
  Tv,
  Bold,
  Italic,
  List,
  Link2,
  Eraser,
  ArrowRight,
  Truck,
  ShoppingCart,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { apiErrorCode, apiErrorMessage } from "@/lib/api";
import { useCreateSellerProduct } from "@/hooks/use-seller-products";
import { useSellerStore } from "@/hooks/use-dashboard";
import Link from "next/link";

interface VariantType {
  name: string;
  values: string[];
}

interface VariantCombination {
  sku: string;
  price: number;
  stock: number;
  image: string;
  options: { [key: string]: string };
}

interface ImageFile {
  id: string;
  url: string;
  name: string;
  size: string;
}

const TAG_COLORS = [
  "bg-[#faf6ff] text-[#7a3dbf] border-[#ebd7fa]",
  "bg-[#e6fafa] text-[#2a9d96] border-[#b2e8e6]",
  "bg-[#f3eafb] text-[#7a3dbf] border-[#ebd7fa]",
  "bg-[#e0f7f6] text-[#2a9d96] border-[#b2e8e6]",
  "bg-[#ede8fb] text-[#7a3dbf] border-[#ebd7fa]",
  "bg-[#d6f5f3] text-[#2a9d96] border-[#b2e8e6]",
];

export default function AddNewProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const createProduct = useCreateSellerProduct();
  const { data: storeRes } = useSellerStore();
  const canSell = Boolean(storeRes?.data?.canSell);
  const [kycBlocked, setKycBlocked] = useState(false);

  const [activeSection, setActiveSection] = useState("basic-info");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("saved");
  const [isPreviewCollapsed, setIsPreviewCollapsed] = useState(false);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<string>("");

  const [categoryPath, setCategoryPath] = useState<string[]>([]);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  const [productName, setProductName] = useState("");
  const [brand, setBrand] = useState("");
  const [condition, setCondition] = useState("New");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const [uploadedImages, setUploadedImages] = useState<ImageFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [videoFile, setVideoFile] = useState<{ name: string; size: string } | null>(null);

  const [basePrice, setBasePrice] = useState<number>(0);
  const [comparePrice, setComparePrice] = useState<number>(0);
  const [costPrice, setCostPrice] = useState<number>(0);
  const [baseStock, setBaseStock] = useState<number>(0);
  const [barcode, setBarcode] = useState("");
  const [alertThreshold, setAlertThreshold] = useState<number>(5);
  const [currency, setCurrency] = useState("NGN (₦)");

  const [hasVariants, setHasVariants] = useState(false);
  const [variantTypes, setVariantTypes] = useState<VariantType[]>([]);
  const [newTypeName, setNewTypeName] = useState("");
  const [variantCombinations, setVariantCombinations] = useState<VariantCombination[]>([]);

  const [colorSwatches, setColorSwatches] = useState<{ [colorName: string]: string }>({});

  const [weight, setWeight] = useState<number>(0);
  const [length, setLength] = useState<number>(0);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [shippingClass, setShippingClass] = useState("Standard");
  const [specialHandling, setSpecialHandling] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedDraft = localStorage.getItem(`draft_product_${id}`);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setProductName(parsed.name || "");
        setBrand(parsed.brand || "");
        setCondition(parsed.condition || "New");
        setDescription(parsed.description || "");
        setTags(parsed.tags || []);
        setBasePrice(Number(parsed.basePrice) || 0);
        setComparePrice(Number(parsed.comparePrice) || 0);
        setCostPrice(Number(parsed.costPrice) || 0);
        setBaseStock(Number(parsed.baseStock) || 0);
        setBarcode(parsed.barcode || "");
        setAlertThreshold(Number(parsed.alertThreshold) || 5);
        setCurrency(parsed.currency || "NGN (₦)");
        setWeight(Number(parsed.weight) || 0);
        setLength(Number(parsed.length) || 0);
        setWidth(Number(parsed.width) || 0);
        setHeight(Number(parsed.height) || 0);
        setShippingClass(parsed.shippingClass || "Standard");
        setSpecialHandling(!!parsed.specialHandling);
        setHasVariants(!!parsed.hasVariants);
        setVariantTypes(parsed.variantTypes || []);
        if (parsed.uploadedImages) setUploadedImages(parsed.uploadedImages);
        if (parsed.colorSwatches) setColorSwatches(parsed.colorSwatches);
      } catch (e) {
        console.error("Error loading draft", e);
      }
    }
  }, [id]);

  useEffect(() => {
    if (!productName) return;
    setSaveStatus("saving");
    const timer = setTimeout(() => {
      const draftObj = {
        name: productName, brand, condition, description, tags, basePrice,
        comparePrice, costPrice, baseStock, barcode, alertThreshold, currency,
        weight, length, width, height, shippingClass, specialHandling,
        hasVariants, variantTypes, uploadedImages, colorSwatches
      };
      localStorage.setItem(`draft_product_${id}`, JSON.stringify(draftObj));
      setSaveStatus("saved");
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastSaved(time);
    }, 2000);
    return () => clearTimeout(timer);
  }, [
    productName, brand, condition, description, tags, basePrice, comparePrice,
    costPrice, baseStock, barcode, alertThreshold, currency, weight, length,
    width, height, shippingClass, specialHandling, hasVariants, variantTypes,
    uploadedImages, colorSwatches, id
  ]);

  const handleEditorInput = () => {
    if (editorRef.current) setDescription(editorRef.current.innerHTML);
  };

  const formatText = (command: string, value: string = "") => {
    document.execCommand(command, false, value);
    handleEditorInput();
  };

  useEffect(() => {
    if (!hasVariants || variantTypes.length === 0) {
      setVariantCombinations([]);
      return;
    }
    setVariantCombinations((prev) => {
      const generateCartesian = (index: number, current: { [key: string]: string }): VariantCombination[] => {
        if (index === variantTypes.length) {
          const optValues = Object.values(current).join(" / ");
          const existing = prev.find((c) =>
            Object.entries(current).every(([k, v]) => c.options[k] === v)
          );
          return [{
            sku: existing?.sku || `${productName.substring(0, 3).toUpperCase()}-${optValues.replace(/\s+/g, "").toUpperCase()}`,
            price: existing?.price || basePrice,
            stock: existing?.stock || Math.floor(baseStock / 4) || 10,
            image: existing?.image || uploadedImages[0]?.url || "",
            options: { ...current }
          }];
        }
        const type = variantTypes[index];
        let results: VariantCombination[] = [];
        for (const val of type.values) {
          results = [...results, ...generateCartesian(index + 1, { ...current, [type.name]: val })];
        }
        return results;
      };
      return generateCartesian(0, {});
    });
  }, [variantTypes, hasVariants, basePrice, baseStock, productName, uploadedImages]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const filesArray = Array.from(e.dataTransfer.files);
      const newImages: ImageFile[] = filesArray
        .filter((file) => file.type.startsWith("image/"))
        .map((file, i) => ({
          id: `img-new-${Date.now()}-${i}`,
          url: URL.createObjectURL(file),
          name: file.name,
          size: `${Math.round(file.size / 1024)} KB`
        }));
      setUploadedImages((prev) => [...prev, ...newImages]);
      triggerToast(`${newImages.length} images added to gallery.`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const filesArray = Array.from(e.target.files);
      const newImages = filesArray
        .filter((file) => file.type.startsWith("image/"))
        .map((file, i) => ({
          id: `img-file-${Date.now()}-${i}`,
          url: URL.createObjectURL(file),
          name: file.name,
          size: `${Math.round(file.size / 1024)} KB`
        }));
      setUploadedImages((prev) => [...prev, ...newImages]);
      triggerToast(`${newImages.length} images added to gallery.`);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setVideoFile({ name: file.name, size: `${(file.size / (1024 * 1024)).toFixed(1)} MB` });
      triggerToast("Demo video clip linked successfully!");
    }
  };

  const [draggedImgIdx, setDraggedImgIdx] = useState<number | null>(null);

  const handleImageDragStart = (idx: number) => setDraggedImgIdx(idx);

  const handleImageDrop = (targetIdx: number) => {
    if (draggedImgIdx === null) return;
    const reordered = [...uploadedImages];
    const [draggedItem] = reordered.splice(draggedImgIdx, 1);
    reordered.splice(targetIdx, 0, draggedItem);
    setUploadedImages(reordered);
    setDraggedImgIdx(null);
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) setTags((prev) => [...prev, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleAddVariantType = () => {
    if (!newTypeName.trim()) return;
    if (variantTypes.some((t) => t.name.toLowerCase() === newTypeName.toLowerCase())) {
      triggerToast("Variant attribute already exists.");
      return;
    }
    setVariantTypes((prev) => [...prev, { name: newTypeName.trim(), values: [] }]);
    setNewTypeName("");
  };

  const [optionInputs, setOptionInputs] = useState<{ [key: string]: string }>({});

  const handleAddOptionValue = (typeName: string) => {
    const val = optionInputs[typeName]?.trim();
    if (!val) return;
    setVariantTypes((prev) =>
      prev.map((t) => t.name === typeName
        ? { ...t, values: t.values.includes(val) ? t.values : [...t.values, val] }
        : t
      )
    );
    setOptionInputs((prev) => ({ ...prev, [typeName]: "" }));
  };

  const profitMargin = basePrice > 0 ? ((basePrice - costPrice) / basePrice) * 100 : 0;

  const totalRequired = 5;
  const filledFields = [
    productName.trim() !== "",
    uploadedImages.length > 0,
    basePrice > 0,
    hasVariants ? variantCombinations.length > 0 : baseStock > 0,
    categoryPath.length > 0
  ];
  const completionPercentage = Math.round(
    (filledFields.filter(Boolean).length / totalRequired) * 100
  );

  const [toast, setToast] = useState("");
  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleSaveDraft = async () => {
    if (!productName.trim()) {
      triggerToast("Add a product name before saving a draft.");
      return;
    }
    try {
      await createProduct.mutateAsync({
        name: productName,
        description,
        price: basePrice,
        compare_at_price: comparePrice || null,
        cost_price: costPrice || null,
        stock: hasVariants ? variantCombinations.reduce((sum, item) => sum + (item.stock || 0), 0) : baseStock,
        category: categoryPath[0],
        subcategory: categoryPath[1],
        brand: brand || undefined,
        tags,
        status: "draft",
        image_urls: uploadedImages.map((img) => img.url).filter(Boolean),
      });
      triggerToast("Draft saved. You can publish after KYC is approved.");
    } catch (error) {
      triggerToast(apiErrorMessage(error, "Could not save draft."));
    }
  };

  const handlePublish = async () => {
    if (!canSell) {
      setKycBlocked(true);
      return;
    }
    if (completionPercentage < 100) {
      triggerToast("Please fill all required basic fields before publishing!");
      return;
    }
    try {
      await createProduct.mutateAsync({
        name: productName,
        description,
        price: basePrice,
        compare_at_price: comparePrice || null,
        cost_price: costPrice || null,
        stock: hasVariants ? variantCombinations.reduce((sum, item) => sum + (item.stock || 0), 0) : baseStock,
        category: categoryPath[0],
        subcategory: categoryPath[1],
        brand: brand || undefined,
        tags,
        status: "active",
        image_urls: uploadedImages.map((img) => img.url).filter(Boolean),
      });
      triggerToast("Listing published successfully! Redirecting...");
      setTimeout(() => router.push("/all-products"), 1200);
    } catch (error) {
      if (apiErrorCode(error) === "KYC_REQUIRED") {
        setKycBlocked(true);
        return;
      }
      triggerToast(apiErrorMessage(error, "Could not publish listing."));
    }
  };

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
  }, []);

  // SVG circle ring params
  const ringR = 28;
  const ringCircum = 2 * Math.PI * ringR;
  const ringOffset = ringCircum - (completionPercentage / 100) * ringCircum;

  const SECTIONS = [
    { id: "basic-info", label: "Basic Info", icon: Package, keyIdx: 0 },
    { id: "media", label: "Product Media", icon: ImageIcon, keyIdx: 1 },
    { id: "pricing", label: "Pricing & Stock", icon: DollarSign, keyIdx: 2 },
    { id: "variants", label: "Variants", icon: Sliders, keyIdx: 3 },
    { id: "shipping", label: "Shipping", icon: Truck, keyIdx: 4 },
  ];

  const inputCls = "w-full bg-white border border-[#ebd7fa] rounded-xl px-4 py-3 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/30 focus:border-[#7a3dbf] transition-all shadow-sm";

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto font-sans relative pb-24 select-none">

      {/* ── Toast ── */}
      {toast && (
        <div className="fixed top-6 right-6 z-[60] flex items-center gap-3 bg-[#7a3dbf] text-white font-semibold text-sm px-5 py-3.5 rounded-2xl shadow-2xl shadow-purple-500/30 animate-[slideInRight_0.3s_ease-out]"
          style={{ animation: "slideInRight 0.3s ease-out" }}>
          <style>{`@keyframes slideInRight{from{transform:translateX(120%);opacity:0}to{transform:translateX(0);opacity:1}}`}</style>
          <div className="h-7 w-7 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
            <CheckCircle size={14} />
          </div>
          <span>{toast}</span>
        </div>
      )}

      {kycBlocked && (
        <div className="fixed inset-0 z-[70] bg-black/40 flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-3xl bg-white border border-[#ebd7fa] p-6 space-y-4 shadow-xl">
            <p className="text-lg font-extrabold text-[#3B1C5A]">KYC verification required</p>
            <p className="text-sm text-[#8A79A5]">
              Complete your business verification before you can add and publish products on the marketplace.
              You can still save this listing as a draft.
            </p>
            <div className="flex flex-wrap gap-2 justify-end">
              <button
                type="button"
                onClick={() => setKycBlocked(false)}
                className="rounded-xl border border-[#ebd7fa] px-4 py-2 text-xs font-bold text-[#6D349F]"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setKycBlocked(false);
                  void handleSaveDraft();
                }}
                className="rounded-xl border border-[#ebd7fa] px-4 py-2 text-xs font-bold text-[#6D349F]"
              >
                Save draft
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

      {/* ── Sticky Top Action Bar ── */}
      <div className="sticky top-0 z-40 bg-white border border-[#ebd7fa] rounded-2xl px-5 py-3.5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">

        {/* Left border accent */}
        <div className="absolute left-0 top-3 bottom-3 w-1 rounded-full bg-[#7a3dbf]" />

        <div className="flex items-center gap-4 pl-3">
          <button
            onClick={() => router.push("/all-products")}
            className="p-2 border border-[#ebd7fa] hover:border-[#7a3dbf] rounded-xl hover:text-[#7a3dbf] transition-all bg-white shadow-sm"
          >
            <ChevronLeft size={16} />
          </button>

          {/* Completion ring */}
          <div className="relative h-14 w-14 shrink-0">
            <svg viewBox="0 0 72 72" className="h-14 w-14 -rotate-90">
              <circle cx="36" cy="36" r={ringR} fill="none" stroke="#ebd7fa" strokeWidth="5" />
              <circle
                cx="36" cy="36" r={ringR} fill="none"
                stroke="#7a3dbf" strokeWidth="5"
                strokeDasharray={ringCircum}
                strokeDashoffset={ringOffset}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 0.6s ease" }}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold text-[#7a3dbf]">
              {completionPercentage}%
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-slate-900 text-base font-semibold tracking-tight">New Product Listing</h2>
              <span className={cn(
                "text-[9px] font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1",
                saveStatus === "saving" && "bg-amber-50 text-amber-600 border-amber-200",
                saveStatus === "saved" && "bg-emerald-50 text-emerald-700 border-emerald-200",
                saveStatus === "idle" && "bg-slate-50 text-slate-500 border-slate-200"
              )}>
                {saveStatus === "saving" && <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping inline-block" />}
                {saveStatus === "saved" && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />}
                {saveStatus === "saving" ? "Saving…" : saveStatus === "saved" ? "Auto-Saved" : "Modified"}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">
              {lastSaved ? `Last saved at ${lastSaved}` : "Auto-saves as you type"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button onClick={handleSaveDraft}
            className="border border-[#ebd7fa] hover:border-[#7a3dbf] text-slate-700 hover:text-[#7a3dbf] font-semibold text-xs px-4 py-2.5 rounded-xl transition-all bg-white shadow-sm">
            Save Draft
          </button>
          <button onClick={() => setIsPreviewCollapsed(!isPreviewCollapsed)}
            className="border border-[#ebd7fa] hover:border-[#7a3dbf] text-slate-700 hover:text-[#7a3dbf] font-semibold text-xs px-4 py-2.5 rounded-xl transition-all bg-white shadow-sm flex items-center gap-1.5">
            {isPreviewCollapsed ? <Eye size={13} /> : <EyeOff size={13} />}
            Preview
          </button>
          <button onClick={handlePublish}
            className="bg-[#7a3dbf] hover:bg-[#682fad] text-white font-semibold text-xs px-6 py-2.5 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5">
            <Sparkles size={13} />
            Publish Product
          </button>
        </div>
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-5 items-start">

        {/* ── Left Sidebar ── */}
        <aside className="lg:col-span-2 sticky top-24 hidden lg:flex flex-col gap-5">
          <div className="bg-white border border-[#ebd7fa] rounded-3xl p-5 shadow-sm space-y-5">

            {/* Big ring */}
            <div className="flex flex-col items-center gap-2 py-2">
              <div className="relative h-24 w-24">
                <svg viewBox="0 0 72 72" className="h-24 w-24 -rotate-90">
                  <circle cx="36" cy="36" r="28" fill="none" stroke="#f3e8ff" strokeWidth="6" />
                  <circle cx="36" cy="36" r="28" fill="none"
                    stroke="#7a3dbf" strokeWidth="6"
                    strokeDasharray={ringCircum}
                    strokeDashoffset={ringOffset}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 0.6s ease" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-semibold text-[#7a3dbf] leading-none">{completionPercentage}%</span>
                  <span className="text-[9px] font-semibold text-slate-400 leading-none mt-0.5">complete</span>
                </div>
              </div>
              <p className="text-[10px] font-semibold text-slate-400 text-center">
                {filledFields.filter(Boolean).length} of {totalRequired} sections done
              </p>
            </div>

            {/* Nav sections */}
            <nav className="border-t border-[#ebd7fa]/60 pt-4 space-y-1">
              {SECTIONS.map(({ id: secId, label, icon: Icon, keyIdx }, i) => {
                const isActive = activeSection === secId;
                const isCompleted = filledFields[keyIdx];
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
                    {/* Active left bar */}
                    {isActive && (
                      <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-[#7a3dbf]" />
                    )}

                    {/* Number circle */}
                    <div className={cn(
                      "h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0 border-2 transition-all",
                      isCompleted
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : isActive
                          ? "bg-[#7a3dbf] border-[#7a3dbf] text-white"
                          : "bg-white border-slate-200 text-slate-400"
                    )}>
                      {isCompleted ? <Check size={11} /> : i + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <span className={cn("text-xs font-semibold block truncate", isActive ? "text-[#7a3dbf]" : "text-slate-600 group-hover:text-slate-800")}>
                        {label}
                      </span>
                    </div>

                    <Icon size={13} className={cn("shrink-0", isActive ? "text-[#7a3dbf]" : "text-slate-300")} />
                  </a>
                );
              })}
            </nav>

            {/* Tip */}
            <div className="bg-[#faf6ff] border border-[#ebd7fa] rounded-2xl p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-[#7a3dbf] font-semibold text-[10px]">
                <Sparkles size={11} />
                <span>Smart Form</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed">Drafts auto-save. Complete all sections to unlock live checkout previews.</p>
            </div>
          </div>
        </aside>

        {/* ── Center Forms ── */}
        <div className={cn("space-y-5 transition-all duration-300", isPreviewCollapsed ? "lg:col-span-8" : "lg:col-span-5")}>

          {/* ── Section 1: Basic Info ── */}
          <section id="basic-info" className="bg-white rounded-3xl shadow-sm border border-[#ebd7fa] overflow-hidden"
            style={{ boxShadow: "0 2px 16px 0 rgba(122,61,191,0.06), inset 0 1px 0 rgba(255,255,255,0.8)" }}>
            <div className="border-l-4 border-[#7a3dbf] px-6 py-5 flex items-center justify-between bg-[#faf6ff]">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-[#7a3dbf] flex items-center justify-center shadow-sm">
                  <Package size={18} className="text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-slate-900 text-sm font-semibold tracking-tight">Basic Product Information</h3>
                    <span className="text-[9px] bg-[#7a3dbf] text-white px-2 py-0.5 rounded-full font-semibold">01</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">Name, category, brand & description</p>
                </div>
              </div>
              <span className="text-[9px] text-[#7a3dbf] font-semibold uppercase tracking-widest border border-[#7a3dbf]/20 bg-[#7a3dbf]/5 px-2 py-1 rounded-lg">Required</span>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Product Name */}
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block">Product Name / Title *</label>
                  <input type="text" required
                    placeholder="e.g. Apple iPhone 15 Pro, Dual SIM, 256GB - Titanium Blue"
                    value={productName} onChange={(e) => setProductName(e.target.value)}
                    className={inputCls} />
                </div>

                {/* Category */}
                <div className="relative space-y-1.5">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block">Multi-Level Category *</label>
                  <button type="button" onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                    className="w-full bg-white border border-[#ebd7fa] rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 flex items-center justify-between shadow-sm hover:border-[#7a3dbf] transition-all focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/30">
                    <div className="flex items-center gap-2">
                      <FolderOpen size={15} className="text-[#7a3dbf]" />
                      <span>{categoryPath.join(" › ")}</span>
                    </div>
                    <ChevronDown size={14} className={cn("text-slate-400 transition-transform", isCategoryDropdownOpen && "rotate-180")} />
                  </button>
                  {isCategoryDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-white border border-[#ebd7fa] rounded-2xl shadow-xl shadow-purple-100/40 p-2">
                      <p className="text-[9px] font-semibold text-[#7a3dbf] uppercase tracking-widest px-2 py-1.5">Select Catalog Class</p>
                      {[
                        ["Electronics", "Smartphones"],
                        ["Electronics", "Monitors"],
                        ["Clothing & Shoes", "Men's Sneakers"],
                        ["Clothing & Shoes", "Women's Bags"]
                      ].map((path) => (
                        <button key={path.join("-")} type="button"
                          onClick={() => { setCategoryPath(path); setIsCategoryDropdownOpen(false); }}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold hover:bg-[#faf6ff] text-slate-700 hover:text-[#7a3dbf] transition-all flex items-center justify-between">
                          <span>{path.join(" › ")}</span>
                          {categoryPath[1] === path[1] && <Check size={12} className="text-[#7a3dbf]" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Brand */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block">Brand Name</label>
                  <input type="text" placeholder="e.g. Apple, Samsung, Nike"
                    value={brand} onChange={(e) => setBrand(e.target.value)}
                    className={inputCls} />
                </div>

                {/* Condition */}
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block">Product Condition</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["New", "Refurbished", "Used"].map((cond) => (
                      <button key={cond} type="button" onClick={() => setCondition(cond)}
                        className={cn(
                          "py-2.5 text-xs font-semibold rounded-xl border transition-all active:scale-95",
                          condition === cond
                            ? "bg-[#7a3dbf] border-transparent text-white shadow-sm"
                            : "bg-white border-slate-200 text-slate-600 hover:border-[#7a3dbf]/40"
                        )}>
                        {cond}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Rich Text Editor */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block">Detailed Product Description</label>
                <div className="border border-[#ebd7fa] rounded-2xl overflow-hidden shadow-sm">
                  {/* Toolbar */}
                  <div className="bg-[#faf6ff] border-b border-[#ebd7fa] px-3 py-2 flex items-center gap-1 flex-wrap">
                    {[
                      { icon: Bold, cmd: "bold", title: "Bold" },
                      { icon: Italic, cmd: "italic", title: "Italic" },
                    ].map(({ icon: Icon, cmd, title }) => (
                      <button key={cmd} type="button" onClick={() => formatText(cmd)} title={title}
                        className="h-7 w-7 flex items-center justify-center hover:bg-white hover:shadow-sm rounded-lg text-slate-600 hover:text-[#7a3dbf] transition-all">
                        <Icon size={13} />
                      </button>
                    ))}
                    <div className="w-px h-4 bg-slate-200 mx-1" />
                    <button type="button" onClick={() => formatText("insertUnorderedList")} title="Bullet List"
                      className="h-7 w-7 flex items-center justify-center hover:bg-white hover:shadow-sm rounded-lg text-slate-600 hover:text-[#7a3dbf] transition-all">
                      <List size={13} />
                    </button>
                    <button type="button" title="Insert Link"
                      onClick={() => { const url = prompt("Insert Hyperlink URL:"); if (url) formatText("createLink", url); }}
                      className="h-7 w-7 flex items-center justify-center hover:bg-white hover:shadow-sm rounded-lg text-slate-600 hover:text-[#7a3dbf] transition-all">
                      <Link2 size={13} />
                    </button>
                    <div className="w-px h-4 bg-slate-200 mx-1" />
                    <button type="button" onClick={() => formatText("removeFormat")} title="Clear Formatting"
                      className="h-7 w-7 flex items-center justify-center hover:bg-white hover:shadow-sm rounded-lg text-slate-400 hover:text-red-400 transition-all">
                      <Eraser size={13} />
                    </button>
                  </div>
                  <div ref={editorRef} contentEditable onInput={handleEditorInput}
                    className="min-h-[150px] p-4 text-sm text-slate-800 outline-none focus:bg-[#faf6ff]/30 transition-all"
                    data-placeholder="Describe variant specific details, key product attributes, packaging configurations..."
                    dangerouslySetInnerHTML={{ __html: description }} />
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block">
                  Tags / Keywords <span className="normal-case text-slate-300 font-medium">(Press Enter)</span>
                </label>
                <div className="bg-[#faf6ff] border border-[#ebd7fa] rounded-2xl p-3 flex flex-wrap gap-2 items-center min-h-[50px]">
                  {tags.map((tag, i) => (
                    <span key={tag}
                      className={cn("text-[11px] font-semibold pl-3 pr-2 py-1.5 rounded-full border flex items-center gap-1.5", TAG_COLORS[i % TAG_COLORS.length])}>
                      <span>{tag}</span>
                      <button type="button" onClick={() => setTags((prev) => prev.filter((t) => t !== tag))}
                        className="opacity-60 hover:opacity-100 transition-opacity">
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                  <input type="text" placeholder="Add tag…" value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleAddTag}
                    className="bg-transparent border-none outline-none text-sm text-slate-700 placeholder:text-slate-400 flex-1 min-w-[100px] py-0.5" />
                </div>
              </div>
            </div>
          </section>

          {/* ── Section 2: Media ── */}
          <section id="media" className="bg-white rounded-3xl shadow-sm border border-[#ebd7fa] overflow-hidden"
            style={{ boxShadow: "0 2px 16px 0 rgba(122,61,191,0.06), inset 0 1px 0 rgba(255,255,255,0.8)" }}>
            <div className="border-l-4 border-[#5FD0C8] px-6 py-5 flex items-center justify-between bg-[#faf6ff]">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-[#5FD0C8] flex items-center justify-center shadow-sm">
                  <ImageIcon size={18} className="text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-slate-900 text-sm font-semibold tracking-tight">Product Media Upload</h3>
                    <span className="text-[9px] bg-[#5FD0C8] text-white px-2 py-0.5 rounded-full font-semibold">02</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">Photos, gallery & video demo</p>
                </div>
              </div>
              <span className="text-[10px] text-slate-500 font-semibold">{uploadedImages.length}/8</span>
            </div>

            <div className="p-6 space-y-5">
              {/* Drop zone */}
              <div
                onDragEnter={handleDrag} onDragOver={handleDrag}
                onDragLeave={handleDrag} onDrop={handleDrop}
                className={cn(
                  "relative rounded-3xl p-8 text-center cursor-pointer transition-all duration-200 group",
                  dragActive
                    ? "border-2 border-[#7a3dbf] bg-purple-50/40"
                    : "border-2 border-dashed border-[#ebd7fa] hover:border-[#7a3dbf]/60 bg-[#faf6ff]/30 hover:bg-purple-50/20"
                )}>
                <input type="file" multiple accept="image/*" onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                <div className="pointer-events-none flex flex-col items-center gap-3">
                  <div className={cn(
                    "h-16 w-16 rounded-3xl flex items-center justify-center transition-all",
                    dragActive
                      ? "bg-[#7a3dbf] text-white scale-110"
                      : "bg-[#f3eafb] text-[#7a3dbf] group-hover:scale-105"
                  )}>
                    <UploadCloud size={28} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">
                      {dragActive ? "Drop images here" : "Drag & drop product images"}
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium mt-1">or click to browse • JPEG, PNG, WEBP • Max 2MB each</p>
                  </div>
                </div>
              </div>

              {/* Gallery thumbnails */}
              {uploadedImages.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Gallery</span>
                    <span className="text-[9px] text-[#7a3dbf] font-semibold bg-[#7a3dbf]/5 px-2 py-0.5 rounded-full">Drag to reorder • First = Cover</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {uploadedImages.map((img, index) => (
                      <div key={img.id} draggable
                        onDragStart={() => handleImageDragStart(index)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleImageDrop(index)}
                        className={cn(
                          "relative aspect-square rounded-2xl border-2 overflow-hidden bg-slate-50 group cursor-grab active:cursor-grabbing transition-all hover:scale-[1.02]",
                          index === 0
                            ? "border-amber-400 ring-2 ring-amber-300/50 ring-offset-1"
                            : "border-slate-100 hover:border-[#7a3dbf]/40"
                        )}>
                        <Image src={img.url} alt={`gallery-${index}`} fill
                          className="object-cover" sizes="150px" />

                        {/* Number badge */}
                        <div className={cn(
                          "absolute top-2 left-2 h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-semibold shadow-sm",
                          index === 0 ? "bg-amber-400 text-white" : "bg-white/90 text-slate-700"
                        )}>
                          {index === 0 ? "★" : index + 1}
                        </div>

                        {/* Hover actions */}
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button type="button" onClick={() => setZoomImage(img.url)}
                            className="p-2 bg-white/90 hover:bg-white text-slate-800 rounded-xl hover:scale-105 transition-all shadow">
                            <Maximize2 size={12} />
                          </button>
                          <button type="button"
                            onClick={() => setUploadedImages((prev) => prev.filter((item) => item.id !== img.id))}
                            className="p-2 bg-white/90 hover:bg-red-50 text-red-500 rounded-xl hover:scale-105 transition-all shadow">
                            <Trash2 size={12} />
                          </button>
                        </div>

                        {/* Footer */}
                        <div className="absolute bottom-0 inset-x-0 bg-black/60 p-2 text-[8px] font-semibold text-white/90 truncate">
                          {img.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Video */}
              <div className="border-t border-[#ebd7fa]/60 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="text-sm font-semibold text-slate-700 block">Product Demo Video</span>
                  <span className="text-[11px] text-slate-400 font-medium">MP4 format, max 20MB</span>
                </div>
                {videoFile ? (
                  <div className="flex items-center gap-2 border border-[#ebd7fa] rounded-xl px-3 py-2 bg-[#faf6ff]">
                    <Tv size={14} className="text-[#7a3dbf]" />
                    <div>
                      <span className="text-[10px] font-semibold text-slate-700 block truncate max-w-[120px]">{videoFile.name}</span>
                      <span className="text-[9px] font-semibold text-[#7a3dbf]">{videoFile.size}</span>
                    </div>
                    <button type="button" onClick={() => setVideoFile(null)}
                      className="text-slate-400 hover:text-red-500 p-0.5 transition-colors">
                      <X size={10} />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <input type="file" accept="video/*" onChange={handleVideoUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                    <button type="button"
                      className="border border-[#ebd7fa] hover:border-[#7a3dbf] text-slate-700 hover:text-[#7a3dbf] font-semibold text-xs px-4 py-2.5 rounded-xl transition-all bg-white flex items-center gap-1.5">
                      <Tv size={13} />
                      Upload Video
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ── Section 3: Pricing ── */}
          <section id="pricing" className="bg-white rounded-3xl shadow-sm border border-[#ebd7fa] overflow-hidden"
            style={{ boxShadow: "0 2px 16px 0 rgba(122,61,191,0.06), inset 0 1px 0 rgba(255,255,255,0.8)" }}>
            <div className="border-l-4 border-[#5FD0C8] px-6 py-5 flex items-center justify-between bg-[#faf6ff]">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-[#5FD0C8] flex items-center justify-center shadow-sm">
                  <DollarSign size={18} className="text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-slate-900 text-sm font-semibold tracking-tight">Pricing & Inventory</h3>
                    <span className="text-[9px] bg-[#5FD0C8] text-white px-2 py-0.5 rounded-full font-semibold">03</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">Set prices, stock levels & margins</p>
                </div>
              </div>
              <span className="text-[9px] text-[#7a3dbf] font-semibold uppercase tracking-widest border border-[#ebd7fa] bg-[#faf6ff] px-2 py-1 rounded-lg">Required</span>
            </div>

            <div className="p-6 space-y-5">
              {/* Currency */}
              <div className="flex items-center justify-between bg-[#faf6ff] border border-[#ebd7fa] rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Info size={14} className="text-[#7a3dbf]" />
                  Display Currency
                </div>
                <select value={currency} onChange={(e) => setCurrency(e.target.value)}
                  className="bg-white border border-[#ebd7fa] rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/20">
                  <option value="NGN (₦)">NGN (₦) — Naira</option>
                  <option value="USD ($)">USD ($) — Dollar</option>
                  <option value="EUR (€)">EUR (€) — Euro</option>
                </select>
              </div>

              {/* Price inputs with prefix */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: "Cost Price *", value: costPrice, setter: setCostPrice, symbol: "₦", subtle: true },
                  { label: "Sale Base Price *", value: basePrice, setter: setBasePrice, symbol: "₦", subtle: false },
                  { label: "Compare-At Price", value: comparePrice, setter: setComparePrice, symbol: "₦", subtle: true },
                ].map(({ label, value, setter, symbol, subtle }) => (
                  <div key={label} className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block">{label}</label>
                    <div className={cn(
                      "flex items-center rounded-xl border overflow-hidden shadow-sm transition-all focus-within:ring-2 focus-within:ring-[#7a3dbf]/30 focus-within:border-[#7a3dbf]",
                      subtle ? "border-[#ebd7fa]" : "border-[#7a3dbf]/40"
                    )}>
                      <div className={cn(
                        "px-3 py-3 text-xs font-semibold border-r",
                        subtle ? "bg-slate-50 text-slate-500 border-slate-100" : "bg-[#7a3dbf]/5 text-[#7a3dbf] border-[#7a3dbf]/20"
                      )}>
                        {symbol}
                      </div>
                      <input type="number" min={0} value={value || ""} onChange={(e) => setter(Number(e.target.value))}
                        className="flex-1 px-3 py-3 text-sm font-semibold text-slate-800 bg-white outline-none" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Profit flow card */}
              {basePrice > 0 && costPrice > 0 && (
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                    <Sparkles size={11} className="text-[#7a3dbf]" />
                    Margin Analysis
                  </div>

                  {/* Flow */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="bg-white rounded-xl border border-slate-200 px-3 py-2 text-center">
                      <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Cost</p>
                      <p className="text-sm font-semibold text-slate-700">₦{costPrice.toLocaleString()}</p>
                    </div>
                    <ArrowRight size={14} className="text-slate-300 shrink-0" />
                    <div className="bg-white rounded-xl border border-[#7a3dbf]/30 px-3 py-2 text-center">
                      <p className="text-[9px] text-[#7a3dbf] font-semibold uppercase tracking-wider">Sale Price</p>
                      <p className="text-sm font-semibold text-[#7a3dbf]">₦{basePrice.toLocaleString()}</p>
                    </div>
                    <ArrowRight size={14} className="text-slate-300 shrink-0" />
                    <div className={cn("bg-white rounded-xl border px-3 py-2 text-center", profitMargin >= 30 ? "border-[#5FD0C8]/40" : profitMargin > 0 ? "border-[#ebd7fa]" : "border-red-200")}>
                      <p className={cn("text-[9px] font-semibold uppercase tracking-wider", profitMargin >= 30 ? "text-[#5FD0C8]" : profitMargin > 0 ? "text-[#7a3dbf]" : "text-red-500")}>
                        Profit
                      </p>
                      <p className={cn("text-sm font-semibold", profitMargin >= 30 ? "text-[#5FD0C8]" : profitMargin > 0 ? "text-[#7a3dbf]" : "text-red-500")}>
                        ₦{(basePrice - costPrice).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Margin meter */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-slate-400">
                      <span>0%</span>
                      <span className={cn("font-semibold", profitMargin >= 30 ? "text-[#5FD0C8]" : profitMargin > 0 ? "text-[#7a3dbf]" : "text-red-500")}>
                        {profitMargin.toFixed(1)}% margin
                      </span>
                      <span>100%</span>
                    </div>
                    <div className="h-2.5 rounded-full overflow-hidden bg-[#ebd7fa]">
                      <div
                        className={cn("h-full rounded-full transition-all duration-500", profitMargin >= 30 ? "bg-[#5FD0C8]" : profitMargin > 0 ? "bg-[#7a3dbf]" : "bg-red-400")}
                        style={{ width: `${Math.min(profitMargin, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Stock */}
              {!hasVariants ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                  {[
                    { label: "Available Stock *", value: baseStock, setter: setBaseStock, type: "number", placeholder: "e.g. 50" },
                    { label: "Barcode Identifier", value: barcode, setter: setBarcode, type: "text", placeholder: "UPC-A / EAN-13" },
                    { label: "Low Stock Alert", value: alertThreshold, setter: setAlertThreshold, type: "number", placeholder: "e.g. 5" },
                  ].map(({ label, value, setter, type, placeholder }) => (
                    <div key={label} className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block">{label}</label>
                      <input type={type} min={0} placeholder={placeholder}
                        value={value} onChange={(e) => (setter as (v: string | number) => void)(type === "number" ? Number(e.target.value) : e.target.value)}
                        className={inputCls} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border border-[#ebd7fa]/60 bg-[#faf6ff]/50 p-4 rounded-2xl flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-[#7a3dbf]/10 flex items-center justify-center shrink-0">
                    <Sliders size={14} className="text-[#7a3dbf]" />
                  </div>
                  <p className="text-xs font-medium text-slate-500">
                    Stock is managed per-variant in the Variants Matrix below.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* ── Section 4: Variants ── */}
          <section id="variants" className="bg-white rounded-3xl shadow-sm border border-[#ebd7fa] overflow-hidden"
            style={{ boxShadow: "0 2px 16px 0 rgba(122,61,191,0.06), inset 0 1px 0 rgba(255,255,255,0.8)" }}>
            <div className="border-l-4 border-[#7a3dbf] px-6 py-5 flex items-center justify-between bg-[#faf6ff]">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-[#7a3dbf] flex items-center justify-center shadow-sm">
                  <Sliders size={18} className="text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-slate-900 text-sm font-semibold tracking-tight">Attributes & Variants</h3>
                    <span className="text-[9px] bg-[#7a3dbf] text-white px-2 py-0.5 rounded-full font-semibold">04</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">Colors, sizes & SKU matrix</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-semibold">Enable</span>
                <button type="button" onClick={() => setHasVariants(!hasVariants)}
                  className={cn(
                    "w-11 h-6 rounded-full p-0.5 transition-colors relative flex items-center cursor-pointer shadow-inner",
                    hasVariants ? "bg-[#7a3dbf]" : "bg-slate-200"
                  )}>
                  <span className={cn(
                    "h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200",
                    hasVariants ? "translate-x-5" : "translate-x-0.5"
                  )} />
                </button>
              </div>
            </div>

            {hasVariants && (
              <div className="p-6 space-y-6">
                {/* Add type */}
                <div className="flex items-center gap-3">
                  <input type="text" placeholder="e.g. Size, Color, Material…"
                    value={newTypeName} onChange={(e) => setNewTypeName(e.target.value)}
                    className={cn(inputCls, "flex-1")} />
                  <button type="button" onClick={handleAddVariantType}
                    className="bg-white border border-[#ebd7fa] hover:border-[#7a3dbf] hover:text-[#7a3dbf] text-slate-600 font-semibold text-xs px-4 py-3 rounded-xl transition-all shadow-sm flex items-center gap-1.5 shrink-0">
                    <Plus size={13} />
                    Add Type
                  </button>
                </div>

                {/* Variant type cards */}
                <div className="space-y-3">
                  {variantTypes.map((type, typeIdx) => {
                    const BORDER_COLORS = ["border-l-violet-400", "border-l-teal-400", "border-l-rose-400", "border-l-amber-400"];
                    return (
                      <div key={type.name}
                        className={cn("border border-[#ebd7fa] border-l-4 rounded-2xl p-4 space-y-3 bg-[#faf6ff]/30", BORDER_COLORS[typeIdx % BORDER_COLORS.length])}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-slate-800">{type.name}</span>
                          <button type="button"
                            onClick={() => setVariantTypes((prev) => prev.filter((t) => t.name !== type.name))}
                            className="text-slate-300 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-red-50">
                            <Trash2 size={13} />
                          </button>
                        </div>

                        <div className="flex flex-wrap gap-2 items-center">
                          {type.values.map((v) => (
                            <span key={v}
                              className="bg-white text-slate-700 text-xs font-semibold pl-3 pr-2 py-1.5 rounded-full border border-[#ebd7fa] flex items-center gap-1.5 shadow-sm">
                              {type.name.toLowerCase() === "color" && (
                                <span className="h-2.5 w-2.5 rounded-full border border-slate-200 inline-block shrink-0"
                                  style={{ backgroundColor: v.toLowerCase().replace(/\s+/g, "") }} />
                              )}
                              {v}
                              <button type="button"
                                onClick={() => setVariantTypes((prev) =>
                                  prev.map((t) => t.name === type.name
                                    ? { ...t, values: t.values.filter((item) => item !== v) } : t
                                  ))}>
                                <X size={10} className="text-slate-400 hover:text-red-400 transition-colors" />
                              </button>
                            </span>
                          ))}
                          <div className="flex items-center gap-1.5">
                            <input type="text" placeholder="Add option…"
                              value={optionInputs[type.name] || ""}
                              onChange={(e) => setOptionInputs((prev) => ({ ...prev, [type.name]: e.target.value }))}
                              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddOptionValue(type.name); } }}
                              className="bg-white border border-[#ebd7fa] rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-[#7a3dbf]/20 focus:border-[#7a3dbf] w-28 transition-all" />
                            <button type="button" onClick={() => handleAddOptionValue(type.name)}
                              className="text-[10px] font-semibold text-[#7a3dbf] hover:underline">+ Add</button>
                          </div>
                        </div>

                        {type.name.toLowerCase() === "color" && type.values.length > 0 && (
                          <div className="border-t border-slate-100 pt-3 space-y-2">
                            <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest block">Link Gallery Photos to Colors</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {type.values.map((colName) => (
                                <div key={colName} className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-100 gap-2">
                                  <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 shrink-0">
                                    <span className="h-3 w-3 rounded-full border border-slate-200"
                                      style={{ backgroundColor: colName.toLowerCase().replace(/\s+/g, "") }} />
                                    {colName}
                                  </span>
                                  <select value={colorSwatches[colName] || ""}
                                    onChange={(e) => setColorSwatches((prev) => ({ ...prev, [colName]: e.target.value }))}
                                    className="flex-1 bg-[#faf6ff] border border-[#ebd7fa] rounded-lg px-2 py-1 text-[10px] font-semibold text-slate-700 focus:outline-none min-w-0">
                                    <option value="">Select photo</option>
                                    {uploadedImages.map((img) => (
                                      <option key={img.id} value={img.url}>{img.name}</option>
                                    ))}
                                  </select>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Combinations table */}
                {variantCombinations.length > 0 && (
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-800">Variant Matrix</span>
                      <span className="text-[9px] bg-[#faf6ff] text-[#7a3dbf] border border-[#ebd7fa] px-2 py-0.5 rounded-full font-semibold">{variantCombinations.length} combinations</span>
                    </div>
                    <div className="overflow-x-auto rounded-2xl border border-[#ebd7fa] shadow-inner">
                      <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead>
                          <tr className="bg-[#faf6ff] text-[9px] font-semibold text-slate-500 uppercase tracking-widest border-b border-[#ebd7fa]">
                            <th className="py-3 px-4">Variant</th>
                            <th className="py-3 px-4 w-40">SKU</th>
                            <th className="py-3 px-4 w-32">Price (₦)</th>
                            <th className="py-3 px-4 w-24">Stock</th>
                            <th className="py-3 px-4 w-36">Photo</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {variantCombinations.map((comb, index) => (
                            <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-[#faf6ff]/30"}>
                              <td className="py-3 px-4 text-xs font-semibold text-slate-800">
                                {Object.entries(comb.options).map(([k, v]) => `${k}: ${v}`).join(" · ")}
                              </td>
                              <td className="py-2.5 px-4">
                                <input type="text" value={comb.sku}
                                  onChange={(e) => { const u = [...variantCombinations]; u[index].sku = e.target.value; setVariantCombinations(u); }}
                                  className="w-full bg-white border border-[#ebd7fa] rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/20" />
                              </td>
                              <td className="py-2.5 px-4">
                                <input type="number" min={0} value={comb.price}
                                  onChange={(e) => { const u = [...variantCombinations]; u[index].price = Number(e.target.value); setVariantCombinations(u); }}
                                  className="w-full bg-white border border-[#ebd7fa] rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/20" />
                              </td>
                              <td className="py-2.5 px-4">
                                <input type="number" min={0} value={comb.stock}
                                  onChange={(e) => { const u = [...variantCombinations]; u[index].stock = Number(e.target.value); setVariantCombinations(u); }}
                                  className="w-full bg-white border border-[#ebd7fa] rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7a3dbf]/20" />
                              </td>
                              <td className="py-2.5 px-4">
                                <select value={comb.image}
                                  onChange={(e) => { const u = [...variantCombinations]; u[index].image = e.target.value; setVariantCombinations(u); }}
                                  className="w-full bg-white border border-[#ebd7fa] rounded-lg px-2 py-1.5 text-[11px] font-semibold text-slate-700 focus:outline-none">
                                  <option value="">Select photo</option>
                                  {uploadedImages.map((img) => (
                                    <option key={img.id} value={img.url}>{img.name}</option>
                                  ))}
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!hasVariants && (
              <div className="px-6 pb-6">
                <div className="flex items-center gap-3 bg-[#faf6ff]/60 border border-[#ebd7fa]/60 rounded-2xl px-4 py-3.5">
                  <Sliders size={16} className="text-slate-300" />
                  <p className="text-xs text-slate-400 font-medium">Enable variants above to create size, color, or other option combinations.</p>
                </div>
              </div>
            )}
          </section>

          {/* ── Section 5: Shipping ── */}
          <section id="shipping" className="bg-white rounded-3xl shadow-sm border border-[#ebd7fa] overflow-hidden"
            style={{ boxShadow: "0 2px 16px 0 rgba(122,61,191,0.06), inset 0 1px 0 rgba(255,255,255,0.8)" }}>
            <div className="border-l-4 border-[#5FD0C8] px-6 py-5 bg-[#faf6ff]">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-[#5FD0C8] flex items-center justify-center shadow-sm">
                  <TruckIcon size={18} className="text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-slate-900 text-sm font-semibold tracking-tight">Shipping & Logistics</h3>
                    <span className="text-[9px] bg-[#5FD0C8] text-white px-2 py-0.5 rounded-full font-semibold">05</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">Weight, dimensions & handling</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Dimensions */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Weight (kg)", value: weight, setter: setWeight, step: "0.01" },
                  { label: "Length (cm)", value: length, setter: setLength },
                  { label: "Width (cm)", value: width, setter: setWidth },
                  { label: "Height (cm)", value: height, setter: setHeight },
                ].map(({ label, value, setter, step }) => (
                  <div key={label} className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block">{label}</label>
                    <input type="number" step={step || "1"} min={0}
                      value={value || ""} onChange={(e) => setter(Number(e.target.value))}
                      className={inputCls} />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Shipping class */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block">Shipping Class</label>
                  <select value={shippingClass} onChange={(e) => setShippingClass(e.target.value)}
                    className={inputCls}>
                    <option value="Standard">Standard Delivery (3–5 days)</option>
                    <option value="Express">Express Air Cargo (1–2 days)</option>
                    <option value="Fragile">Fragile Care Package</option>
                  </select>
                </div>

                {/* Special handling */}
                <div className="flex items-center justify-between border border-[#ebd7fa]/60 rounded-2xl px-4 py-3 bg-[#faf6ff]/40">
                  <div>
                    <span className="text-sm font-semibold text-slate-700 block">Fragile Handling</span>
                    <span className="text-[10px] text-slate-400 font-medium">Requires shock pads or crating.</span>
                  </div>
                  <button type="button" onClick={() => setSpecialHandling(!specialHandling)}
                    className={cn(
                      "w-11 h-6 rounded-full p-0.5 transition-colors relative flex items-center cursor-pointer shadow-inner",
                      specialHandling ? "bg-[#7a3dbf]" : "bg-slate-200"
                    )}>
                    <span className={cn(
                      "h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200",
                      specialHandling ? "translate-x-5" : "translate-x-0.5"
                    )} />
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* ── Right Preview Panel ── */}
        {!isPreviewCollapsed && (
          <aside className="lg:col-span-3 sticky top-24 bg-white border border-[#ebd7fa] rounded-3xl p-5 shadow-lg shadow-purple-100/30 space-y-4">
            <div className="flex items-center justify-between border-b border-[#ebd7fa]/60 pb-3">
              <div className="flex items-center gap-1.5">
                <div className="h-6 w-6 rounded-lg bg-[#7a3dbf] flex items-center justify-center">
                  <Eye size={12} className="text-white" />
                </div>
                <span className="text-xs font-semibold text-slate-800">Live Preview</span>
              </div>
              <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg">
                {(["desktop", "mobile"] as const).map((mode) => (
                  <button key={mode} type="button" onClick={() => setPreviewMode(mode)}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-[9px] font-semibold transition-all capitalize",
                      previewMode === mode ? "bg-white text-[#7a3dbf] shadow-sm" : "text-slate-500 hover:text-slate-700"
                    )}>
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Device frame */}
            <div className="flex justify-center">
              {previewMode === "mobile" ? (
                /* Phone frame */
                <div className="w-[220px] bg-slate-900 rounded-[2.5rem] p-2 shadow-2xl shadow-slate-400/30">
                  {/* Notch */}
                  <div className="flex justify-center mb-1.5">
                    <div className="h-5 w-20 bg-slate-800 rounded-full flex items-center justify-center gap-1.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-slate-600" />
                      <div className="h-2.5 w-2.5 rounded-full bg-slate-700" />
                    </div>
                  </div>
                  <div className="bg-white rounded-[1.8rem] overflow-hidden max-h-[520px] overflow-y-auto">
                    <PreviewCard
                      uploadedImages={uploadedImages}
                      productName={productName}
                      brand={brand}
                      basePrice={basePrice}
                      comparePrice={comparePrice}
                      currency={currency}
                      condition={condition}
                      categoryPath={categoryPath}
                      hasVariants={hasVariants}
                      variantTypes={variantTypes}
                      shippingClass={shippingClass}
                      specialHandling={specialHandling}
                    />
                  </div>
                  {/* Home bar */}
                  <div className="flex justify-center mt-2">
                    <div className="h-1 w-16 bg-slate-600 rounded-full" />
                  </div>
                </div>
              ) : (
                /* Browser chrome */
                <div className="w-full bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-md">
                  {/* Browser bar */}
                  <div className="bg-white border-b border-slate-200 px-3 py-2 flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                      <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    </div>
                    <div className="flex-1 bg-slate-100 rounded-lg px-3 py-1 text-[9px] text-slate-400 font-medium">
                      fastlink.com/products/{productName ? productName.toLowerCase().replace(/\s+/g, "-").slice(0, 20) : "preview"}
                    </div>
                  </div>
                  <div className="bg-white max-h-[560px] overflow-y-auto">
                    <PreviewCard
                      uploadedImages={uploadedImages}
                      productName={productName}
                      brand={brand}
                      basePrice={basePrice}
                      comparePrice={comparePrice}
                      currency={currency}
                      condition={condition}
                      categoryPath={categoryPath}
                      hasVariants={hasVariants}
                      variantTypes={variantTypes}
                      shippingClass={shippingClass}
                      specialHandling={specialHandling}
                    />
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>

      {/* ── Zoom Lightbox ── */}
      {zoomImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setZoomImage(null)} />
          <div className="relative max-w-2xl w-full aspect-square z-10">
            <button onClick={() => setZoomImage(null)}
              className="absolute right-3 top-3 bg-white/90 text-slate-800 rounded-full p-2 hover:scale-105 transition-all shadow-lg z-20">
              <X size={16} />
            </button>
            <div className="rounded-3xl overflow-hidden h-full w-full">
              <Image src={zoomImage} alt="zoom" fill className="object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PreviewCard({
  uploadedImages, productName, brand, basePrice, comparePrice,
  currency, condition, categoryPath, hasVariants, variantTypes,
  shippingClass, specialHandling
}: {
  uploadedImages: ImageFile[];
  productName: string;
  brand: string;
  basePrice: number;
  comparePrice: number;
  currency: string;
  condition: string;
  categoryPath: string[];
  hasVariants: boolean;
  variantTypes: VariantType[];
  shippingClass: string;
  specialHandling: boolean;
}) {
  return (
    <div className="w-full">
      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
        {uploadedImages[0]?.url ? (
          <Image
            src={uploadedImages[0].url}
            alt="preview"
            fill
            className="object-cover"
            sizes="300px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-300">
            <Package size={40} />
          </div>
        )}
        <span className="absolute top-2 left-2 bg-[#7a3dbf] text-white text-[8px] font-semibold px-2 py-0.5 rounded-full uppercase">
          {categoryPath[1] || "Product"}
        </span>
        <span className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[7px] font-semibold px-2 py-0.5 rounded-full">
          {condition}
        </span>
      </div>
      <div className="p-4 space-y-2.5">
        <div>
          <span className="text-[8px] font-semibold text-[#5FD0C8] uppercase tracking-widest block">{brand || "BRAND"}</span>
          <h4 className="text-slate-900 text-xs font-semibold leading-tight mt-0.5 line-clamp-2">
            {productName || "Product Title Placeholder"}
          </h4>
        </div>
        <div className="flex items-center gap-1">
          <div className="flex text-amber-400 text-[10px] leading-none">{"★".repeat(5)}</div>
          <span className="text-[8px] text-slate-400 font-semibold">(0)</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-base font-semibold text-slate-900">
            {currency.split(" ")[0]} {basePrice.toLocaleString()}
          </span>
          {comparePrice > basePrice && (
            <span className="text-[10px] text-slate-400 line-through font-semibold">
              ₦{comparePrice.toLocaleString()}
            </span>
          )}
        </div>
        {hasVariants && variantTypes.length > 0 && (
          <div className="space-y-1.5 border-t border-slate-100 pt-2">
            {variantTypes.map((type) => (
              <div key={type.name} className="space-y-1">
                <span className="text-[8px] font-semibold text-slate-400 uppercase tracking-wide">{type.name}:</span>
                <div className="flex flex-wrap gap-1">
                  {type.values.slice(0, 3).map((val) => (
                    <span key={val}
                      className="border border-slate-200 text-slate-600 text-[8px] font-semibold px-2 py-0.5 rounded-md bg-white">
                      {val}
                    </span>
                  ))}
                  {type.values.length > 3 && (
                    <span className="text-[8px] text-[#7a3dbf] font-semibold self-center">+{type.values.length - 3}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="bg-[#faf6ff] border border-[#ebd7fa] rounded-lg p-2 text-[8px] font-semibold text-slate-500">
          ⚡ {shippingClass} · Fragile: {specialHandling ? "Yes" : "No"}
        </div>
        <button type="button"
          className="w-full bg-[#7a3dbf] text-white text-[9px] font-semibold py-2 rounded-xl shadow-sm flex items-center justify-center gap-1 pointer-events-none">
          <ShoppingCart size={10} />
          Add to Cart
        </button>
      </div>
    </div>
  );
}

interface ImageFile {
  id: string;
  url: string;
  name: string;
  size: string;
}

interface VariantType {
  name: string;
  values: string[];
}

function TruckIcon({ size = 24, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size}
      viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="1" y="3" width="15" height="13" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}
