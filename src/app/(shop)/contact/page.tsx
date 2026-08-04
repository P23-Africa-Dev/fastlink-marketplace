"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronRight,
  Search,
  Phone,
  MessageCircle,
  ArrowRight,
  Store,
  Bike,
  CheckCircle,
} from "lucide-react";

export default function ContactPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSubmitted, setSearchSubmitted] = useState(false);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchSubmitted(true);
    }
  }

  return (
    <div className="min-h-screen bg-white font-montserrat text-[#1E1E2F]">
      
      {/* Breadcrumb Navigation */}
      <div className="bg-[#FAF8FC] border-b border-purple-100/60 py-3.5 px-4 md:px-10 lg:px-16">
        <div className="mx-auto max-w-5xl flex items-center gap-2 text-xs font-semibold text-[#8A79A5]">
          <Link href="/" className="hover:text-[#6D349F] transition-colors flex items-center gap-1">
            Home
          </Link>
          <ChevronRight size={13} />
          <span className="text-[#6D349F] font-bold">Contact</span>
        </div>
      </div>

      {/* Hero Help Center Section (Matching Top Half of Design) */}
      <div className="bg-white py-12 md:py-16 px-4 md:px-10 lg:px-16 border-b border-purple-50">
        <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Heading & Search Box (7 cols) */}
          <div className="md:col-span-7 space-y-6">
            
            {/* Help Center Yellow Badge */}
            <span className="inline-block rounded-md bg-[#F7C631] px-3.5 py-1.5 text-xs font-extrabold text-[#191C1F] uppercase tracking-wider shadow-2xs">
              HELP CENTER
            </span>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#191C1F] tracking-tight leading-tight font-montserrat">
              How we can help you!
            </h1>

            {/* Help Search Form */}
            <form onSubmit={handleSearchSubmit} className="pt-2">
              <div className="relative flex items-center rounded-xl border border-slate-200 bg-white p-2 shadow-2xs focus-within:border-[#411266] focus-within:ring-1 focus-within:ring-[#411266] transition-all max-w-lg">
                <Search size={20} className="text-slate-400 ml-3 shrink-0" />
                <input
                  type="text"
                  placeholder="Enter your question or keyword"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSearchSubmitted(false);
                  }}
                  className="w-full bg-transparent px-3 py-2 text-xs sm:text-sm text-[#191C1F] placeholder-slate-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-[#FA541C] hover:bg-[#E04713] text-white font-extrabold text-xs sm:text-sm px-6 py-3 uppercase tracking-wider shadow-md transition-all shrink-0 cursor-pointer active:scale-95"
                >
                  SEND
                </button>
              </div>

              {searchSubmitted && (
                <div className="mt-3 flex items-center gap-2 text-xs text-emerald-600 font-semibold">
                  <CheckCircle size={15} />
                  <span>Searching help articles for &quot;{searchQuery}&quot;...</span>
                </div>
              )}
            </form>

          </div>

          {/* Right Column: Representative Illustration/Photo (5 cols) */}
          <div className="md:col-span-5 flex justify-center md:justify-end">
            <div className="relative w-full max-w-[360px] aspect-[4/3] sm:aspect-square flex items-center justify-center">
              {/* High Quality Support Representative Illustration */}
              <div className="relative w-full h-full rounded-2xl overflow-hidden bg-gradient-to-br from-purple-50 via-purple-100/50 to-amber-50 p-4 border border-purple-100 flex items-center justify-center shadow-2xs">
                <Image
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800"
                  alt="Customer Support Representative"
                  fill
                  priority
                  className="object-cover rounded-xl"
                  sizes="(max-width: 768px) 100vw, 400px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none rounded-xl" />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Middle Contact Section (Soft Lavender Background `bg-[#F8F0FF]`) */}
      <div className="bg-[#F8F0FF] py-14 md:py-20 px-4 md:px-10 lg:px-16">
        <div className="mx-auto max-w-5xl space-y-12 text-center">
          
          {/* Section Header */}
          <div className="space-y-3">
            <span className="inline-block rounded-md bg-[#2DA5F3] px-3.5 py-1.5 text-xs font-extrabold text-white uppercase tracking-wider shadow-2xs">
              CONTACT US
            </span>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#191C1F] tracking-tight leading-tight">
              Don&apos;t find your answer.<br />Contact with us
            </h2>
          </div>

          {/* 2-Column Contact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 text-left">
            
            {/* Card 1: Call Us Now */}
            <div className="rounded-2xl bg-white p-6 sm:p-8 shadow-sm border border-purple-100/60 flex flex-col justify-between gap-6 hover:shadow-md transition-all">
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 shrink-0 rounded-2xl bg-[#E6F4FF] text-[#2DA5F3] flex items-center justify-center shadow-2xs">
                  <Phone size={24} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-[#191C1F]">
                    Call us now
                  </h3>
                  <p className="text-xs text-[#716388] leading-relaxed">
                    we are available online from 9:00 AM to 5:00 PM (GMT+5:45) Talk with us now
                  </p>
                </div>
              </div>

              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-[#191C1F] mb-6">
                  +1-202-555-0126
                </p>

                <a
                  href="tel:+12025550126"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#2DA5F3] hover:bg-[#1C90DC] text-white font-extrabold text-xs sm:text-sm px-7 py-3.5 uppercase tracking-wider shadow-md transition-all cursor-pointer active:scale-95"
                >
                  <span>CALL NOW</span>
                  <ArrowRight size={16} />
                </a>
              </div>
            </div>

            {/* Card 2: Chat With Us */}
            <div className="rounded-2xl bg-white p-6 sm:p-8 shadow-sm border border-purple-100/60 flex flex-col justify-between gap-6 hover:shadow-md transition-all">
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 shrink-0 rounded-2xl bg-[#E8F7EE] text-[#2DB224] flex items-center justify-center shadow-2xs">
                  <MessageCircle size={24} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-[#191C1F]">
                    Chat with us
                  </h3>
                  <p className="text-xs text-[#716388] leading-relaxed">
                    we are available online from 9:00 AM to 5:00 PM (GMT+5:45) Talk with us now
                  </p>
                </div>
              </div>

              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-[#191C1F] mb-6 truncate">
                  Support@fastlink.com
                </p>

                <a
                  href="mailto:Support@fastlink.com"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#2DB224] hover:bg-[#239B1B] text-white font-extrabold text-xs sm:text-sm px-7 py-3.5 uppercase tracking-wider shadow-md transition-all cursor-pointer active:scale-95"
                >
                  <span>CONTACT US</span>
                  <ArrowRight size={16} />
                </a>
              </div>
            </div>

          </div>

          {/* Bottom CTA Card: Become a Vendor or Rider (Matching Design) */}
          <div className="rounded-3xl bg-[#1E1E22] p-8 sm:p-12 text-white text-left shadow-xl max-w-5xl mx-auto mt-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Left Info Column (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                  Become a Vendor or Rider
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg">
                  Join thousands of vendors selling on Fastlink, or sign up as a delivery rider and earn on your own schedule.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link
                    href="/vendor/register"
                    className="rounded-xl bg-white text-[#1E1E22] hover:bg-slate-100 font-extrabold text-xs sm:text-sm px-6 py-3.5 transition-all shadow-md active:scale-95 inline-flex items-center gap-2"
                  >
                    <Store size={16} />
                    <span>Sell on Fastlink</span>
                  </Link>

                  <Link
                    href="/rider/register"
                    className="rounded-xl border border-slate-600 bg-transparent text-white hover:bg-white/10 font-extrabold text-xs sm:text-sm px-6 py-3.5 transition-all active:scale-95 inline-flex items-center gap-2"
                  >
                    <Bike size={16} />
                    <span>Ride with Us</span>
                  </Link>
                </div>
              </div>

              {/* Right Graphic Banner (5 cols) */}
              <div className="lg:col-span-5">
                <div className="rounded-2xl bg-[#28282D] p-6 sm:p-8 border border-white/5 flex flex-col items-center justify-center text-center shadow-inner">
                  <div className="text-5xl mb-4">
                    🏍️
                  </div>
                  <div className="flex items-center justify-center gap-8 w-full pt-2">
                    <div>
                      <span className="text-2xl sm:text-3xl font-black text-[#F7B928] block">
                        2.5K+
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        Active Riders
                      </span>
                    </div>

                    <div className="h-8 w-[1px] bg-slate-700" />

                    <div>
                      <span className="text-2xl sm:text-3xl font-black text-[#F7B928] block">
                        800+
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        Vendors
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
