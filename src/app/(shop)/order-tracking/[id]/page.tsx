"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ChevronRight,
  ArrowLeft,
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
  Store,
  Bike,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function OrderTrackingDetailsPage() {
  const params = useParams();
  const rawId = (params?.id as string) || "96459761";
  const displayOrderId = rawId.startsWith("#") ? rawId : `#${rawId}`;

  // Mock activity logs matching design screenshot
  const activities = [
    {
      id: "act-1",
      title: "Your order has been delivered. Thank you for shopping at Fastlink!",
      timestamp: "23 Jan, 2021 at 7:32 PM",
      icon: Check,
      badgeBg: "bg-[#E8F7EE] text-[#2DB224]",
    },
    {
      id: "act-2",
      title: "Our delivery man (John Wick) Has picked-up your order for delivery.",
      timestamp: "23 Jan, 2021 at 2:00 PM",
      icon: User,
      badgeBg: "bg-[#E6F4FF] text-[#2DA5F3]",
    },
    {
      id: "act-3",
      title: "Your order has reached at last mile hub.",
      timestamp: "22 Jan, 2021 at 8:00 AM",
      icon: MapPin,
      badgeBg: "bg-[#E6F4FF] text-[#2DA5F3]",
    },
    {
      id: "act-4",
      title: "Your order on the way to (last mile) hub.",
      timestamp: "21 Jan, 2021 at 5:32 AM",
      icon: Map,
      badgeBg: "bg-[#E6F4FF] text-[#2DA5F3]",
    },
    {
      id: "act-[#5]",
      title: "Your order is successfully verified.",
      timestamp: "20 Jan, 2021 at 7:32 PM",
      icon: CheckCircle2,
      badgeBg: "bg-[#E8F7EE] text-[#2DB224]",
    },
    {
      id: "act-6",
      title: "Your order has been confirmed.",
      timestamp: "19 Jan, 2021 at 2:41 PM",
      icon: Calendar,
      badgeBg: "bg-[#E6F4FF] text-[#2DA5F3]",
    },
  ];

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
          <Link href="/order-tracking" className="hover:text-[#6D349F] transition-colors">
            Order tracking
          </Link>
          <ChevronRight size={13} />
          <span className="text-[#6D349F] font-bold">{displayOrderId}</span>
        </div>
      </div>

      {/* Main Order Details Container */}
      <div className="mx-auto max-w-[1600px] px-4 md:px-10 lg:px-16 py-8 md:py-12 space-y-12">
        <div>
          {/* Back Link */}
          <div className="mb-6">
            <Link
              href="/order-tracking"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#6D349F] hover:text-[#411266] transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Track Another Order</span>
            </Link>
          </div>

          {/* Main Card Container (Matching Design Screenshot 2) */}
          <div className="max-w-4xl rounded-2xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
            
            {/* Top Yellow Banner */}
            <div className="bg-[#FFFDF0] border-b border-[#FFE8A3] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#191C1F]">
                  {displayOrderId}
                </h1>
                <p className="text-xs sm:text-sm text-[#5F6C72] mt-1.5 font-medium">
                  4 Products · Order Placed in 17 Jan, 2021 at 7:32 PM
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-3xl sm:text-4xl font-extrabold text-[#2DA5F3]">
                  $1199.00
                </span>
              </div>
            </div>

            {/* Stepper Progress Bar */}
            <div className="p-6 sm:p-10 border-b border-slate-100">
              <p className="text-xs sm:text-sm font-semibold text-[#191C1F] mb-10">
                Order expected arrival <span className="font-extrabold text-[#191C1F]">23 Jan, 2021</span>
              </p>

              {/* Stepper Track & Nodes */}
              <div className="relative mb-8 px-4 sm:px-12">
                
                {/* Background Connecting Lines */}
                <div className="absolute top-3 left-10 right-10 h-1 bg-[#FFE0D3] rounded-full -z-0" />
                <div className="absolute top-3 left-10 w-1/3 h-1 bg-[#FA541C] rounded-full -z-0" />

                {/* 4 Steps */}
                <div className="relative z-10 flex items-center justify-between">
                  
                  {/* Step 1: Order Placed (Active/Checked) */}
                  <div className="flex flex-col items-center gap-3 text-center min-w-[80px]">
                    <div className="h-6 w-6 rounded-full bg-[#FA541C] text-white flex items-center justify-center shadow-xs">
                      <Check size={14} strokeWidth={3} />
                    </div>
                    <div className="flex flex-col items-center gap-1.5 mt-1">
                      <FileText size={22} className="text-[#2DB224]" />
                      <span className="text-xs sm:text-sm font-bold text-[#191C1F]">Order Placed</span>
                    </div>
                  </div>

                  {/* Step 2: Packaging (Current Active Stage) */}
                  <div className="flex flex-col items-center gap-3 text-center min-w-[80px]">
                    <div className="h-6 w-6 rounded-full bg-[#FA541C] text-white flex items-center justify-center shadow-xs ring-4 ring-[#FFE0D3]">
                      <div className="h-2 w-2 rounded-full bg-white" />
                    </div>
                    <div className="flex flex-col items-center gap-1.5 mt-1">
                      <Package size={22} className="text-[#FA541C]" />
                      <span className="text-xs sm:text-sm font-bold text-[#191C1F]">Packaging</span>
                    </div>
                  </div>

                  {/* Step 3: On The Road */}
                  <div className="flex flex-col items-center gap-3 text-center min-w-[80px]">
                    <div className="h-6 w-6 rounded-full bg-white border-2 border-[#FA541C]/40 text-[#FA541C] flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-[#FA541C]/40" />
                    </div>
                    <div className="flex flex-col items-center gap-1.5 mt-1">
                      <Truck size={22} className="text-[#FA541C]/40" />
                      <span className="text-xs sm:text-sm font-medium text-[#716388]">On The Road</span>
                    </div>
                  </div>

                  {/* Step 4: Delivered */}
                  <div className="flex flex-col items-center gap-3 text-center min-w-[80px]">
                    <div className="h-6 w-6 rounded-full bg-white border-2 border-[#FA541C]/30 flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-[#FA541C]/30" />
                    </div>
                    <div className="flex flex-col items-center gap-1.5 mt-1">
                      <Handshake size={22} className="text-[#FA541C]/30" />
                      <span className="text-xs sm:text-sm font-medium text-[#716388]">Delivered</span>
                    </div>
                  </div>

                </div>

              </div>
            </div>

            {/* Order Activity Timeline */}
            <div className="p-6 sm:p-10 space-y-6">
              <h2 className="text-lg sm:text-xl font-bold text-[#191C1F]">
                Order Activity
              </h2>

              <div className="space-y-4">
                {activities.map((act) => {
                  const IconComp = act.icon;
                  return (
                    <div key={act.id} className="flex items-start gap-4">
                      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-2xs mt-0.5", act.badgeBg)}>
                        <IconComp size={18} />
                      </div>
                      <div className="space-y-1 pt-0.5">
                        <p className="text-xs sm:text-sm font-semibold text-[#191C1F] leading-snug">
                          {act.title}
                        </p>
                        <p className="text-xs text-[#716388]">
                          {act.timestamp}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

          </div>
        </div>

        {/* Bottom CTA Card: Become a Vendor or Rider */}
        <div className="rounded-3xl bg-[#1E1E22] p-8 sm:p-12 text-white shadow-xl max-w-4xl">
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
