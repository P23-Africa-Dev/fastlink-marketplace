"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronRight,
  Search,
  ChevronDown,
  User,
  Calendar,
  MessageCircle,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

// Mock Categories
const categories = [
  "All",
  "Electronics Devices",
  "Computer & Laptop",
  "Computer Accessories",
  "SmartPhone",
  "Headphone",
  "Mobile Accessories",
  "Gaming Console",
  "Camera & Photo",
];

// Mock Latest Blog Thumbnails
const latestBlogs = [
  {
    id: 1,
    title: "Curabitur pulvinar aliquam lectus, non blandit erat mattis vitae.",
    date: "28 Nov, 2015",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=300",
  },
  {
    id: 2,
    title: "Curabitur pulvinar aliquam lectus, non blandit erat mattis vitae.",
    date: "28 Nov, 2015",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=300",
  },
  {
    id: 3,
    title: "Curabitur pulvinar aliquam lectus, non blandit erat mattis vitae.",
    date: "28 Nov, 2015",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=300",
  },
];

// Gallery Images
const galleryImages = [
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=200",
];

// Main Blog Posts (12 items total)
const blogPosts = [
  {
    id: 1,
    author: "Cameron",
    date: "1 Feb, 2020",
    comments: 738,
    title: "Curabitur pulvinar aliquam lectus, non blandit erat mattis vitae.",
    excerpt: "Mauris scelerisque odio id rutrum volutpat. Pellentesque urna odio, vulputate at tortor vitae, hendrerit blandit lorem.",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800",
    category: "Electronics Devices",
  },
  {
    id: 2,
    author: "Floyd Miles",
    date: "17 Oct, 2020",
    comments: 826,
    title: "Curabitur massa orci, consectetur et blandit ac, auctor et tellus.",
    excerpt: "Pellentesque vestibulum lorem vel gravida aliquam. Morbi porta, odio id suscipit mattis, risus augue condimentum purus.",
    image: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&q=80&w=800",
    category: "SmartPhone",
  },
  {
    id: 3,
    author: "Marvin McKinney",
    date: "8 Sep, 2020",
    comments: 738,
    title: "Curabitur pulvinar aliquam lectus, non blandit erat mattis vitae.",
    excerpt: "Mauris scelerisque odio id rutrum volutpat. Pellentesque urna odio, vulputate at tortor vitae, hendrerit blandit lorem.",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800",
    category: "Computer & Laptop",
  },
  {
    id: 4,
    author: "Darlene",
    date: "24 May, 2020",
    comments: 826,
    title: "Curabitur massa orci, consectetur et blandit ac, auctor et tellus.",
    excerpt: "Pellentesque vestibulum lorem vel gravida aliquam. Morbi porta, odio id suscipit mattis, risus augue condimentum purus.",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800",
    category: "Computer Accessories",
  },
  {
    id: 5,
    author: "Esther Howard",
    date: "12 Dec, 2020",
    comments: 412,
    title: "The Ultimate Guide to Modern Smart Home Devices in 2021",
    excerpt: "Discover the latest smart home gadgets and automation technology to streamline your daily routines effortlessly.",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800",
    category: "Electronics Devices",
  },
  {
    id: 6,
    author: "Jacob Jones",
    date: "19 Nov, 2020",
    comments: 530,
    title: "Next-Gen Gaming Consoles: What to Expect Next Season",
    excerpt: "High frame rates, ray tracing, and ultra-fast SSD storage are redefining real-time interactive entertainment graphics.",
    image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=800",
    category: "Gaming Console",
  },
  {
    id: 7,
    author: "Leslie Alexander",
    date: "4 Aug, 2020",
    comments: 619,
    title: "Top 10 High-Performance Wireless Noise-Canceling Headphones",
    excerpt: "Immerse yourself in rich, spatial acoustic detail with these top-rated audiophile-approved wireless headphones.",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800",
    category: "Headphone",
  },
  {
    id: 8,
    author: "Guy Hawkins",
    date: "15 Jul, 2020",
    comments: 388,
    title: "Mastering Professional Digital Photography & Mirrorless Lenses",
    excerpt: "Learn how to choose focal lengths, sensor sizes, and dynamic exposure ranges for cinematic portraiture.",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800",
    category: "Camera & Photo",
  },
  {
    id: 9,
    author: "Jane Cooper",
    date: "28 Jun, 2020",
    comments: 940,
    title: "Ergonomic Office Setup: Boosting Productivity at Work",
    excerpt: "Upgrade your workstation with mechanical keyboards, ultra-wide monitors, and ergonomic dual monitor arms.",
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=800",
    category: "Computer Accessories",
  },
  {
    id: 10,
    author: "Robert Fox",
    date: "10 May, 2020",
    comments: 295,
    title: "Essential Mobile Accessories Every Smartphone Owner Needs",
    excerpt: "From MagSafe wireless fast chargers to durable protective cases, explore key accessories for modern mobile devices.",
    image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&q=80&w=800",
    category: "Mobile Accessories",
  },
  {
    id: 11,
    author: "Jenny Wilson",
    date: "3 Apr, 2020",
    comments: 780,
    title: "Comparing Flagship Smartphones: Performance & Camera Tests",
    excerpt: "An in-depth side-by-side comparison of battery endurance, OLED display color accuracy, and night mode photography.",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=800",
    category: "SmartPhone",
  },
  {
    id: 12,
    author: "Cody Fisher",
    date: "14 Jan, 2020",
    comments: 650,
    title: "Building Your Dream Custom PC Setup: Step-by-Step Hardware Guide",
    excerpt: "A beginner-friendly walkthrough on selecting CPUs, GPUs, motherboards, and liquid cooling systems for maximum performance.",
    image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&q=80&w=800",
    category: "Computer & Laptop",
  },
];

