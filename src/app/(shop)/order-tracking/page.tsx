"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Info, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { BecomeVendorRiderCta } from "@/components/become-vendor-rider-cta";

export default function OrderTrackingPage() {
  const router = useRouter();
  const [orderId, setOrderId] = useState("");
  const [billingEmail, setBillingEmail] = useState("");
  
  const [orderIdError, setOrderIdError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [touched, setTouched] = useState({ orderId: false, email: false });

  // Validation checks
  const isEmailValid = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isOrderIdValid = (id: string) => id.trim().length >= 5;

  const isFormFilled = orderId.trim().length > 0 && billingEmail.trim().length > 0;
  const isFormValid = isOrderIdValid(orderId) && isEmailValid(billingEmail);

  function handleOrderIdChange(value: string) {
    setOrderId(value);
    if (touched.orderId) {
      if (value.trim().length < 5) {
        setOrderIdError("Order ID must be at least 5 characters.");
      } else {
        setOrderIdError("");
      }
    }
  }

  function handleEmailChange(value: string) {
    setBillingEmail(value);
    if (touched.email) {
      if (!isEmailValid(value)) {
        setEmailError("Please enter a valid email address.");
      } else {
        setEmailError("");
      }
    }
  }

  function handleBlur(field: "orderId" | "email") {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (field === "orderId") {
      if (orderId.trim().length < 5) {
        setOrderIdError("Order ID must be at least 5 characters.");
      } else {
        setOrderIdError("");
      }
    }
    if (field === "email") {
      if (!isEmailValid(billingEmail)) {
        setEmailError("Please enter a valid email address.");
      } else {
        setEmailError("");
      }
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ orderId: true, email: true });

    let valid = true;
    if (!isOrderIdValid(orderId)) {
      setOrderIdError("Order ID must be at least 5 characters.");
      valid = false;
    } else {
      setOrderIdError("");
    }

    if (!isEmailValid(billingEmail)) {
      setEmailError("Please enter a valid email address.");
      valid = false;
    } else {
      setEmailError("");
    }

    if (valid) {
      const formattedId = orderId.trim().replace(/^#/, "");
      const email = encodeURIComponent(billingEmail.trim());
      router.push(`/order-tracking/${encodeURIComponent(formattedId)}?email=${email}`);
    }
  }

  return (
    <div className="min-h-screen bg-white font-montserrat text-[#1E1E2F]">
      
      {/* Breadcrumb Header */}
      <div className="bg-[#FAF8FC] border-b border-purple-100/60 py-3.5 px-4 md:px-10 lg:px-16">
        <div className="mx-auto max-w-[1600px] flex items-center gap-2 text-xs font-semibold text-[#8A79A5]">
          <Link href="/" className="hover:text-[#6D349F] transition-colors flex items-center gap-1">
            Home
          </Link>
          <ChevronRight size={13} />
          <span>Pages</span>
          <ChevronRight size={13} />
          <span className="text-[#6D349F] font-bold">Order tracking</span>
        </div>
      </div>

      {/* Main Track Order Content */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 md:px-8 py-12 md:py-16 space-y-16">
        <div className="max-w-3xl space-y-6">
          
          <h1 className="text-3xl sm:text-4xl font-bold text-[#191C1F] font-montserrat tracking-tight">
            Track Order
          </h1>

          <p className="text-xs sm:text-sm text-[#5F6C72] leading-relaxed max-w-2xl font-normal">
            To track your order please enter your order ID in the input field below and press the &quot;Track Order&quot; button. this was given to you on your receipt and in the confirmation email you should have received.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            
            {/* 2-Column Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              
              {/* Order ID Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#191C1F] mb-2">
                  Order ID
                </label>
                <input
                  type="text"
                  placeholder="ID..."
                  value={orderId}
                  onChange={(e) => handleOrderIdChange(e.target.value)}
                  onBlur={() => handleBlur("orderId")}
                  className={cn(
                    "w-full rounded-xl border bg-white px-4 py-3 text-xs sm:text-sm text-[#191C1F] placeholder:text-slate-400 focus:outline-none transition-all shadow-2xs",
                    orderIdError
                      ? "border-rose-500 focus:border-rose-500 ring-1 ring-rose-500"
                      : "border-slate-200 focus:border-[#411266] focus:ring-1 focus:ring-[#411266]",
                  )}
                />
                {orderIdError && (
                  <p className="mt-1.5 text-xs text-rose-500 font-medium">
                    {orderIdError}
                  </p>
                )}
              </div>

              {/* Billing Email Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#191C1F] mb-2">
                  Billing Email
                </label>
                <input
                  type="email"
                  placeholder="Email address"
                  value={billingEmail}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  onBlur={() => handleBlur("email")}
                  className={cn(
                    "w-full rounded-xl border bg-white px-4 py-3 text-xs sm:text-sm text-[#191C1F] placeholder:text-slate-400 focus:outline-none transition-all shadow-2xs",
                    emailError
                      ? "border-rose-500 focus:border-rose-500 ring-1 ring-rose-500"
                      : "border-slate-200 focus:border-[#411266] focus:ring-1 focus:ring-[#411266]",
                  )}
                />
                {emailError && (
                  <p className="mt-1.5 text-xs text-rose-500 font-medium">
                    {emailError}
                  </p>
                )}
              </div>

            </div>

            {/* Helper Note */}
            <div className="flex items-center gap-1.5 text-xs text-[#5F6C72] pt-1">
              <Info size={15} className="text-[#5F6C72] shrink-0" />
              <span>Order ID that we send to you in your email address.</span>
            </div>

            {/* Submit Button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={!isFormFilled}
                className={cn(
                  "inline-flex items-center justify-center gap-2.5 rounded-xl py-3.5 px-8 text-xs font-extrabold uppercase tracking-wider text-white shadow-md transition-all",
                  isFormFilled
                    ? "bg-[#411266] hover:bg-[#320c50] cursor-pointer active:scale-[0.99]"
                    : "bg-slate-300 text-slate-500 cursor-not-allowed opacity-70 shadow-none",
                )}
              >
                <span>TRACK ORDER</span>
                <ArrowRight size={16} />
              </button>
            </div>

          </form>

        </div>

        {/* Bottom CTA Card: Become a Vendor or Rider */}
        <BecomeVendorRiderCta />

      </div>

    </div>
  );
}
