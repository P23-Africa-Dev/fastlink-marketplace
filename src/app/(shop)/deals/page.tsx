"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Tag, ShoppingCart } from "lucide-react";
import { useDeals } from "@/hooks/use-catalog";

export default function DealsPage() {
  const { data } = useDeals();
  const deals = data?.data ?? [];
  return (
    <div className="bg-[#EADBF8] min-h-screen pb-16">
      {/* ── 1. Full-Width Hero Section ───────────────────────────────────── */}
      <section className="relative w-full overflow-hidden bg-gradient-to-r from-[#6D349F] via-[#7E37C9] to-[#52237A] py-10 sm:py-14 text-white shadow-md">
        <div className="container-wide relative z-10">
          <div className="mb-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-200 hover:text-white transition-colors bg-white/10 px-3 py-1.5 rounded-lg border border-white/20"
            >
              <ArrowLeft size={14} />
              <span>Back to Homepage</span>
            </Link>
          </div>

          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight font-montserrat mb-3">
              Deals of the Day
            </h1>
            <p className="text-sm sm:text-base text-purple-100 font-medium">
              Exclusive limited-time discounts on electronics, gaming, audio, and household appliances.
            </p>
          </div>
        </div>
      </section>

      {/* ── 2. Deals Grid (Matching Homepage Card Design) ───────────────────── */}
      <section className="container-wide py-10">
        <div className="flex items-center gap-2.5 border-b border-[#D8C2EF] pb-3 mb-6">
          <Tag size={22} className="text-[#6D349F] shrink-0" />
          <h2 className="text-xl sm:text-2xl font-bold text-[#6D349F] font-montserrat">
            All Deals of the Day
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {deals.map((deal) => (
            <Link
              key={deal.id}
              href={deal.href}
              className="group flex flex-col justify-between overflow-hidden rounded-2xl bg-[#F6EFFD] shadow-sm border border-white/60 transition-transform duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <div>
                {/* Product image */}
                <div className="relative aspect-square w-full overflow-hidden bg-purple-100">
                  {deal.image ? (
                    <Image
                      src={deal.image}
                      alt={deal.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[#6D349F]/40">
                      <Tag size={32} />
                    </div>
                  )}
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
      </section>
    </div>
  );
}
