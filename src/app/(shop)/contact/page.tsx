"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import contactHero from "@/assets/contact-hero.png";
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
          <span className="text-[#6D349F] font-semibold">Contact</span>
        </div>
      </div>

      {/* Hero Help Center Section (Matching Top Half of Design) */}
      <div className="bg-white py-10 md:py-14 px-4 md:px-10 lg:px-16">
        <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Heading & Search Box (7 cols) */}
          <div className="md:col-span-7 space-y-6">
            
            {/* Help Center Yellow Badge */}
            <div>
              <span className="inline-block rounded-md bg-[#EFD33D] px-3.5 py-1.5 text-[14px] font-semibold text-[#191C1F] leading-[20px] tracking-normal font-montserrat uppercase">
                HELP CENTER
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-[32px] font-semibold text-[#191C1F] leading-[40px] tracking-normal font-montserrat">
              How we can help you!
            </h1>

            {/* Help Search Form */}
            <form onSubmit={handleSearchSubmit} className="pt-1">
              <div className="relative flex items-center rounded-md border border-[#E4E7E9] bg-white p-1.5 shadow-2xs focus-within:border-[#FA541C] transition-all max-w-lg">
                <Search size={20} className="text-[#FA541C] ml-3 shrink-0" />
                <input
                  type="text"
                  placeholder="Enter your question or keyword"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSearchSubmitted(false);
                  }}
                  className="w-full bg-transparent px-3 py-2 text-xs sm:text-sm text-[#191C1F] placeholder-[#929FA5] focus:outline-none font-medium"
                />
                <button
                  type="submit"
                  className="rounded-md bg-[#FA8232] hover:bg-[#E06D20] text-white font-semibold text-[14px] leading-[48px] tracking-[0.012em] uppercase px-8 h-[48px] flex items-center justify-center font-montserrat shadow-sm transition-all shrink-0 cursor-pointer active:scale-95"
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

          {/* Right Column: Clean Representative Image (5 cols) */}
          <div className="md:col-span-5 flex justify-center md:justify-end">
            <div className="relative w-full max-w-[480px] h-[320px] sm:h-[380px] flex items-center justify-end">
              <Image
                src={contactHero}
                alt="Customer Support Representative with Headset and Laptop"
                priority
                className="object-contain object-right h-full w-auto"
              />
            </div>
          </div>

        </div>
      </div>

      {/* Middle Contact Section (Soft Lavender Background `bg-[#F7EEFB]`) */}
      <div className="bg-[#F7EEFB] py-16 md:py-20 px-4 md:px-10 lg:px-16">
        <div className="mx-auto max-w-5xl space-y-12 text-center">
          
          {/* Section Header */}
          <div className="space-y-3">
            <div>
              <span className="inline-block rounded-md bg-[#2DA5F3] px-3.5 py-1.5 text-xs font-extrabold text-white uppercase tracking-wider shadow-2xs">
                CONTACT US
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-[34px] font-semibold text-[#191C1F] tracking-tight leading-snug font-montserrat">
              Don&apos;t find your answer.<br />Contact with us
            </h2>
          </div>

          {/* 2-Column Contact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 text-left">
            
            {/* Card 1: Call Us Now */}
            <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-purple-100/40 flex flex-col justify-between gap-6 hover:shadow-md transition-all">
              <div className="space-y-4">
                <div className="flex items-start gap-5">
                  <div className="h-20 w-20 shrink-0 rounded-2xl bg-[#EAF6FE] text-[#2DA5F3] flex items-center justify-center shadow-2xs">
                    <Phone size={32} />
                  </div>
                  <div className="space-y-1.5 pt-1">
                    <h3 className="text-[18px] font-semibold text-[#191C1F] leading-[24px] tracking-normal font-montserrat">
                      Call us now
                    </h3>
                    <p className="text-[14px] font-normal text-[#77878F] leading-[20px] tracking-normal font-montserrat max-w-[280px]">
                      we are available online from 9:00 AM to 5:00 PM (GMT95:45) Talk with use now
                    </p>
                  </div>
                </div>

                <div className="sm:pl-[100px]">
                  <p className="text-[24px] font-normal text-[#191C1F] leading-[32px] tracking-normal font-montserrat">
                    +1-202-555-0126
                  </p>
                </div>
              </div>

              <div className="sm:pl-[100px]">
                <a
                  href="tel:+12025550126"
                  className="inline-flex items-center gap-2 rounded-full bg-[#2DA5F3] hover:bg-[#1C90DC] text-white font-bold text-[14px] leading-[48px] tracking-[0.012em] uppercase px-8 h-[48px] shadow-2xs transition-all cursor-pointer active:scale-95 font-montserrat"
                >
                  <span>CALL NOW</span>
                  <ArrowRight size={16} />
                </a>
              </div>
            </div>

            {/* Card 2: Chat With Us */}
            <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-purple-100/40 flex flex-col justify-between gap-6 hover:shadow-md transition-all">
              <div className="space-y-4">
                <div className="flex items-start gap-5">
                  <div className="h-20 w-20 shrink-0 rounded-2xl bg-[#EAF8E6] text-[#2DB224] flex items-center justify-center shadow-2xs">
                    <MessageCircle size={32} />
                  </div>
                  <div className="space-y-1.5 pt-1">
                    <h3 className="text-[18px] font-semibold text-[#191C1F] leading-[24px] tracking-normal font-montserrat">
                      Chat with us
                    </h3>
                    <p className="text-[14px] font-normal text-[#77878F] leading-[20px] tracking-normal font-montserrat max-w-[280px]">
                      we are available online from 9:00 AM to 5:00 PM (GMT95:45) Talk with use now
                    </p>
                  </div>
                </div>

                <div className="sm:pl-[100px]">
                  <p className="text-[24px] font-normal text-[#191C1F] leading-[32px] tracking-normal font-montserrat truncate">
                    Support@clicon.com
                  </p>
                </div>
              </div>

              <div className="sm:pl-[100px]">
                <a
                  href="mailto:Support@clicon.com"
                  className="inline-flex items-center gap-2 rounded-full bg-[#2DB224] hover:bg-[#239B1B] text-white font-bold text-[14px] leading-[48px] tracking-[0.012em] uppercase px-8 h-[48px] shadow-2xs transition-all cursor-pointer active:scale-95 font-montserrat"
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
