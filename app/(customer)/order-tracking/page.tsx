"use client";

import * as React from "react";
import Link from "next/link";
import { Navbar } from "@/components/customer/Navbar";
import { Footer } from "@/components/customer/Footer";
import { BecomeVendorSection } from "@/components/customer/BecomeVendorSection";
import { Home, ChevronRight, Info, ArrowRight, Truck, CheckCircle2, ShieldCheck, MapPin } from "lucide-react";
import { toast } from "sonner";

export default function OrderTrackingPage() {
  const [orderId, setOrderId] = React.useState("");
  const [billingEmail, setBillingEmail] = React.useState("");
  const [trackingData, setTrackingData] = React.useState<{
    status: string;
    estimate: string;
    events: {
      date: string;
      time: string;
      title: string;
      description: string;
      completed: boolean;
      current: boolean;
      icon?: React.ReactNode;
    }[];
  } | null>(null);

  const handleTrackOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || !billingEmail) {
      toast.error("Please fill in both fields.");
      return;
    }

    toast.success("Order details retrieved!");
    
    // Simulate query result with timeline
    setTrackingData({
      status: "In Transit",
      estimate: "Arriving tomorrow by 5:00 PM",
      events: [
        {
          date: "Oct 24",
          time: "17:00",
          title: "Delivered",
          description: "Your order has been delivered. Thank you for shopping at Fastlink!",
          completed: false,
          current: false,
        },
        {
          date: "Oct 23",
          time: "09:15",
          title: "Out for Delivery",
          description: "Our delivery man is on the way to deliver your order.",
          completed: false,
          current: true,
        },
        {
          date: "Oct 22",
          time: "14:30",
          title: "Arrived at Sorting Facility",
          description: "Your order has arrived at the local sorting facility in Lagos.",
          completed: true,
          current: false,
        },
        {
          date: "Oct 21",
          time: "10:00",
          title: "Shipped",
          description: "Your order has been shipped from our main warehouse.",
          completed: true,
          current: false,
        },
        {
          date: "Oct 20",
          time: "08:45",
          title: "Order Placed",
          description: "We have received your order.",
          completed: true,
          current: false,
        },
      ]
    });
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

            {/* Tracking Results - Vertical Timeline */}
            {trackingData && (
              <div className="mt-8 border border-gray-100 rounded-3xl bg-white p-6 sm:p-10 shadow-sm flex flex-col gap-8 animate-in fade-in slide-in-from-top-4 duration-300 text-left">
                {/* Status Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50 pb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Order Activity</h3>
                    <p className="text-sm text-gray-500 mt-1">Order #{orderId || "1023948"}</p>
                  </div>
                  <div className="text-left sm:text-right bg-orange-50/50 p-3 sm:p-4 rounded-xl border border-orange-100/50">
                    <span className="text-xs text-orange-600/80 font-bold uppercase tracking-wider">Estimated Delivery</span>
                    <p className="text-sm font-bold text-accent-orange mt-0.5">{trackingData.estimate}</p>
                  </div>
                </div>

                {/* Timeline */}
                <div className="flex flex-col gap-0 relative">
                  {trackingData.events.map((event, idx) => (
                    <div key={idx} className="flex gap-4 sm:gap-6 relative group">
                      {/* Connecting Line */}
                      {idx !== trackingData.events.length - 1 && (
                        <div className={`absolute left-[39px] sm:left-[43px] top-[40px] bottom-[-20px] w-0.5 ${event.completed || event.current ? 'bg-primary-dark/30' : 'bg-gray-100'}`} />
                      )}

                      {/* Date & Time (Desktop) */}
                      <div className="hidden sm:flex flex-col items-end w-20 pt-1 flex-shrink-0">
                        <span className={`text-sm font-semibold ${event.current ? 'text-primary-dark' : (event.completed ? 'text-gray-700' : 'text-gray-400')}`}>{event.date}</span>
                        <span className={`text-xs ${event.current ? 'text-primary-dark/70' : 'text-gray-400'}`}>{event.time}</span>
                      </div>

                      {/* Timeline Icon/Dot */}
                      <div className="relative z-10 flex flex-col items-center pt-1 flex-shrink-0">
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${
                          event.current 
                            ? 'bg-primary-dark text-white ring-4 ring-primary-dark/10 shadow-md' 
                            : event.completed 
                              ? 'bg-primary-dark/10 text-primary-dark border border-primary-dark/20'
                              : 'bg-white border-2 border-gray-200 text-gray-300'
                        }`}>
                          {event.current ? (
                            <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
                          ) : event.completed ? (
                            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-gray-300" />
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex flex-col pb-8 pt-1">
                        {/* Mobile Date/Time inline */}
                        <div className="flex sm:hidden items-center gap-2 mb-1">
                          <span className={`text-xs font-bold ${event.current ? 'text-primary-dark' : (event.completed ? 'text-gray-700' : 'text-gray-400')}`}>{event.date}</span>
                          <span className="text-gray-300">•</span>
                          <span className={`text-xs ${event.current ? 'text-primary-dark/70' : 'text-gray-400'}`}>{event.time}</span>
                        </div>
                        
                        <h4 className={`text-base font-bold ${event.current ? 'text-gray-900' : (event.completed ? 'text-gray-800' : 'text-gray-400')}`}>
                          {event.title}
                        </h4>
                        <p className={`text-sm mt-1 leading-relaxed ${event.current ? 'text-gray-600 font-medium' : 'text-gray-500'}`}>
                          {event.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
