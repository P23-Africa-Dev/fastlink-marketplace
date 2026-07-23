import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Truck,
  Store,
  Users,
  Headphones,
  ShoppingBag,
  CreditCard,
  Award,
  Package,
} from "lucide-react";

import whyUsIllustration from "@/assets/why_us_illustration.png";
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
    description: "Shop from thousands of products across multiple categories.",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    description: "Enjoy same-day or next-day delivery from trusted stores.",
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    description: "Your transactions are safe with our secure payment system.",
  },
  {
    icon: Award,
    title: "Trusted Stores",
    description: "We partner with verified stores to guarantee quality and trust.",
  },
  {
    icon: Headphones,
    title: "Customer Support",
    description: "Our support team is always here to assist you.",
  },
];

const WHY_US_POINTS = [
  "Easy browsing and smart search",
  "Real-time order tracking",
  "Exclusive deals and offers",
  "Hassle-free returns",
  "Dedicated customer care",
];

const PROMISE_STATS = [
  { value: "1M+", label: "Happy Customers", icon: Users },
  { value: "2,500+", label: "Trusted Stores", icon: Store },
  { value: "50,000+", label: "Products", icon: Package },
];


// ── Shared helper ──────────────────────────────────────────────

function DecorativeHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-8 flex items-center justify-center gap-4">
      <div className="h-px w-10 rounded-full" style={{ background: "#834AB9" }} />
      <h2 className="text-2xl font-extrabold text-brand-900 md:text-3xl">{children}</h2>
      <div className="h-px w-10 rounded-full" style={{ background: "#834AB9" }} />
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <>
      <div className="bg-[#b09dc3] min-h-screen px-6">
        <div className="container-wid bg-[#c3b2cb] border border-brand-200/60 rounded-3x shadow-brand-md overflow-hidden">

          {/* ── Hero ──────────────────────────────────────────────── */}
          <section className="relative w-full overflow-hidden min-h-[380px] md:min-h-[440px] flex items-stretch">

            {/* Background Image & Overlay */}
            <div className="absolute inset-0 z-0 select-none">
              <Image
                src="https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=1600&auto=format&fit=crop"
                alt="FastLink – Shopping Mall"
                fill
                sizes="100vw"
                className="object-cover object-[85%_center] md:object-right"
                priority
              />
              {/* Horizontal blend overlay - visible on desktop */}
              <div
                className="absolute inset-0 z-10 pointer-events-none hidden md:block"
                style={{
                  background: "linear-gradient(to right, #EEE0FA 0%, #EEE0FA 30%, rgba(238, 224, 250, 0.95) 45%, rgba(238, 224, 250, 0.4) 70%, transparent 100%)"
                  // backgroundColor: "#EEE0FA"
                }}
                aria-hidden="true"
              />
              {/* Vertical blend overlay - visible on mobile */}
              <div
                className="absolute inset-0 z-10 pointer-events-none md:hidden"
                style={{
                  // background: "linear-gradient(to bottom, #EEE0FA 0%, #EEE0FA 40%, rgba(238, 224, 250, 0.9) 60%, rgba(238, 224, 250, 0.4) 85%, transparent 100%)"
                }}
                aria-hidden="true"
              />
            </div>

            {/* Left Column — Text Content */}
            <div className="relative z-20 flex flex-col justify-center w-full md:w-[58%] lg:w-[50%] p-6 sm:p-10 md:py-14 md:pl-12 lg:pl-16">

              {/* Breadcrumb */}
              <div className="mb-6 inline-flex w-fit items-center rounded-xl bg-white px-4 py-2 text-sm font-bold text-brand-600 shadow-sm">
                <Link href="/" className="hover:text-brand-800 transition-colors">Home</Link>
                <span className="mx-1.5 text-brand-600 font-bold">&gt;</span>
                <span className="text-brand-600">About us</span>
              </div>

              <h1 className="text-3xl font-extrabold leading-tight text-brand-900 sm:text-4xl lg:text-4xl mb-4">
                About FastLink Marketplace
              </h1>

              <p className="max-w-md text-sm leading-relaxed text-brand-900/80 mb-8 font-medium">
                FastLink Marketplace is Nigeria&apos;s trusted online shopping destination,
                connecting you to the best products, top brands, and reliable stores
                all in one place. We make shopping simple, fast, and secure.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-8 py-3.5 text-sm font-bold text-white transition-all duration-200 hover:bg-brand-700 shadow-md hover:shadow-lg"
                >
                  Shop Now
                </Link>
                <Link
                  href="/products?type=local-stores"
                  className="inline-flex items-center justify-center rounded-xl border-2 border-brand-600 bg-white px-8 py-3.5 text-sm font-bold text-brand-600 transition-all duration-200 hover:bg-brand-50 shadow-md hover:shadow-lg"
                >
                  Explore Store
                </Link>
              </div>
            </div>
          </section>

          {/* Divider line between Hero and Our Story */}
          <div className="h-px w-full bg-brand-200/60" />

          {/* Outer container padding wrapper for all subsequent sections */}
          <div className="px-6 md:px-12 lg:px-16 py-10 md:py-16 space-y-12 md:space-y-16">

            {/* ── Our Story ─────────────────────────────────────────── */}
            <section className="text-center">
              <div className="mx-auto max-w-4xl">
                <DecorativeHeading>Our Story</DecorativeHeading>
                <p className="mx-auto max-w-2xl text-base leading-relaxed text-brand-900/80 font-medium">
                  FastLink Marketplace was founded with a simple mission: to bridge the gap between
                  shoppers and stores across Nigeria through technology and convenience.
                  <br className="hidden md:inline" />
                  From electronics to fashion, groceries to more, we bring a wide variety of products
                  right to your doorstep.
                </p>
              </div>
            </section>

            {/* ── What We Offer ─────────────────────────────────────── */}
            <section className="border border-[#834AB9] rounded-3xl shadow-brand-md  p-6 sm:p-10 shadow-sm">
              <DecorativeHeading>What We Offer</DecorativeHeading>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                {WHAT_WE_OFFER.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="flex flex-col items-center gap-4 rounded-2xl px-4 py-6 text-center border border-[#834AB9]/60 shadow-brand-md transition-all duration-200"
                    >
                      {/* Circle for icon */}
                      <div
                        className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50"
                      >
                        <Icon size={30} className="text-brand-900" strokeWidth={1.5} />
                      </div>
                      <h3 className="text-sm font-bold text-brand-900">{item.title}</h3>
                      <p className="text-xs leading-relaxed text-brand-900/70 text-center">
                        {item.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* ── Why Shop With Us ──────────────────────────────────── */}
            <section className="overflow-hidden rounded-3xl bg-[#baa4cb] p-8 sm:p-12 shadow-sm border border-brand-300/40">
              <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-10">

                {/* Left — checklist */}
                <div className="flex flex-col gap-6 md:col-span-6 lg:col-span-7">
                  <h2 className="text-2xl font-extrabold text-brand-900 md:text-3xl">
                    Why Shop With Us?
                  </h2>
                  <ul className="flex flex-col gap-4">
                    {WHY_US_POINTS.map((point) => (
                      <li key={point} className="flex items-center gap-3">
                        {/* Filled purple checkbox */}
                        <span
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-brand-600 shadow-sm"
                          aria-hidden="true"
                        >
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path
                              d="M2 6l3 3 5-5"
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                        <span className="text-sm md:text-base font-bold text-brand-900/90">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Right — shopping illustration */}
                <div className="flex justify-center md:col-span-6 lg:col-span-5">
                  <div className="relative w-full max-w-[320px] sm:max-w-[360px] aspect-square overflow-hidden rounded-2xl shadow-brand-md bg-brand-100">
                    <Image
                      src={whyUsIllustration}
                      alt="Why Shop With Us Illustration"
                      fill
                      sizes="(max-width: 768px) 100vw, 30vw"
                      className="object-cover"
                    />
                  </div>
                </div>

              </div>
            </section>

            {/* ── Our Promise ───────────────────────────────────────── */}
            <section className=" border border-brand-200/60 rounded-3xl p-6 sm:p-10 shadow-sm">
              <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1fr_auto]">

                {/* Left — copy */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-extrabold text-brand-900 md:text-3xl">
                    Our Promise
                  </h2>
                  <p className="max-w-md text-sm md:text-base leading-relaxed text-brand-900/80 font-medium">
                    We are committed to delivering a seamless shopping experience by
                    combining technology, speed, and customer satisfaction.
                    <br className="hidden md:inline" />
                    Your trust drives us to keep improving every day.
                  </p>
                </div>

                {/* Right — stat cards */}
                <div className="flex flex-col gap-4 sm:flex-row">
                  {PROMISE_STATS.map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <div
                        key={stat.label}
                        className="flex min-w-[150px] flex-col items-center gap-2 rounded-2xl px-6 py-6 text-center border border-[#834AB9]/60 shadow-sm hover:shadow-brand-md transition-all duration-200"
                      >
                        <Icon
                          size={36}
                          className="text-brand-900 mb-1"
                          strokeWidth={1.5}
                        />
                        <span
                          className="text-2xl font-extrabold leading-tight text-brand-900"
                        >
                          {stat.value}
                        </span>
                        <span className="text-xs font-semibold text-brand-900/60">
                          {stat.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

              </div>
            </section>

          </div>
        </div>
      </div>
      <FAQStrip />
    </>
  );
}
