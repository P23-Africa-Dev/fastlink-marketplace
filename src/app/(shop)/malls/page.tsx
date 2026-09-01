"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Search,
} from "lucide-react";
import { MallCard } from "@/components/marketplace/mall-card";
import { DynamicHero } from "@/components/marketplace/dynamic-hero";
import { useMalls } from "@/hooks/use-catalog";

const ITEMS_PER_PAGE = 8;

export default function MallsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { data: mallsPage } = useMalls({ limit: 50 });
  const malls = mallsPage?.data ?? [];

  const filteredMalls = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return malls;
    return malls.filter(
      (mall) =>
        mall.name.toLowerCase().includes(q) ||
        (mall.location && mall.location.toLowerCase().includes(q))
    );
  }, [searchQuery, malls]);

  const totalItems = filteredMalls.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));

  const paginatedMalls = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredMalls.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredMalls, currentPage]);

  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endIndex = Math.min(currentPage * ITEMS_PER_PAGE, totalItems);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  return (
    <div className="bg-[#EADBF8] min-h-screen pb-16">
      <DynamicHero
        title="Malls in Kano"
        subtitle={
          <>
            <p className="text-lg sm:text-xl font-bold mb-2">
              Browse shopping malls near you
            </p>
            <p>
              Select a mall to explore stores, filter by category, and shop products from verified local vendors.
            </p>
          </>
        }
        backgroundImage={malls[0]?.image || undefined}
        backLink="/"
        backLabel="Back to Homepage"
      />

      <div className="container-wide py-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#F2E7FC] p-4 sm:p-5 rounded-2xl border border-white/60 shadow-sm">
          <div className="flex items-center gap-3">
            <Building2 size={24} className="text-[#6D349F] shrink-0" />
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#6D349F] font-montserrat">
                All Malls
              </h2>
              <p className="text-xs text-[#8A79A5]">
                Explore popular shopping plazas and commercial malls
              </p>
            </div>
          </div>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex items-center rounded-xl bg-white p-1 border border-[#E4D1F7] shadow-2xs w-full md:w-auto"
          >
            <div className="flex items-center flex-1 px-3 py-1 gap-2">
              <Search size={16} className="text-[#8A79A5] shrink-0" />
              <input
                type="text"
                placeholder="Search malls, location..."
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

        {paginatedMalls.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {paginatedMalls.map((mall) => (
              <MallCard key={mall.id} mall={mall} variant="detailed" />
            ))}
          </div>
        ) : (
          <div className="bg-[#F2E7FC] rounded-2xl p-10 text-center space-y-3 border border-white/60">
            <p className="text-base font-bold text-[#6D349F]">
              No malls found matching &quot;{searchQuery}&quot;
            </p>
            <p className="text-xs text-[#8A79A5]">
              Try searching for a different mall name or area.
            </p>
            <button
              type="button"
              onClick={() => handleSearchChange("")}
              className="inline-flex items-center gap-2 rounded-xl bg-[#6D349F] text-white px-4 py-2 text-xs font-bold shadow-sm hover:bg-[#572783] transition-all cursor-pointer"
            >
              <RotateCcw size={14} />
              <span>Clear Search</span>
            </button>
          </div>
        )}

        {totalItems > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#F2E7FC] px-6 py-4 rounded-2xl border border-white/60 shadow-xs">
            <p className="text-xs font-semibold text-[#8A79A5]">
              Showing <span className="text-[#6D349F] font-bold">{startIndex}</span> to{" "}
              <span className="text-[#6D349F] font-bold">{endIndex}</span> of{" "}
              <span className="text-[#6D349F] font-bold">{totalItems}</span> malls
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
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
                    type="button"
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
                type="button"
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
