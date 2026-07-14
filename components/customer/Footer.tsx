"use client";

import * as React from "react";

function FooterLogo() {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <svg className="w-11 h-7 text-white flex-shrink-0" viewBox="0 0 50 30" fill="currentColor">
          <rect x="2" y="5" width="8" height="2" rx="1" />
          <rect x="5" y="11" width="10" height="2" rx="1" />
          <rect x="3" y="17" width="8" height="2" rx="1" />
          <rect x="7" y="23" width="9" height="2" rx="1" />
          <rect x="18" y="5" width="4" height="4" />
          <rect x="26" y="5" width="4" height="4" />
          <rect x="34" y="5" width="4" height="4" />
          <rect x="22" y="9" width="4" height="4" />
          <rect x="30" y="9" width="4" height="4" />
          <rect x="18" y="13" width="4" height="4" />
          <rect x="26" y="13" width="4" height="4" />
          <rect x="34" y="13" width="4" height="4" />
          <rect x="22" y="17" width="4" height="4" />
          <rect x="30" y="17" width="4" height="4" />
          <rect x="18" y="21" width="4" height="4" />
          <rect x="26" y="21" width="4" height="4" />
          <rect x="34" y="21" width="4" height="4" />
        </svg>
        <span className="font-['Montserrat'] font-extrabold text-[22px] tracking-tight text-white leading-none">
          FASTLINK
        </span>
      </div>
      <span className="font-['Montserrat'] font-bold text-[9px] tracking-[0.25em] text-white/80 leading-none pl-[44px] -mt-1">
        MARKETPLACE
      </span>
    </div>
  );
}

function DecorativeOrb() {
  return (
    <svg
      className="w-16 h-20 text-white flex-shrink-0 mr-4 self-center hidden md:block"
      viewBox="0 0 60 70"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M30 5C45 20 55 35 55 48C55 60 44 65 30 65C16 65 5 60 5 48C5 35 15 20 30 5Z"
        fill="url(#orbGrad)"
        opacity="0.35"
      />
      <path
        d="M30 10C40 22 48 34 48 45C48 55 40 58 30 58C20 58 12 55 12 45C12 34 20 22 30 10Z"
        fill="url(#orbGrad2)"
        opacity="0.25"
      />
      <circle cx="30" cy="48" r="16" fill="url(#orbCircle)" opacity="0.25" />
      <circle cx="26" cy="44" r="8" fill="#ffffff" opacity="0.15" />
      <defs>
        <linearGradient id="orbGrad" x1="30" y1="5" x2="30" y2="65" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#A06BD2" />
        </linearGradient>
        <linearGradient id="orbGrad2" x1="30" y1="10" x2="30" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#834AB9" />
        </linearGradient>
        <radialGradient id="orbCircle" cx="30" cy="48" r="16" fx="26" fy="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#380469" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export function Footer() {

  return (
    <footer className="w-full bg-primary-dark pt-16 pb-12 sm:pt-20 sm:pb-16 flex flex-col items-center">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 flex flex-col gap-12">
        {/* Main Columns Container */}
        <div className="flex flex-col md:flex-row justify-between gap-10 md:gap-6 flex-wrap">
          {/* Logo & Description */}
          <div className="flex flex-col gap-5 max-w-[280px]">
            <FooterLogo />
            <p className="text-purple-200/60 text-sm leading-relaxed font-['Montserrat'] font-normal">
              Connecting you to shops, malls, and riders near you for fast and reliable delivery.
            </p>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-3 gap-x-4 gap-y-8 sm:gap-x-10 md:gap-x-20 w-full sm:w-auto">
            {/* Company Column */}
            <div className="flex flex-col gap-4 font-['Montserrat']">
              <h3 className="text-white text-sm font-semibold tracking-wider">Company</h3>
              <ul className="flex flex-col gap-2.5">
                <li>
                  <a href="#" className="text-purple-200/70 hover:text-white transition-colors duration-200 text-[13px] font-normal leading-relaxed">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-purple-200/70 hover:text-white transition-colors duration-200 text-[13px] font-normal leading-relaxed">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="text-purple-200/70 hover:text-white transition-colors duration-200 text-[13px] font-normal leading-relaxed">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-purple-200/70 hover:text-white transition-colors duration-200 text-[13px] font-normal leading-relaxed">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* For Users Column */}
            <div className="flex flex-col gap-4 font-['Montserrat']">
              <h3 className="text-white text-sm font-semibold tracking-wider">For Users</h3>
              <ul className="flex flex-col gap-2.5">
                <li>
                  <a href="#" className="text-purple-200/70 hover:text-white transition-colors duration-200 text-[13px] font-normal leading-relaxed">
                    How it Works
                  </a>
                </li>
                <li>
                  <a href="#" className="text-purple-200/70 hover:text-white transition-colors duration-200 text-[13px] font-normal leading-relaxed">
                    Order Tracking
                  </a>
                </li>
                <li>
                  <a href="#" className="text-purple-200/70 hover:text-white transition-colors duration-200 text-[13px] font-normal leading-relaxed">
                    My Account
                  </a>
                </li>
                <li>
                  <a href="#" className="text-purple-200/70 hover:text-white transition-colors duration-200 text-[13px] font-normal leading-relaxed">
                    Refer a Friend
                  </a>
                </li>
                <li>
                  <a href="#" className="text-purple-200/70 hover:text-white transition-colors duration-200 text-[13px] font-normal leading-relaxed">
                    FAQs
                  </a>
                </li>
              </ul>
            </div>

            {/* For Vendors Column */}
            <div className="flex flex-col gap-4 font-['Montserrat']">
              <h3 className="text-white text-sm font-semibold tracking-wider">For Vendors</h3>
              <ul className="flex flex-col gap-2.5">
                <li>
                  <a href="#" className="text-purple-200/70 hover:text-white transition-colors duration-200 text-[13px] font-normal leading-relaxed">
                    Sell on Fastlink
                  </a>
                </li>
                <li>
                  <a href="#" className="text-purple-200/70 hover:text-white transition-colors duration-200 text-[13px] font-normal leading-relaxed">
                    Vendor Portal
                  </a>
                </li>
                <li>
                  <a href="#" className="text-purple-200/70 hover:text-white transition-colors duration-200 text-[13px] font-normal leading-relaxed">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="text-purple-200/70 hover:text-white transition-colors duration-200 text-[13px] font-normal leading-relaxed">
                    Success Stories
                  </a>
                </li>
                <li>
                  <a href="#" className="text-purple-200/70 hover:text-white transition-colors duration-200 text-[13px] font-normal leading-relaxed">
                    Partner API
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Decorative Orb */}
          <DecorativeOrb />
        </div>

        {/* Separator Divider Line */}
        <div className="w-full border-t border-white/[0.08] my-2" />

        {/* Bottom Row */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-purple-200/50 text-xs font-['Montserrat'] font-normal w-full text-center md:text-left">
          <span>© 2026 Fastlink. All rights reserved.</span>
          <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2">
            <a href="#" className="hover:text-white transition-colors duration-200">
              Privacy Policy
            </a>
            <span>·</span>
            <a href="#" className="hover:text-white transition-colors duration-200">
              Terms of Service
            </a>
            <span>·</span>
            <a href="#" className="hover:text-white transition-colors duration-200">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
