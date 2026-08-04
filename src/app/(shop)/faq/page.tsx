"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Package,
  Truck,
  CreditCard,
  RotateCcw,
  Store,
  MessageSquare,
  Mail,
  ArrowRight,
} from "lucide-react";

interface FAQCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

const CATEGORIES: FAQCategory[] = [
  { id: "all", name: "All Questions", icon: <HelpCircle size={18} /> },
  { id: "orders", name: "Orders & Tracking", icon: <Package size={18} /> },
  { id: "shipping", name: "Shipping & Delivery", icon: <Truck size={18} /> },
  { id: "payments", name: "Payments & Pricing", icon: <CreditCard size={18} /> },
  { id: "returns", name: "Returns & Refunds", icon: <RotateCcw size={18} /> },
  { id: "sellers", name: "Sellers & Vendors", icon: <Store size={18} /> },
];

const FAQS: FAQItem[] = [
  {
    id: "faq-1",
    category: "orders",
    question: "How do I track my order in real-time?",
    answer:
      "You can track your order live by navigating to the Orders section in your account dashboard. Additionally, Fastlink sends automated SMS and email notifications with live GPS tracking links as your parcel moves from store dispatch to delivery.",
  },
  {
    id: "faq-2",
    category: "orders",
    question: "Can I modify or cancel my order after placing it?",
    answer:
      "Orders can be modified or cancelled within 30 minutes of placement, as long as the merchant has not yet dispatched the package. Go to your Orders page and select 'Cancel Order' or contact vendor support directly.",
  },
  {
    id: "faq-3",
    category: "shipping",
    question: "What are the estimated delivery times?",
    answer:
      "Express local delivery within your city typically arrives within 2 to 24 hours. Nationwide delivery across all 36 Nigerian states takes between 2 to 5 business days depending on destination and courier choice.",
  },
  {
    id: "faq-4",
    category: "shipping",
    question: "Do you offer doorstep delivery nationwide?",
    answer:
      "Yes! Fastlink partners with top-tier logistics providers and local dispatch riders to ensure 100% doorstep delivery coverage nationwide across Nigeria.",
  },
  {
    id: "faq-5",
    category: "payments",
    question: "What payment methods are supported on Fastlink?",
    answer:
      "We accept all major Nigerian debit cards (Mastercard, Visa, Verve), Bank Transfers, USSD, Fastlink Wallet, and Pay-on-Delivery for select local verified stores.",
  },
  {
    id: "faq-6",
    category: "payments",
    question: "Are prices on Fastlink in Nigerian Naira (₦)?",
    answer:
      "Yes, all prices displayed across Fastlink stores, carts, and checkout pages are denominated in Nigerian Naira (₦) with zero hidden fees.",
  },
  {
    id: "faq-7",
    category: "returns",
    question: "What is your return & refund policy?",
    answer:
      "Fastlink offers a hassle-free 14-day return window. If an item is damaged, defective, or incorrect, you can request a return directly from your dashboard and schedule a free doorstep pickup for a 100% refund.",
  },
  {
    id: "faq-8",
    category: "returns",
    question: "How long does a refund take to process?",
    answer:
      "Once the returned parcel is received and verified by the merchant, refunds are credited back to your Fastlink Wallet immediately or back to your bank account within 24 to 48 hours.",
  },
  {
    id: "faq-9",
    category: "sellers",
    question: "How can I register my business as a vendor on Fastlink?",
    answer:
      "Joining Fastlink is fast and seamless! Click on 'Sell on Fastlink' or visit /register?role=seller to create your merchant store, upload your products, and start reaching thousands of active shoppers nationwide.",
  },
  {
    id: "faq-10",
    category: "sellers",
    question: "What does 'Verified Merchant' mean?",
    answer:
      "Verified Merchants are business owners who have undergone Fastlink's physical store verification, identity authentication, and quality audit, giving buyers 100% peace of mind.",
  },
];

