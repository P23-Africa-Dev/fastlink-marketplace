"use client";

interface CategoryTab {
  slug: string;
  label: string;
  count?: number;
}

interface CategoryTabsProps {
  tabs: CategoryTab[];
  activeSlug: string;
  onChange: (slug: string) => void;
}

export function CategoryTabs({ tabs, activeSlug, onChange }: CategoryTabsProps) {
  return (
    <div className="inline-flex flex-wrap items-center gap-1 rounded-xl bg-[#F2E7FC] p-1.5 shadow-sm border border-white/60">
      {tabs.map((tab) => (
        <button
          key={tab.slug}
          type="button"
          onClick={() => onChange(tab.slug)}
          className={`rounded-lg px-4 sm:px-7 py-2.5 text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${
            activeSlug === tab.slug
              ? "bg-[#6D349F] text-white shadow-sm"
              : "text-[#6D349F] hover:bg-white/50"
          }`}
        >
          {tab.label}
          {tab.count !== undefined ? ` (${tab.count})` : ""}
        </button>
      ))}
    </div>
  );
}
