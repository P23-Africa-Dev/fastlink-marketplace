"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Info,
  ArrowRight,
  Check,
  FileText,
  Package,
  Truck,
  Handshake,
  User,
  MapPin,
  Map,
  CheckCircle2,
  Calendar,
  Bike,
  Store,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Sample mock order data for demonstration
const MOCK_ORDER = {
  id: "#96459761",
  productCount: 4,
  placedDate: "17 Jan, 2021 at 7:32 PM",
  expectedArrival: "23 Jan, 2021",
  totalAmount: "$1199.00",
  currentStage: 2, // 1: Order Placed, 2: Packaging, 3: On The Road, 4: Delivered
  activities: [
    {
      id: "act-1",
      title: "Your order has been delivered. Thank you for shopping at Fastlink!",
      timestamp: "23 Jan, 2021 at 7:32 PM",
      type: "delivered",
      icon: Check,
      badgeBg: "bg-emerald-100 text-emerald-600",
    },
    {
      id: "act-2",
      title: "Our delivery rider (John Wick) has picked-up your order for delivery.",
      timestamp: "23 Jan, 2021 at 2:00 PM",
      type: "pickup",
      icon: User,
      badgeBg: "bg-sky-100 text-sky-600",
    },
    {
      id: "act-3",
      title: "Your order has reached at last mile hub.",
      timestamp: "22 Jan, 2021 at 8:00 AM",
      type: "hub",
      icon: MapPin,
      badgeBg: "bg-sky-100 text-sky-600",
    },
    {
      id: "act-4",
      title: "Your order on the way to (last mile) hub.",
      timestamp: "21 Jan, 2021 at 5:32 AM",
      type: "route",
      icon: Map,
      badgeBg: "bg-sky-100 text-sky-600",
    },
    {
      id: "act-5",
      title: "Your order is successfully verified.",
      timestamp: "20 Jan, 2021 at 7:32 PM",
      type: "verified",
      icon: CheckCircle2,
      badgeBg: "bg-emerald-100 text-emerald-600",
    },
    {
      id: "act-6",
      title: "Your order has been confirmed.",
      timestamp: "19 Jan, 2021 at 2:41 PM",
      type: "confirmed",
      icon: Calendar,
      badgeBg: "bg-sky-100 text-sky-600",
    },
  ],
};

