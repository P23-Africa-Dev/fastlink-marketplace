"use client";

import * as React from "react";
import {
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  HandPlatter,
  Shirt,
  Drone,
  Armchair,
  Leaf,
  Search,
  Star,
  Store,
} from "lucide-react";

interface CategorySidebarProps {
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;
  totalCount?: number;
}

export function CategorySidebar({
  selectedCategory = "All Products",
  onSelectCategory,
  totalCount = 23,
}: CategorySidebarProps) {
  const [isAllProductOpen, setIsAllProductOpen] = React.useState(true);
  const [isNewArrivalOpen, setIsNewArrivalOpen] = React.useState(false);
  const [isBestSellerOpen, setIsBestSellerOpen] = React.useState(false);
  const [isMallsOpen, setIsMallsOpen] = React.useState(false);

  const subcategories = [
    { name: "Food & Beverages", icon: HandPlatter },
    { name: "Fashion & Apparel", icon: Shirt },
    { name: "Electronics & Gadgets", icon: Drone },
    { name: "Home & Living", icon: Armchair },
    { name: "Health & Wellness", icon: Leaf },
  ];

  // Map all navigable categories for the mobile horizontal chips
  const allCategories = [
    { name: "All Products", icon: ShoppingBag },
    ...subcategories,
    { name: "New Arrival", icon: Search },
    { name: "Best Seller", icon: Star },
    { name: "Malls", icon: Store },
  ];

  return (
    <>
      {/* MOBILE LAYOUT: Horizontal Scrollable Chips */}
      <div className="md:hidden w-full overflow-x-auto pb-4 scrollbar-none">
        <div className="flex gap-3 px-1">
          {allCategories.map((cat) => {
            const isSelected =
              selectedCategory === cat.name ||
              (selectedCategory === "All Products" && cat.name === "All Products");
            const Icon = cat.icon;

            return (
              <button
                key={cat.name}
                onClick={() => onSelectCategory?.(cat.name)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-300 ${
                  isSelected
                    ? "bg-primary text-white shadow-md scale-105"
                    : "bg-[#f4f5f8] text-[#505574] border border-surface-light hover:bg-[#ebe8ed]"
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? "text-white" : "text-[#505574]"}`} />
                <span className="text-[13px] font-semibold">{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* DESKTOP LAYOUT: Vertical Tree */}
      <aside className="hidden md:flex w-full md:w-64 flex-col gap-8 select-none">
        {/* Category Header */}
        <div>
          <h2 className="text-[34px] font-extrabold text-[#444662] tracking-tight">
            Category
          </h2>
        </div>

        <div className="flex flex-col gap-2">
          {/* All Product Dropdown */}
          <div className="flex flex-col">
            <button
              onClick={() => {
                onSelectCategory?.("All Products");
                setIsAllProductOpen(!isAllProductOpen);
              }}
              className="relative z-10 flex items-center justify-between w-full px-5 py-3.5 rounded-[12px] transition-all focus:outline-none bg-[#f4f5f8] text-[#505574] hover:bg-[#ebe8ed]"
            >
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-6 w-6 text-[#505574] stroke-[1.5]" />
                <span className="text-[17px] font-medium text-[#505574]">All Product</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-[#f84b4b] text-white rounded-[6px] text-[13px] px-2 py-[1px] font-bold shadow-sm leading-tight">
                  {totalCount}
                </span>
                {isAllProductOpen ? (
                  <ChevronUp className="h-5 w-5 text-[#505574]" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-[#505574]" />
                )}
              </div>
            </button>

            {/* Subcategories (Tree structure) */}
            {isAllProductOpen && (
              <ul className="relative flex flex-col m-0 p-0 list-none ml-[42px] mt-2 mb-2">
                {subcategories.map((sub, index) => {
                  const isFirst = index === 0;
                  const isLast = index === subcategories.length - 1;
                  const Icon = sub.icon;
                  const isSelected = selectedCategory === sub.name;

                  return (
                    <li key={sub.name} className="relative py-[18px]">
                      {/* Main vertical line continuing down */}
                      {!isLast && (
                        <div className="absolute left-0 top-0 bottom-0 w-[1.5px] bg-[#9b9eb9]/60" />
                      )}

                      {/* Special extension upwards for the very first item to connect to the button */}
                      {isFirst && (
                        <div className="absolute left-0 top-[-24px] h-[24px] w-[1.5px] bg-[#9b9eb9]/60" />
                      )}

                      {/* Horizontal branch line OR curved corner for the last item */}
                      {isLast ? (
                        /* For the last item: vertical line for top half, then curves right to middle */
                        <div className="absolute left-0 top-0 w-[24px] h-[50%] border-l-[1.5px] border-b-[1.5px] border-[#9b9eb9]/60 rounded-bl-[16px]" />
                      ) : (
                        /* For non-last items: horizontal line starting from left-0 and going halfway right */
                        <div className="absolute left-0 top-[50%] w-[24px] h-[1.5px] bg-[#9b9eb9]/60" />
                      )}

                      {/* Content Button */}
                      <button
                        onClick={() => onSelectCategory?.(sub.name)}
                        className="flex items-center gap-4 pl-[42px] w-full text-left focus:outline-none group"
                      >
                        <Icon
                          className={`h-6 w-6 transition-transform duration-300 stroke-[1.5] ${
                            isSelected
                              ? "text-primary scale-110"
                              : "text-[#505574] group-hover:text-primary group-hover:scale-110"
                          }`}
                        />
                        <span
                          className={`font-['Montserrat'] text-[13px] leading-none tracking-normal transition-all ${
                            isSelected
                              ? "text-primary font-semibold"
                              : "text-[#505574] hover:text-primary font-normal"
                          }`}
                        >
                          {sub.name}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Bottom Menus container */}
          <div className="flex flex-col gap-1 mt-4">
            {/* New Arrival Dropdown */}
            <button
              onClick={() => {
                onSelectCategory?.("New Arrival");
                setIsNewArrivalOpen(!isNewArrivalOpen);
              }}
              className="flex items-center justify-between w-full px-3 py-3 bg-transparent text-[#505574] hover:text-primary transition-all focus:outline-none group"
            >
              <div className="flex items-center gap-4">
                <Search className={`h-[26px] w-[26px] stroke-[1.5] ${selectedCategory === "New Arrival" ? "text-primary" : "text-[#505574] group-hover:text-primary"}`} />
                <span className={`text-[17px] font-medium ${selectedCategory === "New Arrival" ? "text-primary" : "text-[#505574] group-hover:text-primary"}`}>New Arrival</span>
              </div>
              {isNewArrivalOpen ? (
                <ChevronUp className="h-5 w-5 text-[#505574] group-hover:text-primary" />
              ) : (
                <ChevronDown className="h-5 w-5 text-[#505574] group-hover:text-primary" />
              )}
            </button>

            {/* Best Seller Dropdown */}
            <button
              onClick={() => {
                onSelectCategory?.("Best Seller");
                setIsBestSellerOpen(!isBestSellerOpen);
              }}
              className="flex items-center justify-between w-full px-3 py-3 bg-transparent text-[#505574] hover:text-primary transition-all focus:outline-none group"
            >
              <div className="flex items-center gap-4">
                <Star className={`h-[26px] w-[26px] stroke-[1.5] ${selectedCategory === "Best Seller" ? "text-primary" : "text-[#505574] group-hover:text-primary"}`} />
                <span className={`text-[17px] font-medium ${selectedCategory === "Best Seller" ? "text-primary" : "text-[#505574] group-hover:text-primary"}`}>Best Seller</span>
              </div>
              {isBestSellerOpen ? (
                <ChevronUp className="h-5 w-5 text-[#505574] group-hover:text-primary" />
              ) : (
                <ChevronDown className="h-5 w-5 text-[#505574] group-hover:text-primary" />
              )}
            </button>

            {/* Malls Dropdown */}
            <button
              onClick={() => {
                onSelectCategory?.("Malls");
                setIsMallsOpen(!isMallsOpen);
              }}
              className="flex items-center justify-between w-full px-3 py-3 bg-transparent text-[#505574] hover:text-primary transition-all focus:outline-none group"
            >
              <div className="flex items-center gap-4">
                <Store className={`h-[26px] w-[26px] stroke-[1.5] ${selectedCategory === "Malls" ? "text-primary" : "text-[#505574] group-hover:text-primary"}`} />
                <span className={`text-[17px] font-medium ${selectedCategory === "Malls" ? "text-primary" : "text-[#505574] group-hover:text-primary"}`}>Malls</span>
              </div>
              {isMallsOpen ? (
                <ChevronUp className="h-5 w-5 text-[#505574] group-hover:text-primary" />
              ) : (
                <ChevronDown className="h-5 w-5 text-[#505574] group-hover:text-primary" />
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
