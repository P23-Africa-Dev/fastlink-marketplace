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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BecomeVendorRiderCta } from "@/components/become-vendor-rider-cta";

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
      <div className="mx-auto max-w-5xl px-4 sm:px-6 md:px-8 py-8 md:py-12 space-y-10">
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

          {/* Main Card Container (Matching Design Screenshot) */}
          <div className="rounded-md bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
            
            {/* Top Yellow Banner Box */}
            <div className="p-6 pb-2">
              <div className="bg-[#FFFDF0] border border-[#FFE8A3] p-6 rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-[#191C1F]">
                    {displayOrderId}
                  </h1>
                  <p className="text-xs sm:text-sm text-[#5F6C72] mt-1 font-normal">
                    4 Products · Order Placed in 17 Jan, 2021 at 7:32 PM
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-2xl sm:text-3xl font-extrabold text-[#2DA5F3]">
                    $1199.00
                  </span>
                </div>
              </div>
            </div>

            {/* Stepper Progress Bar */}
            <div className="px-6 sm:px-10 py-6 border-b border-slate-100">
              <p className="text-xs sm:text-sm text-[#5F6C72] font-normal mb-8">
                Order expected arrival <span className="font-bold text-[#191C1F]">23 Jan, 2021</span>
              </p>

              {/* Stepper Track & Nodes */}
              <div className="relative mb-6 px-4 sm:px-12">
                
                {/* Background Connecting Lines */}
                <div className="absolute top-2.5 left-10 right-10 h-1.5 bg-[#FFE3D8] rounded-full -z-0" />
                <div className="absolute top-2.5 left-10 w-1/3 h-1.5 bg-[#FA541C] rounded-full -z-0" />

                {/* 4 Steps */}
                <div className="relative z-10 flex items-center justify-between">
                  
                  {/* Step 1: Order Placed (Active/Checked) */}
                  <div className="flex flex-col items-center gap-3 text-center min-w-[80px]">
                    <div className="h-6 w-6 rounded-full bg-[#FA541C] text-white flex items-center justify-center shadow-xs">
                      <Check size={14} strokeWidth={3} />
                    </div>
                    <div className="flex flex-col items-center gap-1.5 mt-1">
                      <FileText size={24} className="text-[#2DB224]" />
                      <span className="text-xs sm:text-sm font-bold text-[#191C1F]">Order Placed</span>
                    </div>
                  </div>

                  {/* Step 2: Packaging (Current Active Stage) */}
                  <div className="flex flex-col items-center gap-3 text-center min-w-[80px]">
                    <div className="h-6 w-6 rounded-full bg-[#FA541C] text-white flex items-center justify-center shadow-xs">
                      <div className="h-2 w-2 rounded-full bg-white" />
                    </div>
                    <div className="flex flex-col items-center gap-1.5 mt-1">
                      <Package size={24} className="text-[#FA541C]" />
                      <span className="text-xs sm:text-sm font-bold text-[#191C1F]">Packaging</span>
                    </div>
                  </div>

                  {/* Step 3: On The Road */}
                  <div className="flex flex-col items-center gap-3 text-center min-w-[80px]">
                    <div className="h-6 w-6 rounded-full bg-white border-2 border-[#FA541C] flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-transparent" />
                    </div>
                    <div className="flex flex-col items-center gap-1.5 mt-1">
                      <Truck size={24} className="text-[#FF9F7D]" />
                      <span className="text-xs sm:text-sm font-medium text-[#716388]">On The Road</span>
                    </div>
                  </div>

                  {/* Step 4: Delivered */}
                  <div className="flex flex-col items-center gap-3 text-center min-w-[80px]">
                    <div className="h-6 w-6 rounded-full bg-white border-2 border-[#FA541C] flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-transparent" />
                    </div>
                    <div className="flex flex-col items-center gap-1.5 mt-1">
                      <Handshake size={24} className="text-[#FF9F7D]" />
                      <span className="text-xs sm:text-sm font-medium text-[#716388]">Delivered</span>
                    </div>
                  </div>

                </div>

              </div>
            </div>

            {/* Order Activity Timeline */}
            <div className="p-6 sm:p-10 space-y-6">
              <h2 className="text-base sm:text-lg font-bold text-[#191C1F]">
                Order Activity
              </h2>

              <div className="space-y-4">
                {activities.map((act) => {
                  const IconComp = act.icon;
                  return (
                    <div key={act.id} className="flex items-start gap-4">
                      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-md shadow-2xs mt-0.5", act.badgeBg)}>
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
        <BecomeVendorRiderCta />

      </div>

    </div>
  );
}
