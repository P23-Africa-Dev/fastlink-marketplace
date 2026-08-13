"use client";

import Link from "next/link";
import { ArrowLeft, Building2 } from "lucide-react";
import { useNationwideStores } from "@/hooks/use-catalog";

export default function NationwideStoresPage() {
  const { data } = useNationwideStores();
  const stores = data?.data ?? [];
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
              Nationwide Brand Stores
            </h1>
            <p className="text-sm sm:text-base text-purple-100 font-medium">
              Discover top stores offering fast 3-5 day nationwide shipping across Nigeria.
            </p>
          </div>
        </div>
      </section>

      {/* ── 2. Stores Grid (Matching Homepage Card Design) ───────────────────── */}
      <section className="container-wide py-10">
        <div className="flex items-center gap-2.5 border-b border-[#D8C2EF] pb-3 mb-6">
          <Building2 size={22} className="text-[#6D349F] shrink-0" />
          <h2 className="text-xl sm:text-2xl font-bold text-[#6D349F] font-montserrat">
            All Nationwide Brands
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {stores.map((brand) => (
            <Link
              key={brand.id}
              href={brand.href}
              className="group flex flex-col justify-center rounded-2xl bg-[#F6EFFD] p-5 shadow-sm border border-white/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <span className="text-lg font-extrabold text-[#6D349F] font-montserrat group-hover:text-[#52237A] transition-colors">
                {brand.name}
              </span>
              <span className="mt-1 text-sm text-[#8A79A5] font-medium">{brand.tagline}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