const POSTS_PER_PAGE = 4;

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("Most Popular");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter posts across ALL 12 items
  const filteredPosts = React.useMemo(() => {
    return blogPosts.filter((post) => {
      const matchesCategory =
        selectedCategory === "All" || post.category === selectedCategory;
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.author.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Calculate total pages dynamically
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);

  // Slice posts for current page (4 per page)
  const paginatedPosts = React.useMemo(() => {
    const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
    return filteredPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);
  }, [filteredPosts, currentPage]);

  // Reset to page 1 on filter or search changes
  function handleCategorySelect(cat: string) {
    setSelectedCategory(cat);
    setCurrentPage(1);
  }

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  }

  return (
    <div className="min-h-screen bg-[#F5ECF9] font-montserrat text-[#1E1E2F]">
      
      {/* Breadcrumb Navigation */}
      <div className="bg-[#FAF8FC] border-b border-purple-100/60 py-3.5 px-4 md:px-10 lg:px-16">
        <div className="mx-auto max-w-[1400px] flex items-center gap-2 text-xs font-semibold text-[#8A79A5]">
          <Link href="/" className="hover:text-[#6D349F] transition-colors flex items-center gap-1">
            Home
          </Link>
          <ChevronRight size={13} />
          <span className="text-[#6D349F] font-semibold">Blog</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="mx-auto max-w-[1400px] px-4 md:px-8 lg:px-12 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDEBAR (3 Cols on lg) */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Category Card */}
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-purple-100/40 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#191C1F]">
                CATEGORY
              </h3>

              <div className="space-y-3">
                {categories.map((cat) => {
                  const isActive = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => handleCategorySelect(cat)}
                      className="flex items-center gap-3 w-full text-left text-xs font-medium text-[#5F6C72] hover:text-[#191C1F] transition-colors group cursor-pointer"
                    >
                      <div
                        className={`h-4 w-4 rounded-full border flex items-center justify-center transition-all ${
                          isActive
                            ? "border-[#FA8232] bg-white"
                            : "border-slate-300 group-hover:border-slate-400"
                        }`}
                      >
                        {isActive && (
                          <div className="h-2 w-2 rounded-full bg-[#FA8232]" />
                        )}
                      </div>
                      <span className={isActive ? "font-bold text-[#191C1F]" : ""}>
                        {cat}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Latest Blog Card */}
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-purple-100/40 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#191C1F]">
                LATEST BLOG
              </h3>

              <div className="space-y-4">
                {latestBlogs.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 group cursor-pointer">
                    <div className="relative h-14 w-18 shrink-0 rounded-lg overflow-hidden bg-slate-100">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-semibold text-[#191C1F] group-hover:text-[#FA8232] transition-colors line-clamp-2 leading-snug">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-[#77878F]">
                        {item.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gallery Card */}
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-purple-100/40 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#191C1F]">
                GALLERY
              </h3>

              <div className="grid grid-cols-4 gap-2">
                {galleryImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square rounded-lg overflow-hidden bg-slate-100 group cursor-pointer"
                  >
                    <Image
                      src={img}
                      alt={`Gallery thumbnail ${idx + 1}`}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT MAIN CONTENT (9 Cols on lg) */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* Search & Sort Controls Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              
              {/* Search Box */}
              <div className="relative w-full sm:w-[320px] rounded-lg border border-slate-200 bg-white shadow-2xs focus-within:border-[#FA8232] transition-all">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full bg-transparent px-4 py-2.5 text-xs sm:text-sm text-[#191C1F] placeholder-slate-400 focus:outline-none font-medium"
                />
                <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <span className="text-xs font-medium text-[#5F6C72]">
                  Sort by:
                </span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none rounded-lg border border-slate-200 bg-white px-4 py-2.5 pr-8 text-xs font-semibold text-[#191C1F] shadow-2xs focus:outline-none cursor-pointer"
                  >
                    <option value="Most Popular">Most Popular</option>
                    <option value="Latest">Latest</option>
                    <option value="Oldest">Oldest</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

            </div>

            {/* Blog Posts 2-Column Grid */}
            {paginatedPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {paginatedPosts.map((post) => (
                  <div
                    key={post.id}
                    className="rounded-2xl bg-white p-6 shadow-sm border border-purple-100/40 flex flex-col justify-between gap-5 hover:shadow-md transition-all group"
                  >
                    <div className="space-y-4">
                      {/* Post Hero Image */}
                      <div className="relative w-full h-[220px] rounded-xl overflow-hidden bg-slate-100">
                        <Image
                          src={post.image}
                          alt={post.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      {/* Metadata Row */}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-[#77878F]">
                        <div className="flex items-center gap-1.5">
                          <User size={15} className="text-[#FA8232]" />
                          <span>{post.author}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar size={15} className="text-[#FA8232]" />
                          <span>{post.date}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MessageCircle size={15} className="text-[#FA8232]" />
                          <span>{post.comments}</span>
                        </div>
                      </div>

                      {/* Post Title */}
                      <h2 className="text-lg font-bold text-[#191C1F] group-hover:text-[#FA8232] transition-colors leading-snug cursor-pointer">
                        {post.title}
                      </h2>

                      {/* Post Excerpt */}
                      <p className="text-xs sm:text-sm text-[#77878F] leading-relaxed line-clamp-3">
                        {post.excerpt}
                      </p>
                    </div>

                    {/* Read More CTA Button */}
                    <div>
                      <button
                        className="inline-flex items-center gap-2 rounded-md border border-[#FFE7D6] bg-white hover:bg-[#FA8232] text-[#FA8232] hover:text-white font-extrabold text-xs px-5 py-2.5 uppercase tracking-wider transition-all cursor-pointer shadow-2xs"
                      >
                        <span>READ MORE</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl bg-white p-12 text-center text-slate-500 shadow-2xs font-medium">
                No blog posts found matching your search or category filter.
              </div>
            )}

            {/* Dynamic Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 sm:gap-3 pt-6 pb-4">
                
                {/* Previous Page Circle Button */}
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="h-10 w-10 sm:h-12 sm:w-12 rounded-full border-2 border-[#FA8232] text-[#FA8232] hover:bg-[#FA8232] hover:text-white disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[#FA8232] flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                  aria-label="Previous Page"
                >
                  <ArrowLeft size={18} strokeWidth={2.5} />
                </button>

                {/* Dynamic Page Number Buttons */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  const isActive = currentPage === page;
                  const pageLabel = String(page).padStart(2, "0");
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`h-10 w-10 sm:h-12 sm:w-12 rounded-full text-xs sm:text-sm font-semibold flex items-center justify-center transition-all cursor-pointer ${
                        isActive
                          ? "bg-[#FA8232] text-white font-bold shadow-xs scale-105"
                          : "bg-white border border-slate-200/90 text-[#191C1F] hover:border-[#FA8232] hover:text-[#FA8232] shadow-2xs"
                      }`}
                    >
                      {pageLabel}
                    </button>
                  );
                })}

                {/* Next Page Circle Button */}
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="h-10 w-10 sm:h-12 sm:w-12 rounded-full border-2 border-[#FA8232] text-[#FA8232] hover:bg-[#FA8232] hover:text-white disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[#FA8232] flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                  aria-label="Next Page"
                >
                  <ArrowRight size={18} strokeWidth={2.5} />
                </button>

              </div>
            )}

          </div>

        </div>
      </div>

    </div>
  );
}
