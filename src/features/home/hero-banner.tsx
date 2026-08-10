import Link from "next/link";
import Image from "next/image";

import groupsBg from "@/assets/Groups.png";

/**
 * HeroBanner
 *
 * Full-width homepage hero section.
 * Renders the brand background image (Groups.png) featuring a 3D cart,
 * with text and CTAs positioned on the left side to match the reference UI image.
 */
export function HeroBanner() {
  return (
    <section
      className="relative w-full overflow-hidden bg-[#6B2CB5]"
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
      </div>

      {/* ── Main content ────────────────────────────────────────── */}
      <div className="container-wide relative z-10 flex min-h-[380px] items-center py-12 md:min-h-[420px] lg:min-h-[460px]">
        <div className="grid w-full grid-cols-1 items-center gap-8 md:grid-cols-2">

          {/* Left — copy */}
          <div className="flex flex-col gap-6 animate-slide-in-left">
            <h1
              className="font-montserrat font-bold text-3xl sm:text-5xl lg:text-[50px] leading-tight lg:leading-[58.58px] text-white tracking-normal align-middle"
              style={{ verticalAlign: "middle" }}
            >
              Structured Digital<br />
              Commerce. Local &amp;<br />
              Nationwide.
            </h1>

            <p
              className="font-montserrat font-normal text-base sm:text-lg lg:text-[15px] leading-relaxed lg:leading-[25px] text-white/90 tracking-normal align-middle max-w-xl"
              style={{ verticalAlign: "middle" }}
            >
              Shop from trusted brands, retail chains, and verified partners<br className="hidden sm:inline" />
              powered by FastLink infrastructure
            </p>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/malls"
                className="inline-flex items-center justify-center h-[50px] px-7 rounded-lg bg-[#F59E0B] hover:bg-[#E59100] text-base font-bold text-white shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95"
              >
                Explore Stores Near You
              </Link>

              <Link
                href="/nationwide-stores"
                className="inline-flex items-center justify-center h-[50px] px-7 rounded-lg border border-white/80 bg-purple-900/30 hover:bg-white/20 text-base font-bold text-white backdrop-blur-xs transition-all duration-300 hover:scale-105 hover:shadow-md active:scale-95"
              >
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


