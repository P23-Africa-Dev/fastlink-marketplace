"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import {
  ChevronRight,
  ArrowLeft,
  Check,
  FileText,
  Package,
  Truck,
  Handshake,
  MapPin,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { formatOrderDate } from "@/lib/order-map";
import { BecomeVendorRiderCta } from "@/components/become-vendor-rider-cta";
import { useTrackOrder } from "@/hooks/use-orders";
import type { ApiOrderStatus } from "@/types/order";

const STEP_INDEX: Record<ApiOrderStatus, number> = {
  pending: 0,
  confirmed: 1,
  shipped: 2,
  delivered: 3,
  cancelled: 0,
};

function eventIcon(status: string) {
  if (status === "delivered") return { icon: Check, badgeBg: "bg-[#E8F7EE] text-[#2DB224]" };
  if (status === "shipped") return { icon: Truck, badgeBg: "bg-[#E6F4FF] text-[#2DA5F3]" };
  if (status === "cancelled") return { icon: MapPin, badgeBg: "bg-[#FDECEC] text-[#E11D48]" };
  if (status === "confirmed") return { icon: CheckCircle2, badgeBg: "bg-[#E8F7EE] text-[#2DB224]" };
  return { icon: Calendar, badgeBg: "bg-[#E6F4FF] text-[#2DA5F3]" };
}

export default function OrderTrackingDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white font-montserrat px-4 py-16 text-center text-[#5F6C72]">
          Looking up your order…
        </div>
      }
    >
      <OrderTrackingDetailsContent />
    </Suspense>
  );
}

function OrderTrackingDetailsContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const rawId = decodeURIComponent((params?.id as string) || "");
  const email = searchParams.get("email") ?? undefined;
  const { data, isLoading, isError } = useTrackOrder(rawId, email);
  const order = data?.data;

  const displayOrderId = rawId.startsWith("#") ? rawId : `#${rawId}`;
  const currentStep = order ? STEP_INDEX[order.status] ?? 0 : 0;
  const progressPct = order?.status === "delivered" ? 100 : Math.max(0, (currentStep / 3) * 100);

  const activities = [...(order?.events ?? [])].reverse().map((event) => {
    const visual = eventIcon(event.status);
    return {
      id: event.id,
      title: event.title,
      timestamp: formatOrderDate(event.createdAt),
      icon: visual.icon,
      badgeBg: visual.badgeBg,
    };
  });

  return (
    <div className="min-h-screen bg-white font-montserrat text-[#1E1E2F]">
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
          <span className="text-[#6D349F] font-bold">{order ? `#${order.reference.replace(/^#/, "")}` : displayOrderId}</span>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 md:px-8 py-8 md:py-12 space-y-10">
        <div>
          <div className="mb-6">
            <Link
              href="/order-tracking"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#6D349F] hover:text-[#411266] transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Track Another Order</span>
            </Link>
          </div>

          {isLoading && <p className="text-sm text-[#5F6C72]">Looking up your order…</p>}

          {isError && (
            <div className="rounded-md border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
              We couldn&apos;t find that order. Check the ID and billing email, then try again.
            </div>
          )}

          {order && (
            <div className="rounded-md bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
              <div className="p-6 pb-2">
                <div className="bg-[#FFFDF0] border border-[#FFE8A3] p-6 rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-[#191C1F]">
                      #{order.reference.replace(/^#/, "")}
                    </h1>
                    <p className="text-xs sm:text-sm text-[#5F6C72] mt-1 font-normal">
                      {order.items.length} Product{order.items.length === 1 ? "" : "s"} · Order placed{" "}
                      {formatOrderDate(order.createdAt)}
                    </p>
                    {order.status === "cancelled" && (
                      <p className="text-xs font-bold text-rose-600 mt-2">This order was cancelled.</p>
                    )}
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-2xl sm:text-3xl font-extrabold text-[#2DA5F3]">
                      {formatPrice(order.total)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-6 sm:px-10 py-6 border-b border-slate-100">
                <p className="text-xs sm:text-sm text-[#5F6C72] font-normal mb-8">
                  Order expected arrival{" "}
                  <span className="font-bold text-[#191C1F]">{formatOrderDate(order.estimatedDelivery)}</span>
                </p>

                <div className="relative mb-6 px-4 sm:px-12">
                  <div className="absolute top-2.5 left-10 right-10 h-1.5 bg-[#FFE3D8] rounded-full -z-0" />
                  <div
                    className="absolute top-2.5 left-10 h-1.5 bg-[#FA541C] rounded-full -z-0"
                    style={{ width: `calc(${progressPct}% - 2.5rem)` }}
                  />

                  <div className="relative z-10 flex items-center justify-between">
                    <StepperNode
                      label="Order Placed"
                      icon={FileText}
                      complete={currentStep >= 0}
                      current={currentStep === 0 && order.status !== "cancelled"}
                    />
                    <StepperNode
                      label="Packaging"
                      icon={Package}
                      complete={currentStep >= 1}
                      current={currentStep === 1}
                    />
                    <StepperNode
                      label="On The Road"
                      icon={Truck}
                      complete={currentStep >= 2}
                      current={currentStep === 2}
                    />
                    <StepperNode
                      label="Delivered"
                      icon={Handshake}
                      complete={currentStep >= 3}
                      current={currentStep === 3}
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-10 space-y-6">
                <h2 className="text-base sm:text-lg font-bold text-[#191C1F]">Order Activity</h2>

                <div className="space-y-4">
                  {activities.length === 0 && (
                    <p className="text-sm text-[#5F6C72]">No tracking events yet.</p>
                  )}
                  {activities.map((act) => {
                    const IconComp = act.icon;
                    return (
                      <div key={act.id} className="flex items-start gap-4">
                        <div
                          className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-md shadow-2xs mt-0.5",
                            act.badgeBg,
                          )}
                        >
                          <IconComp size={18} />
                        </div>
                        <div className="space-y-1 pt-0.5">
                          <p className="text-xs sm:text-sm font-semibold text-[#191C1F] leading-snug">
                            {act.title}
                          </p>
                          <p className="text-xs text-[#716388]">{act.timestamp}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        <BecomeVendorRiderCta />
      </div>
    </div>
  );
}

function StepperNode({
  label,
  icon: Icon,
  complete,
  current,
}: {
  label: string;
  icon: typeof FileText;
  complete: boolean;
  current: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-3 text-center min-w-[80px]">
      <div
        className={cn(
          "h-6 w-6 rounded-full flex items-center justify-center shadow-xs",
          complete || current
            ? "bg-[#FA541C] text-white"
            : "bg-white border-2 border-[#FA541C]",
        )}
      >
        {complete && !current ? (
          <Check size={14} strokeWidth={3} />
        ) : current ? (
          <div className="h-2 w-2 rounded-full bg-white" />
        ) : (
          <div className="h-1.5 w-1.5 rounded-full bg-transparent" />
        )}
      </div>
      <div className="flex flex-col items-center gap-1.5 mt-1">
        <Icon size={24} className={complete || current ? "text-[#FA541C]" : "text-[#FF9F7D]"} />
        <span
          className={cn(
            "text-xs sm:text-sm",
            complete || current ? "font-bold text-[#191C1F]" : "font-medium text-[#716388]",
          )}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
