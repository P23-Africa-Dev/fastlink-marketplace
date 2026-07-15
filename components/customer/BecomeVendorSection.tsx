"use client";

import React from "react";

const MotorcycleIllustration = () => (
  <svg className="w-40 h-24" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Road line */}
    <line x1="10" y1="105" x2="190" y2="105" stroke="#333333" strokeWidth="3" strokeLinecap="round" />

    {/* Front Wheel */}
    <circle cx="50" cy="85" r="22" fill="#121212" stroke="#666" strokeWidth="4" />
    <circle cx="50" cy="85" r="10" fill="#e0e0e0" />

    {/* Rear Wheel */}
    <circle cx="150" cy="85" r="22" fill="#121212" stroke="#666" strokeWidth="4" />
    <circle cx="150" cy="85" r="10" fill="#e0e0e0" />

    {/* Frame and engine lines */}
    <path d="M50 85L80 50H120L150 85" stroke="#a0a0a0" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M80 50L95 85H120L110 50" stroke="#808080" strokeWidth="4" strokeLinejoin="round" />

    {/* Exhaust pipe */}
    <path d="M100 90H140L160 75" stroke="#d0d0d0" strokeWidth="4" strokeLinecap="round" />

    {/* Seat / Body (Teal / Blue accents matching the screenshot) */}
    <path d="M75 45C75 45 90 35 115 38C125 39 135 48 135 48L75 45Z" fill="#00acc1" />
    <path d="M110 40H135V48H110V40Z" fill="#121212" />

    {/* Fuel Tank (Silver / White body) */}
    <path d="M75 45C75 45 70 30 90 30H110L115 45H75Z" fill="#e0e0e0" />

    {/* Handlebars & Fork */}
    <path d="M50 85L72 32" stroke="#a0a0a0" strokeWidth="4" />
    <path d="M68 32H80" stroke="#121212" strokeWidth="4" strokeLinecap="round" />

    {/* Windshield (Teal glass highlight) */}
    <path d="M72 32L65 24C65 24 75 20 78 28L72 32Z" fill="#00acc1" opacity="0.8" />

    {/* Decal Block */}
    <rect x="106" y="58" width="16" height="10" rx="3" fill="#ffffff" />
    <text x="114" y="66" fill="#121212" fontSize="8" fontWeight="bold" textAnchor="middle">01</text>
  </svg>
);

export function BecomeVendorSection() {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 pb-24 mt-5">
      <div className="w-full bg-[#1c1c1c] rounded-[32px] p-8 sm:p-12 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-12 sm:gap-16 shadow-xl border border-white/5">
        {/* Left Column */}
        <div className="flex flex-col gap-6 w-full lg:max-w-xl text-left">
          <h2 className="font-['Montserrat'] font-bold text-[36px] sm:text-[46px] text-white leading-tight tracking-tight">
            Become a Vendor<br />or Rider
          </h2>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed max-w-lg">
            Join thousands of vendors selling on Fastlink, or sign up as a delivery rider and earn on your own schedule.
          </p>
          <div className="flex flex-wrap items-center gap-4 mt-2">
            <button className="bg-white hover:bg-gray-100 text-[#834AB9] font-bold text-sm px-8 py-4 rounded-full transition-all duration-300 shadow-md active:scale-95">
              Sell on Fastlink
            </button>
            <button className="bg-transparent hover:bg-white/10 text-white font-bold text-sm px-8 py-4 rounded-full border border-white/40 transition-all duration-300 flex items-center gap-2 active:scale-95">
              <span>Ride with Us</span>
              <span className="text-xs">→</span>
            </button>
          </div>
        </div>

        {/* Right Column */}
        <div className="bg-[#242424] rounded-[24px] p-8 w-full lg:w-[420px] flex flex-col items-center justify-center text-center gap-8 border border-white/[0.03] shadow-inner">
          {/* Custom Motorcycle SVG */}
          <div className="relative flex items-center justify-center py-2">
            <MotorcycleIllustration />
          </div>

          {/* Statistics */}
          <div className="flex items-center justify-center w-full gap-10 sm:gap-14 border-t border-white/[0.06] pt-6">
            <div className="flex flex-col items-center gap-1.5">
              <span className="font-['Montserrat'] font-extrabold text-[28px] sm:text-[34px] text-[#f9d749] leading-none tracking-tight">
                2.5K+
              </span>
              <span className="text-[12px] font-medium text-gray-400 tracking-wide uppercase">
                Active Riders
              </span>
            </div>

            <div className="h-10 w-[1px] bg-white/[0.08]" />

            <div className="flex flex-col items-center gap-1.5">
              <span className="font-['Montserrat'] font-extrabold text-[28px] sm:text-[34px] text-[#f9d749] leading-none tracking-tight">
                800+
              </span>
              <span className="text-[12px] font-medium text-gray-400 tracking-wide uppercase">
                Vendors
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
