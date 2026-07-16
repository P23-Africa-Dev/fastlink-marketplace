import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/customer/Navbar";
import { Footer } from "@/components/customer/Footer";
import { BecomeVendorSection } from "@/components/customer/BecomeVendorSection";
import { Home, ChevronRight, Search, PhoneCall, MessageCircle, ArrowRight } from "lucide-react";

export default function ContactUsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="w-full flex-1">
        {/* Breadcrumb section */}
        <div className="w-full py-5 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-2 text-[15px] font-medium text-gray-500">
            <Link href="/" className="hover:text-primary-dark flex items-center gap-2 transition-colors">
              <Home className="w-[18px] h-[18px]" />
              <span>Home</span>
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-[#380469] font-semibold">Contact</span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="w-full bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-24 flex flex-col lg:flex-row items-center justify-between gap-12">
            
            {/* Left Content */}
            <div className="w-full lg:w-[45%] flex flex-col items-start gap-6">
              <div className="bg-[#EED843] text-gray-900 font-bold uppercase text-[14px] tracking-wide px-5 py-2.5 rounded-md inline-block">
                HELP CENTER
              </div>
              
              <h1 className="text-[44px] sm:text-[52px] lg:text-[56px] font-bold text-gray-900 leading-[1.1] mt-2">
                How we can help you!
              </h1>
              
              <div className="w-full max-w-[560px] mt-4 relative flex items-center bg-white border border-[#E4E7E9] rounded-md p-1.5 focus-within:border-primary-dark transition-all h-[72px] shadow-sm">
                <Search className="w-6 h-6 text-[#FA8232] ml-4 flex-shrink-0" strokeWidth={2.5} />
                <input
                  type="text"
                  placeholder="Enter your question or keyword"
                  className="flex-1 w-full h-full px-4 text-gray-700 bg-transparent border-none outline-none text-[16px] placeholder:text-gray-400"
                />
                <button className="h-full bg-[#FA8232] hover:bg-[#E5762A] text-white font-bold tracking-wider uppercase px-9 rounded-md transition-colors flex-shrink-0 text-[15px]">
                  SEND
                </button>
              </div>
            </div>

            {/* Right Content - Image */}
            <div className="w-full lg:w-[55%] flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[650px] aspect-[4/3] lg:aspect-auto lg:h-[550px]">
                <Image 
                  src="/support-agent.png" 
                  alt="Customer Support Agent" 
                  fill
                  className="object-contain object-right"
                  priority
                />
              </div>
            </div>

          </div>
        </div>

        {/* Contact Info Section */}
        <div className="w-full bg-[#FAFAFA] py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col items-center">
            
            {/* Header */}
            <div className="bg-[#2DA5F3] text-white font-bold uppercase text-[14px] tracking-wide px-5 py-2.5 rounded-[4px] inline-block mb-6">
              CONTACT US
            </div>
            
            <h2 className="text-[36px] sm:text-[44px] font-bold text-gray-900 leading-[1.2] text-center max-w-2xl mb-12">
              Don&apos;t find your answer. <br/> Contact with us
            </h2>
            
            {/* Cards Container */}
            <div className="flex flex-col md:flex-row items-stretch justify-center gap-6 w-full max-w-[1000px]">
              
              {/* Call Card */}
              <div className="flex-1 bg-white rounded-[4px] shadow-[0px_4px_24px_rgba(0,0,0,0.02)] p-8 sm:p-10 flex flex-col md:flex-row items-start gap-6 border border-transparent hover:border-[#2DA5F3]/30 transition-all">
                <div className="w-[72px] h-[72px] bg-[#EAF6FE] rounded-[4px] flex items-center justify-center shrink-0">
                  <PhoneCall className="w-8 h-8 text-[#2DA5F3]" strokeWidth={2} />
                </div>
                <div className="flex flex-col items-start text-left">
                  <h3 className="text-[20px] font-bold text-gray-900 mb-2">Call us now</h3>
                  <p className="text-[14px] text-[#5F6C72] leading-[1.6] mb-6">
                    we are available online from 9:00 AM to 5:00 PM<br/>(GMT95:45) Talk with use now
                  </p>
                  <p className="text-[22px] font-medium text-gray-900 mb-6">
                    +1-202-555-0126
                  </p>
                  <button className="bg-[#2DA5F3] hover:bg-[#2DA5F3]/90 text-white font-bold uppercase text-[13px] tracking-wide px-6 py-3 rounded-[4px] flex items-center gap-2 transition-colors">
                    CALL NOW <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Chat Card */}
              <div className="flex-1 bg-white rounded-[4px] shadow-[0px_4px_24px_rgba(0,0,0,0.02)] p-8 sm:p-10 flex flex-col md:flex-row items-start gap-6 border border-transparent hover:border-[#2DB224]/30 transition-all">
                <div className="w-[72px] h-[72px] bg-[#EAF7E9] rounded-[4px] flex items-center justify-center shrink-0">
                  <MessageCircle className="w-8 h-8 text-[#2DB224]" strokeWidth={2} />
                </div>
                <div className="flex flex-col items-start text-left">
                  <h3 className="text-[20px] font-bold text-gray-900 mb-2">Chat with us</h3>
                  <p className="text-[14px] text-[#5F6C72] leading-[1.6] mb-6">
                    we are available online from 9:00 AM to 5:00 PM<br/>(GMT95:45) Talk with use now
                  </p>
                  <p className="text-[22px] font-medium text-gray-900 mb-6">
                    Support@clicon.com
                  </p>
                  <button className="bg-[#2DB224] hover:bg-[#2DB224]/90 text-white font-bold uppercase text-[13px] tracking-wide px-6 py-3 rounded-[4px] flex items-center gap-2 transition-colors">
                    CONTACT US <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>

      <BecomeVendorSection />
      <Footer />
    </div>
  );
}
