"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Navbar } from "@/components/customer/Navbar";

interface HeroBannerProps {
  onShopNowClick?: () => void;
  onExploreClick?: () => void;
}

export function HeroBanner({ onShopNowClick, onExploreClick }: HeroBannerProps) {
  return (
    <section className="w-full bg-gray-50">
      {/* Navbar — self-contained, same max-w-7xl centering */}
      <Navbar />

      {/* Hero card — centered on large screens, full-width on small */}
      <div className="w-full max-w-7xl mx-auto sm:px-4 pb-4">
        <div className="relative overflow-hidden min-h-[480px] sm:min-h-[520px] flex flex-col">
          {/* Background image */}
          <Image
            src="/images/hero-bg.png"
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) calc(100vw - 2rem), 1280px"
            className="object-cover object-center"
            priority
          />

          {/* Mobile overlay — semi-transparent so text is legible on small screens */}
          <div className="absolute inset-0 bg-white/55 sm:hidden" />

          {/* Text content */}
          <div className="relative z-10 flex-1 flex items-center px-8 sm:px-14 py-14 sm:py-20">
            <div className="max-w-lg flex flex-col gap-5">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-[64px] font-normal tracking-normal leading-[53px] text-dark"
              >
                The Home of{" "}
                <span className="text-accent-orange">Smart</span>{" "}
                Vendors
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.12 }}
                className="text-[20px] font-normal tracking-normal leading-[1] text-dark/60"
              >
                Your one Shop online Marketplace for everything you need.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.22 }}
                className="flex items-center gap-3 pt-1"
              >
                <Button
                  variant="primary"
                  size="lg"
                  className="rounded-[20px] px-8 font-bold shadow-lg"
                  onClick={onShopNowClick}
                >
                  Shop Now
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-[20px] px-8 font-bold"
                  onClick={onExploreClick}
                >
                  Explore
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroBanner;
