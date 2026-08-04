"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: "track-order",
    question: "How do I track my Order?",
    answer:
      "You can easily track your order in real-time by navigating to the Orders section in your account dashboard. You will also receive continuous SMS and email notifications with live updates as your parcel moves from vendor dispatch to your doorstep.",
  },
  {
    id: "return-policy",
    question: "What is your return policy?",
    answer:
      "Items can be returned within 14 days of delivery provided they are in their original condition and packaging. Simply visit your order history to initiate a hassle-free return and schedule a free doorstep pickup.",
  },
  {
    id: "nationwide-delivery",
    question: "Do you deliver Nationwide?",
    answer:
      "Yes! Fastlink provides fast, reliable nationwide delivery across all 36 states in Nigeria. Express local delivery arrives within 24 hours, while nationwide logistics arrive in 2 to 5 business days.",
  },
];

export function FAQStrip() {
  const [openId, setOpenId] = useState<string | null>("track-order");

  const toggleItem = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="w-full bg-[#D4BAF0] py-16">
      <div className="container-wide">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-8 md:gap-12 items-start">
          {FAQ_ITEMS.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div key={item.id} className="flex flex-col gap-4">
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  className="flex items-center justify-between gap-2 text-left text-[15px] font-medium text-white transition-opacity hover:opacity-90 cursor-pointer"
                >
                  <span>{item.question}</span>
                  {isOpen ? (
                    <ChevronUp size={18} className="shrink-0" />
                  ) : (
                    <ChevronDown size={18} className="shrink-0 text-white/80" />
                  )}
                </button>
                {isOpen && (
                  <p className="text-[13px] font-medium leading-[1.6] text-[#4A2574] pr-4 animate-in fade-in duration-200">
                    {item.answer}
                  </p>
                )}
              </div>
            );
          })}

          {/* CTA Button */}
          <div className="flex shrink-0 pt-1 md:pt-0">
            <Link
              href="/faq"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-[#834AB9] px-6 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#6D349F] active:scale-[0.98]"
            >
              Visit our FAQs Center
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

