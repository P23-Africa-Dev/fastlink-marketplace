"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import {
  ChevronRight,
  Search,
  User,
  Calendar,
  MessageCircle,
  Tag,
  Share2,
  Copy,
  Check,
  RotateCw,
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

// Popular Tags
const popularTags = [
  "Game",
  "iPhone",
  "TV",
  "Asus Laptops",
  "Macbook",
  "SSD",
  "Graphics Card",
  "Speaker",
  "Tablet",
  "Microwave",
  "Samsung",
  "Power Bank",
];

// Initial Comments List (Matching Design Screenshot)
const initialComments = [
  {
    id: 1,
    name: "Annette Black",
    date: "26 Apr, 2021",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
    comment: "In a nisi commodo, porttitor ligula consequat, tincidunt dui. Nulla volutpat, metus eu aliquam malesuada, elit libero venenatis urna, consequat maximus arcu diam non diam.",
  },
  {
    id: 2,
    name: "Devon Lane",
    date: "24 Apr, 2021",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
    comment: "Quisque eget tortor lobortis, facilisis metus eu, elementum est. Nunc sit amet erat quis ex convallis suscipit. Nam hendrerit, velit ut aliquam euismod, nibh tortor rutrum nisi, ac sodales nunc eros porta nisi. Sed scelerisque, est eget aliquam venenatis, est sem tempor eros.",
  },
  {
    id: 3,
    name: "Jacob Jones",
    date: "20 Apr, 2021",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    comment: "Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae.",
  },
  {
    id: 4,
    name: "Jane Cooper",
    date: "18 Apr, 2021",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200",
    comment: "Pellentesque feugiat, nibh vel vehicula pretium, nibh nibh bibendum elit, a volutpat arcu dui nec orci. Aenean dui odio, ullamcorper quis turpis ac, volutpat imperdiet ex.",
  },
  {
    id: 5,
    name: "Darrell Steward",
    date: "7 Apr, 2021",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
    comment: "Nulla molestie interdum ultricies.",
  },
];