export default function FAQPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [openIds, setOpenIds] = useState<string[]>(["faq-1", "faq-3"]);

  const toggleFaq = (id: string) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredFaqs = useMemo(() => {
    return FAQS.filter((faq) => {
      const matchesCategory =
        selectedCategory === "all" || faq.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === "" ||
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-[#EADBF8] font-montserrat">
      {/* ── Hero Banner ────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#6D349F] via-[#7E37C9] to-[#52237A] py-16 md:py-20 text-white">
        <div className="container-wide relative z-10 text-center">
          {/* <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs sm:text-sm font-semibold text-purple-100 backdrop-blur-md border border-white/20 mb-4">
            <HelpCircle size={16} /> Fastlink Support &amp; Help Center
          </span> */}
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4">
            How can we help you today?
          </h1>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-purple-100/90 leading-relaxed mb-8">
            Search our knowledge base or browse frequently asked questions regarding orders, logistics, payments, and vendor store policies.
          </p>

          {/* Search Box */}
          <div className="max-w-2xl mx-auto relative">
            <div className="relative flex items-center">
              <Search className="absolute left-4 h-5 w-5 text-purple-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search questions e.g. 'track order', 'returns', 'naira payment'..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-14 pl-12 pr-4 rounded-2xl bg-white text-gray-900 placeholder-gray-400 text-sm sm:text-base shadow-lg border border-purple-200 focus:outline-none focus:ring-4 focus:ring-purple-300/50 transition-all font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 text-xs font-bold text-purple-600 hover:text-purple-800 bg-purple-100 px-2.5 py-1 rounded-full"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Content ───────────────────────────────────────── */}
      <section className="container-wide py-12">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-4 mb-8">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-[#6D349F] text-white shadow-md scale-[1.02]"
                    : "bg-[#F6EFFD] text-[#6D349F] hover:bg-white border border-purple-100/80"
                }`}
              >
                {cat.icon}
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* FAQs Accordion List */}
        <div className="max-w-4xl mx-auto space-y-4">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => {
              const isOpen = openIds.includes(faq.id);
              return (
                <div
                  key={faq.id}
                  className="overflow-hidden rounded-2xl bg-[#F6EFFD] border border-white/80 shadow-sm transition-all hover:shadow-md"
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full flex items-center justify-between p-5 sm:p-6 text-left transition-colors hover:bg-white/40 cursor-pointer"
                  >
                    <span className="text-base sm:text-lg font-bold text-[#6D349F] pr-4">
                      {faq.question}
                    </span>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#6D349F] shadow-xs">
                      {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-6 pt-1 text-sm sm:text-base leading-relaxed text-[#4A2574] border-t border-purple-100/60 animate-in fade-in duration-200">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-16 bg-[#F6EFFD] rounded-2xl border border-white/60 p-8">
              <HelpCircle className="h-12 w-12 text-purple-400 mx-auto mb-3 opacity-60" />
              <h3 className="text-lg font-bold text-[#6D349F]">No matching questions found</h3>
              <p className="text-sm text-[#8A79A5] mt-1 mb-4">
                Try typing a different keyword or reset your search query.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory("all");
                  setSearchQuery("");
                }}
                className="px-5 py-2.5 rounded-xl bg-[#7E37C9] text-white text-xs font-bold hover:bg-[#6D349F] transition-colors"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>

        {/* ── Support Contact Banner ─────────────────────────────── */}
        <div className="max-w-4xl mx-auto mt-16 overflow-hidden rounded-3xl bg-gradient-to-r from-[#6D349F] to-[#7E37C9] p-8 sm:p-10 text-white shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <span className="inline-block rounded-md bg-white/10 px-3 py-1 text-xs font-bold text-purple-200 mb-2">
                24/7 Customer Care
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold mb-3">
                Still have questions?
              </h3>
              <p className="text-sm text-purple-100/90 leading-relaxed">
                Can&apos;t find the answer you&apos;re looking for? Our friendly support team is available 24/7 to assist you.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-3">
              <Link
                href="/contact"
                className="flex items-center justify-center gap-2 h-12 rounded-xl bg-white text-[#6D349F] text-sm font-bold shadow-md transition-all hover:bg-purple-50 hover:scale-[1.02] active:scale-[0.98]"
              >
                <MessageSquare size={18} />
                <span>Contact Customer Support</span>
                <ArrowRight size={16} />
              </Link>
              <a
                href="mailto:support@fastlink.com"
                className="flex items-center justify-center gap-2 h-12 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-bold backdrop-blur-sm border border-white/20 transition-all"
              >
                <Mail size={18} />
                <span>Email support@fastlink.com</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
