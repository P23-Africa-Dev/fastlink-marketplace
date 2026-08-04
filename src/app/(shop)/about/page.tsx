import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Truck,
  Users,
  Headphones,
  ShoppingBag,
  CreditCard,
  Award,
  Package,
  Search,
  Percent,
  RotateCcw,
  Store,
} from "lucide-react";

import whyUsIllustration from "@/assets/why_us_illustration.png";
import aboutHeroIllustration from "@/assets/about_hero_illustration.png";
import { FAQStrip } from "@/features/home/faq-strip";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "FastLink Marketplace is Nigeria's trusted online shopping destination, connecting you to the best products, top brands, and reliable stores all in one place.",
};

// ── Data ───────────────────────────────────────────────────────

const WHAT_WE_OFFER = [
  {
    icon: ShoppingBag,
    title: "Wide Selection",
    description: "Shop from thousands of products across multiple categories. Shop from thousands of products across multiple categories. Shop from thousands of products...",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    description: "Enjoy same-day or next-day delivery from trusted stores. Enjoy same-day or next-day delivery from trusted stores. Enjoy same-day...",
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    description: "Your transactions are safe with our secure payment system. Your transactions are safe with our secure payment system...",
  },
  {
    icon: Award,
    title: "Trusted Stores",
    description: "We partner with verified stores to guarantee quality and trust. We partner with verified stores...",
  },
  {
    icon: Headphones,
    title: "Customer Support",
    description: "Our support team is always here to assist you. Our support team is always here...",
  },
];

const WHY_US_POINTS = [
  { text: "Easy browsing and smart search", icon: Search },
  { text: "Real-time order tracking", icon: Truck },
  { text: "Exclusive deals and offers", icon: Percent },
  { text: "Hassle-free returns", icon: RotateCcw },
  { text: "Dedicated customer care", icon: Headphones },
];

const PROMISE_STATS = [
  { value: "1M", label: "Happy Customers" },
  { value: "2500+", label: "Trusted Stores" },
  { value: "50,000+", label: "Products" },
];

// ── Page ───────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <div className="bg-[#EADBF8] min-h-screen text-[#380469] font-montserrat">
      {/* ── Hero Section ────────────────────────────────────────── */}
      <section className="container-wide py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
          {/* Left Column — Text Content */}
          <div className="flex flex-col justify-center animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-[#380469] mb-6">
              About Fastlink Marketplace
            </h1>
            <p className="text-sm md:text-base leading-relaxed text-[#542B7A] font-medium mb-8">
              FastLink Marketplace is Nigeria&apos;s trusted online shopping destination,
              connecting you to the best products, top brands, and reliable stores
              all in one place. We make shopping simple, fast, and secure.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/products"
                className="inline-flex items-center justify-center rounded-xl bg-[#834AB9] px-8 py-3.5 text-sm font-bold text-white transition-all duration-200 hover:bg-[#6B3A99] shadow-md hover:shadow-lg hover:-translate-y-px"
              >
                Shop now!
              </Link>
              <Link
                href="/products?type=local-stores"
                className="inline-flex items-center justify-center rounded-xl border-2 border-[#834AB9] bg-transparent px-8 py-3.5 text-sm font-bold text-[#834AB9] transition-all duration-200 hover:bg-[#834AB9]/10 shadow-sm hover:shadow-md hover:-translate-y-px"
              >
                Explore Stores Near You
              </Link>
            </div>
          </div>

          {/* Right Column — Image Asset */}
          <div className="flex justify-center animate-fade-in stagger-1">
            <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-brand-md bg-[#3D3A40] border border-[#834AB9]/15">
              <Image
                src={aboutHeroIllustration}
                alt="About Fastlink Marketplace Storefront"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-500 hover:scale-105"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Our Story Section ────────────────────────────────────── */}
      <section className="container-wide py-16 border-t border-[#834AB9]/10 animate-fade-up">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#380469] mb-6">
            Our Story
          </h2>
          <p className="text-base md:text-lg leading-relaxed text-[#542B7A] font-medium">
            FastLink Marketplace was founded with a simple mission: to bridge the gap between
            shoppers and stores across Nigeria through technology and convenience.
            <br className="hidden md:inline" />
            From electronics to fashion, groceries to more, we bring a wide variety of products
            right to your doorstep.
          </p>
        </div>
      </section>

      {/* ── What We Offer Section ────────────────────────────────── */}
      <section className="container-wide py-16 border-t border-[#834AB9]/10 animate-fade-up">
        <h2 className="text-3xl md:text-4xl font-extrabold text-[#380469] mb-12 text-center">
          What We Offer
        </h2>
        <div className="flex flex-wrap justify-center gap-6 max-w-6xl mx-auto">
          {WHAT_WE_OFFER.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="w-full md:w-[calc(50%-16px)] lg:w-[calc(33.333%-16px)] flex flex-col items-center text-center bg-white rounded-2xl p-8 sm:p-10 border border-[#834AB9]/15 shadow-brand-md hover:shadow-brand-lg transition-all duration-300 hover:-translate-y-1"
              >
                {/* Icon Container */}
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F3E8FF] mb-5">
                  <Icon size={26} className="text-[#834AB9]" />
                </div>
                <h3 className="text-lg font-bold text-[#380469] mb-3">{item.title}</h3>
                <p className="text-sm leading-relaxed text-[#542B7A] font-medium">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Why Shop With Us Section ─────────────────────────────── */}
      <section className="container-wide py-16 border-t border-[#834AB9]/10 animate-fade-up">
        <div className="rounded-3xl bg-[#DFC8F5]/40 border border-[#834AB9]/10 p-8 sm:p-12 md:p-16 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
            {/* Left Column — Checklist */}
            <div className="flex flex-col">
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#380469] mb-8">
                Why Shop With Us?
              </h2>
              <ul className="flex flex-col gap-6">
                {WHY_US_POINTS.map((point) => {
                  const Icon = point.icon;
                  return (
                    <li key={point.text} className="flex items-center gap-4">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#834AB9] text-white shadow-sm">
                        <Icon size={16} />
                      </span>
                      <span className="text-base font-bold text-[#380469]/90">
                        {point.text}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Right Column — Illustration */}
            <div className="flex justify-center">
              <div className="relative w-full aspect-square max-w-[400px] rounded-3xl overflow-hidden shadow-brand-md bg-[#3D3A40] border border-[#834AB9]/15">
                <Image
                  src={whyUsIllustration}
                  alt="Why Shop With Us Illustration"
                  fill
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Our Promise Section ──────────────────────────────────── */}
      <section className="container-wide py-16 md:py-24 border-t border-[#834AB9]/10 animate-fade-up">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16 items-center max-w-6xl mx-auto">
          {/* Left Column — Copy */}
          <div className="lg:col-span-6 space-y-4">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#380469]">
              Our Promise
            </h2>
            <p className="text-sm md:text-base leading-relaxed text-[#542B7A] font-medium max-w-lg">
              We are committed to delivering a seamless shopping experience by combining technology,
              speed, and customer satisfaction.
              <br className="hidden md:inline" />
              Your trust drives us to keep improving every day.
            </p>
          </div>

          {/* Right Column — Stats */}
          <div className="lg:col-span-6">
            <div className="grid grid-cols-3 gap-4 sm:gap-8">
              {PROMISE_STATS.map((stat) => (
                <div key={stat.label} className="text-left">
                  <div className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#834AB9] mb-2">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-[#542B7A]/80 leading-snug">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Strip */}
      <FAQStrip />
    </div>
  );
}