export default function BlogDetailsPage() {
  const params = useParams();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeTag, setActiveTag] = useState("Graphics Card");
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);

  // Comments State
  const [commentsList, setCommentsList] = useState(initialComments);
  const [loadingMore, setLoadingMore] = useState(false);
  const [newComment, setNewComment] = useState({
    name: "",
    email: "",
    text: "",
  });

  function handleCopyLink() {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handlePostComment(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.name.trim() || !newComment.text.trim()) return;

    const created = {
      id: Date.now(),
      name: newComment.name,
      date: "Just now",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200",
      comment: newComment.text,
    };

    setCommentsList([created, ...commentsList]);
    setNewComment({ name: "", email: "", text: "" });
  }

  function handleLoadMoreComments() {
    setLoadingMore(true);
    setTimeout(() => {
      const extraComments = [
        {
          id: Date.now() + 1,
          name: "Kristin Watson",
          date: "2 Apr, 2021",
          avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
          comment: "Phasellus at leo nunc. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae.",
        },
        {
          id: Date.now() + 2,
          name: "Albert Flores",
          date: "28 Mar, 2021",
          avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200",
          comment: "Curabitur pulvinar aliquam lectus, non blandit erat mattis vitae. Super detailed article!",
        },
      ];
      setCommentsList((prev) => [...prev, ...extraComments]);
      setLoadingMore(false);
    }, 600);
  }

  return (
    <div className="min-h-screen bg-[#F5ECF9] font-montserrat text-[#1E1E2F]">
      
      {/* Breadcrumb Navigation */}
      <div className="bg-[#FAF8FC] border-b border-purple-100/60 py-3.5 px-4 md:px-10 lg:px-16">
        <div className="mx-auto max-w-[1400px] flex items-center gap-2 text-xs font-semibold text-[#8A79A5]">
          <Link href="/" className="hover:text-[#6D349F] transition-colors">
            Home
          </Link>
          <ChevronRight size={13} />
          <Link href="/blog" className="hover:text-[#6D349F] transition-colors">
            Blog
          </Link>
          <ChevronRight size={13} />
          <span className="text-[#6D349F] font-bold">Blog Details</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="mx-auto max-w-[1400px] px-4 md:px-8 lg:px-12 py-8 md:py-12 space-y-8">
        
        {/* Top Hero Banner Image (Matching Design Screenshot) */}
        <div className="relative w-full h-[320px] sm:h-[420px] md:h-[500px] rounded-3xl overflow-hidden shadow-sm border border-purple-100/40 bg-slate-100">
          <Image
            src="https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&q=80&w=1600"
            alt="Hero Gadgets Banner"
            fill
            priority
            className="object-cover"
          />
        </div>

        {/* 2-Column Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT MAIN CONTENT (8 Cols on lg) */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-purple-100/40 space-y-8">
            
            {/* Metadata Row */}
            <div className="flex flex-wrap items-center gap-5 text-xs text-[#77878F] font-medium">
              <div className="flex items-center gap-1.5 text-[#191C1F]">
                <Tag size={16} className="text-[#FA8232]" />
                <span>Electronics</span>
              </div>
              <div className="flex items-center gap-1.5">
                <User size={16} className="text-[#FA8232]" />
                <span>Marvin McKinney</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar size={16} className="text-[#FA8232]" />
                <span>8 Sep, 2020</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MessageCircle size={16} className="text-[#FA8232]" />
                <span>738</span>
              </div>
            </div>

            {/* Article Headline */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#191C1F] leading-tight tracking-tight font-montserrat">
              How artist collective Meow Wolf&apos;s website complements their immersive venues
            </h1>

            {/* Author Share Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-y border-slate-100">
              
              {/* Left Author Info */}
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 rounded-full overflow-hidden bg-slate-200 border border-slate-200">
                  <Image
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
                    alt="Cameron Williamson"
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="text-sm font-bold text-[#191C1F]">
                  Cameron Williamson
                </span>
              </div>

              {/* Right Social Share Buttons */}
              <div className="flex items-center gap-2">
                {/* WhatsApp */}
                <button className="h-8 w-8 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-2xs hover:opacity-90 transition-all cursor-pointer">
                  <span className="text-xs font-bold">wa</span>
                </button>
                {/* Facebook */}
                <button className="h-8 w-8 rounded-full bg-[#3B5998] text-white flex items-center justify-center shadow-2xs hover:opacity-90 transition-all cursor-pointer">
                  <span className="text-xs font-bold">f</span>
                </button>
                {/* Twitter */}
                <button className="h-8 w-8 rounded-full bg-[#1DA1F2] text-white flex items-center justify-center shadow-2xs hover:opacity-90 transition-all cursor-pointer">
                  <span className="text-xs font-bold">t</span>
                </button>
                {/* LinkedIn */}
                <button className="h-8 w-8 rounded-full bg-[#0077B5] text-white flex items-center justify-center shadow-2xs hover:opacity-90 transition-all cursor-pointer">
                  <span className="text-xs font-bold">in</span>
                </button>
                {/* Pinterest */}
                <button className="h-8 w-8 rounded-full bg-[#BD081C] text-white flex items-center justify-center shadow-2xs hover:opacity-90 transition-all cursor-pointer">
                  <span className="text-xs font-bold">p</span>
                </button>
                {/* Copy Link */}
                <button
                  onClick={handleCopyLink}
                  className="h-8 w-8 rounded-full bg-[#65676B] text-white flex items-center justify-center shadow-2xs hover:opacity-90 transition-all cursor-pointer"
                  title="Copy Link"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>

            </div>

            {/* Article Body Paragraph 1 */}
            <p className="text-xs sm:text-sm text-[#5F6C72] leading-relaxed font-normal">
              Sed a laoreet erat, in vehicula erat. Vivamus a viverra ipsum, ut interdum tellus. Donec quis ex quis metus sodales facilisis ut nec ex. Ut commodo lacus vel odio venenatis, sit amet lacinia lacus cursus. Ut sodales laoreet dapibus. Sed aliquam nisi odio, sed blandit erat placerat sed. Mauris eleifend, magna in convallis congue, orci est fermentum leo, at tincidunt massa ligula semper dolor. Nunc tristique enim in risus tristique rutrum eget ac eros.
            </p>

            {/* Quote Box (Matching Design Screenshot) */}
            <div className="rounded-2xl bg-[#FFF4ED] p-6 sm:p-8 flex items-start gap-4 border-l-4 border-[#FA8232]">
              <span className="text-4xl leading-none text-[#FA8232] font-serif shrink-0">
                “
              </span>
              <p className="text-xs sm:text-sm text-[#191C1F] font-semibold leading-relaxed italic">
                Vintage meets vogue is the only way to describe this serif typeface. Neue World encompasses the mode high-fashion aesthetic of the 1960s with a commercial take.
              </p>
            </div>

            {/* Article Body Paragraph 2 & 3 */}
            <div className="space-y-4 text-xs sm:text-sm text-[#5F6C72] leading-relaxed font-normal">
              <p>
                Mauris fermentum faucibus risus a efficitur. Morbi sit amet arcu turpis. Ut nisl velit, mattis at augue vel, molestie egestas justo. Aliquam elementum nibh neque, eu ornare nunc feugiat sed. Aliquam erat volutpat. Praesent vitae orci blandit, semper felis ac, interdum lacus.
              </p>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed iaculis nunc urna, id lobortis elit dapibus et. Etiam ultricies leo justo, nec vehicula augue auctor et. Sed finibus volutpat dui. Nunc vitae urna dictum tellus luctus tincidunt quis feugiat dolor. Aliquam malesuada tristique urna, quis ornare diam venenatis quis. Nunc ligula lectus, posuere sit amet ultrices ut, porttitor efficitur mauris. Aliquam bibendum vitae turpis sed molestie. Donec massa lorem, semper vel pellentesque ut, ultrices in enim. Sed fringilla, mi porttitor sodales vehicula, felis enim gravida nisi, at mollis ante leo et ligula. Quisque non aliquam eros, in aliquet tellus. Mauris ullamcorper quam erat, vehicula rhoncus velit interdum eget.
              </p>
            </div>

            {/* 2-Image Graphic Grid (Matching Design Screenshot) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
              {/* Image 1: Robot */}
              <div className="relative w-full h-[240px] sm:h-[280px] rounded-2xl overflow-hidden bg-slate-100">
                <Image
                  src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800"
                  alt="Futuristic Robot Assistant"
                  fill
                  className="object-cover"
                />
              </div>

              {/* Image 2: Smartphone & Crypto 3D graphic */}
              <div className="relative w-full h-[240px] sm:h-[280px] rounded-2xl overflow-hidden bg-slate-100">
                <Image
                  src="https://images.unsplash.com/photo-1622979135225-d2ba269bc1bd?auto=format&fit=crop&q=80&w=800"
                  alt="Mobile Web3 Illustration"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Paragraph 4 */}
            <p className="text-xs sm:text-sm text-[#5F6C72] leading-relaxed font-normal">
              Proin pulvinar quam at aliquet sagittis. Quisque laoreet luctus bibendum. Aenean in dignissim orci. Suspendisse at augue eget neque dictum vestibulum eu ac orci. Integer imperdiet lectus nec urna mollis euismod. Proin et risus nulla. Cras at diam in risus feugiat accumsan. Nulla sit amet blandit mi, a convallis mauris. Quisque lacus dolor, cursus ac quam ac, tempus ultrices sem. Ut porttitor.
            </p>

            <div className="pt-6 border-t border-slate-100 space-y-12">
              
              {/* Leave a Commends Form */}
              <div className="space-y-6">
                <h3 className="text-xl sm:text-2xl font-bold text-[#191C1F] font-montserrat">
                  Leave a Commends
                </h3>

                <form onSubmit={handlePostComment} className="space-y-5">
                  
                  {/* 2-Column Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-xs font-bold text-[#191C1F] mb-1.5 font-montserrat">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={newComment.name}
                        onChange={(e) => setNewComment({ ...newComment, name: e.target.value })}
                        className="w-full rounded-md border border-slate-200 bg-white p-3 text-xs sm:text-sm text-[#191C1F] focus:border-[#FA8232] focus:outline-none transition-all shadow-2xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#191C1F] mb-1.5 font-montserrat">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={newComment.email}
                        onChange={(e) => setNewComment({ ...newComment, email: e.target.value })}
                        className="w-full rounded-md border border-slate-200 bg-white p-3 text-xs sm:text-sm text-[#191C1F] focus:border-[#FA8232] focus:outline-none transition-all shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Comment Message Textarea */}
                  <div>
                    <label className="block text-xs font-bold text-[#191C1F] mb-1.5 font-montserrat">
                      Descri
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="What's your thought about this blog..."
                      value={newComment.text}
                      onChange={(e) => setNewComment({ ...newComment, text: e.target.value })}
                      className="w-full rounded-md border border-slate-200 bg-white p-3.5 text-xs sm:text-sm text-[#191C1F] placeholder-slate-400 focus:border-[#FA8232] focus:outline-none transition-all shadow-2xs resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <div>
                    <button
                      type="submit"
                      className="rounded-md bg-[#FA8232] hover:bg-[#E06D20] text-white font-bold text-xs uppercase px-7 py-3.5 tracking-wider shadow-sm transition-all cursor-pointer active:scale-95 font-montserrat"
                    >
                      POST COMMENDS
                    </button>
                  </div>

                </form>
              </div>

              {/* Commends List Section */}
              <div className="space-y-6 pt-4">
                <h3 className="text-xl sm:text-2xl font-bold text-[#191C1F] font-montserrat">
                  Commends
                </h3>

                <div className="divide-y divide-slate-100">
                  {commentsList.map((item) => (
                    <div key={item.id} className="py-5 first:pt-0 flex items-start gap-4">
                      <div className="relative h-10 w-10 shrink-0 rounded-full overflow-hidden bg-slate-100 border border-slate-200 mt-0.5">
                        <Image
                          src={item.avatar}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-bold text-[#191C1F]">
                            {item.name}
                          </span>
                          <span className="text-xs text-slate-400">·</span>
                          <span className="text-xs text-[#77878F] font-normal">
                            {item.date}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-[#5F6C72] leading-relaxed font-normal">
                          {item.comment}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Load More Button */}
                <div className="pt-2">
                  <button
                    onClick={handleLoadMoreComments}
                    className="inline-flex items-center gap-2 rounded-md border border-[#FFE7D6] bg-white hover:bg-[#FA8232] text-[#FA8232] hover:text-white font-bold text-xs px-6 py-3 uppercase tracking-wider transition-all cursor-pointer shadow-2xs"
                  >
                    <RotateCw size={14} className={loadingMore ? "animate-spin" : ""} />
                    <span>{loadingMore ? "LOADING..." : "LOAD MORE"}</span>
                  </button>
                </div>

              </div>

            </div>

          </div>

          {/* RIGHT SIDEBAR (4 Cols on lg) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Search Box Card */}
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-purple-100/40 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#191C1F]">
                SEARCH
              </h3>
              <div className="relative rounded-lg border border-slate-200 bg-white focus-within:border-[#FA8232] transition-all">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent px-4 py-2.5 text-xs sm:text-sm text-[#191C1F] placeholder-slate-400 focus:outline-none"
                />
                <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

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
                      onClick={() => setSelectedCategory(cat)}
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

            {/* Popular Tag Card */}
            {/* <div className="rounded-2xl bg-white p-6 shadow-sm border border-purple-100/40 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#191C1F]">
                POPULAR TAG
              </h3>
              <div className="flex flex-wrap gap-2">
                {popularTags.map((tag) => {
                  const isActive = activeTag === tag;
                  return (
                    <button
                      key={tag}
                      onClick={() => setActiveTag(tag)}
                      className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                        isActive
                          ? "border border-[#FA8232] bg-[#FFE7D6] text-[#FA8232] font-semibold"
                          : "border border-slate-200 bg-white text-[#5F6C72] hover:border-slate-300 hover:text-[#191C1F]"
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div> */}

          </div>

        </div>
      </div>

    </div>
  );
}
