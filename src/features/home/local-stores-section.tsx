"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronRight,
  Store as StoreIcon,
  LayoutGrid,
  Smartphone,
  Shirt,
  Home,
  Sparkles,
  HeartPulse,
  ShoppingBag,
} from "lucide-react";
import { MallCard } from "@/components/marketplace/mall-card";
import { useCategories, useMalls } from "@/hooks/use-catalog";

const CATEGORY_ICONS: Record<string, typeof Smartphone> = {
  electronics: Smartphone,
  "home-living": Home,
  fashion: Shirt,
  beauty: Sparkles,
  health: HeartPulse,
  groceries: ShoppingBag,
};

function SectionHeader({
  icon,
  title,
  seeMoreHref,
}: {
  icon: React.ReactNode;
  title: string;
  seeMoreHref: string;
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="flex items-center gap-2.5 text-lg sm:text-xl font-bold text-[#6D349F] font-montserrat">
        {icon}
        {title}
      </h2>
      <Link
        href={seeMoreHref}
        className="flex items-center gap-1 text-sm font-medium text-[#8A79A5] transition-colors hover:text-[#6D349F]"
      >
        See More
        <ChevronRight size={16} />
      </Link>
    </div>
  );
}

export function LocalStoresSection() {
  const [location, setLocation] = useState("");
  const { data: mallsPage } = useMalls({ limit: 4 });
  const { data: categoriesRes } = useCategories();
  const featuredMalls = mallsPage?.data ?? [];
  const categories = (categoriesRes?.data ?? []).filter((cat) => cat.slug !== "books");

  return (
    <div className="bg-[#EADBF8] py-10">
      <div className="container-wide space-y-10">
        <div>
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <StoreIcon size={24} className="text-[#6D349F] shrink-0" />

              <form
                onSubmit={(e) => e.preventDefault()}
                className="flex items-center rounded-xl bg-white p-1 border border-[#E4D1F7] shadow-2xs"
              >
                <input
                  type="text"
                  placeholder="Enter Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-28 sm:w-36 md:w-40 bg-transparent px-3 py-1 text-xs text-[#411266] placeholder:text-[#C5B5DF] focus:outline-none font-medium"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold text-xs px-4 py-1.5 transition-all shadow-2xs active:scale-95 cursor-pointer"
                >
                  Search
                </button>
              </form>

              <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold text-[#6D349F] font-montserrat tracking-tight">
                Malls in Kano
              </h2>
            </div>

            <Link
              href="/malls"
              className="flex items-center gap-1 text-sm font-medium text-[#8A79A5] transition-colors hover:text-[#6D349F] shrink-0"
            >
              See More
              <ChevronRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3.5 md:grid-cols-4">
            {featuredMalls.map((mall) => (
              <MallCard key={mall.id} mall={mall} />
            ))}
          </div>
        </div>

        <div>
          <SectionHeader
            icon={<LayoutGrid size={22} className="text-[#6D349F] shrink-0" />}
            title="Shop By Catagory"
            seeMoreHref="/categories"
          />

          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-5">
            {categories.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.slug] ?? LayoutGrid;
              return (
                <Link
                  key={cat.id}
                  href={`/products?category=${encodeURIComponent(cat.name)}`}
                  className="group overflow-hidden rounded-2xl border border-white/60 bg-[#F6EFFD] p-2 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-purple-100">
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  <div className="flex items-center gap-2 px-2 pt-3 pb-1">
                    <Icon size={18} className="text-[#6D349F] shrink-0" />
                    <span className="text-sm font-bold text-[#6D349F] font-montserrat">
                      {cat.name}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
