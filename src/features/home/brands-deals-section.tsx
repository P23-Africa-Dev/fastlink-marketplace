"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, ChevronLeft, ShoppingCart } from "lucide-react";
import type { BrandPartner } from "@/mocks/stores-data";
import {
  useBrands,
  useDeals,
  useEmergingVendors,
  useNationwideStores,
} from "@/hooks/use-catalog";

// ── Shared: section header ─────────────────────────────────────

function SectionHeader({
  title,
  seeMoreHref,
  onPrev,
  onNext,
  hideSeeMore = false,
}: {
  title: string;
  seeMoreHref?: string;
  onPrev?: () => void;
  onNext?: () => void;
  hideSeeMore?: boolean;
}) {
  return (
    <div className="mb-6 flex items-center justify-between gap-2 sm:gap-4 overflow-hidden w-full">
      <h2 className="text-base sm:text-xl md:text-2xl font-extrabold text-[#6D349F] font-montserrat truncate min-w-0">
        {title}
      </h2>
      <div className="hidden md:block h-[1px] flex-1 bg-[#D8C2EF]"></div>
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {onPrev && onNext && (
          <div className="flex items-center gap-1 sm:gap-1.5">
            <button
              onClick={onPrev}
              aria-label="Scroll left"
              className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-white/80 border border-purple-200 text-[#6D349F] transition-all hover:bg-[#6D349F] hover:text-white shadow-xs"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={onNext}
              aria-label="Scroll right"
              className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-white/80 border border-purple-200 text-[#6D349F] transition-all hover:bg-[#6D349F] hover:text-white shadow-xs"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
        {!hideSeeMore && seeMoreHref && (
          <Link
            href={seeMoreHref}
            className="flex items-center gap-0.5 sm:gap-1 text-xs sm:text-sm font-bold text-[#6D349F] transition-colors hover:text-[#5a2a83] shrink-0"
          >
            <span>See More</span>
            <ChevronRight size={14} />
          </Link>
        )}
      </div>
    </div>
  );
}

// ── Brand logo / wordmark ──────────────────────────────────────

function BrandWordmark({ brand }: { brand: BrandPartner }) {
  const colorMap: Record<NonNullable<BrandPartner["style"]>, string> = {
    "blue-bold": "font-extrabold text-blue-700",
    black:       "font-extrabold text-neutral-900",
    orange:      "font-bold text-neutral-800",
    default:     "font-semibold text-neutral-700",
  };
  const cls = colorMap[brand.style ?? "default"];

  if (brand.style === "orange") {
    return (
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#FF6900] text-sm font-black text-white">
          mi
        </span>
        <span className={`text-base ${cls}`}>{brand.name}</span>
      </div>
    );
  }

  if (brand.name === "Unilever") {
    return (
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-blue-800 text-sm font-black text-blue-800">
          U
        </span>
        <span className={`text-base font-semibold text-blue-800`}>{brand.name}</span>
      </div>
    );
  }

  if (brand.name === "NIKE") {
    return (
      <svg viewBox="0 0 100 36" className="h-7 w-auto text-neutral-900" aria-label="Nike" fill="currentColor">
        <path d="M96.49,4.43C93.67,7.37,88.54,10,83.86,11.13L16.46,31.57C11.2,33.13,6.44,33.75,3.31,32.92A8.31,8.31,0,0,1,.13,30.8a6.07,6.07,0,0,1-.1-6.31c1.34-2.5,4-4.71,7.84-6.38l.07.1c-2.93,1.93-4.7,4.08-4.91,6a3.81,3.81,0,0,0,1.56,3.42c2.43,1.91,7.24,1.81,13.25.15L81.94,7.58a32.5,32.5,0,0,0,8.31-4A9.48,9.48,0,0,0,93.8,0l.12,0A8.09,8.09,0,0,1,96.49,4.43Z"/>
      </svg>
    );
  }

  return <span className={`text-base ${cls}`}>{brand.name}</span>;
}

// ── Main component ─────────────────────────────────────────────

export function BrandsDealsSection() {
  const brandSliderRef = useRef<HTMLDivElement>(null);
  const vendorsSliderRef = useRef<HTMLDivElement>(null);
  const dealsSliderRef = useRef<HTMLDivElement>(null);
  const { data: brandsRes } = useBrands();
  const { data: nationwideRes } = useNationwideStores();
  const { data: vendorsRes } = useEmergingVendors();
  const { data: dealsRes } = useDeals();
  const brands = brandsRes?.data ?? [];
  const nationwide = nationwideRes?.data ?? [];
  const vendors = vendorsRes?.data ?? [];
  const deals = dealsRes?.data ?? [];

  // Auto-scroll Brand Partners slider every 1.8s
  useEffect(() => {
    const slider = brandSliderRef.current;
    if (!slider) return;

    const interval = setInterval(() => {
      if (slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - 10) {
        slider.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        slider.scrollBy({ left: 220, behavior: "smooth" });
      }
    }, 1800);

    return () => clearInterval(interval);
  }, []);

  const scrollBrands = (direction: "left" | "right") => {
    if (brandSliderRef.current) {
      const scrollAmount = direction === "left" ? -240 : 240;
      brandSliderRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const scrollVendors = (direction: "left" | "right") => {
    if (vendorsSliderRef.current) {
      const scrollAmount = direction === "left" ? -300 : 300;
      vendorsSliderRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const scrollDeals = (direction: "left" | "right") => {
    if (dealsSliderRef.current) {
      const scrollAmount = direction === "left" ? -300 : 300;
      dealsSliderRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="bg-[#EADBF8] pb-12">
      <div className="container-wide space-y-12 py-8">

        {/* ① Official Retail & Brand Partners ──────────────────── */}
        <div>
          <SectionHeader
            title="Official Retail & Brand Partners"
            seeMoreHref="/brands"
            onPrev={() => scrollBrands("left")}
            onNext={() => scrollBrands("right")}
          />

          <div className="overflow-hidden rounded-xl bg-[#F6EFFD] shadow-sm border border-purple-100/80">
            <div
              ref={brandSliderRef}
              className="flex items-center divide-x divide-[#ECD7F8] overflow-x-auto scroll-smooth scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              {brands.map((brand) => (
                <Link
                  key={brand.id}
                  href={brand.href}
                  className="flex min-w-[150px] sm:min-w-[180px] flex-shrink-0 items-center justify-center px-6 py-5 transition-colors hover:bg-white/60"
                >
                  <BrandWordmark brand={brand} />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ② Nationwide Brand Stores ───────────────────────────── */}
        <div>
          <SectionHeader
            title="Nationwide Brand Stores"
            hideSeeMore
          />

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {nationwide.map((brand) => (
              <Link
                key={brand.id}
                href={brand.href}
                className="group flex flex-col justify-center rounded-2xl bg-[#F6EFFD] p-5 shadow-sm border border-white/60 transition-transform hover:-translate-y-1"
              >
                <span className="text-lg font-extrabold text-[#6D349F]">
                  {brand.name}
                </span>
                <span className="mt-1 text-sm text-[#8A79A5]">{brand.tagline}</span>
              </Link>
            ))}
          </div>
        </div>

      </div>

      {/* ③ Verified Emerging Vendors — Full Width Bleeding Right Slider ───── */}
      <div className="w-full bg-[#EADBF8] pb-8 overflow-hidden">
        <div className="container-wide">
          <SectionHeader
            title="Verified Emerging Vendors"
            seeMoreHref="/emerging-vendors"
            onPrev={() => scrollVendors("left")}
            onNext={() => scrollVendors("right")}
          />
        </div>

        <div className="w-full">
          <div
            ref={vendorsSliderRef}
            className="flex items-stretch gap-4 overflow-x-auto scroll-smooth scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-3 w-full pl-4 sm:pl-6 lg:pl-[calc(max(1rem,(100vw-80rem)/2+2rem))] pr-4 sm:pr-8 md:pr-12"
          >
            {vendors.map((vendor) => (
              <Link
                key={vendor.id}
                href={vendor.href}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl bg-[#F6EFFD] shadow-sm border border-white/60 w-[240px] sm:w-[265px] md:w-[285px] shrink-0 transition-transform duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <div>
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-purple-100">
                    <Image
                      src={vendor.image}
                      alt={vendor.name}
                      fill
                      sizes="(max-width: 640px) 240px, 285px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <p className="font-bold text-[#6D349F] font-montserrat truncate group-hover:text-[#52237A] transition-colors">
                      {vendor.name}
                    </p>
                    <p className="mt-0.5 text-xs text-[#8A79A5] font-medium truncate">
                      {vendor.category}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ④ Deals of the Day — Full Width Bleeding Right Slider ─────────── */}
      <div className="w-full bg-[#EADBF8] pt-4 overflow-hidden">
        <div className="container-wide">
          <SectionHeader
            title="Deals of the Day"
            seeMoreHref="/deals"
            onPrev={() => scrollDeals("left")}
            onNext={() => scrollDeals("right")}
          />
        </div>

        {/* Bleeds all the way to the right edge of screen */}
        <div className="w-full">
          <div
            ref={dealsSliderRef}
            className="flex items-stretch gap-4 overflow-x-auto scroll-smooth scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-3 w-full pl-4 sm:pl-6 lg:pl-[calc(max(1rem,(100vw-80rem)/2+2rem))] pr-4 sm:pr-8 md:pr-12"
          >
            {deals.map((deal) => (
              <Link
                key={deal.id}
                href={deal.href}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl bg-[#F6EFFD] shadow-sm border border-white/60 w-[240px] sm:w-[265px] md:w-[285px] shrink-0 transition-transform duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <div>
                  {/* Product image */}
                  <div className="relative aspect-square w-full overflow-hidden bg-purple-100">
                    <Image
                      src={deal.image}
                      alt={deal.name}
                      fill
                      sizes="(max-width: 640px) 240px, 285px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Top Right Pill Tag */}
                    <div className="absolute right-2.5 top-2.5 rounded-full bg-white/90 backdrop-blur px-3 py-1 text-[10px] font-bold text-[#6D349F] shadow-sm">
                      {deal.category}
                    </div>
                  </div>

                  {/* Product info */}
                  <div className="p-3.5 space-y-1.5">
                    <p className="truncate text-sm font-bold text-[#6D349F] font-montserrat">
                      {deal.name}
                    </p>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1">
                        <svg
                          className="h-3.5 w-3.5 text-amber-400 fill-amber-400"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="font-bold text-[#6D349F]">{deal.rating}</span>
                        <span className="text-[10px] text-[#8A79A5]">({deal.reviews} Reviews)</span>
                      </div>
                      <span className="font-bold text-[#6D349F]">
                        {deal.discount}% Off
                      </span>
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="p-3.5 pt-0 grid grid-cols-2 gap-2">
                  <button className="flex items-center justify-center gap-1 rounded-full border border-[#6D349F] py-2 px-1 text-[10px] sm:text-[11px] font-bold text-[#6D349F] transition-colors hover:bg-purple-100/50">
                    <span>ADD TO CARD</span>
                    <ShoppingCart size={11} className="hidden sm:inline" />
                  </button>
                  <button className="flex items-center justify-center rounded-full bg-[#6D349F] py-2 px-1 text-[10px] sm:text-[11px] font-bold text-white transition-colors hover:bg-[#5a2a83]">
                    VIEW NOW
                  </button>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
