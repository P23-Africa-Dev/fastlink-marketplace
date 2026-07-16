"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/customer/Navbar";
import { Footer } from "@/components/customer/Footer";
import { BecomeVendorSection } from "@/components/customer/BecomeVendorSection";
import { Home, ChevronRight, Info, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function OrderTrackingPage() {
  const router = useRouter();
  const [orderId, setOrderId] = React.useState("");
  const [billingEmail, setBillingEmail] = React.useState("");

  const handleTrackOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || !billingEmail) {
      toast.error("Please fill in both fields.");
      return;
    }

    toast.success("Redirecting to tracking details...");
    router.push(`/order-tracking/${orderId}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="w-full flex-1">
        {/* Breadcrumb section */}
        <div className="w-full bg-[#FAFAFA] border-y border-gray-100 py-4 mb-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-500">
            <Link href="/" className="hover:text-primary-dark flex items-center gap-1 transition-colors">
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
            <span className="text-gray-400">Pages</span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
            <span className="text-primary-dark font-semibold">Order tracking</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
          <div className="max-w-3xl flex flex-col gap-8">
            {/* Heading and Description */}
            <div className="flex flex-col gap-4 text-left">
              <h1 className="text-[32px] sm:text-[38px] font-bold text-gray-900 tracking-tight leading-tight">
                Track Order
              </h1>
              <p className="text-sm sm:text-base text-gray-500 leading-relaxed max-w-2xl font-light">
                To track your order please enter your order ID in the input field below and press the &ldquo;Track Order&rdquo; button. this was given to you on your receipt and in the confirmation email you should have received.
              </p>
            </div>

            {/* Input Form */}
            <form onSubmit={handleTrackOrder} className="flex flex-col gap-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                {/* Order ID */}
                <div className="flex flex-col gap-2.5">
                  <label className="text-sm font-semibold text-gray-700 text-left">
                    Order ID
                  </label>
                  <input
                    type="text"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="ID..."
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-dark/20 focus:border-primary-dark transition-all h-[52px]"
                    required
                  />
                  <div className="flex items-start gap-2 mt-1 text-xs text-gray-400 font-medium leading-relaxed">
                    <Info className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" />
                    <span>Order ID that we sent to your in your email address.</span>
                  </div>
                </div>

                {/* Billing Email */}
                <div className="flex flex-col gap-2.5">
                  <label className="text-sm font-semibold text-gray-700 text-left">
                    Billing Email
                  </label>
                  <input
                    type="email"
                    value={billingEmail}
                    onChange={(e) => setBillingEmail(e.target.value)}
                    placeholder="Email address"
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-dark/20 focus:border-primary-dark transition-all h-[52px]"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-start">
                <button
                  type="submit"
                  className="bg-primary-dark hover:bg-primary-dark/95 text-white font-bold text-sm h-[54px] px-8 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-98 shadow-md"
                >
                  <span>TRACK ORDER</span>
                  <ArrowRight className="w-4.5 h-4.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Reusable Promotion Banner */}
      <BecomeVendorSection />

      {/* Footer */}
      <Footer />
    </div>
  );
}
