import Link from "next/link";
import Image from "next/image";
import { Store } from "lucide-react";

import groupsBg from "@/assets/Groups.png";

/**
 * HeroBanner
 *
 * Full-width homepage hero section.
 * Renders the brand background image (Groups.png) featuring a 3D cart,
 * with text and CTAs positioned on the left side.
 */
export function HeroBanner() {
  return (
    <section
      className="relative w-full overflow-hidden bg-brand-900"
      aria-label="Fastlink – Structured Digital Commerce"
    >
      {/* ── Background Image ────────────────────────────────────── */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <Image
          src={groupsBg}
          alt="Hero background"
          fill
          priority
          placeholder="blur"
          className="object-cover object-right md:object-center"
        />
        {/* Gradient overlay for excellent text contrast across screen sizes */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-brand-950/80 via-brand-900/60 to-brand-900/40 md:from-brand-950/40 md:via-transparent md:to-transparent"
          aria-hidden="true"
        />
      </div>

      {/* ── Main content ────────────────────────────────────────── */}
      <div className="container-wide relative z-10 flex min-h-[340px] items-center py-10 md:min-h-[400px] md:py-12 lg:min-h-[440px]">
        <div className="grid w-full grid-cols-1 items-center gap-8 md:grid-cols-2">

          {/* Left — copy */}
          <div className="flex flex-col gap-6 md:gap-8">
            <h1
              className="font-sans font-bold text-3xl sm:text-4xl md:text-[55.68px] md:leading-[68.58px] text-white tracking-normal align-middle"
              style={{ verticalAlign: "middle" }}
            >
              Structured Digital
              <br />
              Commerce.Local &amp; Nationwide.
            </h1>

            <p
              className="max-w-xl md:max-w-[700px] font-sans font-bold text-lg sm:text-xl md:text-[36px] md:leading-[35.7px] text-white/95 tracking-normal align-middle"
              style={{ verticalAlign: "middle" }}
            >
              Shop from trusted brands, retail chains, and verified partners
              <br className="hidden sm:block" />
              powered by FastLink infrastructure
            </p>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-4 pt-1">
              <Link
                href="/products?type=local-stores"
                className="inline-flex items-center justify-center h-[52px] px-6 rounded-lg bg-white text-base font-bold text-[#834AB9] shadow-lg shadow-black/10 transition-all duration-200 hover:bg-white/95 hover:scale-[1.02] active:scale-[0.98]"
              >
                Explore Stores Near You
              </Link>

              <Link
                href="/products?type=nationwide"
                className="inline-flex items-center justify-center gap-3 h-[52px] px-6 rounded-lg text-base font-bold text-white transition-all duration-200 hover:brightness-110 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: "linear-gradient(90deg, rgba(84, 43, 122, 0.7) 0%, rgba(107, 58, 153, 0.7) 100%)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                }}
              >
                <span className="flex items-center justify-center p-1.5 rounded-md bg-white/15 border border-white/10">
                  <Store size={16} />
                </span>
                Shop Nationwide Brands
              </Link>
            </div>
          </div>

          {/* Right — spacer to show the background image cart */}
          <div className="hidden md:block" aria-hidden="true" />

        </div>
      </div>
    </section>
  );
}

