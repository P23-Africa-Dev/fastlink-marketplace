import React from "react";
import Link from "next/link";
import { Store, Bike } from "lucide-react";
import { cn } from "@/lib/utils";

interface BecomeVendorRiderCtaProps {
  className?: string;
}

export function BecomeVendorRiderCta({ className }: BecomeVendorRiderCtaProps) {
  return (
    <section className="w-full">
      <div className="container-wide relative py-12 md:py-10">
        <div
          className={cn(
            "rounded-3xl bg-[#1E1E22] p-8 sm:p-12 text-white text-left shadow-xl max-w-5x mx-auto my-12",
            className
          )}
        >
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
                <div className="text-5xl mb-4">🏍️</div>
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
    </section>
  );
}

export default BecomeVendorRiderCta;
