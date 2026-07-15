"use client";

import * as React from "react";
import { HeroBanner } from "@/components/customer/HeroBanner";
import { CategorySidebar } from "@/components/customer/CategorySidebar";
import { ProductCard } from "@/components/customer/ProductCard";
import { Pagination } from "@/components/customer/Pagination";
import { Footer } from "@/components/customer/Footer";
import { Product } from "@/types";
import { Search } from "lucide-react";
import { MOCK_PRODUCTS } from "@/lib/mock-data";
import { BecomeVendorSection } from "@/components/customer/BecomeVendorSection";

export default function CustomerHomePage() {
  const [selectedCategory, setSelectedCategory] = React.useState("All Products");
  const [currentPage, setCurrentPage] = React.useState(1);
  const ITEMS_PER_PAGE = 6;

  const filteredProducts = React.useMemo(() => {
    if (selectedCategory === "All Products") return MOCK_PRODUCTS;
    return MOCK_PRODUCTS.filter((p) => p.category === selectedCategory);
  }, [selectedCategory]);

  const totalPages = React.useMemo(() => {
    return Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  }, [filteredProducts]);

  const displayedProducts = React.useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const recommendationProducts = React.useMemo(() => {
    return [
      {
        id: "rec-1",
        name: "Product Name",
        description: "Experience lightning-fast loading with an SSD and immersive 3D Audio.",
        price: 29.90,
        imageUrl: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?q=80&w=400&auto=format&fit=crop",
        category: "Home & Wellness",
        stock: 5,
        vendorId: "vendor-b",
        rating: 5.0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "rec-2",
        name: "Product Name",
        description: "Voice control your music, smart home devices, and get hands-free helper functions.",
        price: 29.90,
        imageUrl: "https://images.unsplash.com/photo-1543512214-318c7553f230?q=80&w=400&auto=format&fit=crop",
        category: "Home & Wellness",
        stock: 12,
        vendorId: "vendor-a",
        rating: 5.0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "rec-3",
        name: "Product Name",
        description: "Experience lightning-fast loading with an SSD and immersive 3D Audio.",
        price: 29.90,
        imageUrl: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?q=80&w=400&auto=format&fit=crop",
        category: "Home & Wellness",
        stock: 5,
        vendorId: "vendor-b",
        rating: 5.0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "rec-4",
        name: "Product Name",
        description: "Voice control your music, smart home devices, and get hands-free helper functions.",
        price: 29.90,
        imageUrl: "https://images.unsplash.com/photo-1543512214-318c7553f230?q=80&w=400&auto=format&fit=crop",
        category: "Home & Wellness",
        stock: 12,
        vendorId: "vendor-a",
        rating: 5.0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "rec-5",
        name: "Product Name",
        description: "Experience lightning-fast loading with an SSD and immersive 3D Audio.",
        price: 29.90,
        imageUrl: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?q=80&w=400&auto=format&fit=crop",
        category: "Home & Wellness",
        stock: 5,
        vendorId: "vendor-b",
        rating: 5.0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#efe4f5] flex flex-col">
      {/* Full-bleed hero with navbar inside */}
      <HeroBanner
        onShopNowClick={() => {
          document.getElementById("shop-section")?.scrollIntoView({ behavior: "smooth" });
        }}
        onExploreClick={() => {
          document.getElementById("shop-section")?.scrollIntoView({ behavior: "smooth" });
        }}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 mt-10 flex flex-col gap-10 pb-16">
        {/* Malls Map */}
        <section className="flex flex-col gap-3">
          <div className="bg-secondary rounded-[24px] py-14 px-6 sm:px-12 flex flex-col items-center justify-center text-center gap-6 shadow-sm overflow-hidden">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              Malls Around Me!
            </h2>
            <div className="relative flex items-center w-full max-w-xl bg-white rounded-full p-1.5 shadow-md border border-surface-light">
              <div className="pl-3.5 text-gray-400">
                <Search className="h-5 w-5" />
              </div>
              <input
                type="text"
                placeholder="Search for your location"
                className="w-full bg-transparent pl-2 pr-4 py-2 text-sm text-dark placeholder:text-gray-400 focus:outline-none"
              />
              <button className="bg-primary hover:bg-primary-dark text-white text-sm font-semibold px-6 py-2 rounded-full transition-colors flex-shrink-0">
                Search
              </button>
            </div>
          </div>
          {/* <MallMap /> */}
        </section>

        {/* Shop Section */}
        <section id="shop-section" className="flex flex-col md:flex-row gap-10 mt-4">
          <div className="flex-shrink-0">
            <CategorySidebar
              selectedCategory={selectedCategory}
              onSelectCategory={handleSelectCategory}
              totalCount={MOCK_PRODUCTS.length}
            />
          </div>

          <div className="flex-1 flex flex-col">
            {displayedProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 md:gap-8">
                  {displayedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </>
            ) : (
              <div className="bg-white border border-surface-light rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[300px] shadow-sm">
                <span className="text-sm font-semibold text-primary">No products in this category.</span>
                <button
                  onClick={() => handleSelectCategory("All Products")}
                  className="text-xs font-bold text-accent-orange hover:underline mt-2"
                >
                  Reset Category
                </button>
              </div>
            )}
          </div>
        </section>

      </main>

      {/* Explore Our Recommendations */}
      <section className="w-full bg-[#efe4f5] pt-10 pb-20 sm:pt-16 sm:pb-24 lg:pt-10 lg:pb-32 flex flex-col gap-10">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="font-['Montserrat'] font-bold text-[32px] sm:text-[40px] lg:text-[48px] leading-[36px] sm:leading-[44px] lg:leading-[53px] tracking-normal text-[#834AB9]">
            Explore Our<br />Recommendations
          </h2>
        </div>
        <div className="w-full overflow-x-auto pb-6 scroll-smooth scrollbar-none">
          <div className="flex gap-8 px-4 sm:px-6 xl:px-[calc((100vw-1232px)/2)]">
            {recommendationProducts.map((product) => (
              <div key={product.id} className="w-[280px] sm:w-[360px] flex-shrink-0">
                <ProductCard product={product} aspectRatio="aspect-[1.35]" />
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Become a Vendor or Rider Component */}
      <BecomeVendorSection />

      {/* Footer component */}
      <Footer />
    </div>
  );
}