export default function OrderTrackingPage() {
  const [orderId, setOrderId] = useState("");
  const [billingEmail, setBillingEmail] = useState("");
  const [trackedOrder, setTrackedOrder] = useState<typeof MOCK_ORDER | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  function handleTrackOrder(e: React.FormEvent) {
    e.preventDefault();
    setHasSearched(true);
    // For demo purposes, display the mock order
    setTrackedOrder(MOCK_ORDER);
  }

  return (
    <div className="min-h-screen bg-slate-50 font-montserrat text-[#1E1E2F]">
      
      {/* Breadcrumb Navigation */}
      <div className="bg-[#FAF8FC] border-b border-purple-100 py-3 px-4 md:px-10 lg:px-16">
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

      <div className="mx-auto max-w-[1600px] px-4 md:px-10 lg:px-16 py-8 md:py-12 space-y-12">
        
        {/* Track Order Form Section */}
        <div className="rounded-2xl bg-white p-6 sm:p-10 shadow-2xs border border-slate-200/80 max-w-4xl">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E1E2F] mb-3 font-montserrat">
            Track Order
          </h1>
          <p className="text-xs sm:text-sm text-[#716388] leading-relaxed mb-6 max-w-2xl">
            To track your order please enter your order ID in the input field below and press the &quot;Track Order&quot; button. This was given to you on your receipt and in the confirmation email you should have received.
          </p>

          <form onSubmit={handleTrackOrder} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1E1E2F] mb-2">
                  Order ID
                </label>
                <input
                  type="text"
                  placeholder="ID..."
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#1E1E2F] placeholder-slate-400 focus:border-[#411266] focus:outline-none transition-all shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1E1E2F] mb-2">
                  Billing Email
                </label>
                <input
                  type="email"
                  placeholder="Email address"
                  value={billingEmail}
                  onChange={(e) => setBillingEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#1E1E2F] placeholder-slate-400 focus:border-[#411266] focus:outline-none transition-all shadow-2xs"
                />
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-[#8A79A5]">
              <Info size={14} className="text-[#8A79A5] shrink-0" />
              <span>Order ID that we sent to you in your email address.</span>
            </div>

            <button
              type="submit"
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-[#411266] hover:bg-[#320c50] text-white font-extrabold px-8 py-3.5 text-xs sm:text-sm uppercase tracking-wider shadow-md transition-all cursor-pointer active:scale-[0.99]"
            >
              <span>TRACK ORDER</span>
              <ArrowRight size={16} />
            </button>
          </form>
        </div>

        {/* Order Status & Progress Details (Displayed when Tracked) */}
        {(trackedOrder || hasSearched) && (
          <div className="rounded-2xl bg-white shadow-2xs border border-slate-200/80 overflow-hidden max-w-4xl">
            
            {/* Top Summary Banner */}
            <div className="bg-[#FFFDF0] border-b border-[#FFE8A3] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#1E1E2F]">
                  {trackedOrder?.id || "#96459761"}
                </h2>
                <p className="text-xs sm:text-sm text-[#716388] mt-1 font-medium">
                  {trackedOrder?.productCount} Products · Order Placed in {trackedOrder?.placedDate}
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#00A8FF]">
                  {trackedOrder?.totalAmount}
                </span>
              </div>
            </div>

            {/* Stepper Progress Section */}
            <div className="p-6 sm:p-10 border-b border-slate-100">
              <p className="text-xs sm:text-sm font-semibold text-[#1E1E2F] mb-8">
                Order expected arrival <span className="font-extrabold">{trackedOrder?.expectedArrival}</span>
              </p>

              {/* Progress Line and Nodes */}
              <div className="relative mb-10 px-4 sm:px-10">
                {/* Connecting Track Line */}
                <div className="absolute top-3.5 left-8 right-8 h-1 bg-amber-100 rounded-full -z-0" />
                <div className="absolute top-3.5 left-8 w-1/3 h-1 bg-[#FA541C] rounded-full -z-0" />

                {/* 4 Stages Nodes */}
                <div className="relative z-10 flex items-center justify-between">
                  
                  {/* Stage 1: Order Placed */}
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="h-7 w-7 rounded-full bg-[#FA541C] text-white flex items-center justify-center shadow-xs">
                      <Check size={14} strokeWidth={3} />
                    </div>
                    <div className="flex flex-col items-center gap-1 mt-1">
                      <FileText size={20} className="text-[#FA541C]" />
                      <span className="text-xs sm:text-sm font-bold text-[#1E1E2F]">Order Placed</span>
                    </div>
                  </div>

                  {/* Stage 2: Packaging */}
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="h-7 w-7 rounded-full bg-[#FA541C] text-white flex items-center justify-center shadow-xs">
                      <div className="h-2.5 w-2.5 rounded-full bg-white" />
                    </div>
                    <div className="flex flex-col items-center gap-1 mt-1">
                      <Package size={20} className="text-[#FA541C]" />
                      <span className="text-xs sm:text-sm font-bold text-[#1E1E2F]">Packaging</span>
                    </div>
                  </div>

                  {/* Stage 3: On The Road */}
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="h-7 w-7 rounded-full bg-white border-2 border-amber-300 text-amber-500 flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-amber-300" />
                    </div>
                    <div className="flex flex-col items-center gap-1 mt-1">
                      <Truck size={20} className="text-[#FA541C]/60" />
                      <span className="text-xs sm:text-sm font-medium text-[#716388]">On The Road</span>
                    </div>
                  </div>

                  {/* Stage 4: Delivered */}
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="h-7 w-7 rounded-full bg-white border-2 border-amber-200 text-amber-400 flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-amber-200" />
                    </div>
                    <div className="flex flex-col items-center gap-1 mt-1">
                      <Handshake size={20} className="text-[#FA541C]/50" />
                      <span className="text-xs sm:text-sm font-medium text-[#716388]">Delivered</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Order Activity Log */}
            <div className="p-6 sm:p-10 space-y-6">
              <h3 className="text-base sm:text-lg font-extrabold text-[#1E1E2F]">
                Order Activity
              </h3>

              <div className="space-y-4">
                {MOCK_ORDER.activities.map((act) => {
                  const IconComp = act.icon;
                  return (
                    <div key={act.id} className="flex items-start gap-3.5">
                      <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg shadow-2xs mt-0.5", act.badgeBg)}>
                        <IconComp size={16} />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs sm:text-sm font-semibold text-[#1E1E2F]">
                          {act.title}
                        </p>
                        <p className="text-xs text-[#8A79A5]">
                          {act.timestamp}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* Bottom CTA Card: Become a Vendor or Rider (Matching Screenshot 1 & 2) */}
        <div className="rounded-3xl bg-[#1E1E22] p-8 sm:p-12 text-white shadow-xl">
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
  );
}
