"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, MonitorPlay, Folder } from "lucide-react";
import Link from "next/link";

import type { ProductFilter } from "@/types/product";
import { MOCK_CATEGORIES } from "@/mocks/data";
import { cn } from "@/lib/utils";

interface ProductFiltersProps {
  filters: ProductFilter;
  onFiltersChange: (filters: ProductFilter) => void;
  className?: string;
}

const BRANDS_BY_CATEGORY: Record<string, string[]> = {
  Electronics: ["Samsung", "Xiaomi", "Sony", "LG", "HP"],
  Fashion: ["Nike", "Zara", "H&M", "Adidas", "Gucci"],
  "Home & Kitchen": ["IKEA", "KitchenAid", "OXO", "Cuisinart", "Lodge"],
  Stationery: ["Moleskine", "Leuchtturm", "Pilot", "Rhodia", "Staedtler"],
  "Art & Prints": ["Winsor & Newton", "Canson", "Faber-Castell", "Daler", "Arteza"],
  Jewelry: ["Pandora", "Tiffany", "Swarovski", "Alex Ani", "Mejuri"],
  "Food & Pantry": ["Heinz", "Nestlé", "Knorr", "Maggi", "Dangote"],
};

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
    <div className="border-b border-[#e8d5fa]/50 py-3.5">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-left py-1"
      >
        <span className="text-[15px] font-medium text-[#827498]">{title}</span>
        {open ? (
          <ChevronUp size={16} className="text-[#827498]" />
        ) : (
          <ChevronDown size={16} className="text-[#827498]" />
        )}
      </button>
      {open && <div className="mt-3 space-y-2.5">{children}</div>}
    </div>
  );
}

export function ProductFilters({ filters, onFiltersChange, className }: ProductFiltersProps) {
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

  const brands = BRANDS_BY_CATEGORY[filters.category ?? ""] ?? ["Nike", "Samsung", "Sony", "IKEA", "Zara"];

  const activeCategory = MOCK_CATEGORIES.find((c) => c.name === filters.category);

  function toggleBrand(brand: string) {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand],
    );
  }

  return (
    <aside className={cn("w-full font-sans pb-10", className)}>
      {/* Active Category Header */}
      <div className="mb-2 flex items-center gap-3 pb-4 border-b border-[#e8d5fa]/50 px-1">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#7a3dbf] text-white">
           <MonitorPlay size={14} />
        </div>
        <span className="text-[17px] font-bold text-[#7a3dbf]">
          {filters.category ?? "Electronics"}
        </span>
      </div>

      {/* Categories */}
      <Section title="Categories">
        <div className="space-y-1.5">
          <label className="flex cursor-pointer items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <input
                type="radio"
                name="category"
                checked={!filters.category}
                onChange={() => update({ category: undefined })}
                className="accent-[#7a3dbf]"
              />
              <span className="text-xs text-slate-600">All Categories</span>
            </div>
          </label>
          {MOCK_CATEGORIES.map((cat) => (
            <label key={cat.id} className="flex cursor-pointer items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="category"
                  checked={filters.category === cat.name}
                  onChange={() => update({ category: cat.name })}
                  className="accent-[#7a3dbf]"
                />
                <span className="text-xs text-slate-600">{cat.name}</span>
              </div>
              <span className="text-[10px] text-slate-400">{cat.count}</span>
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
            <span className="text-[15px] font-bold text-[#827498]">Local</span>
            <span className="text-[13px] text-[#bda4da]">(Same Day)</span>
          </div>
        </label>
        <label className="flex cursor-pointer items-center gap-3">
          <CustomCheckbox 
            checked={deliveryNationwide} 
            onChange={setDeliveryNationwide} 
            colorClass="bg-[#7a3dbf]" 
          />
          <div className="flex items-center gap-1.5">
            <span className="text-[15px] font-medium text-[#827498]">Nationwide</span>
            <span className="text-[13px] text-[#bda4da]">(3-5Days)</span>
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
              <span className="text-[15px] text-[#827498]">{brand}</span>
            </label>
          ))}
        </div>
      </Section>

      {/* Price */}
      <Section title="Price">
        <div className="space-y-4 mt-2">
          <div className="flex w-full items-center justify-center rounded-md border border-[#e8d5fa] bg-[#fdfaff] py-2">
            <span className="text-[14px] text-[#827498]">
              N30,000 &mdash; N380,000
            </span>
          </div>
          <div className="relative h-1 w-[90%] mx-auto bg-[#e8d5fa] rounded-full overflow-hidden">
             <div className="absolute left-[5%] right-[15%] top-0 bottom-0 bg-[#7a3dbf] rounded-full" />
          </div>
          <div className="flex justify-end pt-1">
            <button
              onClick={() => {
                setPriceMax(PRICE_MAX);
                update({ minPrice: undefined, maxPrice: undefined });
              }}
              className="text-[11px] text-[#bda4da] hover:text-[#7a3dbf] transition-colors"
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
                    <span key={i} className={i < opt.value ? "text-[#fbb321] text-[15px]" : "text-slate-200 text-[15px]"}>★</span>
                  ))}
                </div>
                <span className="text-[14px] text-[#827498]">&amp;Up</span>
              </div>
            </label>
          ))}
          <label className="flex cursor-pointer items-center gap-3">
            <CustomCheckbox 
              checked={false} 
              onChange={() => {}} 
            />
            <div className="flex items-center gap-1">
              <span className="text-[14px] text-[#bda4da]">Rating 4.0 Bays%</span>
            </div>
          </label>
        </div>
      </Section>

      {/* Reset All */}
      <div className="pt-8 space-y-6">
        <div className="relative">
          <select
            onChange={(e) => {
              if (e.target.value === "reset") clearAll();
            }}
            className="w-full appearance-none rounded-md bg-[#eaddf7] px-4 py-2.5 text-[15px] font-medium text-[#827498] focus:outline-none"
          >
            <option value="">Reset</option>
            <option value="reset">Clear All Filters</option>
          </select>
          <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#827498]" />
        </div>

        <Link
          href="/products"
          className="flex items-center gap-2.5 text-[15px] font-medium text-[#827498] hover:text-[#7a3dbf] transition-colors px-1"
        >
          <Folder size={18} className="text-[#827498]" />
          Continue Shopping
        </Link>
      </div>
    </aside>
  );
}
