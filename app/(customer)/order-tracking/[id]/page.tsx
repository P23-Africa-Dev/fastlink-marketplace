"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/customer/Navbar";
import { Footer } from "@/components/customer/Footer";
import { BecomeVendorSection } from "@/components/customer/BecomeVendorSection";
import { Home, ChevronRight, Check, Package, Truck, Handshake, User, MapPin, Map, ClipboardList, NotebookText } from "lucide-react";

export default function OrderTrackingDetailsPage() {
  const params = useParams();
  const id = params?.id as string;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="w-full flex-1">
        {/* Breadcrumb section */}
        <div className="w-full bg-[#F2F4F5] py-5 mb-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-2 text-[15px] font-medium text-gray-500">
            <Link href="/" className="hover:text-primary-dark flex items-center gap-2 transition-colors">
              <Home className="w-[18px] h-[18px]" />
              <span>Home</span>
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-500">Pages</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link href="/order-tracking" className="hover:text-primary-dark transition-colors">
              Order tracking
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-[#380469] font-semibold">Details</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 pb-24">
          <div className="bg-white border border-[#E4E7E9] rounded-md">
             {/* Yellow Box */}
             <div className="m-6 bg-[#FDFAE7] border border-[#FDEB9D] rounded-sm p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                   <h2 className="text-[28px] font-medium text-gray-900 leading-tight">#{id || "96459761"}</h2>
                   <p className="text-[15px] text-gray-500 mt-2 flex items-center gap-1.5">
                     4 Products <span className="text-gray-400">•</span> Order Placed in 17 Jan, 2021 at 7:32 PM
                   </p>
                </div>
                <div className="mt-4 sm:mt-0">
                   <span className="text-[32px] font-bold text-[#2DA5F3]">$1199.00</span>
                </div>
             </div>

             <div className="px-8 pb-14">
                <p className="text-[15px] text-gray-600">
                  Order expected arrival <span className="font-semibold text-gray-900">23 Jan, 2021</span>
                </p>

                {/* Timeline */}
                <div className="relative flex justify-between items-start text-center w-full mt-12">
                  <div className="absolute top-[13px] left-[12.5%] right-[12.5%] h-[5px] flex z-0">
                    <div className="w-1/3 bg-[#FA8232]"></div>
                    <div className="w-2/3 bg-[#FFE7D6]"></div>
                  </div>
                  
                  {/* Step 1 */}
                  <div className="flex flex-col items-center relative z-10 w-1/4">
                    <div className="w-[30px] h-[30px] rounded-full bg-[#FA8232] text-white flex items-center justify-center">
                      <Check className="w-5 h-5 stroke-[3]" />
                    </div>
                    <div className="mt-6 flex flex-col items-center">
                      <NotebookText className="w-9 h-9 text-[#2DB224]" strokeWidth={1.5} />
                      <div className="mt-3.5 text-[15px] font-semibold text-gray-900">Order Placed</div>
                    </div>
                  </div>
                  {/* Step 2 */}
                  <div className="flex flex-col items-center relative z-10 w-1/4">
                    <div className="w-[30px] h-[30px] rounded-full bg-[#FA8232] flex items-center justify-center">
                       <div className="w-3 h-3 rounded-full bg-white"></div>
                    </div>
                    <div className="mt-6 flex flex-col items-center">
                      <Package className="w-9 h-9 text-[#FA8232]" strokeWidth={1.5} />
                      <div className="mt-3.5 text-[15px] font-semibold text-gray-900">Packaging</div>
                    </div>
                  </div>
                  {/* Step 3 */}
                  <div className="flex flex-col items-center relative z-10 w-1/4">
                    <div className="w-[30px] h-[30px] rounded-full border-[2.5px] border-[#FA8232] bg-white"></div>
                    <div className="mt-6 flex flex-col items-center">
                      <Truck className="w-9 h-9 text-[#FFC7A1]" strokeWidth={1.5} />
                      <div className="mt-3.5 text-[15px] font-medium text-[#8B96A5]">On The Road</div>
                    </div>
                  </div>
                  {/* Step 4 */}
                  <div className="flex flex-col items-center relative z-10 w-1/4">
                    <div className="w-[30px] h-[30px] rounded-full border-[2.5px] border-[#FA8232] bg-white"></div>
                    <div className="mt-6 flex flex-col items-center">
                      <Handshake className="w-9 h-9 text-[#FFC7A1]" strokeWidth={1.5} />
                      <div className="mt-3.5 text-[15px] font-medium text-[#8B96A5]">Delivered</div>
                    </div>
                  </div>
                </div>
             </div>

             <div className="border-t border-[#E4E7E9]"></div>

             {/* Order Activity */}
             <div className="p-8 pb-10">
                <h3 className="text-[22px] font-medium text-gray-900 mb-8">Order Activity</h3>
                <div className="flex flex-col gap-6">
                   {/* Activity Item 1 */}
                   <div className="flex items-start gap-4">
                      <div className="w-12 h-12 flex items-center justify-center bg-[#EAF7E9] rounded-[4px] shrink-0">
                         <Check className="w-6 h-6 text-[#2DB224]" strokeWidth={2.5} />
                      </div>
                      <div className="pt-0.5">
                         <p className="text-[15px] text-gray-800">Your order has been delivered. Thank you for shopping at Clicon!</p>
                         <p className="text-[14px] text-gray-500 mt-1">23 Jan, 2021 at 7:32 PM</p>
                      </div>
                   </div>
                   
                   {/* Activity Item 2 */}
                   <div className="flex items-start gap-4">
                      <div className="w-12 h-12 flex items-center justify-center bg-[#EAF6FE] rounded-[4px] shrink-0">
                         <User className="w-6 h-6 text-[#2DA5F3]" strokeWidth={2} />
                      </div>
                      <div className="pt-0.5">
                         <p className="text-[15px] text-gray-800">Our delivery man (John Wick) Has picked-up your order for delvery.</p>
                         <p className="text-[14px] text-gray-500 mt-1">23 Jan, 2021 at 2:00 PM</p>
                      </div>
                   </div>

                   {/* Activity Item 3 */}
                   <div className="flex items-start gap-4">
                      <div className="w-12 h-12 flex items-center justify-center bg-[#EAF6FE] rounded-[4px] shrink-0">
                         <MapPin className="w-6 h-6 text-[#2DA5F3]" strokeWidth={2} />
                      </div>
                      <div className="pt-0.5">
                         <p className="text-[15px] text-gray-800">Your order has reached at last mile hub.</p>
                         <p className="text-[14px] text-gray-500 mt-1">22 Jan, 2021 at 8:00 AM</p>
                      </div>
                   </div>

                   {/* Activity Item 4 */}
                   <div className="flex items-start gap-4">
                      <div className="w-12 h-12 flex items-center justify-center bg-[#EAF6FE] rounded-[4px] shrink-0">
                         <Map className="w-6 h-6 text-[#2DA5F3]" strokeWidth={2} />
                      </div>
                      <div className="pt-0.5">
                         <p className="text-[15px] text-gray-800">Your order on the way to (last mile) hub.</p>
                         <p className="text-[14px] text-gray-500 mt-1">21 Jan, 2021 at 5:32 AM</p>
                      </div>
                   </div>

                   {/* Activity Item 5 */}
                   <div className="flex items-start gap-4">
                      <div className="w-12 h-12 flex items-center justify-center bg-[#EAF7E9] rounded-[4px] shrink-0">
                         <Check className="w-6 h-6 text-[#2DB224]" strokeWidth={2.5} />
                      </div>
                      <div className="pt-0.5">
                         <p className="text-[15px] text-gray-800">Your order is successfully verified.</p>
                         <p className="text-[14px] text-gray-500 mt-1">20 Jan, 2021 at 7:32 PM</p>
                      </div>
                   </div>

                   {/* Activity Item 6 */}
                   <div className="flex items-start gap-4">
                      <div className="w-12 h-12 flex items-center justify-center bg-[#EAF6FE] rounded-[4px] shrink-0">
                         <ClipboardList className="w-6 h-6 text-[#2DA5F3]" strokeWidth={2} />
                      </div>
                      <div className="pt-0.5">
                         <p className="text-[15px] text-gray-800">Your order has been confirmed.</p>
                         <p className="text-[14px] text-gray-500 mt-1">19 Jan, 2021 at 2:61 PM</p>
                      </div>
                   </div>
                </div>
             </div>
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
