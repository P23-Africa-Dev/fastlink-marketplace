"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, MonitorPlay, Folder } from "lucide-react";
import Link from "next/link";

import type { ProductFilter } from "@/types/product";
import { useCategories, useBrands } from "@/hooks/use-catalog";
import { cn } from "@/lib/utils";

interface ProductFiltersProps {
  filters: ProductFilter;
  onFiltersChange: (filters: ProductFilter) => void;
  className?: string;
}

const BRANDS_BY_CATEGORY: Record<string, string[]> = {};

const PRICE_MIN = 30000;
const PRICE_MAX = 380000;

const RATING_OPTIONS = [
  { label: "5 Stars & Up", value: 5 },
  { label: "4 Stars & Up", value: 4 },
  { label: "3 Stars & Up", value: 3 },
];

const SORT_OPTIONS = [
  { value: "bestseller", label: "Best Selling" },
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

function CustomCheckbox({ 
  checked, 
  onChange, 
  colorClass = "bg-[#7a3dbf]" 
}: { 
  checked: boolean; 
  onChange: (c: boolean) => void; 
  colorClass?: string;
}) {
  return (
    <div
      onClick={() => onChange(!checked)}
      className={cn(
        "flex h-[18px] w-[18px] shrink-0 cursor-pointer items-center justify-center rounded-[4px] border-[1.5px] transition-colors",
        checked ? cn("border-transparent", colorClass) : "border-[#cdbce3] bg-transparent"
      )}
    >
      {checked && (
        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
    </div>
  );
}

function Section({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[#e8d5fa]/50 py-3.5 font-montserrat">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-left py-1"
      >
        <span className="text-[15px] font-semibold text-[#6D349F]">{title}</span>
        {open ? (
          <ChevronUp size={16} className="text-[#6D349F]" />
        ) : (
          <ChevronDown size={16} className="text-[#6D349F]" />
        )}
      </button>
      {open && <div className="mt-3 space-y-2.5">{children}</div>}
    </div>
  );
}

export function ProductFilters({ filters, onFiltersChange, className }: ProductFiltersProps) {
  const { data: categoriesRes } = useCategories();
  const { data: brandsRes } = useBrands();
  const categories = categoriesRes?.data ?? [];
  const brandNames = (brandsRes?.data ?? []).map((b) => b.name);

  const [deliveryLocal, setDeliveryLocal] = useState(true);
  const [deliveryNationwide, setDeliveryNationwide] = useState(true);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceMax, setPriceMax] = useState(PRICE_MAX);

  function update(patch: Partial<ProductFilter>) {
    onFiltersChange({ ...filters, ...patch });
  }

  function clearAll() {
    onFiltersChange({});
    setDeliveryLocal(true);
    setDeliveryNationwide(true);
    setSelectedBrands([]);
    setPriceMax(PRICE_MAX);
  }

  const brands =
    BRANDS_BY_CATEGORY[filters.category ?? ""]?.length
      ? BRANDS_BY_CATEGORY[filters.category ?? ""]
      : brandNames;

  function toggleBrand(brand: string) {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand],
    );
  }

  return (
    <aside className={cn("w-full font-montserrat pb-10", className)}>
      {/* Active Category Header */}
      <div className="mb-2 flex items-center gap-3 pb-4 border-b border-[#e8d5fa]/50 px-1">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#6D349F] text-white shadow-xs">
           <MonitorPlay size={15} />
        </div>
        <span className="text-[17px] font-bold text-[#6D349F]">
          {filters.category ?? "Electronics"}
        </span>
      </div>

      {/* Categories */}
      <Section title="Categories">
        <div className="space-y-2">
          <label className="flex cursor-pointer items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <input
                type="radio"
                name="category"
                checked={!filters.category}
                onChange={() => update({ category: undefined })}
                className="accent-[#6D349F] h-4 w-4"
              />
              <span className="text-sm font-medium text-[#4A2574]">All Categories</span>
            </div>
          </label>
          {categories.map((cat) => (
            <label key={cat.id} className="flex cursor-pointer items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <input
                  type="radio"
                  name="category"
                  checked={filters.category === cat.name}
                  onChange={() => update({ category: cat.name })}
                  className="accent-[#6D349F] h-4 w-4"
                />
                <span className="text-sm font-medium text-[#4A2574]">{cat.name}</span>
              </div>
              {cat.itemCount && (
                <span className="text-xs font-semibold text-[#8A79A5]">{cat.itemCount}</span>
              )}
            </label>
          ))}
        </div>
      </Section>

      {/* Delivery Type */}
      <Section title="Delivery Type">
        <label className="flex cursor-pointer items-center gap-3">
          <CustomCheckbox 
            checked={deliveryLocal} 
            onChange={setDeliveryLocal} 
            colorClass="bg-[#53a69a]" 
          />
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-[#6D349F]">Local</span>
            <span className="text-xs font-medium text-[#8A79A5]">(Same Day)</span>
          </div>
        </label>
        <label className="flex cursor-pointer items-center gap-3">
          <CustomCheckbox 
            checked={deliveryNationwide} 
            onChange={setDeliveryNationwide} 
            colorClass="bg-[#6D349F]" 
          />
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-[#6D349F]">Nationwide</span>
            <span className="text-xs font-medium text-[#8A79A5]">(3-5 Days)</span>
          </div>
        </label>
      </Section>

      {/* Brand */}
      <Section title="Brand">
        <div className="space-y-3">
          {brands.map((brand) => (
            <label key={brand} className="flex cursor-pointer items-center gap-3">
              <CustomCheckbox 
                checked={selectedBrands.includes(brand)} 
                onChange={() => toggleBrand(brand)} 
              />
              <span className="text-sm font-medium text-[#4A2574]">{brand}</span>
            </label>
          ))}
        </div>
      </Section>

      {/* Price */}
      <Section title="Price">
        <div className="space-y-4 mt-2">
          <div className="flex w-full items-center justify-center rounded-xl border border-[#e8d5fa] bg-[#fdfaff] py-2.5 shadow-2xs">
            <span className="text-xs font-semibold text-[#6D349F]">
              ₦30,000 &mdash; ₦380,000
            </span>
          </div>
          <div className="relative h-1.5 w-[90%] mx-auto bg-[#e8d5fa] rounded-full overflow-hidden">
             <div className="absolute left-[5%] right-[15%] top-0 bottom-0 bg-[#6D349F] rounded-full" />
          </div>
          <div className="flex justify-end pt-1">
            <button
              onClick={() => {
                setPriceMax(PRICE_MAX);
                update({ minPrice: undefined, maxPrice: undefined });
              }}
              className="text-xs font-semibold text-[#8A79A5] hover:text-[#6D349F] transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </Section>

      {/* Rating */}
      <Section title="Rating" defaultOpen={true}>
        <div className="space-y-3">
          {RATING_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex cursor-pointer items-center gap-3">
              <CustomCheckbox 
                checked={filters.rating === opt.value} 
                onChange={() => update({ rating: filters.rating === opt.value ? undefined : opt.value })} 
              />
              <div className="flex items-center gap-1.5">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={i < opt.value ? "text-[#fbb321] text-[15px]" : "text-slate-300 text-[15px]"}>★</span>
                  ))}
                </div>
                <span className="text-xs font-semibold text-[#6D349F]">&amp; Up</span>
              </div>
            </label>
          ))}
        </div>
      </Section>

      {/* Reset All */}
      <div className="pt-8 space-y-4">
        <button
          onClick={clearAll}
          className="w-full rounded-xl bg-[#eaddf7] px-4 py-2.5 text-xs font-bold text-[#6D349F] hover:bg-[#6D349F] hover:text-white transition-colors"
        >
          Clear All Filters
        </button>

        <Link
          href="/products"
          className="flex items-center justify-center gap-2 text-xs font-bold text-[#6D349F] hover:text-[#52237A] transition-colors px-1"
        >
          <Folder size={16} />
          <span>Continue Shopping</span>
        </Link>
      </div>
    </aside>
  );
}
