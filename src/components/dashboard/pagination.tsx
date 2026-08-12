"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  itemName?: string;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50],
  itemName = "records",
  className,
}: PaginationProps) {
  const effectiveTotalPages = Math.max(1, totalPages);
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers array with intelligent ellipsis logic
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (effectiveTotalPages <= maxVisible + 2) {
      for (let i = 1; i <= effectiveTotalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(effectiveTotalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < effectiveTotalPages - 2) {
        pages.push("...");
      }

      pages.push(effectiveTotalPages);
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 pt-4 select-none",
        className
      )}
    >
      {/* Item Counter & Optional Page Size Selector */}
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-xs font-normal text-slate-400 whitespace-nowrap">
          Showing <span className="font-semibold text-slate-700">{startItem}-{endItem}</span> of{" "}
          <span className="font-semibold text-slate-700">{totalItems.toLocaleString()}</span> {itemName}
        </p>

        {onPageSizeChange && pageSizeOptions.length > 0 && (
          <div className="flex items-center gap-1 text-xs font-semibold text-slate-500 pl-2 border-l border-slate-200">
            <span className="hidden sm:inline text-slate-400 font-normal">Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="bg-[#faf6ff] border border-[#ebd7fa] rounded-lg px-2 py-1 text-xs font-semibold text-[#7a3dbf] focus:outline-none cursor-pointer"
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Page Navigation Controls */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          className="p-2 rounded-xl border border-[#ebd7fa] text-slate-600 hover:bg-[#faf6ff] hover:text-[#7a3dbf] disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-600 transition-colors"
          title="Previous Page"
          aria-label="Previous Page"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Numeric Page Buttons */}
        {pages.map((p, idx) => {
          if (p === "...") {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="h-8 w-8 flex items-center justify-center text-xs font-semibold text-slate-400"
              >
                …
              </span>
            );
          }

          const pageNum = p as number;
          const isActive = pageNum === currentPage;

          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={cn(
                "h-8 min-w-[2rem] px-2 rounded-xl flex items-center justify-center font-semibold text-xs transition-all",
                isActive
                  ? "bg-[#7a3dbf] text-white shadow-sm shadow-purple-500/20"
                  : "border border-[#ebd7fa] text-slate-700 hover:bg-[#faf6ff] hover:text-[#7a3dbf]"
              )}
            >
              {pageNum}
            </button>
          );
        })}

        {/* Next Button */}
        <button
          onClick={() => onPageChange(Math.min(effectiveTotalPages, currentPage + 1))}
          disabled={currentPage >= effectiveTotalPages}
          className="p-2 rounded-xl border border-[#ebd7fa] text-slate-600 hover:bg-[#faf6ff] hover:text-[#7a3dbf] disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-600 transition-colors"
          title="Next Page"
          aria-label="Next Page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
