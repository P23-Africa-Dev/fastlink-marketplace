"use client";

import React, { useState } from "react";
import Image from "next/image";
import contactHeroFrame from "@/assets/Frame 1000009508.png";
import {
  Phone,
  MessageCircle,
  ArrowRight,
  Mail,
  MapPin,
} from "lucide-react";
import { BecomeVendorRiderCta } from "@/components/become-vendor-rider-cta";
import { FAQStrip } from "@/features/home/faq-strip";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    orderNumber: "",
    message: "",
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      setFormSubmitted(true);
      setFormData({ name: "", email: "", orderNumber: "", message: "" });
    }
  }

  return (
    <div className="min-h-screen bg-[#F6EFFD] font-montserrat text-[#1E1E2F]">

      {/* ── 1. Hero Section ───────────────────────────────────────────── */}
      <section className="relative w-full min-h-[380px] sm:min-h-[460px] flex items-center overflow-hidden">
        {/* Background Frame Image */}
        <Image
          src={contactHeroFrame}
          alt="Contact Support Background"
          fill
          priority
          className="object-cover object-center"
        />

        <div className="mx-auto max-w-6xl px-4 w-full relative z-10 py-12 sm:py-16 md:py-20">
          <div className="max-w-3xl space-y-5">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight font-montserrat tracking-tight">
              We&apos;re Here to Help.
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-slate-200 leading-relaxed font-medium max-w-2xl sm:max-w-3xl">
              Reach out to our dedicated FastLink support team. Contact Us Now.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-3">
              <a
                href="tel:+12025550126"
                className="rounded-xl bg-[#FA8232] hover:bg-[#E06D20] text-white font-extrabold text-xs sm:text-sm px-8 py-3.5 transition-all shadow-md active:scale-95 inline-flex items-center justify-center font-montserrat cursor-pointer"
              >
                Get in Touch
              </a>

              <a
                href="mailto:Support@clicon.com"
                className="rounded-xl border border-white/70 bg-white/5 hover:bg-white/15 text-white font-extrabold text-xs sm:text-sm px-8 py-3.5 transition-all active:scale-95 inline-flex items-center justify-center font-montserrat cursor-pointer"
              >
                Live Chat
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Middle Contact Cards Section ───────────────────────────── */}
      <section className="bg-[#F6EFFD] py-16 md:py-20 px-4 md:px-10 lg:px-16">
        <div className="mx-auto max-w-5xl space-y-12 text-center">

          {/* Section Header */}
          <div className="space-y-3">
            <div>
              <span className="inline-block rounded-md bg-[#2DA5F3] px-3.5 py-1.5 text-xs font-extrabold text-white uppercase tracking-wider shadow-2xs">
                CONTACT US
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-[34px] font-bold text-[#191C1F] tracking-tight leading-snug font-montserrat">
              Don&apos;t find your answer.<br />Contact with us
            </h2>
          </div>

          {/* 2-Column Contact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 text-left">

            {/* Card 1: Call Us Now */}
            <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-purple-100/40 flex flex-col justify-between gap-6 hover:shadow-md transition-all">
              <div className="space-y-4">
                <div className="flex items-start gap-5">
                  <div className="h-16 w-16 sm:h-20 sm:w-20 shrink-0 rounded-2xl bg-[#EAF6FE] text-[#2DA5F3] flex items-center justify-center shadow-2xs">
                    <Phone size={30} />
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
                  <p className="text-[22px] sm:text-[24px] font-semibold text-[#191C1F] leading-[32px] tracking-normal font-montserrat">
                    +1-202-555-0126
                  </p>
                </div>
              </div>

              <div className="sm:pl-[100px]">
                <a
                  href="tel:+12025550126"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#2DA5F3] hover:bg-[#1C90DC] text-white font-extrabold text-[13px] leading-[44px] tracking-[0.012em] uppercase px-7 h-[44px] shadow-2xs transition-all cursor-pointer active:scale-95 font-montserrat"
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
                  <div className="h-16 w-16 sm:h-20 sm:w-20 shrink-0 rounded-2xl bg-[#EAF8E6] text-[#2DB224] flex items-center justify-center shadow-2xs">
                    <MessageCircle size={30} />
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
                  <p className="text-[22px] sm:text-[24px] font-semibold text-[#191C1F] leading-[32px] tracking-normal font-montserrat truncate">
                    Support@clicon.com
                  </p>
                </div>
              </div>

              <div className="sm:pl-[100px]">
                <a
                  href="mailto:Support@clicon.com"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#2DB224] hover:bg-[#239B1B] text-white font-extrabold text-[13px] leading-[44px] tracking-[0.012em] uppercase px-7 h-[44px] shadow-2xs transition-all cursor-pointer active:scale-95 font-montserrat"
                >
                  <span>CONTACT US</span>
                  <ArrowRight size={16} />
                </a>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ── 3. Full-Width Contact Us Form Section ──────────────────────── */}
      <section className="w-full bg-[#FFFFFF] pt-16 md:pt-24 md:pb-10 border-y border-purple-100/50">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start text-left">

            {/* Left Info Column (5 cols) */}
            <div className="lg:col-span-5 space-y-6 pt-2">
              <div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#191C1F] tracking-tight font-montserrat mb-4">
                  Contact Us
                </h2>
                <p className="text-xs sm:text-sm text-[#5F6C72] leading-relaxed max-w-md font-normal">
                  We are committed to processing the information in order to contact you and talk about your project.
                </p>
              </div>

              {/* Contact List */}
              <div className="space-y-6 pt-2">

                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="h-11 w-11 shrink-0 rounded-xl bg-white text-[#FA8232] flex items-center justify-center shadow-2xs">
                    {/* <Mail size={20} /> */}
                    <svg width="24" height="20" viewBox="0 0 24 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 5L12 12L5 5" stroke="#FD7E1E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                      <rect x="1" y="1" width="22" height="18" rx="2" stroke="#FD7E1E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                      <path d="M7 13L5 15" stroke="#FD7E1E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                      <path d="M17 13L19 15" stroke="#FD7E1E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>

                  </div>
                  <div className="pt-2">
                    <p className="text-xs sm:text-sm font-semibold text-[#191C1F] font-montserrat">
                      example@fastlink.com
                    </p>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-4">
                  <div className="h-11 w-11 shrink-0 rounded-xl bg-white text-[#FA8232] flex items-center justify-center shadow-2xs">
                    {/* <MapPin size={20} /> */}

                    <svg width="24" height="23" viewBox="0 0 24 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 12V22H13" stroke="#FD7E1E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                      <path d="M20.86 8.249L12 1L1 10" stroke="#FD7E1E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                      <path fill-rule="evenodd" clip-rule="evenodd" d="M23 14.817C23 17.183 19 21 19 21C19 21 15 17.183 15 14.817C15.0139 13.777 15.4458 12.7863 16.1983 12.0683C16.9507 11.3502 17.9605 10.9652 19 11C20.0395 10.9652 21.0493 11.3502 21.8017 12.0683C22.5542 12.7863 22.9861 13.777 23 14.817V14.817Z" stroke="#FD7E1E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                      <circle cx="19" cy="15" r="1" fill="url(#paint0_linear_181_19883)" />
                      <defs>
                        <linearGradient id="paint0_linear_181_19883" x1="18.3359" y1="14.2027" x2="19.849" y2="15.7655" gradientUnits="userSpaceOnUse">
                          <stop stop-color="#A83ADC" />
                          <stop offset="1" stop-color="#FF6C1A" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  <div className="pt-1">
                    <p className="text-xs sm:text-sm font-semibold text-[#191C1F] leading-snug font-montserrat">
                      4074 fastlink Suite 375<br />
                      Abuja Nigeria
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-4">
                  <div className="h-11 w-11 shrink-0 rounded-xl bg-white text-[#FA8232] flex items-center justify-center shadow-2xs">
                    {/* <Phone size={20} /> */}

                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fill-rule="evenodd" clip-rule="evenodd" d="M20 11H12L8 13V3C8 1.89543 8.89543 1 10 1H20C21.1046 1 22 1.89543 22 3V9C22 10.1046 21.1046 11 20 11Z" stroke="#FD7E1E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                      <path d="M5 3H3C1.89543 3 1 3.89543 1 5V21C1 22.1046 1.89543 23 3 23H14C15.1046 23 16 22.1046 16 21V14" stroke="#FD7E1E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>

                  </div>
                  <div className="pt-2">
                    <p className="text-xs sm:text-sm font-semibold text-[#191C1F] font-montserrat">
                      +44 123 654 7890
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Right Form Column (7 cols) */}
            <div className="lg:col-span-7">
              <form onSubmit={handleFormSubmit} className="space-y-4">

                {/* Name Input */}
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Name *"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-xs sm:text-sm text-[#191C1F] placeholder:text-slate-400 focus:border-[#8B5CF6] focus:outline-none transition-all shadow-2xs"
                  />
                </div>

                {/* Email Input */}
                <div>
                  <input
                    type="email"
                    required
                    placeholder="Email *"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-xs sm:text-sm text-[#191C1F] placeholder:text-slate-400 focus:border-[#8B5CF6] focus:outline-none transition-all shadow-2xs"
                  />
                </div>

                {/* Order Number Input */}
                <div>
                  <input
                    type="text"
                    placeholder="Order Number"
                    value={formData.orderNumber}
                    onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-xs sm:text-sm text-[#191C1F] placeholder:text-slate-400 focus:border-[#8B5CF6] focus:outline-none transition-all shadow-2xs"
                  />
                </div>

                {/* Message Textarea */}
                <div>
                  <textarea
                    required
                    rows={4}
                    placeholder="Message *"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-xs sm:text-sm text-[#191C1F] placeholder:text-slate-400 focus:border-[#8B5CF6] focus:outline-none transition-all shadow-2xs resize-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold text-xs sm:text-sm py-3.5 px-6 transition-all shadow-sm active:scale-[0.99] cursor-pointer font-montserrat"
                >
                  Submit
                </button>

                {formSubmitted && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold text-center">
                    Thank you for contacting us! We will respond shortly.
                  </div>
                )}

              </form>
            </div>

          </div>
        </div>

        <BecomeVendorRiderCta />

      </section>

      {/* FAQ Strip */}
      <FAQStrip />

    </div>
  );
}
