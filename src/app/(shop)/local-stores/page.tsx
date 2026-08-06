"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Clock,
  Store as StoreIcon,
  ArrowLeft,
  Building2,
  ChevronLeft,
  ChevronRight,
  Search,
  RotateCcw,
} from "lucide-react";
import { KANO_MALLS, LOCAL_STORES_NEAR_YOU } from "@/mocks/stores-data";

const ITEMS_PER_PAGE = 8;

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
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Handle Tab Switch
  const handleTabChange = (tab: "stores" | "malls") => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  // Handle Search Input Change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  // Filtered Stores
  const filteredStores = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return LOCAL_STORES_NEAR_YOU;
    return LOCAL_STORES_NEAR_YOU.filter(
      (store) =>
        store.name.toLowerCase().includes(q) ||
        store.category.toLowerCase().includes(q) ||
        store.location.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Filtered Malls
  const filteredMalls = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return KANO_MALLS;
    return KANO_MALLS.filter(
      (mall) =>
        mall.name.toLowerCase().includes(q) ||
        (mall.location && mall.location.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  // Active items based on current tab
  const currentFilteredList = activeTab === "stores" ? filteredStores : filteredMalls;
  const totalItems = currentFilteredList.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));

  // Current page items
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return currentFilteredList.slice(start, start + ITEMS_PER_PAGE);
  }, [currentFilteredList, currentPage]);

  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endIndex = Math.min(currentPage * ITEMS_PER_PAGE, totalItems);

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
                onClick={() => handleTabChange("stores")}
                className={`rounded-lg px-7 py-2.5 text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                  activeTab === "stores"
                    ? "bg-[#6D349F] text-white shadow-sm"
                    : "text-[#6D349F] hover:bg-white/50"
                }`}
              >
                Local Stores ({filteredStores.length})
              </button>
              <button
                onClick={() => handleTabChange("malls")}
                className={`rounded-lg px-7 py-2.5 text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                  activeTab === "malls"
                    ? "bg-[#6D349F] text-white shadow-sm"
                    : "text-[#6D349F] hover:bg-white/50"
                }`}
              >
                Malls ({filteredMalls.length})
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Content Container ─────────────────────────────────────────── */}
      <div className="container-wide py-10 space-y-8">

        {/* ── Search & Header Bar ────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#F2E7FC] p-4 sm:p-5 rounded-2xl border border-white/60 shadow-sm">
          
          <div className="flex items-center gap-3">
            {activeTab === "stores" ? (
              <StoreIcon size={24} className="text-[#6D349F] shrink-0" />
            ) : (
              <Building2 size={24} className="text-[#6D349F] shrink-0" />
            )}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#6D349F] font-montserrat">
                {activeTab === "stores" ? "Local Stores in Kano" : "Malls in Kano"}
              </h2>
              <p className="text-xs text-[#8A79A5]">
                {activeTab === "stores"
                  ? "Explore nearby supermarkets, pharmacies, electronics & fashion hubs"
                  : "Explore popular shopping plazas and commercial malls"}
              </p>
            </div>
          </div>

          {/* Search Input Box matching Homepage style */}
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex items-center rounded-xl bg-white p-1 border border-[#E4D1F7] shadow-2xs w-full md:w-auto"
          >
            <div className="flex items-center flex-1 px-3 py-1 gap-2">
              <Search size={16} className="text-[#8A79A5] shrink-0" />
              <input
                type="text"
                placeholder={activeTab === "stores" ? "Search stores, location..." : "Search malls, location..."}
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full md:w-56 bg-transparent text-xs sm:text-sm text-[#411266] placeholder:text-[#C5B5DF] focus:outline-none font-medium"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold text-xs px-5 py-2 transition-all shadow-2xs active:scale-95 cursor-pointer shrink-0"
            >
              Search
            </button>
          </form>

        </div>

        {/* ── STORES TAB CONTENT ───────────────────────────────────────────── */}
        {activeTab === "stores" && (
          <section className="space-y-6">
            {paginatedItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {(paginatedItems as typeof LOCAL_STORES_NEAR_YOU).map((store) => (
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
            ) : (
              <div className="bg-[#F2E7FC] rounded-2xl p-10 text-center space-y-3 border border-white/60">
                <p className="text-base font-bold text-[#6D349F]">No local stores found matching &quot;{searchQuery}&quot;</p>
                <p className="text-xs text-[#8A79A5]">Try searching for a different store name or location.</p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#6D349F] text-white px-4 py-2 text-xs font-bold shadow-sm hover:bg-[#572783] transition-all cursor-pointer"
                >
                  <RotateCcw size={14} />
                  <span>Clear Search</span>
                </button>
              </div>
            )}
          </section>
        )}

        {/* ── MALLS TAB CONTENT ────────────────────────────────────────────── */}
        {activeTab === "malls" && (
          <section className="space-y-6">
            {paginatedItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {(paginatedItems as typeof KANO_MALLS).map((mall) => (
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
            ) : (
              <div className="bg-[#F2E7FC] rounded-2xl p-10 text-center space-y-3 border border-white/60">
                <p className="text-base font-bold text-[#6D349F]">No malls found matching &quot;{searchQuery}&quot;</p>
                <p className="text-xs text-[#8A79A5]">Try searching for a different mall name or area.</p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#6D349F] text-white px-4 py-2 text-xs font-bold shadow-sm hover:bg-[#572783] transition-all cursor-pointer"
                >
                  <RotateCcw size={14} />
                  <span>Clear Search</span>
                </button>
              </div>
            )}
          </section>
        )}

        {/* ── PAGINATION CONTROLS ────────────────────────────────────────── */}
        {totalItems > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#F2E7FC] px-6 py-4 rounded-2xl border border-white/60 shadow-xs pt-4">
            
            {/* Status text */}
            <p className="text-xs font-semibold text-[#8A79A5]">
              Showing <span className="text-[#6D349F] font-bold">{startIndex}</span> to{" "}
              <span className="text-[#6D349F] font-bold">{endIndex}</span> of{" "}
              <span className="text-[#6D349F] font-bold">{totalItems}</span> {activeTab === "stores" ? "stores" : "malls"}
            </p>

            {/* Pagination buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-[#6D349F] border border-white/80 shadow-2xs hover:bg-[#E4D1F7] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <ChevronLeft size={16} />
                <span>Prev</span>
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`h-8 w-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      currentPage === pageNum
                        ? "bg-[#6D349F] text-white shadow-xs"
                        : "bg-white text-[#6D349F] hover:bg-[#E4D1F7] border border-white/80"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-[#6D349F] border border-white/80 shadow-2xs hover:bg-[#E4D1F7] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
