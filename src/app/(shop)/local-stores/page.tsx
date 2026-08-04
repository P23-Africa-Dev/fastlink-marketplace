"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Clock, Store as StoreIcon, ArrowLeft, Building2 } from "lucide-react";
import { KANO_MALLS, LOCAL_STORES_NEAR_YOU } from "@/mocks/stores-data";

function TargetIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#6D349F"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
    >
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export default function LocalStoresPage() {
  const [activeTab, setActiveTab] = useState<"stores" | "malls">("stores");

  return (
    <div className="bg-[#EADBF8] min-h-screen pb-16">
      {/* ── 1. Full-Width Hero Banner Section ───────────────────────────────────── */}
      <section className="relative w-full overflow-hidden bg-gradient-to-r from-[#EADBF8] via-[#E4D1F7] to-[#EADBF8] border-b border-[#D8C2EFA0] py-10 sm:py-14">
        {/* Background Mall Image with overlay */}
        <div className="absolute inset-0 z-0 pointer-events-none select-none">
          <Image
            src="https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=1600&auto=format&fit=crop"
            alt="Local stores banner"
            fill
            priority
            className="object-cover object-right opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#EADBF8] via-[#EADBF8]/95 to-transparent" />
        </div>

        <div className="container-wide relative z-10">
          {/* Back to Homepage button */}
          <div className="mb-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6D349F] hover:text-[#52237A] transition-colors bg-white/60 px-3.5 py-1.5 rounded-lg border border-white/80 shadow-xs"
            >
              <ArrowLeft size={14} />
              <span>Back to Homepage</span>
            </Link>
          </div>

          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#6D349F] tracking-tight font-montserrat mb-3">
              Local Stores &amp; Malls
            </h1>
            <p className="text-lg sm:text-xl font-bold text-[#6D349F] mb-2">
              Discover stores and malls near you
            </p>
            <p className="text-xs sm:text-sm text-[#8A79A5] leading-relaxed max-w-xl mb-6">
              Find trusted local stores and top malls in Kano. Shop electronics, fashion, groceries and more.
            </p>

            {/* Filter Toggle Tabs */}
            <div className="inline-flex items-center rounded-xl bg-[#F2E7FC] p-1.5 shadow-sm border border-white/60">
              <button
                onClick={() => setActiveTab("stores")}
                className={`rounded-lg px-7 py-2.5 text-xs sm:text-sm font-bold transition-all duration-200 ${
                  activeTab === "stores"
                    ? "bg-[#6D349F] text-white shadow-sm"
                    : "text-[#6D349F] hover:bg-white/50"
                }`}
              >
                Local Stores
              </button>
              <button
                onClick={() => setActiveTab("malls")}
                className={`rounded-lg px-7 py-2.5 text-xs sm:text-sm font-bold transition-all duration-200 ${
                  activeTab === "malls"
                    ? "bg-[#6D349F] text-white shadow-sm"
                    : "text-[#6D349F] hover:bg-white/50"
                }`}
              >
                Malls
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Content Container ─────────────────────────────────────────── */}
      <div className="container-wide py-10 space-y-12">
        {/* ── STORES TAB CONTENT ───────────────────────────────────────────── */}
        {activeTab === "stores" && (
          <section className="space-y-4">
            <div className="flex items-center gap-2.5 border-b border-[#D8C2EF] pb-3">
              <StoreIcon size={22} className="text-[#6D349F] shrink-0" />
              <h2 className="text-xl sm:text-2xl font-bold text-[#6D349F] font-montserrat">
                Local Stores Near you
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {LOCAL_STORES_NEAR_YOU.map((store) => (
                <Link
                  key={store.id}
                  href={`/stores/${store.slug}`}
                  className="group overflow-hidden rounded-2xl border border-white/60 bg-[#F2E7FC] p-3 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md flex flex-col justify-between"
                >
                  <div>
                    {/* Store Image */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-purple-100 mb-3">
                      <Image
                        src={store.image}
                        alt={store.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>

                    {/* Store Info */}
                    <div className="space-y-1 px-1">
                      <h3 className="text-base font-bold text-[#6D349F] truncate font-montserrat">
                        {store.name}
                      </h3>
                      <p className="text-xs text-[#8A79A5] font-medium">
                        {store.category}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-[#8A79A5] pt-1">
                        <MapPin size={13} className="text-[#6D349F] shrink-0" />
                        <span className="truncate">{store.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Tag */}
                  <div className="mt-4 pt-2 border-t border-[#E4D1F7]">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-[#E4D1F7] px-3 py-1 text-[11px] font-bold text-[#6D349F]">
                      <Clock size={12} className="text-[#6D349F]" />
                      <span>{store.deliveryTag}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── MALLS TAB CONTENT ────────────────────────────────────────────── */}
        {activeTab === "malls" && (
          <section className="space-y-4">
            <div className="flex items-center gap-2.5 border-b border-[#D8C2EF] pb-3">
              <Building2 size={22} className="text-[#6D349F] shrink-0" />
              <h2 className="text-xl sm:text-2xl font-bold text-[#6D349F] font-montserrat">
                Malls in Kano
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3.5 md:grid-cols-4">
              {KANO_MALLS.map((mall) => (
                <Link
                  key={mall.id}
                  href={`/stores/${mall.slug}`}
                  className="group overflow-hidden rounded-2xl border border-white/60 bg-[#F2E7FC] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                >
                  {/* Mall image */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-purple-100">
                    <Image
                      src={mall.image}
                      alt={mall.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  {/* Mall info bar matching homepage cards */}
                  <div className="flex items-center justify-between bg-[#F2E7FC] px-3.5 py-3 border-t border-[#E4D1F7]">
                    <div className="flex items-center gap-2 min-w-0">
                      <TargetIcon />
                      <span className="truncate text-sm font-bold text-[#6D349F] font-montserrat">
                        {mall.name}
                      </span>
                    </div>
                    {mall.location && (
                      <span className="ml-2 shrink-0 text-[10px] font-medium text-[#A093B5]">
                        {mall.location}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
