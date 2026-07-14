"use client";

import * as React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function ArrowLeftToLine() {
  return (
    <svg
      className="h-4.5 w-4.5 stroke-[1.5]"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 6v12M18 12H8m0 0l5-5m-5 5l5 5"
      />
    </svg>
  );
}

function ArrowRightToLine() {
  return (
    <svg
      className="h-4.5 w-4.5 stroke-[1.5]"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18 6v12M6 12h10m0 0l-5-5m5 5l-5 5"
      />
    </svg>
  );
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="w-full border-t border-[#dbdaea] pt-6 flex items-center justify-between mt-12 font-['Montserrat'] select-none">
      {/* Previous Button */}
      <button
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`flex items-center gap-2 text-[14px] font-medium transition-all duration-300 focus:outline-none ${
          currentPage === 1
            ? "text-[#505574]/40 cursor-not-allowed"
            : "text-[#505574] hover:text-primary active:scale-95"
        }`}
      >
        <ArrowLeftToLine />
        <span>Previous</span>
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1.5">
        {pages.map((page) => {
          const isActive = page === currentPage;
          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`h-9 w-9 flex items-center justify-center rounded-[8px] text-[14px] transition-all duration-300 focus:outline-none ${
                isActive
                  ? "bg-[#ebe8ed] text-primary-dark font-bold shadow-sm"
                  : "text-[#505574] hover:bg-[#ebe8ed]/50 hover:text-primary font-normal active:scale-95"
              }`}
            >
              {page}
            </button>
          );
        })}
      </div>

      {/* Next Button */}
      <button
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`flex items-center gap-2 text-[14px] font-medium transition-all duration-300 focus:outline-none ${
          currentPage === totalPages
            ? "text-[#505574]/40 cursor-not-allowed"
            : "text-[#505574] hover:text-primary active:scale-95"
        }`}
      >
        <span>Next</span>
        <ArrowRightToLine />
      </button>
    </div>
  );
}

export default Pagination;
